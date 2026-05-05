from sqlalchemy.orm import Session
from schemas import AgentCall, AgentContext
import json

from .prompt_builder import get_system_prompt
from .client import llm_request
from models import AppError

CHART_OUTPUT_PROMPT = """
You are a chart configuration generator.
You receive the user's chart request and data (from SQL results or file contents).
Return ONLY a valid JSON object — no markdown, no backticks, no explanation.

The JSON must include:
- chart_type: one of "bar", "line", "pie", "area"
- title: string
- data: array of objects with consistent keys
- x_key: string — the key used for the X axis
- y_keys: array of strings — the keys used for the Y axis
"""

def get_graphics_agent_response(db: Session, context: AgentContext, call: AgentCall):

    if context.sql_result is not None:
        call.instruction += f"\n\nSQL results:\n{context.sql_result}"

    if context.file_contents is not None:
        call.instruction += f"\n\nFile contents:\n{context.file_contents}"

    system_prompt = get_system_prompt(persona_prompt=False) + CHART_OUTPUT_PROMPT

    raw_response = llm_request(system_prompt, call.instruction, context.conversation_history)

    try:
        clean = raw_response.strip().removeprefix("```json").removesuffix("```").strip()
        context.chart_config = json.loads(clean)
    except Exception as e:
        raise AppError(status_code=500, detail=f"Chart parsing error: {str(e)}")

    return context