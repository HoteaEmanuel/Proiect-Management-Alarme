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

FILE_EXPORT_PROMPT = """
A file was exported during this conversation turn and is available for the user to download.
Mention it naturally at the end of your response:
- One sentence only
- Match the user's language exactly
- Do NOT describe the file contents again
- Do NOT say where to find it or how to download it
- Example: "I've also prepared an Excel file with the full data for you to download."
"""

TEXT_FORMAT_PROMPT = """
Format your responses using Markdown to ensure clarity and visual appeal:
- Use **bold** for important values, numbers, or key terms
- Use *italic* for emphasis or secondary information
- Use ## or ### for headings in longer responses to separate sections clearly
- Use `inline code` for technical terms, identifiers, or exact values
- Use Markdown tables for structured or comparative data — always include a header row and align columns
- Use bullet points or numbered lists for sequences, steps, or enumerations
- Add spacing between sections to improve readability
- Avoid walls of text — break long paragraphs into shorter, focused ones
- Prefer tables over plain lists when data has multiple attributes per item
"""

# Generates a natural language response using the LLM, incorporating SQL results or file contents if available
def get_text_agent_response(db: Session, context: AgentContext, call: AgentCall) -> AgentContext:
    
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

    if context.file_export:
        system_prompt += FILE_EXPORT_PROMPT

    print(f"\n\n[TEXT AGENT] System Prompt: {system_prompt}\n\n")

    context.text_response = llm_request(system_prompt, instruction, context.conversation_history)

    return context