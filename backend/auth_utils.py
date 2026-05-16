import os
from datetime import timedelta, datetime, timezone
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
from typing import Annotated
from starlette import status
from sqlalchemy.orm import Session

from schemas import LoginRequest
from crud import authenticate_user
from core import UnauthorizedError

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

http_bearer = HTTPBearer()

# Verifies the received token, decodes it, and extracts the current user's data
async def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials, Depends(http_bearer)]) -> dict:
    token = credentials.credentials

    try:
        # Verify if the token is valid
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("id")

        if username is None or user_id is None:
            raise UnauthorizedError("Could not validate user payload.")

        # Return the user data
        return {"username": username, "id": user_id}
    
    except ExpiredSignatureError:
        raise UnauthorizedError("Access token has expired.")
        
    except JWTError:
        raise UnauthorizedError("Could not validate credentials.")

# Creates and signs a JWT token containing the username, user ID, and expiration time
def create_jwt_token(username: str, user_id: str, expires_delta: timedelta) -> str:

    payload = {"sub": username, "id": user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    payload["exp"] = expires
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def process_user_login(login_request: LoginRequest, db: Session):
    user = authenticate_user(login_request.username, login_request.password, db)

    access_token = create_jwt_token(user.username, user.id, timedelta(minutes=15))
    refresh_token = create_jwt_token(user.username, user.id, timedelta(days=30))
    
    return access_token, refresh_token, user

def process_token_refresh(refresh_token: str):
    try:

        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user_id = payload.get("id")

        if username is None or user_id is None:
            raise UnauthorizedError(message="Invalid refresh token payload")

        new_access_token = create_jwt_token(username, user_id, timedelta(minutes=15))
        
        return new_access_token, user_id, username

    except ExpiredSignatureError:
        raise UnauthorizedError(message="Refresh token expired")
    except JWTError:
        raise UnauthorizedError(message="Invalid refresh token")