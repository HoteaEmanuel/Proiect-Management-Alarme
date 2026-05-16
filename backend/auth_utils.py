import os
from datetime import timedelta, datetime, timezone
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
from typing import Annotated
from starlette import status

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

http_bearer = HTTPBearer()

# Verifies the received token, decodes it, and extracts the current user's data
async def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials, Depends(http_bearer)]) -> dict:
    token = credentials.credentials
    print("TOKEN ")
    print(token)
    try:
        # Verify if the token is valid
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("id")
        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate user"
            )
        # Return the user data
        return {"username": username, "id": user_id}
    
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired token"
        )    
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user"
        )   

# Creates and signs a JWT token containing the username, user ID, and expiration time
def create_jwt_token(username: str, user_id: str, expires_delta: timedelta) -> str:

    payload = {"sub": username, "id": user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    payload["exp"] = expires
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)