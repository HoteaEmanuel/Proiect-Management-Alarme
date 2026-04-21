from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from sqlalchemy.orm import Session

from integrations.chatbot import ChatRequest, ChatResponse, ConversationResponse, ConversationCreate, ConversationListresponse
from integrations.chatbot import llm_request, create_new_conversation

from crud import get_user_conversations

from models.exceptions import AppError


router = APIRouter()

@router.post("/chatbot", response_model=ChatResponse)
async def send_message_to_chatbot(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        return llm_request(db=db, request=request)

    except AppError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.get("/conversations/{user_id}", response_model=ConversationListresponse)
async def get_conversations_list(user_id: int, db: Session = Depends(get_db)):
    return ConversationListresponse(
        conversations=get_user_conversations(db=db, user_id=user_id)
    )

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(request: ConversationCreate, db: Session = Depends(get_db)):
    try:
        conversation = create_new_conversation(db=db, user_id=request.user_id)

        return ConversationResponse.model_validate(conversation)
    except AppError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)