from sqlalchemy.orm import Session
import json
from datetime import datetime

from models import AppError
from schemas import MessageRequest, MessageCreate, MessageResponse, OutputBlock, AgentContext, TextBlock
from crud import get_conversation_history, save_message_to_db, get_user_conversations
from crud import create_new_conversation, set_response_id, get_conversation_file
from .orchestrator import get_orchestrator_response
from .client import llm_request
from .prompt_builder import get_system_prompt

def prepare_conversation(db: Session, request: MessageRequest):
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

def save_bot_response(db: Session, request: MessageCreate, output_blocks: list[OutputBlock], agent_context: AgentContext, user_message_id: int):
    bot_message_data = MessageCreate(
        conversation_id=request.conversation_id,
        user_id=request.user_id,
        role="assistant",
        content=output_blocks[0].content if output_blocks else "",
        has_sql_query=True if agent_context.sql_query_text is not None else False,
        sql_query=agent_context.sql_query_text
    )
    bot_reply = save_message_to_db(db=db, message_data=bot_message_data)

    set_response_id(db, user_message_id, bot_reply.id)
    
#conversatia are fisier atasat -> raspuns pe baza fisierului -> nu mai este folosit orchestratorul
def get_file_based_response(db: Session, request: MessageRequest, context_history: list[dict[str, str]]):
    conversation_file=get_conversation_file(db=db, conversation_id=request.conversation_id)
    if conversation_file is None:
        return None

    system_prompt=get_system_prompt(
        persona_prompt=True,
        language_prompt=True,
        conversation_context_prompt=True,
        file_analysis_prompt=True
    )
    
    user_prompt=f"""
    Conversation's attached file: {conversation_file.file_name}
    
    Extracted content from file: 
    ---
    {conversation_file.file_content}
    ---
    
    User's question: {request.message} 
    """
    
    answer = llm_request(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        context=context_history
    )
    
    agent_context=AgentContext(
        user_message=request.message,
        conversation_history=context_history,
        text_response=answer
    )
    
    output_blocks=[
        TextBlock(type="text", content=answer)
    ]
    
    return output_blocks, agent_context

#functie ce gestioneaza conversatiile user-agent din pagina de chat (practic un agent)
def user_chat_request(db: Session, request: MessageRequest):
    try:
        request.conversation_id, user_message_id, context_history = prepare_conversation(db=db, request=request)
        
        file_response = get_file_based_response(db=db, request=request, context_history=context_history)
        
        if file_response is not None:
            output_blocks, agent_context = file_response
        else:
            output_blocks, agent_context = get_orchestrator_response(db, request, context_history)

        save_bot_response(db, request, output_blocks, agent_context, user_message_id)

        return MessageResponse(conversation_id=request.conversation_id,
                               content=output_blocks)
    
    except AppError:
        raise
    except Exception as e:
        raise AppError(status_code=500, detail=f"LLM request failed: {str(e)}")
    

