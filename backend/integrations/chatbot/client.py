
import os
from openai import AzureOpenAI
from models.exceptions import AppError

ai_model = os.getenv("AI_MODEL")
model_key = os.getenv("MODEL_KEY")
api = os.getenv("API")
endpoint = os.getenv("ENDPOINT")

client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key=model_key,
    api_version="2025-04-01-preview"
)

def llm_request(message, model=ai_model):
    messages = [
        {"role": "system", "content": "Acest mesaj e doar un test de conexiune. Te rog sa returnezi doar mesajul utilizatorului."},
        {"role": "user", "content": message}
    ]

    config = {
        "messages" : messages,
        "model" : model,
        "reasoning_effort" : "medium",
        "logit_bias" : None,
        "max_completion_tokens" : 8000,
        #"n" : 1,
        #"stop" : None,
        #"stream" : False,
        #"stream_options" : {"include_usage" : False},
        #"temperature" : 0.2,
        #"top_p" : 0.8,
        #"tools" : None,
        #"tool_choice" : "none",
        #"parallel_tool_calls" : True,
        "user" : None
    }

    try:
        response = client.chat.completions.create(**config)

        bot_reply = response.choices[0].message.content
        used_tokens = response.usage.total_tokens

        return bot_reply, used_tokens
    except Exception as e:
        raise AppError(status_code=500, detail=str(e))
