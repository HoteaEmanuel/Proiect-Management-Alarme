from sqlalchemy.orm import Session
from sqlalchemy import select

from models import MessageModel, ConversationModel, AppError
from schemas import ChatMessage, ChatCreate

#functie ce returneaza istoricul unei conversatii, cu limita de mesaje (de folosit pentru fereastra de context a agentilor)
def get_conversation_history(db: Session, user_id: int, conversation_id: int, limit: int = 10):
    
    #querry ff simplu pentru a prelua mesajele
    stmt = (
        select(MessageModel)
        .where(
            MessageModel.user_id == user_id,
            MessageModel.conversation_id == conversation_id
        )
        #ordonez descrescator ca sa le am pe cele mai recente, apoi in le reordonez ca sa fie cronologic
        .order_by(MessageModel.created_at.desc())
        .limit(limit)
    )
    
    try:
        rows = db.execute(stmt).scalars().all()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    #inversez pentru ordinea cronologica
    rows = list(reversed(rows))
    
    #parsez rezultatete ca sa le am sub forma de dictionare
    return [{"role": row.role, "content": row.content} for row in rows]

#functie ce returneaza intregul istoric al unei conversatii (necesara pentru a returna conversatia catre front folosind MessageModel)
def get_full_conversation(db: Session, user_id: int, conversation_id: int):
    stmt = (
        select(MessageModel)
        .where(
            MessageModel.user_id == user_id,
            MessageModel.conversation_id == conversation_id
        )
        .order_by(MessageModel.created_at.asc())
    )

    try:
        rows = db.execute(stmt).scalars().all()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    return [ChatMessage.model_validate(row) for row in rows]

#functie ce returneaza lista de conversatii ale user ului
def get_user_conversations(db: Session, user_id: int):
    stmt = (
        select(ConversationModel)
        .where(
            ConversationModel.user_id == user_id
        )
        .order_by(ConversationModel.created_at.desc())
    )

    try:
        rows = db.execute(stmt).scalars().all()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    return rows

#functie ce salveaza un mesaj in baza de date (ATENTIE: mesajul trebuie sa apartina unei conversatii)
def save_message_to_db(db: Session, message_data: ChatCreate):
    
    message = MessageModel(
        conversation_id=message_data.conversation_id,
        user_id=message_data.user_id,
        role=message_data.role,
        content=message_data.content
    )
    
    try:
        db.add(message)
        db.commit()
        db.refresh(message)
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    return message


#functie ce creeaza o noua conversatie in baza de date
def create_new_conversation(db: Session, user_id: int):
    
    conversation = ConversationModel(
        user_id=user_id
    )
    
    try:
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    return conversation