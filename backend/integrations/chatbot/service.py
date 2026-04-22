from sqlalchemy.orm import Session

from models import AppError
from schemas import ChatRequest, ChatCreate, ChatResponse
from crud import get_conversation_history, get_full_conversation, save_message_to_db, create_new_conversation
from client import llm_request

#functie ce gestioneaza conversatiile user-agent din pagina de chat (practic un agent)
def user_chat_request(db: Session, request: ChatRequest):
    
    try:
        #daca e conversatie noua o creez si ii preiau id-ul creat de baza de date
        if request.new_chat:
            conversation = create_new_conversation(db=db, user_id=request.user_id)
            conversation_id = conversation.conversation_id
        else:
            conversation_id = request.conversation_id

        context_history = get_conversation_history(db=db, user_id=request.user_id, 
                                        conversation_id=conversation_id, 
                                        limit=10)

        #salvez mesajul utilizatorului in baza de date
        user_message_data = ChatCreate(
            conversation_id=conversation_id,
            user_id=request.user_id,
            role="user",
            content=request.message
        )
        save_message_to_db(db=db, message_data=user_message_data)

        #apelez API-ul
        bot_reply = llm_request("Raspunde in limba romana dar ca si cum te balbai", request.message, context_history)

        #salvez raspunsul bot-ului in baza de date
        bot_message_data = ChatCreate(
            conversation_id=conversation_id,
            user_id=request.user_id,
            role="assistant",
            content=bot_reply
        )
        save_message_to_db(db=db, message_data=bot_message_data)

        #preiau toata conversatia din baza de date si o trimit catre frontend
        full_chat_history = get_full_conversation(db=db, 
                                             user_id=request.user_id, 
                                             conversation_id=conversation_id)

        return ChatResponse(conversation_id=conversation_id, conversation=full_chat_history)
    
    except AppError:
        raise
    except Exception as e:
        raise AppError(status_code=500, detail=f"LLM request failed: {str(e)}")
    

