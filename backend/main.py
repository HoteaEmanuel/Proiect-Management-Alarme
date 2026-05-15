from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import alarms, auth, chatbot
from database import get_db, engine
from core.error_handlers import setup_exception_handlers
import models.users

models.users.Base.metadata.create_all(bind=engine)

app = FastAPI()

setup_exception_handlers(app)

# Middleware pentru a permite conectarea backendului cu frontenului
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