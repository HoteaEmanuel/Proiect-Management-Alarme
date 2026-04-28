import os
from sqlalchemy.orm import Session
from typing import Annotated
from fastapi import Depends, APIRouter, HTTPException, Response, Cookie
from fastapi.encoders import jsonable_encoder
from starlette import status
from datetime import timedelta
from jose import jwt, JWTError, ExpiredSignatureError
from dotenv import load_dotenv

from database import get_db
from models import AppError
from schemas import CreateUserRequest, LoginRequest, UserResponse, TokenResponse
from crud import authenticate_user, create_user
from auth_utils import create_jwt_token, get_current_user

router = APIRouter(

    prefix = "/auth",
    tags = ["auth"]
)

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


db_dependency = Annotated[Session, Depends(get_db)]
        
#######################################################

# Creeaza un cont nou de utilizator verificand daca username-ul sau email-ul exista deja,
# hash-uind parola si salvand noul utilizator in baza de date.
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreateUserRequest, db: db_dependency):
    
    try:
        create_user(create_user_request, db)
        return {"message": "User created successfully"}
    except AppError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


#######################################################

# Primeste datele de login, verifica utilizatorul in baza de date si returneaza un token daca autentificarea este valida.
@router.post("/login", response_model= TokenResponse , status_code=status.HTTP_200_OK)
async def login(response: Response,login_request: LoginRequest, db: db_dependency):

    user = authenticate_user(login_request.username, login_request.password, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Creare acces token + refresh token 
    # Acces token ul se pastreaza in memorie => il returnez
    accesToken = create_jwt_token(user.username, user.id, timedelta(minutes=15)) # creeaza acces token cu durata de 15 minute
    refreshToken = create_jwt_token(user.username, user.id, timedelta(days=30)) # creeaza refresh token cu durata de 30 de zile    
    
    # Salvam refresh token in cookie HttpOnly pentru protectie
    response.set_cookie(
            key="refresh_token",
            value=refreshToken,
            httponly=True,
            secure=True, 
            samesite="none",
            max_age=60 * 60 * 24 * 30 # 30 de zile
        )
    
    # returneaza access tokenul si userul
    userResponse = UserResponse(user_id=user.id, username=user.username)
    return {
        "access_token": accesToken,
        "user":jsonable_encoder(userResponse),
    }


#######################################################

user_dependency = Annotated[dict, Depends(get_current_user)]

# Returneaza datele utilizatorului autentificat daca tokenul este valid.
@router.get("/me", status_code=status.HTTP_200_OK)
async def read_current_user(user: user_dependency):
    print("AICI")
    return user


# Creeaza un nou acces token daca refresh tokenul e valid si nu e expirat => userul ramane logat
@router.post("/refresh")
async def refresh_token(
    response: Response,
    refresh_token: Annotated[str | None, Cookie()] = None
):
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        # Verifica daca tokenul e valid
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user_id  = payload.get("id")

        if username is None or user_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # genereaza un nou access token
        new_acces_token = create_jwt_token(username, user_id, timedelta(minutes=15))
        userResponse = UserResponse(user_id=user_id, username=username)
        # returneaza noul access token si userul
        return { "accessToken": new_acces_token, "user": userResponse }

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")