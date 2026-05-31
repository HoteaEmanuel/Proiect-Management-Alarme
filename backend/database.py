from  sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os
import redis

load_dotenv()

DATABASE_URL=os.getenv("DATABASE_URL")
AI_DATABASE_URL=os.getenv("AI_DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/8")

engine=create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)

ai_engine = create_engine(AI_DATABASE_URL)

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

class Base(DeclarativeBase):
    pass

def get_db():
    db=SessionLocal()
    print("SQL Server - CONNECTED")
    try:
        yield db
    finally:
        db.close()