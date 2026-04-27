from sqlalchemy.orm import Session
from passlib.context import CryptContext

from models import Users, AppError
from schemas import CreateUserRequest

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Interogheaza baza de date pentru a gasi primul utilizator al carui username corespunde cu username-ul primit
def authenticate_user(username: str, password: str, db: Session):

    user = db.query(Users).filter(Users.username == username).first()
    if user is None:
        return None
    
    if not bcrypt_context.verify(password, user.hashed_password):
        return None
    
    return user

def create_user(create_user_request: CreateUserRequest, db: Session):
    
    existing_user = db.query(Users).filter(
        (Users.username == create_user_request.username) |
        (Users.email == create_user_request.email)
    ).first()

    if existing_user:
        raise AppError(
            status_code=400,
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
    
    return new_user