# text_agent.py
from sqlalchemy.orm import Session

from schemas import AgentCall, AgentContext, LLMTextResponse
from .prompt_builder import get_system_prompt
from .client import llm_request

def get_text_agent_response(db: Session, context: AgentContext, call: AgentCall):
    
    instruction = call.instruction
    if context.sql_result is not None:
        instruction += f"\n\nRezultatele query-ului SQL:\n{context.sql_result}"

    system_prompt = get_system_prompt(
        persona_prompt=True,
        language_prompt=True,
        error_handling_prompt=True,
        sql_output_prompt=True if context.sql_result is not None else False
    )

    llm_response = llm_request(system_prompt, instruction, context.conversation_history, LLMTextResponse)

    context.text_response = llm_response.text_response

    return context