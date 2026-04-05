from passlib.context import CryptContext
from pydantic import BaseModel
from database import get_db
from models import Users
from sqlalchemy.orm import Session
from typing import Annotated
from fastapi import Depends, APIRouter, HTTPException
from starlette import status
from datetime import timedelta, datetime, timezone
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os

router = APIRouter(

    prefix = "/auth",
    tags = ["auth"]
)

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db_dependency = Annotated[Session, Depends(get_db)]

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/auth/login")

class CreateUserRequest(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

#######################################################

# Creeaza un cont nou de utilizator verificand daca username-ul sau email-ul exista deja,
# hash-uind parola si salvand noul utilizator in baza de date.
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreateUserRequest, db: db_dependency):
    
    existing_user = db.query(Users).filter(
        (Users.username == create_user_request.username) |
        (Users.email == create_user_request.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists."
        )

    new_user = Users(
        username=create_user_request.username,
        email=create_user_request.email,
        first_name=create_user_request.first_name,
        last_name=create_user_request.last_name,
        hashed_password=bcrypt_context.hash(create_user_request.password)
    )

    db.add(new_user)
    db.commit()

    return {"message": "User created successfully"}

#######################################################

# Interogheaza baza de date pentru a gasi primul utilizator al carui username corespunde cu username-ul primit
def authenticate_user(username: str, password: str, db: Session):

    user = db.query(Users).filter(Users.username == username).first()

    if user is None:
        return None
    
    if not bcrypt_context.verify(password, user.hashed_password):
        return None
    
    return user


# Creeaza un token JWT care contine username-ul si id-ul user-ului si timpul de expirare, apoi il semneaza folosind cheia secreta.
def create_access_token(username: str, user_id: int, expires_delta: timedelta):

    payload = {"sub": username, "id": user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    payload["exp"] = expires

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# Primeste datele de login, verifica utilizatorul in baza de date si returneaza un token daca autentificarea este valida.
@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(login_request: LoginRequest, db: db_dependency):

    user = authenticate_user(login_request.username, login_request.password, db)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    token = create_access_token(user.username, user.id, timedelta(minutes=30))

    return {
        "access_token": token,
        "token_type": "bearer"
    }


#######################################################

# Verifica tokenul primit, il decodeaza si extrage datele utilizatorului curent.
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username: str = payload.get("sub")
        user_id: int = payload.get("id")

        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate user"
            )
        
        return {"username": username, "id": user_id}
    

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user"
        )
    

user_dependency = Annotated[dict, Depends(get_current_user)]


# Returneaza datele utilizatorului autentificat daca tokenul este valid.
@router.get("/me", status_code=status.HTTP_200_OK)
async def read_current_user(user: user_dependency):
    return user