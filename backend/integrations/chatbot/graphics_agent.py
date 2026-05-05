from sqlalchemy.orm import Session
from schemas import AgentCall, AgentContext, LLMChartResponse
from .prompt_builder import get_system_prompt
from .client import llm_request

CHART_OUTPUT_PROMPT = """
You are a chart configuration generator.
You receive the user's chart request and SQL query results.
Your job is to return a JSON object that can be used by the frontend to render a Recharts chart.

Return only valid structured data.
Do not include explanations, Markdown, or natural language text.

The chart config must be suitable for Recharts and must include:
- chart_type
- title
- data
- x_key
- y_keys
"""

def get_graphics_agent_response(db: Session, context: AgentContext, call: AgentCall):

    system_prompt = get_system_prompt(persona_prompt=False) + CHART_OUTPUT_PROMPT

    llm_response = llm_request(system_prompt, call.instruction, context.conversation_history, LLMChartResponse)

    context.chart_config = llm_response.model_dump()

    return context