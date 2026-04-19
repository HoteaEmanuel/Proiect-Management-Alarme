from sqlalchemy.orm import Session
from backend.models import MessageModel
from .schemas import ChatCreate

def save_message_to_db(db: Session, message_data: ChatCreate):
    
    db_message = MessageModel(
        chat_id=message_data.chat_id,
        user_id=message_data.user_id,
        role=message_data.role,
        content=message_data.content
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message