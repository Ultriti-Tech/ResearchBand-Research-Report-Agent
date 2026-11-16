from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.models.payment import Payment
from src.models.credits import Credit
from src.models.credit_trasaction import CreditTransaction

from src.db.database import get_db
from src.dependencies.user import CurrentUser
from src.schema.Credits import CreditTransactionRequest

router = APIRouter(prefix="/creditTransaction", tags=["creditTransaction"])

# These values must match your actual plan IDs.
# Values represent credits, NOT payment amounts in rupees.
PLAN_CREDITS = {
    "topup": 50,
    "monthly": 600,
    "yearly": 800,
}


@router.post("/credit")
def create_credit_transaction(
    data: CreditTransactionRequest,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        # 1. Find and lock the payment
        payment = db.scalar(
            select(Payment)
            .where(
                Payment.id == data.payment_id,
                Payment.razorpay_order_id == data.razorpay_order_id,
                Payment.user_id == current_user.id,
            )
            .with_for_update()
        )

        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        # 2. Ensure payment is verified
        if payment.status != "paid":
            raise HTTPException(status_code=400, detail="Payment has not been verified")

        # 3. Determine credits from backend plan configuration
        credits_to_add = PLAN_CREDITS.get(payment.plan_id)

        if credits_to_add is None:
            raise HTTPException(status_code=400, detail="Invalid payment plan")

        # 4. Determine transaction type
        if payment.plan_id.startswith("topup"):
            transaction_type = "purchase"
        else:
            transaction_type = "subscription"

        # 5. Generate stable idempotency key
        idempotency_key = f"payment_{payment.id}"

        # 6. Check whether credits were already allocated
        existing_transaction = db.scalar(
            select(CreditTransaction).where(
                CreditTransaction.idempotency_key == idempotency_key
            )
        )

        if existing_transaction:
            return {
                "success": True,
                "message": "Credits already allocated",
                "balance": existing_transaction.balance_after,
            }

        # 7. Find and lock user's credit wallet
        credit = db.scalar(
            select(Credit).where(Credit.user_id == current_user.id).with_for_update()
        )

        if not credit:
            raise HTTPException(status_code=404, detail="Credit wallet not found")

        # 8. Update wallet
        credit.balance += credits_to_add

        # 9. Create transaction history
        credit_transaction = CreditTransaction(
            user_id=current_user.id,
            amount=credits_to_add,
            transaction_type=transaction_type,
            balance_after=credit.balance,
            description=f"Added {credits_to_add} credits",
            reference_id=str(payment.id),
            idempotency_key=idempotency_key,
            metadata={
                "plan_id": payment.plan_id,
                "razorpay_payment_id": payment.razorpay_payment_id,
            },
        )

        db.add(credit_transaction)

        
        # # Update user's purchased plan
        # if payment.plan_id in ("monthly", "yearly"):
        #     current_user.purchased = payment.plan_id

        # Commit all changes together
        db.commit()
        db.refresh(credit)
        # db.refresh(current_user)


        return {
            "success": True,
            "message": "Credits added successfully",
            "credits_added": credits_to_add,
            "balance": credit.balance,
            "purchased_plan": current_user.purchased
        }

    except Exception:
        db.rollback()
        raise
