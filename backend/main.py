from fastapi import FastAPI
from routers import alarms, auth
from database import get_db, engine
import models.users

models.users.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def greet():
    return "Hello"

app.include_router(alarms.router, prefix="/alarms", tags=["Alarms"])
app.include_router(auth.router)

print("HELLO :)")