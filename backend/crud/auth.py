from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

from models import Users
from schemas import CreateUserRequest, ChangePasswordRequest
from core import UnauthorizedError, DuplicateResourceError, EntityNotFoundError

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#Queries the DB with the given credentials, raises UnauthorizedError if the username or password in invalid
def authenticate_user(username: str, password: str, db: Session) -> Users | None:
    user = db.query(Users).filter(Users.username == username).first()
    
    if not user or not bcrypt_context.verify(password, user.hashed_password):
        raise UnauthorizedError("Invalid username or password")
    
    return user

# Creates a new user in the database
def create_user(create_user_request: CreateUserRequest, db: Session) -> Users:
    
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

# Verifies the current password and updates it with a new hashed one for the given user
def change_user_password(user_id: str, request: ChangePasswordRequest, db: Session) -> None:
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise UnauthorizedError("User not found.")
    if not bcrypt_context.verify(request.old_password, user.hashed_password):
        raise UnauthorizedError("Current password is incorrect.")
    user.hashed_password = bcrypt_context.hash(request.new_password)
    db.commit()

# Fetches a user by id, raising EntityNotFoundError if not found
def get_user_by_id(user_id: str, db: Session) -> Users:
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise EntityNotFoundError("User", user_id)
    return user

