from sqlalchemy.orm import Session
from typing import Annotated
from fastapi import Depends, APIRouter, Response, Cookie
from fastapi.encoders import jsonable_encoder
from starlette import status

from database import get_db
from schemas import CreateUserRequest, LoginRequest, UserResponse, TokenResponse
from crud import create_user
from auth_utils import get_current_user, process_user_login, process_token_refresh
from core import UnauthorizedError

router = APIRouter(

    prefix = "/auth",
    tags = ["auth"]
)

db_dependency = Annotated[Session, Depends(get_db)]
        
# Creates a new user account by verifying username/email uniqueness, hashing the password, and saving it to the database
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreateUserRequest, db: db_dependency) -> dict:
    create_user(create_user_request, db)
    return {"message": "User created successfully"}



# Authenticates the user credentials and returns an access token along with an HTTP-only refresh token cookie
@router.post("/login", response_model= TokenResponse , status_code=status.HTTP_200_OK)
async def login(response: Response, login_request: LoginRequest, db: db_dependency):

    acces_token, refresh_token, user = process_user_login(login_request, db)
    
    # Save refresh token in an HttpOnly cookie for security
    response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True, 
            samesite="none",
            max_age=60 * 60 * 24 * 30 # 30 de zile
        )
    
    # Return the access token and user payload
    userResponse = UserResponse(user_id=user.id, username=user.username)

    return {
        "access_token": acces_token,
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
):
    if not refresh_token:
        raise UnauthorizedError("No refresh token provided in cookies.")

    new_access_token, user_id, username = process_token_refresh(refresh_token)

    user_response = UserResponse(user_id=user_id, username=username)

    return {
        "accesToken": new_access_token,
        "user": user_response
    }