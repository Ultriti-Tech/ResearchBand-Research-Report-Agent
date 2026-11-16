import hmac
import hashlib
import os

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.db.database import get_db
from src.dependencies.user import CurrentUser
from src.models.payment import Payment
from src.schema.payment import VerifyRequestDb
from src.models.subscription import Subscription

router = APIRouter(prefix="/transaction", tags=["Transactions"])

RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


@router.post("/verify")
def verify_transaction(
    data: VerifyRequestDb, current_user: CurrentUser, db: Session = Depends(get_db)
):
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Payment configuration error")

    # 1. Find payment belonging to the authenticated user
    transaction = db.scalar(
        select(Payment)
        .where(
            Payment.id == data.payment_id,
            Payment.razorpay_order_id == data.razorpay_order_id,
            Payment.user_id == current_user.id,
        )
        .with_for_update()
    )

    if not transaction:
        raise HTTPException(status_code=404, detail="Payment transaction not found")

    # 2. Prevent duplicate processing
    if transaction.status == "paid":
        if transaction.razorpay_payment_id == data.razorpay_payment_id:
            return {"success": True, "message": "Payment already verified"}

        raise HTTPException(status_code=409, detail="Payment already processed")

    # 3. Generate expected Razorpay signature
    message = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"), message.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    # 4. Verify signature
    if not hmac.compare_digest(expected_signature, data.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")


    # Update payment after successful signature verification
    transaction.razorpay_payment_id = data.razorpay_payment_id
    transaction.status = "paid"

    now = datetime.now(timezone.utc)

    if data.plan_type == "monthly":
        new_subscription = Subscription(
            user_id=current_user.id,
            plan_type="monthly",
            sign_up_credits=600,
            started_at=now,
            expires_at=now + timedelta(days=30),
        )

    elif data.plan_type == "yearly":
        new_subscription = Subscription(
            user_id=current_user.id,
            plan_type="yearly",
            sign_up_credits=800,
            started_at=now,
            expires_at=now + timedelta(days=365),
        )

    else:
        new_subscription = None

    if new_subscription:
        db.add(new_subscription)
        current_user.purchased = data.plan_type

    db.commit()
    db.refresh(transaction)
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Payment verified successfully",
        "status": transaction.status,
    }
