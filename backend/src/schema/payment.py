from pathlib import Path

from pydantic import BaseModel, Field, field_validator


class PaymentRequest(BaseModel):
    plan_id: str


class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    
class VerifyRequestDb(BaseModel):
    plan_type : str
    payment_id : str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    