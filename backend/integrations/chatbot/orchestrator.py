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
3. Write a clear instruction for each agent, including any relevant context from the user's message
4. Order the agents correctly — if one agent depends on another's output, it must come after

Rules:
- Only use agents from the available list
- Instructions must be self-contained — each agent only sees its own instruction and the shared context
- If the user asks for a chart, sql must always come before chart
- If the user starts a new conversation, generate a short and relevant conversation_title

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