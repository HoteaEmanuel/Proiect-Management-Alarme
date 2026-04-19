from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ChatRequest(BaseModel):
    user_id: int
    message: str

class ChatResponse(BaseModel):
    status: str = "succes"
    reply: str
    tokens_used: Optional[int] = None

class ChatCreate(BaseModel):
    chat_id: str
    user_id: int
    role: str
    content: str

class ChatMessage(ChatCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)