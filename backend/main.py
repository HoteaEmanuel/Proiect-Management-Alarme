from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import alarms, auth
from database import get_db, engine
import models.users

models.users.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Middleware pentru a permite conectarea backendului cu frontenului
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def greet():
    return "Hello"

app.include_router(alarms.router, prefix="/alarms", tags=["Alarms"])
app.include_router(auth.router)

print("HELLO :)")