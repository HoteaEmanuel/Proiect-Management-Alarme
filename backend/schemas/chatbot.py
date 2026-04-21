from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ChatRequest(BaseModel):
    user_id: int
    conversation_id: int = 0
    message: str
    new_chat: bool = False

class ChatCreate(BaseModel):
    conversation_id: int
    user_id: int
    role: str
    content: str

class ChatMessage(ChatCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatResponse(BaseModel):
    conversation_id: int
    conversation: list[ChatMessage]

class ConversationCreate(BaseModel):
    user_id: int

class ConversationResponse(BaseModel):
    user_id: int
    conversation_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationListresponse(BaseModel):
    conversations: list[ConversationResponse]
