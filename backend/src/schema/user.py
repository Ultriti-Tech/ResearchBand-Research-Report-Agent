from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict



class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username:str
    is_active: bool
    updated_at: datetime
    created_at: datetime
    purchased:str
    

    model_config = ConfigDict(from_attributes=True)
    

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse