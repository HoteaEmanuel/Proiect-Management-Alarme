import os
import logging
from pydantic import BaseModel
from openai import AzureOpenAI
from typing import Any

from core import LLMQueryExecutionError, ExternalServiceError

logger = logging.getLogger(__name__)

ai_model = os.getenv("AI_MODEL")
model_key = os.getenv("MODEL_KEY")
api = os.getenv("API")
endpoint = os.getenv("ENDPOINT")

client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key=model_key,
    api_version="2025-04-01-preview"
)

# Sends a formatted request to the Azure OpenAI model and returns the response payload
def llm_request(system_prompt: str, user_prompt: str, context: list[dict[str, str]] = None, response_model: type[BaseModel] = None) -> Any:

    system_prompt = {"role": "system", "content": system_prompt}
    user_prompt = {"role": "user", "content": user_prompt}

    config = {
            "messages" : [system_prompt] + (context or []) + [user_prompt],
            "model" : ai_model,
            "reasoning_effort" : "medium",
            "max_completion_tokens" : 8000,
        }
    
    try:
        if response_model:
            config["response_format"] = response_model
            response = client.beta.chat.completions.parse(**config)

            if not response.choices[0].message.parsed:
                raise LLMQueryExecutionError("The AI model failed to structure the response correctly.")

            return response.choices[0].message.parsed
        
        else:
            response = client.beta.chat.completions.create(**config)
            return response.choices[0].message.content
        
    except Exception as e:
        raise ExternalServiceError(
            service_name="OpenAI",
            details=f"API call failed: {str(e)}"
        )