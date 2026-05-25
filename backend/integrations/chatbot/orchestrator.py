from sqlalchemy.orm import Session
import logging

from database import redis_client
from schemas import MessageCreate, OrchestratorResponse, AgentContext, TextBlock, ChartBlock, RawFileAttachment
from .client import llm_request
from .prompt_builder import get_system_prompt
from crud import get_conversation_title, set_conversation_title, parse_file
from .sql_query_agent import get_sql_agent_response
from .text_agent import get_text_agent_response
from .graphics_agent import get_graphics_agent_response
from .excel_agent import get_excel_agent_response

logger = logging.getLogger(__name__)

ORCHESTRATOR_PROMPT = """
You are an orchestrator that analyzes the user's message and decides which agents are needed and in what order.

Your job is to:
1. Understand what the user is asking for
2. Select the appropriate agents from the available list
3. Write a clear and SHORT instruction for each agent
4. Order the agents correctly — if one agent depends on another's output, it must come after

Rules:
- Only use agents from the available list
- If the user starts a new conversation, generate a short and relevant conversation_title
- Always write agent instructions in English, regardless of the user's language

CRITICAL — You are a router, not an assistant:
- Do NOT answer the user's question yourself
- Do NOT generate SQL queries
- Do NOT ask the user for clarifications — delegate that to the appropriate agent
- Do NOT add explanations, warnings, or suggestions in your response
- Your only output is the list of agents to call and their instructions

CRITICAL — Instructions must be minimal:
- Write instructions in ONE sentence maximum
- Just describe WHAT the agent should do, not HOW
- Do NOT specify column names, table names, conditions, or SQL logic — the agents already know the schema
- Do NOT specify output format — agents handle that themselves
- Do NOT instruct the text agent on formatting, tone, or Markdown — it already knows

CRITICAL — Agent dependencies & flows:
- The excel agent CANNOT fetch or filter data. It only exports whatever data the sql agent (or context) provides.
- If the user asks for an Excel export of database data: sql → excel → text
- If the user asks to filter or modify a previously generated Excel file (e.g., "now give me only the ones from Server X"), you MUST generate a NEW sql instruction with the updated filters, then call excel, then text.
- If data comes from the database and needs visualization: sql → chart
- If data comes from attached files: chart (file contents are already in context)
- text and chart can be used together: text explains, chart visualizes
- Never use chart agent for tabular data or simple summaries — use text instead
- Never send an empty message, even if the user asks just for a file, use the text agent to describe it

CRITICAL — Excel agent rules:
- After excel agent, always add text agent to describe what was exported
- Never instruct the excel agent about which rows, columns, or filters to apply — it reads the data directly from context
- Never mention "all results", "all rows", or any data scope in the excel agent instruction
- Excel instruction must be ONE sentence: just say what the file represents, nothing else
- Example of correct excel instruction: "Export the active alarms data to Excel"
- Example of incorrect excel instruction: "Export all 150 rows of active alarms including severity and timestamp columns"

CRITICAL — Context awareness:
- Always read the conversation history before writing instructions
- If the user's message refers to previous results (e.g. "of those", "from these", "how many have..."), include the relevant context in the agent instruction
- Example: user asks "how many have Major severity?" after "how many active alarms are there?" → sql instruction must be "Count active alarms with Major severity"
- Example: user asks "Export only the ones from Server X" after getting an export of all active alarms → agents: sql ("Get active alarms from Server X") -> excel ("Export active alarms from Server X to Excel") -> text ("Describe the newly exported file").

{files_context}

Available agents:
{agents_list}
"""

FILES_CONTEXT_PROMPT = """
IMPORTANT — The user has attached the following files to this message:
{files_list}

- Agents are already aware of file contents — do NOT re-explain or summarize them
- If the user's question is about the attached files, instruct the relevant agent to use the file contents
- If the user's question requires both file data and database data, use both sql and text agents
"""

AVAILABLE_AGENTS = {
    "sql": {
        "run": get_sql_agent_response,
        "description": "Executes SQL queries and returns data from the database"
    },
    "chart": {
        "run": get_graphics_agent_response,
        "description": "Generates a chart configuration based on available data — use only when the user explicitly asks for a chart, graph, or visualization"
    },
    "excel": {
        "run": get_excel_agent_response,
        "description": "Generates and exports an Excel file based on available data — use only when the user explicitly asks for an Excel file, spreadsheet, or data export. Always followed by text agent."
    },
    "text": {
        "run": get_text_agent_response,
        "description": "Formulates natural language responses, including interpretation of SQL results"
    }
}
    
# Constructs the orchestrator's system prompt by compiling available agents and appending file context if present
def build_orchestrator_system_prompt(files: list[RawFileAttachment] | None = None) -> str:
    language_rule = get_system_prompt(persona_prompt=False, language_prompt=True)
    
    agents_list = "\n".join(
        f"- {name}: {meta['description']}"
        for name, meta in AVAILABLE_AGENTS.items()
    )

    if files:
        files_list = "\n".join(
            f"- {f.filename} ({f.filename.rsplit('.', 1)[-1] if '.' in f.filename else 'unknown'})"
            for f in files
        )
        files_context = FILES_CONTEXT_PROMPT.format(files_list=files_list)
    else:
        files_context = ""

    return language_rule + ORCHESTRATOR_PROMPT.format(
        agents_list=agents_list,
        files_context=files_context
    )

# Formats the agent context properties into a list of standardized output blocks for the chat response
def build_output_blocks(context: AgentContext) -> list:
    blocks = []
    if context.text_response:
        blocks.append(TextBlock(type="text", content=context.text_response))
    if context.chart_config:
        blocks.append(ChartBlock(type="chart", content=context.chart_config))
    return blocks

# Analyzes the incoming message, delegates tasks to appropriate agents, and orchestrates the complete response
def get_orchestrator_response(db: Session, request: MessageCreate, context_history: list[dict[str, str]]) -> tuple[list, AgentContext]:
    
    system_prompt = build_orchestrator_system_prompt(files=request.files or None)

    orchestrator_response = llm_request(system_prompt, request.message, context_history, OrchestratorResponse)

    print(f"[ORCHESTRATOR] Selected agents: {[a.agent for a in orchestrator_response.agents]}")
    print(f"[ORCHESTRATOR] Instructions: {[(a.agent, a.instruction) for a in orchestrator_response.agents]}")

    if request.new_chat:
        conversation_title = orchestrator_response.conversation_title
        set_conversation_title(db, request.conversation_id, conversation_title)
    else:
        conversation_title = get_conversation_title(db, request.conversation_id)

    agent_context = AgentContext(
        user_message=request.message,
        conversation_history=context_history
    )

    parsed = []
    if request.files:
        for file in request.files:
            try:
                content = parse_file(file.filename, file.content)
                parsed.append(f"[{file.filename}]:\n{content}")
            except Exception as e:
                logger.error(f"Error while parsing request file {file.filename}: {str(e)}")
                continue

    if parsed:
        agent_context.file_contents = "\n\n".join(parsed)

    for agent_call in orchestrator_response.agents:
        if redis_client.exists(f"cancel:{request.request_id}"):
            logger.warning(f"[RESPONSE CANCELED] ")
            agent_context.text_response = "Response was canceled by the user"
            agent_context.is_stopped = True
            break

        agent = AVAILABLE_AGENTS.get(agent_call.agent)
        if not agent:
            continue
        agent_context = agent["run"](db, agent_context, agent_call)
    
    
    output_blocks = build_output_blocks(agent_context)

    return output_blocks, agent_context