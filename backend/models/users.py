import uuid
from sqlalchemy import Column, String

from database import Base


class Users(Base):
    __tablename__ = "Users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(100), unique=True)
    username = Column(String(50), unique=True, nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    hashed_password = Column(String(255), nullable=False) 