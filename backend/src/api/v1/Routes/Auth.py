from dotenv import load_dotenv
import os


import ast
import logging

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from datetime import datetime, timezone

# import files
from src.schema.Auth import UserResponse, RegisterRequest, LoginRequest
from src.schema.user import LoginResponse, TokenResponse
from db.database import get_db
from models.user import User
from core.security import hash_password, verify_password, create_access_token

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------
# register user
@router.post("/register", response_model=TokenResponse)
def register(
    req: RegisterRequest, response: Response, db: Annotated[Session, Depends(get_db)]
):
    print(req)

    email = str(req.email).strip().lower()
    password = str(req.password).strip().lower()
    username = str(req.username).strip().lower()

    hashed_password = hash_password(password=password)

    exsisting = db.scalar(select(User).where(User.email == email))

    if exsisting:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        purchased="FREE",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise


    access_token = create_access_token(subject=str(user.id))

    # -------------------------------------
    # Store JWT in HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        max_age=60 * 60 * 24,
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            purchased=user.purchased,
            created_at=user.created_at,
            updated_at=user.updated_at,
        ),
    )


# -----------------------
# login user
@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    req: LoginRequest, response: Response, db: Annotated[Session, Depends(get_db)]
):
    
    email = str(req.email).strip().lower()
    password = str(req.password).strip().lower()

    user = db.scalar(select(User).where(User.email == email))

    if user is None or not verify_password(
        password=password, hashed_password=user.hashed_password if user else ""
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is disabled",
        )
        
    access_token = create_access_token(subject=str(user.id))

    # ---------------------------------
    # Store JWT in HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        max_age=60 * 60 * 24,
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            purchased=user.purchased,
            created_at=user.created_at,
            updated_at=user.updated_at,
        ),
    )
