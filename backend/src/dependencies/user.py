from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from core.security import decode_access_token
from db.database import get_db
from models.user import User

# --------------------
# get current user
def get_current_user(
    access_token: Annotated[
        str | None,
        Cookie()
    ],
    db: Annotated[Session, Depends(get_db)],
) -> User:

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
    )
    
    print("access_token : ",access_token)

    if not access_token:
        raise unauthorized

    try:
        payload = decode_access_token(access_token)

        subject = payload.get("sub")

        if not subject:
            raise unauthorized

        user_id = int(subject)

    except (InvalidTokenError, ValueError, TypeError):
        raise unauthorized

    user = db.get(User, user_id)

    if user is None:
        raise unauthorized

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    return user


CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]