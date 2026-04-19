from fastapi import APIRouter, Depends, HTTPException

from integrations.chatbot import ChatRequest, ChatMessage, ChatResponse, llm_request

from models.exceptions import AppError


router = APIRouter()

@router.post("/chatbot", response_model=ChatResponse)
async def send_message_to_chatbot(message: ChatRequest):
    try:
        reply_text, used_tokens = llm_request(message.message)
        return ChatResponse(reply=reply_text, tokens_used=used_tokens)
    except AppError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)