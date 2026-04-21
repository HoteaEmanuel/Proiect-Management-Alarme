from sqlalchemy import String, Integer, Text, DateTime, CheckConstraint, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime

class Base(DeclarativeBase):
    pass

class ConversationModel(Base):
    __tablename__ = "Conversations"

    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    conversation_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class MessageModel(Base):
    __tablename__ = "Messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    conversation_id: Mapped[int] = mapped_column(Integer, ForeignKey("Conversations.conversation_id"), nullable=False, index=True, )
    
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
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