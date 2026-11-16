from fastapi import APIRouter, Depends, HTTPException, status, Response

from typing import Annotated
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.models.credits import Credit

from src.db.database import get_db
from src.dependencies.user import CurrentUser
from src.schema.user import UserResponse, CurrentUserResponse
from src.dependencies.credit_restore_helper import (
    reset_daily_credits,
    reset_monthly_credits,
)

from src.models.subscription import Subscription

router = APIRouter(prefix="/users", tags=["Users"])


# from src.core.rate_limiting import token_bucket_limit
# from datetime import datetime, timezone
# from sqlalchemy import select

# from src.models.subscription import Subscription


@router.get(
    "/getUser",
    response_model=CurrentUserResponse,
    # dependencies=[
    #     Depends(
    #         token_bucket_limit(
    #             scope="user_details",
    #             capacity=10,
    #             refill_per_second=10 / 60,
    #         )
    #     )
    # ],
)
def read_current_user(
    current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]
):
    credits = db.scalar(select(Credit).where(Credit.user_id == current_user.id))

    if not credits:
        raise HTTPException(status_code=404, detail="Credit wallet not found")

    # 1. Get the latest subscription
    subscription = db.scalar(
        select(Subscription)
        .where(Subscription.user_id == current_user.id)
        .order_by(Subscription.started_at.desc(), Subscription.id.desc())
        .limit(1)
    )

    now = datetime.now(timezone.utc)

    # 2. Check subscription expiry
    if subscription:
        if subscription.expires_at is not None and subscription.expires_at <= now:
            subscription.status = "expired"
            current_user.purchased = "FREE"

        elif subscription.expires_at is None or subscription.expires_at > now:
            current_user.purchased = subscription.plan_type.upper()

    # 3. Restore credits according to current plan
    plan = (current_user.purchased or "FREE").lower()

    if plan == "free":
        reset_daily_credits(credits=credits, current_user=current_user)

    elif plan == "monthly":
        reset_monthly_credits(
            credits=credits, current_user=current_user, monthly_allowance=600
        )

    elif plan == "yearly":
        reset_monthly_credits(
            credits=credits, current_user=current_user, monthly_allowance=800
        )

    # 4. Save changes
    db.commit()

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
        credits=credits.balance,
    )
