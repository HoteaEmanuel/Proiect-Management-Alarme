from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

from models import Users
from schemas import CreateUserRequest
from core import UnauthorizedError, DuplicateResourceError

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#Queries the DB with the given credentials, raises UnauthorizedError if the username or password in invalid
def authenticate_user(username: str, password: str, db: Session):
    user = db.query(Users).filter(Users.username == username).first()
    
    if not user or not bcrypt_context.verify(password, user.hashed_password):
        return UnauthorizedError("Invalid username or password")
    
    return user

#Registers the new user
def create_user(create_user_request: CreateUserRequest, db: Session):
    
    existing_user = db.query(Users).filter(
        (Users.username == create_user_request.username) |
        (Users.email == create_user_request.email)
    ).first()

    if existing_user:
        raise DuplicateResourceError("Username or email already exists.")

    new_user = Users(
        username=create_user_request.username,
        email=create_user_request.email,
        first_name=create_user_request.first_name,
        last_name=create_user_request.last_name,
        hashed_password=bcrypt_context.hash(create_user_request.password)
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    
    except IntegrityError:
        db.rollback()
        raise DuplicateResourceError("Username or email already exists")
    