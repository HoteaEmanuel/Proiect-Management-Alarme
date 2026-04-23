from sqlalchemy import String, Integer, Text, DateTime, CheckConstraint, ForeignKey, Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime

class Base(DeclarativeBase):
    pass

class ConversationModel(Base):
    __tablename__ = "Conversations"

    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    conversation_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_title: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class MessageModel(Base):
    __tablename__ = "Messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    conversation_id: Mapped[int] = mapped_column(Integer, ForeignKey("Conversations.conversation_id"), nullable=False, index=True, )
    
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    
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