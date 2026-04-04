from fastapi import FastAPI
from routers import alarms
from database import get_db
app=FastAPI()
@app.get("/")
def greet():
    return "Hello"

app.include_router(alarms.router, prefix="/alarms", tags=["Alarms"])


print("HELLO :)")