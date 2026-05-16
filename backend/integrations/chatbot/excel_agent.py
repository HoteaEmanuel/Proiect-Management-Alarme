from sqlalchemy.orm import Session
import pandas as pd
import io

from schemas import AgentCall, AgentContext, ExcelStructure, RawFileAttachment
from .client import llm_request
from integrations.cloudinary import upload_file_to_cloudinary

EXCEL_STRUCTURE_PROMPT = """
You are an Excel export agent. Your job is to define the structure of an Excel file based on the data provided.

You will receive a list of records. Each record is a dictionary with specific keys.
Your output must be a valid ExcelStructure JSON object:
- filename: descriptive, lowercase, underscores, ends in .xlsx
- sheet_name: short and descriptive, max 31 characters
- headers: human-readable column names (e.g. "Total Sales" not "total_sales")
- column_mapping: the exact key from the data records that corresponds to each header, in the same order

Do NOT reproduce the data. Only define the structure.
"""

def get_excel_agent_response(db: Session, context: AgentContext, call: AgentCall):

    instruction = call.instruction

    if context.sql_result:
        sample = context.sql_result[0]
        instruction += f"\n\nAvailable keys in data: {list(sample.keys())}"

    llm_response = llm_request(EXCEL_STRUCTURE_PROMPT, instruction, context.conversation_history, ExcelStructure)

    mapped_data = [
        {header: record.get(key) for header, key in zip(llm_response.headers, llm_response.column_mapping)}
        for record in (context.sql_result or [])
    ]

    buffer = io.BytesIO
    df = pd.DataFrame(mapped_data, columns=llm_response.headers)
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name=llm_response.sheet_name)
    buffer.seek(0)

    raw_file = RawFileAttachment(filename=llm_response.filename, content=buffer.read(), preserve=True)
    context.file_export = upload_file_to_cloudinary(file=raw_file)

    return context