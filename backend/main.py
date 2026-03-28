from fastapi import FastAPI
app=FastAPI()

@app.get('/')
def home():
    return {"Darius" : "Veriga slaba"}
@app.get("/ceau")
def greet():
    return {"Mesaj":"Buna"}


print("HELLO :)")