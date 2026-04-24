from sqlalchemy.orm import Session
import json
from datetime import datetime

from models import AppError
from schemas import ChatRequest, ChatCreate, ChatResponse, LLMSQLResponse
from crud import get_conversation_history, get_full_conversation, save_message_to_db, get_user_conversations
from crud import create_new_conversation, run_llm_query, set_response_id, get_conversation_title, set_conversation_title
from .client import llm_request
from .prompt_builder import get_system_prompt
from .query_validator import is_query_safe

def prepare_conversation(db: Session, request: ChatRequest):
    #daca e conversatie noua o creez si ii preiau id-ul creat de baza de date
    if request.new_chat:
            conversation = create_new_conversation(db=db, user_id=request.user_id)
            conversation_id = conversation.conversation_id
    else:
        conversation_id = request.conversation_id

    #verificare conversation id
    conversations_list = get_user_conversations(db=db, user_id=request.user_id)
    conversations_list = [p.conversation_id for p in conversations_list]

    if conversation_id not in conversations_list:
        raise AppError(status_code=400, detail="conversation_id not found")

    #salvez mesajul utilizatorului in baza de date
    user_message_data = ChatCreate(
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

def serialize_query_result(result: list) -> str:
    return json.dumps(
        result, 
        ensure_ascii=False,
        default=lambda x: x.isoformat() if isinstance(x, datetime) else str(x)
    )

def get_llm_response(db: Session, request: ChatCreate, user_message_id: int, context_history: list[dict[str, str]]):

    system_prompt = get_system_prompt(
            new_conversation_prompt=request.new_chat,
            persona_prompt=True,
            language_prompt=True,
            conversation_context_prompt=False if context_history == [] else True,
            db_schema_prompt=True,
            db_safety_prompt=True,
            sql_output_prompt=True,
            error_handling_prompt=True
        )

    llm_response = llm_request(system_prompt, request.message, context_history, LLMSQLResponse)

    if request.new_chat:
        conversation_title = llm_response.conversation_title
        set_conversation_title(db, request.conversation_id, conversation_title)
    else:
        conversation_title = get_conversation_title(db, request.conversation_id)

    query = None
    is_query = llm_response.has_sql_query

    if is_query:
        query = llm_response.sql_query
        if is_query_safe(query):
            query_result = run_llm_query(db, query)

            system_prompt = get_system_prompt(
                persona_prompt=True,
                language_prompt=True,
                query_results_prompt=True,
                conversation_context_prompt=False if context_history == [] else True,
            )

            final_text = llm_request(system_prompt, serialize_query_result(query_result), context_history)
        else:
            final_text = "Nu am putut executa interogarea din motive de securitate."
    else:
        final_text = llm_response.text_response

    #salvez raspunsul bot-ului in baza de date
    

    return conversation_title, final_text, is_query, query 

def save_bot_response(db: Session, request: ChatCreate, final_text: str, is_query: bool, query: str, user_message_id: int):
    bot_message_data = ChatCreate(
        conversation_id=request.conversation_id,
        user_id=request.user_id,
        role="assistant",
        content=final_text,
        has_sql_query=is_query,
        sql_query=query
    )
    bot_reply = save_message_to_db(db=db, message_data=bot_message_data)

    set_response_id(db, user_message_id, bot_reply.id)

#functie ce gestioneaza conversatiile user-agent din pagina de chat (practic un agent)
def user_chat_request(db: Session, request: ChatRequest):
    
    try:
        request.conversation_id, user_message_id, context_history = prepare_conversation(db=db, request=request)

        conversation_title, final_text, is_query, query = get_llm_response(db, request, user_message_id, context_history)

        save_bot_response(db, request, final_text, is_query, query, user_message_id)
        

        #preiau toata conversatia din baza de date si o trimit catre frontend
        full_chat_history = get_full_conversation(db=db, 
                                             user_id=request.user_id, 
                                             conversation_id=request.conversation_id)

        return ChatResponse(conversation_id=request.conversation_id,
                            conversation_title=conversation_title,
                            conversation=full_chat_history["messages"])
    
    except AppError:
        raise
    except Exception as e:
        raise AppError(status_code=500, detail=f"LLM request failed: {str(e)}")
    

