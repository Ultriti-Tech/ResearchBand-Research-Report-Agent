from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel

from typing import Annotated
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from src.models.credits import Credit


from src.models.payment import Payment
from src.models.subscription import Subscription
from src.dependencies.user import CurrentUser
from src.db.database import get_db

from src.payment.payment import create_order, verify_payment
from src.schema.payment import PaymentRequest, VerifyRequest

router = APIRouter()


PLANS = {
    "free": {
        "name": "Free",
        "price": 0,
        "credits": 20,
        "type": "free",
    },
    "topup": {
        "name": "Top-up",
        "price": 50,
        "credits": 50,
        "type": "one_time",
    },
    "monthly": {
        "name": "Monthly",
        "price": 1,
        "credits": 600,
        "type": "subscription",
    },
    "yearly": {
        "name": "Yearly",
        "price": 4999,
        "credits": 800,
        "type": "subscription",
        "duration_months": 12,
    },
}


# ---------------------------------
# create the paymnt order
@router.post("/create-order")
def create_payment_order(
    data: PaymentRequest,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    plan = PLANS.get(data.plan_id)

    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")

    if data.plan_id != "topup":
        # Check for an active subscription
        subscription = db.scalar(
            select(Subscription).where(
                Subscription.user_id == current_user.id,
                Subscription.expires_at > func.now(),
            )
        )

        if subscription:
            raise HTTPException(
                status_code=400,
                detail=f"You already have an active {subscription.plan_type} subscription. "
                "You can purchase another plan after it expires.",
            )

    if not current_user:
        raise HTTPException(status_code=401, detail="User not found")

    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    if plan["price"] <= 0:
        raise HTTPException(
            status_code=400, detail="This plan does not require payment"
        )

    amount_paise = plan["price"]

    # -------------
    # payment trasaction
    razorpay_order = create_order(amount_paise)

    payment = Payment(
        user_id=current_user.id,
        plan_id=data.plan_id,
        amount=plan["price"],
        currency="INR",
        status="pending",
        razorpay_order_id=razorpay_order["order_id"],
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    # 4. Return order details to React
    return {
        "order_id": razorpay_order["order_id"],
        "amount": razorpay_order["amount"],
        "currency": razorpay_order["currency"],
        "payment_id": payment.id,
    }


# ----------------------------------
# verify the payment
@router.post("/verify-payment")
def verify_payment_order(data: VerifyRequest):

    is_valid = verify_payment(
        data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    return {"success": True, "message": "Payment verified successfully"}
