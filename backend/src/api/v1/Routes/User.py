from fastapi import APIRouter, Depends, HTTPException, status, Response

from src.dependencies.user import CurrentUser
from src.schema.user import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


# from core.rate_limiter import token_bucket_limit

# -------------------
# get user detail
@router.get(
    "/getUser",
    response_model=UserResponse,
    # dependencies=[
    #     Depends(
    #         token_bucket_limit(
    #             scope="user_details",
    #             capacity=30,
    #             refill_per_second=20 / 60,
    #         )
    #     )
    # ],
)
def read_current_user(current_user: CurrentUser):
    return current_user

# ----------------------------------
# delete account current user
@router.delete("/account")
def delete_account(current_user: CurrentUser):
    # Add account deletion service and confirmation checks.
    return {"message": "Authenticated account", "user_id": current_user.id}
