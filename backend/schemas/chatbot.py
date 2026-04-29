from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Literal, Union

class MessageRequest(BaseModel):
    user_id: str | None = None
    conversation_id: str | None = None
    message: str
    new_chat: bool = False

class MessageCreate(BaseModel):
    user_id: str
    conversation_id: str
    role: str
    has_sql_query: bool = False
    content: str
    sql_query: str | None = None

class Message(MessageCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TextBlock(BaseModel):
    type: Literal["text"]
    content: str

class ChartBlock(BaseModel):
    type: Literal["chart"]
    content: dict

OutputBlock = Union[TextBlock, ChartBlock]

class MessageResponse(BaseModel):
    conversation_id: str
    content: list[OutputBlock]

class ConversationHistory(BaseModel):
    messages: list[Message]

class ConversationCreate(BaseModel):
    user_id: str

class ConversationResponse(BaseModel):
    conversation_id: str
    conversation_title: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationListresponse(BaseModel):
    conversations: list[ConversationResponse]

class LLMSQLResponse(BaseModel):
    has_sql_query: bool
    sql_query: str | None
    text_response: str | None
    
class ConversationTitleUpdate(BaseModel):
    new_title: str


class AgentCall(BaseModel):
    agent: str
    instruction: str

class OrchestratorResponse(BaseModel):
    conversation_title: str | None = None
    agents: list[AgentCall]

class AgentContext(BaseModel):
    user_message: str
    conversation_history: list[dict]

    sql_query_text: str | None = None
    sql_result: list[dict] | None = None
    text_response: str | None = None
    chart_config: dict | None = None

class LLMTextResponse(BaseModel):
    text_response: str
