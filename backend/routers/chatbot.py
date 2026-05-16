from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from database import get_db
from sqlalchemy.orm import Session
from typing import List

from schemas import MessageRequest, AssistantMessage, ConversationListresponse, ConversationHistory, RawFileAttachment 
from schemas import UpdateTitleRequest, CloudinaryFileAttachment, ConversationResponse, ConversationFileList
from integrations.chatbot import user_chat_request, parse_raw_files
from crud import get_user_conversations, get_full_conversation, delete_conversation, update_conversation_title, get_file_history, get_conversation_data
from auth_utils import get_current_user

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)

# Processes a user message and uploaded files, forwards them to the AI orchestrator, and returns the assistant's response
@router.post("/chatbot", response_model=AssistantMessage)
async def send_message_to_chatbot(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
    conversation_id: str | None = Form(None), 
    message: str = Form(''),
    new_chat: bool = Form(False),
    raw_files: list[RawFileAttachment] = Depends(parse_raw_files),
):  
    request = MessageRequest(
            user_id=user_id["id"],
            conversation_id=conversation_id,
            message=message,
            new_chat=new_chat,
            files=raw_files
        )
    
    return user_chat_request(db=db, request=request)

# Retrieves a list of all chat conversations associated with the current user
@router.get("/conversations", response_model=ConversationListresponse)
def get_conversations_list(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    return ConversationListresponse(
        conversations=get_user_conversations(db=db, user_id=user_id["id"])
    )
 
@router.get("/conversations/{conversation_id}", response_model=ConversationHistory)
def get_chat_history(conversation_id: str, user_id : str = Depends(get_current_user), db: Session = Depends(get_db)):
    return ConversationHistory(
        messages=get_full_conversation(db=db, user_id=user_id["id"], conversation_id=conversation_id)
    )
    
# Retrieves metadata and basic information for a specific conversation ID
@router.get("/conversations/{conversation_id}/info",response_model=ConversationResponse)  
def get_conversation_info(conversation_id: str, user_id : str = Depends(get_current_user), db: Session = Depends(get_db)):  
    return get_conversation_data(db=db, user_id=user_id["id"], conversation_id=conversation_id)
   
# Fetches the history of all files uploaded and generated within a specific conversation
@router.get("/conversations/{conversation_id}/files", response_model=ConversationFileList)
def get_conversation_files(conversation_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    all_files = get_file_history(db=db, user_id=user_id["id"], conversation_id=conversation_id)
    return ConversationFileList(
        user_files=[f for f in all_files if f.role == "user"],
        assistant_files=[f for f in all_files if f.role == "assistant"]
    )

@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_chat(conversation_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    delete_conversation(db=db, user_id=user_id["id"], conversation_id=conversation_id)

@router.patch("/conversations/{conversation_id}", status_code=200)
def edit_conversation_title(conversation_id: str, body: UpdateTitleRequest , user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    update_conversation_title(db=db, user_id=user_id["id"], conversation_id=conversation_id, new_title=body.new_title)
    return {"detail": "Title updated successfully"}
    
