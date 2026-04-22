from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from sqlalchemy.orm import Session

from schemas import ChatRequest, ChatResponse, ConversationListresponse
from integrations.chatbot import user_chat_request
from crud import get_user_conversations, get_full_conversation
from models import AppError

router = APIRouter()

@router.post("/chatbot", response_model=ChatResponse)
def send_message_to_chatbot(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        return user_chat_request(db=db, request=request)
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.get("/conversations/{user_id}", response_model=ConversationListresponse)
def get_conversations_list(user_id: int, db: Session = Depends(get_db)):
    try:
        return ConversationListresponse(
            conversations=get_user_conversations(db=db, user_id=user_id)
        )
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.get("/chat/{chat_id}", response_model=ChatResponse)
def get_chat_history(user_id: int, chat_id: int, db: Session = Depends(get_db)):
    try:
        history = get_full_conversation(db=db, user_id=user_id, conversation_id=chat_id)
        return ChatResponse(conversation_id=chat_id, conversation=history)
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

