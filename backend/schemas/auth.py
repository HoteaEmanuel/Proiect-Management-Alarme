from pydantic import BaseModel

class CreateUserRequest(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    user_id: str
    username: str
    
    
class TokenResponse(BaseModel):
    access_token: str
    user : UserResponse