import uuid
from sqlalchemy import String, Integer, Text, DateTime, CheckConstraint, ForeignKey, Boolean, BigInteger, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime

from database import Base

class ConversationModel(Base):
    __tablename__ = "Conversations"

    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    conversation_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_title: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    messages = relationship(
        "MessageModel", 
        back_populates="conversation", 
        cascade="all, delete", 
        passive_deletes=True
    )

class MessageModel(Base):
    __tablename__ = "Messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("Conversations.conversation_id", ondelete="CASCADE"), nullable=False, index=True)
    
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("Users.id"), nullable=False)

    is_stopped: Mapped[Boolean] = mapped_column(Boolean, default=False, nullable=False)
    
    role: Mapped[str] = mapped_column(String(20), nullable=False)

    response_id: Mapped[int] = mapped_column(Integer, ForeignKey("Messages.id"), nullable=True)
    
    content: Mapped[str] = mapped_column(Text, nullable=False)

    smart_replies: Mapped[list | None] = mapped_column(JSON(none_as_null=True), nullable=True)

    has_sql_query: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    sql_query: Mapped[str] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        nullable=False, 
        server_default=func.now()
    )

    __table_args__ = (
        CheckConstraint(
            "role IN ('user', 'assistant', 'system')", 
            name="CHK_Message_Role"
        ),
    )

    conversation = relationship("ConversationModel", back_populates="messages")
    files = relationship("ConversationFileModel", cascade="all, delete-orphan", back_populates="message")
    
class ConversationFileModel(Base):
    __tablename__ = "ConversationFiles"

    file_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    message_id: Mapped[int] = mapped_column(ForeignKey("Messages.id", ondelete="CASCADE"), nullable=False)

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    public_id: Mapped[str | None] = mapped_column(String(500), nullable=True)

    resource_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    file_format: Mapped[str | None] = mapped_column(String(50), nullable=True)
    file_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    is_deleted: Mapped[bool] = mapped_column(default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)

    message = relationship("MessageModel", back_populates="files")