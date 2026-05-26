# text_agent.py
from sqlalchemy.orm import Session

from schemas import AgentCall, AgentContext, TextAgentResponse
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

SMART_REPLIES_PROMPT = """
You must also generate exactly 3 "smart replies" (follow-up suggestions) for the user.
These will be rendered as clickable buttons to help the user continue the conversation smoothly.
- Anticipate the most logical next questions or actions based on your current response
- Write them strictly from the USER'S perspective (e.g., "Show me the details", NOT "Would you like details?")
- Keep them very concise (maximum 4-6 words per reply)
- Match the exact language of the current conversation
- Ensure variety: one could ask for a drill-down, another for a visualization, and another for a related topic

CRITICAL — Output separation:
- Place these 3 suggestions EXCLUSIVELY in the `smart_replies` array.
- DO NOT include any "Recommendations", "Next steps", "Suggested actions", or "Recomandări rapide" section in the main `text` response. 
- The main `text` must strictly answer the user's question and interpret the data, ending immediately after the conclusion or the file export mention.

CRITICAL — System Capabilities Constraints for Smart Replies:
The system CAN ONLY perform the following actions:
1. Query the database and filter/aggregate data
2. Explain or interpret data in text
3. Generate charts/graphs for visualization
4. Export raw data to Excel (.xlsx)

You MUST NOT suggest any action outside of these capabilities:
- NEVER suggest exporting to PDF, CSV, Word, or any format other than Excel.
- NEVER suggest exporting a chart/graph as a file (e.g., "Export chart to Excel" or "Download chart image" is forbidden).
- If suggesting an Excel export, make sure it refers strictly to exporting the raw data/table.
- Only suggest actions that make sense with the current context and data.
"""

FILE_EXPORT_PROMPT = """
A file was exported during this conversation turn and is available for the user to download.
Mention it naturally at the end of your response:
- One sentence only
- Match the user's language exactly
- Do NOT describe the file contents again
- Do NOT say where to find it or how to download it
- Example: "I've also prepared an Excel file with the full data for you to download."

CRITICAL FOR SMART REPLIES: 
Since you have JUST exported an Excel file, absolutely DO NOT suggest exporting data to Excel in your smart replies. Suggest data analysis, charts, or filtering instead.
"""

# Generates a natural language response using the LLM, incorporating SQL results or file contents if available
def get_text_agent_response(db: Session, context: AgentContext, call: AgentCall) -> AgentContext:
    system_prompt = get_system_prompt(
        persona_prompt=False,
        language_prompt=True,
    ) + TEXT_FORMAT_PROMPT + SMART_REPLIES_PROMPT
    
    if context.sql_query_text:
        system_prompt += QUERY_RESULT_PROMPT

    if context.file_export:
        system_prompt += FILE_EXPORT_PROMPT

    instruction = call.instruction
    if context.sql_result is not None:
        total_rows = len(context.sql_result)
        
        if total_rows > 30:
            preview_data = context.sql_result[:15]
            instruction += (
                f"\n\nSQL Query Results (Preview of first 15 rows out of {total_rows} total):\n"
                f"{preview_data}\n"
                f"\nNOTE: There are {total_rows - 30} more rows not shown here to save space. "
                f"Base your summary on the total count and the preview patterns."
            )
        else:
            instruction += f"\n\nSQL Query Results ({total_rows} rows):\n{context.sql_result}"

    if context.file_contents is not None:
        instruction += f"\n\nFile contents:\n{context.file_contents}"



    response = llm_request(system_prompt, instruction, context.conversation_history, TextAgentResponse)

    context.text_response = response.text
    context.smart_replies = response.smart_replies

    return context