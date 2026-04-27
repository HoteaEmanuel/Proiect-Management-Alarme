from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ChatRequest(BaseModel):
    user_id: str | None = None
    conversation_id: str | None = None
    message: str
    new_chat: bool = False

class ChatCreate(BaseModel):
    conversation_id: str
    user_id: str
    role: str
    has_sql_query: bool = False
    content: str
    sql_query: str | None = None


class ChatMessage(ChatCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatResponse(BaseModel):
    conversation_id: str
    conversation_title: str
    content: str

class ConversationHistory(BaseModel):
    messages: list[ChatMessage]

class ConversationCreate(BaseModel):
    user_id: str

class ConversationResponse(BaseModel):
    user_id: str
    conversation_id: str
    conversation_title: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationListresponse(BaseModel):
    conversations: list[ConversationResponse]

class LLMSQLResponse(BaseModel):
    conversation_title: str | None
    has_sql_query: bool
    sql_query: str | None
    text_response: str | None
    
class ConversationTitleUpdate(BaseModel):
    new_title: str
