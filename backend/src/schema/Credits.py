from pathlib import Path
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class CreditTransactionRequest(BaseModel):
    amount: int
    plan_type: str
    payment_id: UUID
    razorpay_order_id : str
    
    