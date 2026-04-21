from sqlalchemy.orm import Session
from models import MessageModel, ConversationModel
from schemas import ChatCreate

def save_message_to_db(db: Session, message_data: ChatCreate):
    
    db_message = MessageModel(
        conversation_id=message_data.conversation_id,
        user_id=message_data.user_id,
        role=message_data.role,
        content=message_data.content
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message

def create_new_conversation(db: Session, user_id: int):
    
    conversation = ConversationModel(
        user_id=user_id
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    return conversation