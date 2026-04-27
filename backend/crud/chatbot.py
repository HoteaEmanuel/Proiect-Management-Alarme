from sqlalchemy.orm import Session
from sqlalchemy import select, text

from models import MessageModel, ConversationModel, AppError
from schemas import ChatMessage, ChatCreate

#functie ce returneaza istoricul unei conversatii, cu limita de mesaje (de folosit pentru fereastra de context a agentilor)
def get_conversation_history(db: Session, user_id: str, conversation_id: str, limit: int = 10):
    
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
def get_full_conversation(db: Session, user_id: str, conversation_id: str):
    stmt = (
        select(MessageModel)
        .where(
            MessageModel.user_id == user_id,
            MessageModel.conversation_id == conversation_id
        )
        .order_by(MessageModel.created_at.asc())
    )

    try:
        conversation = db.execute(
            select(ConversationModel)
            .where(ConversationModel.conversation_id == conversation_id)
        ).scalar()

        if conversation is None:
            raise AppError(status_code=404, detail="Conversation not found")

        rows = db.execute(stmt).scalars().all()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    return {
        "conversation_title": conversation.conversation_title, 
        "messages": [ChatMessage.model_validate(row) for row in rows]
    }

#functie ce returneaza lista de conversatii ale user ului
def get_user_conversations(db: Session, user_id: str):
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

#functie ce salveaza un mesaj in baza de date
def save_message_to_db(db: Session, message_data: ChatCreate):
    
    message = MessageModel(
        conversation_id=message_data.conversation_id,
        user_id=message_data.user_id,
        role=message_data.role,
        content=message_data.content,
        has_sql_query=message_data.has_sql_query,
        sql_query=message_data.sql_query
    )
    
    try:
        db.add(message)
        db.commit()
        db.refresh(message)
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    return message

def set_response_id(db: Session, user_message_id: int, bot_response_id: int):
    try:
        db.query(MessageModel)\
            .filter(MessageModel.id == user_message_id)\
            .update({"response_id": bot_response_id})
        db.commit()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
def get_conversation_title(db: Session, conversation_id: str):
    try:
        result = db.execute(
            text("SELECT CONVERSATION_TITLE FROM CONVERSATIONS WHERE CONVERSATION_ID = :conversation_id"),
            {"conversation_id": conversation_id}
        ).scalar()

        if result is None:
            raise AppError(status_code=400, detail="Conversation not found")
        
        return result
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")

def set_conversation_title(db: Session, conversation_id: str, conversation_title: str):
    try:
        db.query(ConversationModel)\
            .filter(ConversationModel.conversation_id == conversation_id)\
            .update({"conversation_title": conversation_title})
        db.commit()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    

#functie ce creeaza o noua conversatie in baza de date
def create_new_conversation(db: Session, user_id: str):
    
    conversation = ConversationModel(
        user_id=user_id,
    )
    
    try:
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    return conversation

def run_llm_query(db: Session, query: str):
    try:
        result = db.execute(text(query))
        if result.returns_rows:
            return [dict(row) for row in result.mappings().all()]

        return []
    except AppError as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
#functie care sterge o conversatie+toate mesajele asoctiate din baza de date      
def delete_conversation(db: Session, user_id: str, conversation_id: str):
    try:
        conversation=db.execute(
            select(ConversationModel).
            where(
                ConversationModel.conversation_id == conversation_id,
                ConversationModel.user_id == user_id)
        ).scalar()
        if conversation is None:
            raise AppError(status_code=404, detail="Conversation not found")
        
        # sterg toate mesajele asociate conversatiei
        db.query(MessageModel).filter(MessageModel.conversation_id == conversation_id).delete()
        
        # sterg conversatia
        db.delete(conversation)
        db.commit()
        
    except AppError:
        raise
    except Exception as e:
        db.rollback()
        raise AppError(status_code=500, detail=f"Database error: {str(e)}") 
    
def update_conversation_title(db: Session, user_id: str, conversation_id: str, new_title: str):
    conversation = db.execute(
        select(ConversationModel)
        .where(
            ConversationModel.conversation_id == conversation_id,
            ConversationModel.user_id == user_id
        )
    ).scalar()
    if conversation is None:
        raise AppError(status_code=404, detail="Conversation not found")
    
    try:
        conversation.conversation_title=new_title
        db.commit()
    except Exception as e:
        db.rollback()
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")