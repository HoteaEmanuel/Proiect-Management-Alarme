from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from database import get_db
from sqlalchemy.orm import Session
from typing import List

from schemas import MessageRequest, AssistantMessage, ConversationListresponse, ConversationHistory, RawFileAttachment, UpdateTitleRequest, CloudinaryFileAttachment
from integrations.chatbot import user_chat_request
from crud import get_user_conversations, get_full_conversation, delete_conversation, update_conversation_title, get_file_history
from auth_utils import get_current_user

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)

@router.post("/chatbot", response_model=AssistantMessage)
async def send_message_to_chatbot(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
    conversation_id: str | None = Form(None), 
    message: str = Form(''),
    new_chat: bool = Form(False),
    files: list[UploadFile] = File(default=[]),
    file_preserve_flags: list[str] = Form(default=[])
):
    print(user_id,conversation_id,message,new_chat,files,file_preserve_flags)
    parsed_flags = [f.lower() == "true" for f in file_preserve_flags]
    while len(parsed_flags) < len(files):
            parsed_flags.append(False)   
    
    raw_files = []
    for upload_file, preserve in zip(files, parsed_flags):
        content = await upload_file.read()
        raw_files.append(RawFileAttachment(
            filename=upload_file.filename or "unknown",
            content=content,
            preserve=preserve
        ))
    
    print(f"[ROUTER] files primite: {len(files)}")
    print(f"[ROUTER] raw_files construite: {len(raw_files)}")
    for f in raw_files:
        print(f"[ROUTER] - {f.filename}, {len(f.content)} bytes, preserve={f.preserve}")
    
    request = MessageRequest(
            user_id=user_id["id"],
            conversation_id=conversation_id,
            message=message,
            new_chat=new_chat,
            files=raw_files
        )

    try:
        request.user_id=user_id["id"]
        return user_chat_request(db=db, request=request)
    except Exception as e:
        print(f"{str(e)}")
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

@router.get("/conversations/{conversation_id}/files", response_model=list[CloudinaryFileAttachment])
def get_conversation_files(conversation_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        files = get_file_history(db=db, user_id=user_id["id"], conversation_id=conversation_id)
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_chat(conversation_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        delete_conversation(db=db, user_id=user_id["id"], conversation_id=conversation_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.patch("/conversations/{conversation_id}", status_code=200)
def edit_conversation_title(conversation_id: str, body: UpdateTitleRequest , user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        update_conversation_title(db=db, user_id=user_id["id"], conversation_id=conversation_id, new_title=body.new_title)
        return {"detail": "Title updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
