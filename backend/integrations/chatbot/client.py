import os

from pydantic import BaseModel
from openai import AzureOpenAI

from models import AppError

ai_model = os.getenv("AI_MODEL")
model_key = os.getenv("MODEL_KEY")
api = os.getenv("API")
endpoint = os.getenv("ENDPOINT")

client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key=model_key,
    api_version="2025-04-01-preview"
)

def llm_request(system_prompt: str, user_prompt: str, context: list[dict[str, str]] = None, response_model: type[BaseModel] = None):

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
            return response.choices[0].message.parsed
        else:
            response = client.beta.chat.completions.create(**config)
            return response.choices[0].message.content
    except Exception as e:
        raise AppError(status_code=500, detail=f"AI model API call error: str({e})")