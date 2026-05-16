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
        
# Creates a new user account by verifying username/email uniqueness, hashing the password, and saving it to the database
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreateUserRequest, db: db_dependency) -> dict:
    
    try:
        create_user(create_user_request, db)
        return {"message": "User created successfully"}
    except AppError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)



# Authenticates the user credentials and returns an access token along with an HTTP-only refresh token cookie
@router.post("/login", response_model= TokenResponse , status_code=status.HTTP_200_OK)
async def login(response: Response,login_request: LoginRequest, db: db_dependency) -> dict:

    user = authenticate_user(login_request.username, login_request.password, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Create access token (15 mins) and refresh token (30 days)
    accesToken = create_jwt_token(user.username, user.id, timedelta(minutes=15))
    refreshToken = create_jwt_token(user.username, user.id, timedelta(days=30))    
    
    # Save refresh token in an HttpOnly cookie for security
    response.set_cookie(
            key="refresh_token",
            value=refreshToken,
            httponly=True,
            secure=True, 
            samesite="none",
            max_age=60 * 60 * 24 * 30 # 30 de zile
        )
    
    # Return the access token and user payload
    userResponse = UserResponse(user_id=user.id, username=user.username)
    return {
        "access_token": accesToken,
        "user":jsonable_encoder(userResponse),
    }



user_dependency = Annotated[dict, Depends(get_current_user)]

# Returns the currently authenticated user's data if the access token is valid
@router.get("/me", status_code=status.HTTP_200_OK)
async def read_current_user(user: user_dependency) -> dict:
    return user


# Generates a new access token if the provided refresh token is valid and not expired
@router.post("/refresh")
async def refresh_token(
    response: Response,
    refresh_token: Annotated[str | None, Cookie()] = None
) -> dict:
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        # Verify if the token is valid
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user_id  = payload.get("id")

        if username is None or user_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Generate a new access token
        new_acces_token = create_jwt_token(username, user_id, timedelta(minutes=15))
        userResponse = UserResponse(user_id=user_id, username=username)
        # Return the new access token and user payload
        return { "accessToken": new_acces_token, "user": userResponse }

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")