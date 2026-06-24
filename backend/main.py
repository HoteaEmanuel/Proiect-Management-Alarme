import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from contextlib import asynccontextmanager
import redis.asyncio as aioredis


from routers import alarms, auth, chatbot, text_to_speech
from database import get_db, engine
from core.error_handlers import setup_exception_handlers
import models.users

models.users.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis_connection = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/8"), decode_responses=True)
    await FastAPILimiter.init(redis_connection)
    yield
    await redis_connection.close()

app = FastAPI(lifespan=lifespan)

setup_exception_handlers(app)

# Middleware for backend-frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(alarms.router, prefix="/alarms", tags=["Alarms"])
app.include_router(chatbot.router, prefix="/api", tags=["Chatbot"])
app.include_router(text_to_speech.router, prefix="/audio", tags=["Text_To_Speech"])