from sqlalchemy.orm import Session
from schemas import AgentCall, AgentContext
import json
import logging

from .prompt_builder import get_system_prompt
from .client import llm_request
from core import LLMQueryExecutionError

logger = logging.getLogger(__name__)

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

# Requests a JSON chart configuration from the LLM using available data and appends it to the agent context
def get_graphics_agent_response(db: Session, context: AgentContext, call: AgentCall) -> AgentContext:

    if context.sql_result is not None:
        call.instruction += f"\n\nSQL results:\n{context.sql_result}"

    if context.file_contents is not None:
        call.instruction += f"\n\nFile contents:\n{context.file_contents}"

    system_prompt = get_system_prompt(persona_prompt=False) + CHART_OUTPUT_PROMPT

    raw_response = llm_request(system_prompt, call.instruction, context.conversation_history)

    try:
        clean = raw_response.strip().removeprefix("```json").removesuffix("```").strip()
        context.chart_config = json.loads(clean)

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI chart config. Raw response: {raw_response}")
        raise LLMQueryExecutionError("The AI model failed to generate a valid chart configuration format.")
    
    except Exception as e:
        logger.error(f"Unexpected error processing AI chart config: {str(e)}")
        raise LLMQueryExecutionError(f"An unexpected error occurred while processing the graphics instruction.")

    return context