from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, text
import pandas as pd
import io
import fitz
import json
import requests
from docx import Document as DocxDocument

from models import MessageModel, ConversationModel, AppError, ConversationFileModel
from schemas import MessageCreate, CloudinaryFileAttachment
from integrations.cloudinary import get_signed_url

# Extracts and returns text content from a PDF file byte stream
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
    
# Extracts and returns text and table data from a DOCX file byte stream
def parse_docx(content:bytes) -> str:
    try:
        doc=DocxDocument(io.BytesIO(content))
        paragraphs=[p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                cells=[cell.text.strip() for cell in row.cells]
                paragraphs.append(" | ".join(cells))
        extracted = "\n".join(paragraphs).strip()
        if not extracted:
            raise AppError(status_code=400, detail="DOCX extraction failed")
        return extracted
    except AppError:
        raise
    except Exception as e:
        raise AppError(status_code=400, detail=f"DOCX parsing error: {str(e)}")

# Parses various file formats and extracts their text content
def parse_file(filename: str, content: bytes) -> str:
    if "." not in filename:
        raise AppError(status_code=400, detail="File has no extension")
    ext = filename.rsplit(".", 1)[-1].lower()
    try:
        if ext=="pdf":
            return parse_pdf(content)
        elif ext=="docx":
            return parse_docx(content)
        elif ext == "csv":
            df=pd.read_csv(io.BytesIO(content), on_bad_lines="skip")
            return df.to_json(orient="records", force_ascii=False)
        elif ext in ("xlsx", "xls"):
            df=pd.read_excel(io.BytesIO(content))
            return df.to_markdown(index=False)
        else:
            raise AppError(status_code=400, detail="Invalid format; accepted: .csv, .xlsx, .xls, .pdf, .docx")

    except AppError:
        raise
    except Exception as e:
        raise AppError(status_code=400, detail=f"Parsing error: {str(e)}")

# Retrieves a list of files associated with a specific message ID
def get_message_files(db: Session, message_id: int) -> list[dict]:
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

# Fetches the recent conversation history for a user
def get_conversation_history(db: Session, user_id: str, conversation_id: str, limit: int = 10) -> list[dict]:
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
                        signed_url = get_signed_url(file["public_id"], file["resource_type"])
                        print(f"[SIGNED URL] {signed_url}")
                        response = requests.get(signed_url, allow_redirects=True)
                        print(f"[ISTORIC] {file['filename']} - Status: {response.status_code}, Bytes: {len(response.content)}")
                        
                        parsed = parse_file(file["filename"], response.content)
                        parsed_files.append(f"[{file['filename']}]:\n{parsed}")
                    except Exception as e:
                        print(f"[ISTORIC] nu am putut parsa fisierul {file['filename']}: {str(e)}")
                        continue

                if parsed_files:
                    content += "\n\nFișiere atașate:\n\n" + "\n\n".join(parsed_files)

            result.append({"role": msg.role, "content": content})

    return result

# Retrieves a list of all uploaded files within a specific conversation
def get_file_history(db: Session, user_id: str, conversation_id: str) -> list[CloudinaryFileAttachment]:
    files = (
        db.query(ConversationFileModel)
        .join(MessageModel, MessageModel.id == ConversationFileModel.message_id)
        .filter(
            MessageModel.conversation_id == conversation_id,
            MessageModel.user_id == user_id,
            ConversationFileModel.is_deleted == False
        )
        .order_by(ConversationFileModel.created_at.asc())
        .all()
    )

    return [
        CloudinaryFileAttachment(
            filename=f.filename,
            url=f.file_url,
            public_id=f.public_id or "",
            resource_type=f.resource_type or "",
            file_format=f.file_format or "",
            file_size=f.file_size or 0
        )
        for f in files
    ]

# Fetches a specific conversation record for a given user
def get_conversation_data(db: Session, user_id: str, conversation_id: str) -> ConversationModel:
    try:
        conversation = db.execute(
            select(ConversationModel)
            .where(
                ConversationModel.conversation_id == conversation_id,
                ConversationModel.user_id == user_id
            )
        ).scalar()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")

    if conversation is None:
        raise AppError(status_code=404, detail="Conversation not found")

    return conversation
        
# Retrieves the complete conversation history formatted for the frontend
def get_full_conversation(db: Session, user_id: str, conversation_id: str) -> list[dict]:
    try:
        conversation = db.execute(
            select(ConversationModel)
            .where(ConversationModel.conversation_id == conversation_id)
            # .options(joinedload(ConversationModel.messages))
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
            
            entry = {"role": msg.role, "blocks": blocks}
            
            files = get_message_files(db, msg.id)
            if files:
                entry["file"] = files[0]  # or files if you want the list
            
            result.append(entry)
        else:
            files = get_message_files(db, msg.id)
            entry = {"role": msg.role, "content": msg.content}
            if files:
                entry["files"] = files
            result.append(entry)
    
    return result

# Retrieves a list of all conversations belonging to a specific user
def get_user_conversations(db: Session, user_id: str) -> list[ConversationModel]:
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

# Saves a new message to the database
def save_message_to_db(db: Session, message_data: MessageCreate) -> MessageModel:
    
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

# Updates a user's message record to link it with the corresponding bot response ID
def set_response_id(db: Session, user_message_id: int, bot_response_id: int) -> None:
    try:
        db.query(MessageModel)\
            .filter(MessageModel.id == user_message_id)\
            .update({"response_id": bot_response_id})
        db.commit()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")

# Retrieves the title of a conversation based on its ID
def get_conversation_title(db: Session, conversation_id: str) -> str:
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

# Updates the title of a specific conversation in the database
def set_conversation_title(db: Session, conversation_id: str, conversation_title: str) -> None:
    try:
        db.query(ConversationModel)\
            .filter(ConversationModel.conversation_id == conversation_id)\
            .update({"conversation_title": conversation_title})
        db.commit()
    except Exception as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")

# Creates a new empty conversation for the specified user
def create_new_conversation(db: Session, user_id: str) -> ConversationModel:
    
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

# Executes a raw SQL query generated by the LLM
def run_llm_query(db: Session, query: str) -> list[dict]:
    try:
        result = db.execute(text(query))
        if result.returns_rows:
            return [dict(row) for row in result.mappings().all()]

        return []
    except AppError as e:
        raise AppError(status_code=500, detail=f"Database error: {str(e)}")
    
# Deletes a conversation and all its associated messages    
def delete_conversation(db: Session, user_id: str, conversation_id: str) -> None:
    try:
        conversation=db.execute(
            select(ConversationModel).
            where(
                ConversationModel.conversation_id == conversation_id,
                ConversationModel.user_id == user_id)
        ).scalar()
        if conversation is None:
            raise AppError(status_code=404, detail="Conversation not found")
        
        # Delete all the messages associated to the conversation
        db.query(MessageModel).filter(MessageModel.conversation_id == conversation_id).delete()
        
        # Delete conversation
        db.delete(conversation)
        db.commit()
        
    except AppError:
        raise
    except Exception as e:
        db.rollback()
        raise AppError(status_code=500, detail=f"Database error: {str(e)}") 

# Modifies the title of an existing conversation
def update_conversation_title(db: Session, user_id: str, conversation_id: str, new_title: str) -> None:
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
    
# Saves metadata for multiple uploaded files to the database
def save_conversation_files(db: Session, message_id: int, files: list[CloudinaryFileAttachment]) -> list[CloudinaryFileAttachment]:
    db_files = [
        ConversationFileModel(
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
