from sqlalchemy.orm import Session
from sqlalchemy import select
from models import MessageModel, ConversationModel
from schemas import ChatMessage

def get_conversation_history(db: Session, user_id: int, conversation_id: int, limit: int = None):
    
    stmt = (
        select(MessageModel)
        .where(
            MessageModel.user_id == user_id,
            MessageModel.conversation_id == conversation_id
        )
        #ordonez descrescator ca sa le am pe cele mai recente, apoi in le reordonez ca sa fie cronologic
        .order_by(MessageModel.created_at.desc())
    )

    if limit is not None:
        stmt.limit(limit)
    
    rows = db.execute(stmt).scalars().all()
    
    #inversez pentru ordinea cronologica
    rows = list(reversed(rows))
    
    return [{"role": row.role, "content": row.content} for row in rows]

def get_full_conversation(db: Session, user_id: int, conversation_id: int):
    stmt = (
        select(MessageModel)
        .where(
            MessageModel.user_id == user_id,
            MessageModel.conversation_id == conversation_id
        )
        .order_by(MessageModel.created_at.asc())
    )

    rows = db.execute(stmt).scalars().all()

    return [ChatMessage.model_validate(row) for row in rows]

def get_user_conversations(db: Session, user_id: int):
    stmt = (
        select(ConversationModel)
        .where(
            ConversationModel.user_id == user_id
        )
        .order_by(ConversationModel.created_at.desc())
    )

    rows = db.execute(stmt).scalars().all()

    return rows