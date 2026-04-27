from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from sqlalchemy.orm import Session

from schemas import ChatRequest, ChatResponse, ConversationListresponse, ConversationTitleUpdate, ConversationHistory
from integrations.chatbot import user_chat_request
from crud import get_user_conversations, get_full_conversation, delete_conversation, update_conversation_title
from .auth import get_current_user

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)

@router.post("/chatbot", response_model=ChatResponse)
def send_message_to_chatbot(request: ChatRequest, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        request.user_id=user_id["id"]
        return user_chat_request(db=db, request=request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations", response_model=ConversationListresponse)
def get_conversations_list(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return ConversationListresponse(
            conversations=get_user_conversations(db=db, user_id=user_id["id"])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversation/{conversation_id}", response_model=ConversationHistory)
def get_chat_history(conversation_id: str, user_id : str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        conversation = get_full_conversation(db=db, user_id=user_id["id"], conversation_id=conversation_id)
        return ConversationHistory(mesages=conversation["messages"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_chat(conversation_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        delete_conversation(db=db, user_id=user_id["id"], conversation_id=conversation_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.patch("/conversations/{conversation_id}", status_code=200)
def edit_conversation_title(conversation_id: str, body: ConversationTitleUpdate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        update_conversation_title(db=db, user_id=user_id["id"], conversation_id=conversation_id, new_title=body.new_title)
        return {"detail": "Title updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))