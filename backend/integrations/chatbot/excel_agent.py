from sqlalchemy.orm import Session
from openpyxl import Workbook
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

# Processes a row of data by safely converting its cells to integer, float, or string types for Excel
def coerce_row(row: list) -> list:
    result = []
    for cell in row:
        if cell is None:
            result.append(None)
            continue
        try:
            result.append(int(cell))
            continue
        except (ValueError, TypeError):
            pass
        try:
            result.append(float(cell))
            continue
        except (ValueError, TypeError):
            pass
        result.append(str(cell))
    return result

# Generates an Excel file based on the LLM-defined structure and database results, then saves it to the context
def get_excel_agent_response(db: Session, context: AgentContext, call: AgentCall) -> AgentContext:

    instruction = call.instruction

    if context.sql_result:
        sample = context.sql_result[0]
        instruction += f"\n\nAvailable keys in data: {list(sample.keys())}"

    llm_response = llm_request(EXCEL_STRUCTURE_PROMPT, instruction, context.conversation_history, ExcelStructure)

    workbook = Workbook()
    workbook.remove(workbook.active)
    worksheet = workbook.create_sheet(title=llm_response.sheet_name)

    worksheet.append(llm_response.headers)

    for record in (context.sql_result or []):
        row = [record.get(key) for key in llm_response.column_mapping]
        worksheet.append(coerce_row(row))

    buffer = io.BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    raw_file = RawFileAttachment(filename=llm_response.filename, content=buffer.read(), preserve=True)
    context.file_export = upload_file_to_cloudinary(file=raw_file)

    return context