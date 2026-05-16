from sqlalchemy.orm import Session
import json
from datetime import datetime

from models import AppError, MessageModel
from schemas import MessageRequest, MessageCreate, AssistantMessage, AgentContext, OutputBlock, RawFileAttachment, CloudinaryFileAttachment
from crud import get_conversation_history, save_message_to_db, get_user_conversations
from crud import create_new_conversation, set_response_id, save_conversation_files
from integrations.cloudinary import upload_file_to_cloudinary
from .orchestrator import get_orchestrator_response

# Sets up the conversation context by validating the ID, saving the user's message, and fetching chat history
def prepare_conversation(db: Session, request: MessageRequest) -> tuple[str, int, list[dict]]:
    # If it's a new conversation, create it and retrieve the database-generated ID
    if request.new_chat:
        conversation = create_new_conversation(db=db, user_id=request.user_id)
        conversation_id = conversation.conversation_id
    else:
        conversation_id = request.conversation_id

    # Verify conversation ID
    conversations_list = get_user_conversations(db=db, user_id=request.user_id)
    conversations_list = [p.conversation_id for p in conversations_list]

    if conversation_id not in conversations_list:
        raise AppError(status_code=400, detail="conversation_id not found")

    # Save the user's message to the database
    user_message_data = MessageCreate(
        conversation_id=conversation_id,
        user_id=request.user_id,
        role="user",
        content=request.message
    )
    saved_user_message = save_message_to_db(db=db, message_data=user_message_data)

    context_history = get_conversation_history(db=db, user_id=request.user_id, 
                                    conversation_id=conversation_id, 
                                    limit=10)

    return conversation_id, saved_user_message.id, context_history 

# Saves the generated assistant response to the database and links it to the triggering user message
def save_bot_response(db: Session, request: MessageCreate, output_blocks: list[OutputBlock], agent_context: AgentContext, user_message_id: int) -> MessageModel:
    bot_message_data = MessageCreate(
        conversation_id=request.conversation_id,
        user_id=request.user_id,
        role="assistant",
        content=json.dumps([block.model_dump() for block in output_blocks], ensure_ascii=False),
        has_sql_query=True if agent_context.sql_query_text is not None else False,
        sql_query=agent_context.sql_query_text
    )
    bot_message_data = save_message_to_db(db=db, message_data=bot_message_data)

    set_response_id(db, user_message_id, bot_message_data.id)

    return bot_message_data

# Uploads preserved files to Cloudinary and saves their metadata to the database
def upload_and_save_user_preserve_files(
    db: Session,
    message_id: int,
    files: list[RawFileAttachment]
) -> list:
    preserve_files = [f for f in files if f.preserve]
    if not preserve_files:
        return []

    uploaded = []
    for file in preserve_files:
        try:
            cloudinary_file = upload_file_to_cloudinary(file)
            uploaded.append(cloudinary_file)
        except Exception as e:
            print(f"[CLOUDINARY] EROARE upload {file.filename}: {e}")
            continue

    return save_conversation_files(db, message_id, uploaded)

# Manages user-agent conversations from the chat interface, acting as the main entry point
def user_chat_request(db: Session, request: MessageRequest) -> AssistantMessage:
    try:
        request.conversation_id, user_message_id, context_history = prepare_conversation(db=db, request=request)
        
        upload_and_save_user_preserve_files(db, user_message_id, request.files)
        
        output_blocks, agent_context = get_orchestrator_response(db, request, context_history)

        bot_message_data = save_bot_response(db, request, output_blocks, agent_context, user_message_id)
        
        if agent_context.file_export:
            save_conversation_files(db, bot_message_data.id, [agent_context.file_export])

        return AssistantMessage(conversation_id=request.conversation_id,
                               blocks=output_blocks,
                               file=agent_context.file_export)
    
    except AppError:
        raise
    except Exception as e:
        raise AppError(status_code=500, detail=f"LLM request failed: {str(e)}")
    

