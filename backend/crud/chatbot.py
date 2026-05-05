from sqlalchemy.orm import Session
from sqlalchemy import select, text
import pandas as pd
import io
import fitz
import json
import requests

from models import MessageModel, ConversationModel, AppError, ConversationFileModel
from schemas import MessageCreate, FileAttachment

def parse_pdf(content: bytes) -> str:
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        pages = []
        for page_index, page in enumerate(doc):
            text=page.get_text("text") or ""
            if text.strip():
                pages.append(
                    f"\n\n[Pagina {page_index+1}]\n{text.strip()}"
                )
        extracted_text="\n".join(pages).strip()
        if not extracted_text:
            raise AppError(status_code=400, detail="PDF extraction failed")
        return extracted_text
    except AppError:
        raise
    except Exception as e:
        raise AppError(status_code=400, detail=f"PDF parsing error: {str(e)}")
    
def parse_file(filename: str, content: bytes) -> str:
    #extrag extensia fisierului
    if "." not in filename:
        raise AppError(status_code=400, detail="File has no extension")
    ext = filename.rsplit(".", 1)[-1].lower()

    try:
        #parsez in functie de extensie
        if ext=="pdf":
            return parse_pdf(content)
        elif ext == "csv":
            df=pd.read_csv(io.BytesIO(content), on_bad_lines="skip")
            return df.to_json(orient="records", force_ascii=False)
        elif ext in ("xlsx", "xls"):
            df=pd.read_excel(io.BytesIO(content))
            return df.to_markdown(index=False)
        else:
            raise AppError(status_code=400, detail="Invalid format; accepted: .csv, .xlsx, .xls, .pdf")

    except AppError:
        raise
    except Exception as e:
        raise AppError(status_code=400, detail=f"Parsing error: {str(e)}")

def get_message_files(db: Session, message_id: int):
    try:
        rows = db.execute(
            select(ConversationFileModel)
            .where(
                ConversationFileModel.message_id == message_id,
                ConversationFileModel.is_deleted == False
            )
        ).scalars().all()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")

    return [
        {
            "filename": f.filename,
            "url": f.file_url,
            "public_id": f.public_id,
            "resource_type": f.resource_type,
            "file_format": f.file_format,
            "file_size": f.file_size,
        }
        for f in rows
    ]

def get_conversation_history(db: Session, user_id: str, conversation_id: str, limit: int = 10):
    stmt = (
        select(MessageModel)
        .where(
            MessageModel.user_id == user_id,
            MessageModel.conversation_id == conversation_id
        )
        .order_by(MessageModel.created_at.desc())
        .limit(limit)
    )
    
    try:
        rows = db.execute(stmt).scalars().all()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    messages = list(reversed(rows))
    
    result = []
    for msg in messages:
        if msg.role == "assistant":
            try:
                blocks = json.loads(msg.content)
                content = " ".join(
                    block["content"] for block in blocks 
                    if block.get("type") == "text"
                )
            except:
                content = msg.content
            result.append({"role": msg.role, "content": content})
        else:
            content = msg.content

            files = get_message_files(db, msg.id)
            if files:
                parsed_files = []
                for file in files:
                    try:
                        file_bytes = requests.get(file["url"]).content
                        parsed = parse_file(file["filename"], file_bytes)
                        parsed_files.append(f"[{file['filename']}]:\n{parsed}")
                    except Exception:
                        continue  # fisierul nu poate fi parsat, il sarim

                if parsed_files:
                    content += "\n\nFișiere atașate:\n\n" + "\n\n".join(parsed_files)

            result.append({"role": msg.role, "content": content})

    return result

#functie ce returneaza intregul istoric al unei conversatii (necesara pentru a returna conversatia catre front folosind MessageModel)
def get_full_conversation(db: Session, user_id: str, conversation_id: str):
    try:
        conversation = db.execute(
            select(ConversationModel)
            .where(ConversationModel.conversation_id == conversation_id)
        ).scalar()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")

    if conversation is None:
        raise AppError(status_code=404, detail="Conversation not found")

    try:
        stmt = (
            select(MessageModel)
            .where(
                MessageModel.user_id == user_id,
                MessageModel.conversation_id == conversation_id
            )
            .order_by(MessageModel.created_at.asc())
        )
        messages = db.execute(stmt).scalars().all()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
    result = []
    for msg in messages:
        if msg.role == "assistant":
            try:
                blocks = json.loads(msg.content)
            except:
                blocks = msg.content
            result.append({"role": msg.role, "blocks": blocks})
        else:
            files = get_message_files(db, msg.id)
            entry = {"role": msg.role, "content": msg.content}
            if files:
                entry["files"] = files
            result.append(entry)
    
    return result

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
def save_message_to_db(db: Session, message_data: MessageCreate):
    
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
    


def save_conversation_files(
    db: Session,
    user_id: str,
    conversation_id: str,
    message_id: int | None,
    files: list[FileAttachment]
):
    db_files = [
        ConversationFileModel(
            user_id=user_id,
            conversation_id=conversation_id,
            message_id=message_id,
            filename=file.filename,
            file_url=file.url,
            public_id=file.public_id,
            resource_type=file.resource_type,
            file_format=file.file_format,
            file_size=file.file_size,
        )
        for file in files
    ]

    db.add_all(db_files)
    db.commit()
    for f in db_files:
        db.refresh(f)

    return db_files
    
#functie care returneaza toate fisierele asociate conversatiei, daca exista
def get_conversation_files(db: Session, conversation_id: str):
    return db.execute(
        select(ConversationFileModel)
        .where(
            ConversationFileModel.conversation_id == conversation_id
        )
        .order_by(ConversationFileModel.created_at.asc())
    ).scalars().all()
