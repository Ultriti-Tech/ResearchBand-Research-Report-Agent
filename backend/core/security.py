from datetime import datetime, timedelta, timezone
from typing import Annotated
import os
from dotenv import load_dotenv

load_dotenv()

import jwt
from jwt.exceptions import InvalidTokenError

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from pwdlib import PasswordHash

SECRET_KEY = os.environ["JWT_SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer()


# --------------------
# passsword hashing ----
def hash_password(password: str) -> str:
    hashed_password = password_hash.hash(password)
    return hashed_password


# ---------------------
# verify password
def verify_password(password: str, hashed_password: str) -> bool:
    isVerified = password_hash.verify(password, hashed_password)
    return isVerified


# hashed_password = hash_password("1243")
# print(hashed_password)

# bol = verify_password(
#     "1243",
#     "$argon2id$v=19$m=65536,t=3,p=4$6XkUrszL4scUiGM/6z9L/A$2Unz6UHXzBA/4gUu2utuARYSzH9rpHG/Iqs7yyJQKmQ",
# )
# print(bol)


# ------------------------------
# create axcess token
def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    now = datetime.now(timezone.utc)
    expires = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    payload = {"sub": subject, "iat": now, "exp": expires}

    jwt_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return jwt_token

# print(create_access_token())


# -----------------------------------
# decode access token
def decode_access_token(token: str) -> dict:
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
        options={"require": ["sub", "exp"]},
    )
    

# ------------------------------------
# get the subject - token
def get_current_subject(
    credentials: Annotated[
        HTTPAuthorizationCredentials,
        Depends(bearer_scheme),
    ],
) -> str:
    try:
        payload = decode_access_token(credentials.credentials)
        subject = payload.get("sub")

        if not isinstance(subject, str) or not subject:
            raise InvalidTokenError("Invalid subject")

        return subject

    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# token = create_access_token(
#     subject=str("343567534qrfasdxvwue87tr834e")
# )
# print(token)

# payload = decode_access_token("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNDM1Njc1MzRxcmZhc2R4dnd1ZTg3dHI4MzRlIiwiaWF0IjoxNzkyNjQyMjcwLCJleHAiOjE3OTI2NDU4NzB9.baNfh2xgb7uXQ_VCzrpkC7iccxbLHfThNH1rWaOifPM")

# print(payload)