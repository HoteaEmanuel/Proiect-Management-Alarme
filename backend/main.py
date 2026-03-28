from fastapi import FastAPI
app=FastAPI()

@app.get("/ceau")
def greet():
    return {"Mesaj":"Buna"}


print("HELLO :)")