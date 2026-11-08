from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
# from schema import UserResponse
from pydantic import BaseModel, EmailStr, ConfigDict


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username:str
    is_active: bool
    created_at: datetime
    purchased:str

    # model_config = ConfigDict(from_attributes=True)
    
    
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    username:str
    # user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

