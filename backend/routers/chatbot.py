from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from database import get_db
from sqlalchemy.orm import Session
from typing import List

from schemas import MessageRequest, MessageResponse, ConversationListresponse, ConversationTitleUpdate, ConversationHistory
from integrations.chatbot import user_chat_request
from integrations.chatbot.cloudinary_service import upload_file_to_cloudinary
from crud import get_user_conversations, get_full_conversation, delete_conversation, update_conversation_title, save_conversation_file
from auth_utils import get_current_user

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)

@router.post("/chatbot", response_model=MessageResponse)
def send_message_to_chatbot(request: MessageRequest, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
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

@router.get("/conversations/{conversation_id}", response_model=ConversationHistory)
def get_chat_history(conversation_id: str, user_id : str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        conversation = get_full_conversation(db=db, user_id=user_id["id"], conversation_id=conversation_id)
        return ConversationHistory(messages=conversation)
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
    
# router incarcare fisiere multiple (excel/csv/pdf) in conversatie
# Swagger UI interpreteaza List[UploadFile] ca array<string> in loc de file picker
# openapi_extra suprascrie schema generata automat: format binary = file picker cu multi-select
@router.post(
    "/conversations/{conversation_id}/upload-file",
    status_code=201,
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "file": {
                                "type": "array",
                                "items": {"type": "string", "format": "binary"}
                            }
                        },
                        "required": ["file"]
                    }
                }
            }
        }
    }
)
def upload_conversation_file(conversation_id: str, file: List[UploadFile] = File(...), user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    print("user_id:", user_id)
    print("conversation_id:", conversation_id)
    try:
        uploaded_files = []
        for uploaded_file in file:
            content = uploaded_file.file.read()
            save_conversation_file(db, user_id["id"], conversation_id, uploaded_file.filename, content)
            uploaded_files.append(uploaded_file.filename)

        return {
            "detail": "Files uploaded successfully",
            "files": uploaded_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/upload/cloudinary")
def upload_to_cloudinary(file: UploadFile = File(...)):
    try:
        uploaded_file = upload_file_to_cloudinary(file)

        return {
            "message": "File uploaded successfully",
            "file": uploaded_file,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}",
        )