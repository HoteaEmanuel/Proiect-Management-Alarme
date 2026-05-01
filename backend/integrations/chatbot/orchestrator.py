from sqlalchemy.orm import Session
from datetime import datetime
import json

from schemas import MessageCreate, OrchestratorResponse, AgentContext, TextBlock, ChartBlock
from .client import llm_request
from .prompt_builder import get_system_prompt
from crud import get_conversation_history, get_conversation_title, set_conversation_title, set_response_id
from .sql_query_agent import get_sql_agent_response
from .text_agent import get_text_agent_response

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

CRITICAL — Context awareness:
- Always read the conversation history before writing instructions
- If the user's message refers to previous results (e.g. "of those", "from these", "how many have..."), include the relevant context in the agent instruction
- Example: user asks "how many have Major severity?" after "how many active alarms are there?" → instruction must be "Count active alarms with Major severity", not just "Count alarms with Major severity"

Example of a BAD instruction: "Inspectează schema bazei de date pentru a identifica tabelele... consideră valorile active: 1, true, 'ACTIVE'..."
Example of a GOOD instruction: "Count how many alarms are currently active."

Available agents:
{agents_list}
"""

AVALABILE_AGENTS = {
    "sql": {
        "run": get_sql_agent_response,
        "description": "Executes SQL queries and returns data from the database"
    },
    "text": {
        "run": get_text_agent_response,
        "description": "Formulates natural language responses, including interpretation of SQL results"
    }
}
    

def build_orchestrator_system_prompt():
    language_rule = get_system_prompt(persona_prompt=False, language_prompt=True)
    agent_list = "\n".join(
        f"- {name}: {meta['description']}"
        for name, meta in AVALABILE_AGENTS.items()
    )
    return language_rule + ORCHESTRATOR_PROMPT.format(agents_list=agent_list)

def build_output_blocks(context: AgentContext):
    blocks = []
    if context.text_response:
        blocks.append(TextBlock(type="text", content=context.text_response))
    if context.chart_config:
        blocks.append(ChartBlock(type="chart", content=context.chart_config))
    return blocks

def get_orchestrator_response(db: Session, request: MessageCreate, context_history: list[dict[str, str]]):
    
    system_prompt = build_orchestrator_system_prompt()

    orchestrator_response = llm_request(system_prompt, request.message, context_history, OrchestratorResponse)

    print(f"[ORCHESTRATOR] Agents selectați: {[a.agent for a in orchestrator_response.agents]}")
    print(f"[ORCHESTRATOR] Instrucțiuni: {[(a.agent, a.instruction) for a in orchestrator_response.agents]}")

    if request.new_chat:
        conversation_title = orchestrator_response.conversation_title
        set_conversation_title(db, request.conversation_id, conversation_title)
    else:
        conversation_title = get_conversation_title(db, request.conversation_id)

    agent_context = AgentContext(
        user_message=request.message,
        conversation_history=context_history
    )

    for agent_call in orchestrator_response.agents:
        agent = AVALABILE_AGENTS.get(agent_call.agent)
        if not agent:
            continue
        agent_context = agent["run"](db, agent_context, agent_call)
    
    
    output_blocks = build_output_blocks(agent_context)

    return output_blocks, agent_context