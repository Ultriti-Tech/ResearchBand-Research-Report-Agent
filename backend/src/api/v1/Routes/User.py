from fastapi import APIRouter, Depends, HTTPException, status, Response

from typing import Annotated
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.models.credits import Credit

from src.db.database import get_db
from src.dependencies.user import CurrentUser
from src.schema.user import UserResponse, CurrentUserResponse

router = APIRouter(prefix="/users", tags=["Users"])


from src.core.rate_limiting import token_bucket_limit


# -------------------
# get user detail
@router.get(
    "/getUser",
    response_model=CurrentUserResponse,
    dependencies=[
        Depends(
            token_bucket_limit(
                scope="user_details",
                capacity=10,
                refill_per_second=10 / 60,
            )
        )
    ],
)
def read_current_user(
    current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]
):

    credits = db.scalar(select(Credit).where(Credit.user_id == current_user.id))
    credit_balance = credits.balance

    user = UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        is_active=current_user.is_active,
        updated_at=current_user.updated_at,
        created_at=current_user.created_at,
        purchased=current_user.purchased,
    )

    return CurrentUserResponse(
        user=user,
        credits=credit_balance if credits else 0,
    )


# ----------------------------------
# delete account current user
@router.delete("/account")
def delete_account(current_user: CurrentUser):
    # Add account deletion service and confirmation checks.
    return {"message": "Authenticated account", "user_id": current_user.id}
