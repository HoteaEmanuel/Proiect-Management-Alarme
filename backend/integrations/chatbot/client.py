
import os
from openai import AzureOpenAI
from sqlalchemy.orm import Session
from models.exceptions import AppError
from schemas import ChatRequest, ChatCreate, ChatResponse
from crud import get_conversation_history, get_full_conversation
from .service import save_message_to_db, create_new_conversation

ai_model = os.getenv("AI_MODEL")
model_key = os.getenv("MODEL_KEY")
api = os.getenv("API")
endpoint = os.getenv("ENDPOINT")

client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key=model_key,
    api_version="2025-04-01-preview"
)

def llm_request(db: Session, request: ChatRequest):

    try:

        if request.new_chat:
            conversation = create_new_conversation(db=db, user_id=request.user_id)
            conversation_id = conversation.conversation_id
        else:
            conversation_id = request.conversation_id

        system_prompt = {"role": "system", "content": "Acest mesaj e doar un test de conexiune.\
                        Te rog sa returnezi [assistent]: + mesajul utilizatorului."}

        context_history = get_conversation_history(db=db, user_id=request.user_id, 
                                        conversation_id=conversation_id, 
                                        limit=10)

        message = [
            {"role": "user", "content": request.message}
        ]

        config = {
            "messages" : [system_prompt] + context_history + message,
            "model" : ai_model,
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

        user_message_data = ChatCreate(
            conversation_id=conversation_id,
            user_id=request.user_id,
            role="user",
            content=request.message
        )
        save_message_to_db(db=db, message_data=user_message_data)

        response = client.chat.completions.create(**config)


        bot_reply = response.choices[0].message.content
        #used_tokens = response.usage.total_tokens

        bot_message_data = ChatCreate(
            conversation_id=conversation_id,
            user_id=request.user_id,
            role="assistant",
            content=bot_reply
        )

        save_message_to_db(db=db, message_data=bot_message_data)

        full_chat_history = get_full_conversation(db=db, 
                                             user_id=request.user_id, 
                                             conversation_id=conversation_id)

        return ChatResponse(conversation_id=conversation_id, conversation=full_chat_history)
    except Exception as e:
        raise AppError(status_code=500, detail=str(e))
