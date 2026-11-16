import os
import razorpay
import time
from decimal import Decimal

from src.config.settings import settings

# Initialize Razorpay instance
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


# Create order function
def create_order(amount):

    amount_paise = int(Decimal(str(amount)) * 100)

    options = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"receipt_{time.time_ns()}",
    }

    order = razorpay_client.order.create(data=options)

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "status": order["status"],
    }


# Verify payment signature function
def verify_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature):

    print(
        "------------------\n-----------\n",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    )

    try:

        params = {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        }

        razorpay_client.utility.verify_payment_signature(params)

        print("generated_signature === razorpay_signature : True")

        return True

    except razorpay.errors.SignatureVerificationError:

        print("generated_signature === razorpay_signature : False")

        return False
