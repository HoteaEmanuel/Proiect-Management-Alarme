# text_agent.py
from sqlalchemy.orm import Session

from schemas import AgentCall, AgentContext, LLMTextResponse
from .prompt_builder import get_system_prompt
from .client import llm_request

QUERY_RESULT_PROMPT = """
The user asked a question that required a database query.
The query was executed and the results are provided below.
Interpret the results in natural language, directly answering the user's original question.
- Be concise and specific, do not just list the raw data
- Highlight important patterns or anomalies if relevant
- If the result is empty, clearly state that no data was found matching the criteria
- Do NOT include the SQL query in your response
- Do NOT mention technical details, column names, assumptions, or how the data was retrieved
- Answer as if you simply know the answer — no references to queries or databases
"""

def get_text_agent_response(db: Session, context: AgentContext, call: AgentCall):
    
    instruction = call.instruction
    if context.sql_result is not None:
        instruction += f"\n\nRezultatele query-ului SQL:\n{context.sql_result}"

    system_prompt = get_system_prompt(
        persona_prompt=False,
        language_prompt=True,
    )

    if context.sql_query_text:
        system_prompt += QUERY_RESULT_PROMPT

    print(f"\n\n[TEXT AGENT] System Prompt: {system_prompt}\n\n")

    llm_response = llm_request(system_prompt, instruction, context.conversation_history, LLMTextResponse)

    context.text_response = llm_response.text_response

    return context