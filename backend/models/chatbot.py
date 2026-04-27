import uuid
from sqlalchemy import String, Integer, Text, DateTime, CheckConstraint, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime

from database import Base

class ConversationModel(Base):
    __tablename__ = "Conversations"

    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    conversation_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_title: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class MessageModel(Base):
    __tablename__ = "Messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("Conversations.conversation_id"), nullable=False, index=True)
    
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("Users.id"), nullable=False)
    
    role: Mapped[str] = mapped_column(String(20), nullable=False)

    response_id: Mapped[int] = mapped_column(Integer, ForeignKey("Messages.id"), nullable=True)
    
    content: Mapped[str] = mapped_column(Text, nullable=False)

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