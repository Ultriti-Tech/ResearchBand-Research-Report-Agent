from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from src.core.security import decode_access_token
from src.db.database import get_db
from src.models.user import User

optional_bearer = HTTPBearer(auto_error=False)


# --------------------
# get current user
def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    access_token: Annotated[str | None, Cookie()] = None,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(optional_bearer),
    ] = None,
) -> User:

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
    )

    token = access_token or (credentials.credentials if credentials else None)
    if not token:
        raise unauthorized

    try:
        payload = decode_access_token(token)

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
