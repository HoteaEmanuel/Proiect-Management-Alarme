from sqlalchemy.orm import Session

from schemas import AgentCall, AgentContext,LLMSQLResponse
from crud import run_llm_query
from .prompt_builder import get_system_prompt
from .client import llm_request
from .query_validator import is_query_safe

def get_sql_agent_response(db: Session, context: AgentContext, call: AgentCall):

    system_prompt = get_system_prompt(
        persona_prompt=True,
        db_schema_prompt=True,
        db_safety_prompt=True,
        sql_output_prompt=True
    )

    llm_response = llm_request(system_prompt, call.instruction, context.conversation_history, LLMSQLResponse)

    if llm_response.has_sql_query:
        query = llm_response.sql_query
        if is_query_safe(query):
            context.sql_query_text = query
            context.sql_result = run_llm_query(db, query)

    return context