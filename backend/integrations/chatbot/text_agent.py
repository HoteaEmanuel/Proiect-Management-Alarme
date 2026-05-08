# text_agent.py
from sqlalchemy.orm import Session

from schemas import AgentCall, AgentContext
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

TEXT_FORMAT_PROMPT = """
Format your responses using Markdown when it improves readability:
- Use **bold** for important values or numbers
- Use *italic* for emphasis
- Use ## or ### for headings in longer responses
- Use `inline code` for technical terms or values
- Use Markdown tables for structured or comparative data (e.g. lists of alarms, metrics, or results with multiple attributes)
"""

def get_text_agent_response(db: Session, context: AgentContext, call: AgentCall):
    
    instruction = call.instruction
    if context.sql_result is not None:
        instruction += f"\n\nSQL Query Results:\n{context.sql_result}"

    if context.file_contents is not None:
        instruction += f"\n\nFile contents:\n{context.file_contents}"

    system_prompt = get_system_prompt(
        persona_prompt=False,
        language_prompt=True,
    ) + TEXT_FORMAT_PROMPT

    if context.sql_query_text:
        system_prompt += QUERY_RESULT_PROMPT

    print(f"\n\n[TEXT AGENT] System Prompt: {system_prompt}\n\n")

    context.text_response = llm_request(system_prompt, instruction, context.conversation_history)

    return context