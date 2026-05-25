from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Literal, Union, Annotated
from fastapi import UploadFile, File

class RawFileAttachment(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    filename: str
    content: bytes
    preserve: bool = False

class CloudinaryFileAttachment(BaseModel):
    filename: str
    url: str
    public_id: str
    resource_type: str
    file_format: str
    file_size: int
    role: str | None = None

class ConversationFileList(BaseModel):
    user_files: list[CloudinaryFileAttachment]
    assistant_files: list[CloudinaryFileAttachment]   

class ExcelStructure(BaseModel):
    filename: str
    sheet_name: str
    headers: list[str]
    column_mapping: list[str]  # ordonata - fiecare element e cheia din sql_result corespunzatoare headerului

class UpdateTitleRequest(BaseModel):
    new_title: str
    
class MessageRequest(BaseModel):
    user_id: str | None = None
    conversation_id: str | None = None
    request_id: str | None = None
    message: str | None = None
    new_chat: bool = False
    files: list[RawFileAttachment] = []

class MessageCreate(BaseModel):
    user_id: str
    conversation_id: str
    role: str
    has_sql_query: bool = False
    content: str
    smart_replies: list[str] | None = None
    sql_query: str | None = None

class TextBlock(BaseModel):
    type: Literal["text"] = "text"
    content: str

class ChartBlock(BaseModel):
    type: Literal["chart"] = "chart"
    content: dict

OutputBlock = Union[TextBlock, ChartBlock]

class UserMessage(BaseModel):
    role: Literal["user"] = "user"
    content: str
    files: list[CloudinaryFileAttachment] = []

class AssistantMessage(BaseModel):
    conversation_id: str | None = None
    request_id: str | None = None
    role: Literal["assistant"] = "assistant"
    blocks: list[OutputBlock]
    smart_replies: list[str] | None = None
    files: list[CloudinaryFileAttachment] | None = []
    is_stopped: bool = False

ChatMessage = Annotated[
    Union[UserMessage, AssistantMessage],
    Field(discriminator="role")
]

class ConversationHistory(BaseModel):
    messages: list[ChatMessage]
    
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

class TextAgentResponse(BaseModel):
    text: str
    smart_replies: list[str]

class AgentCall(BaseModel):
    agent: str
    instruction: str

class OrchestratorResponse(BaseModel):
    conversation_title: str | None = None
    agents: list[AgentCall]

class AgentContext(BaseModel):
    user_message: str
    conversation_history: list[dict]
    is_stopped: bool = False
    file_contents: str | None = None

    sql_query_text: str | None = None
    sql_result: list[dict] | None = None
    text_response: str | None = None
    chart_config: dict | None = None
    smart_replies: list[str] | None = None
    file_export: CloudinaryFileAttachment | None = None
