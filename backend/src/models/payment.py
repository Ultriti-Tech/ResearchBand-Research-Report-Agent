import uuid
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    CheckConstraint,
    ForeignKey,
    Index,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.db.base import Base


class Payment(Base):
    __tablename__ = "payments"
    
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_payment_amount"),
        CheckConstraint(
            "status IN ('pending', 'authorized', 'paid', 'failed', 'refunded')",
            name="check_payment_status",
        ),
        Index("idx_payments_user_created", "user_id", "created_at"),
        {"schema": "public"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )

    plan_id = Column(String(50), nullable=False)

    amount = Column(Integer, nullable=False)

    currency = Column(String(10), nullable=False, server_default="INR")

    status = Column(String(20), nullable=False, server_default="pending")

    razorpay_order_id = Column(String(255), unique=True, nullable=True)

    razorpay_payment_id = Column(String(255), unique=True, nullable=True)

    failure_reason = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


