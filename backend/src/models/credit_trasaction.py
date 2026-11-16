
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
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func

from src.db.base import Base


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    __table_args__ = (
        CheckConstraint(
            "amount <> 0",
            name="ck_credit_transactions_amount"
        ),
        CheckConstraint(
            "balance_after >= 0",
            name="ck_credit_transactions_balance_after"
        ),
        CheckConstraint(
            """
            transaction_type IN (
                'purchase',
                'usage',
                'refund',
                'subscription',
                'bonus',
                'adjustment',
                'expiration',
                'reservation',
                'release'
            )
            """,
            name="ck_credit_transactions_type"
        ),
        Index(
            "idx_credit_transactions_user_created",
            "user_id",
            text("created_at DESC")
        ),
        Index(
            "idx_credit_transactions_type",
            "transaction_type"
        ),
        Index(
            "idx_credit_transactions_reference",
            "reference_id",
            postgresql_where=text("reference_id IS NOT NULL")
        ),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()")
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False
    )

    amount = Column(Integer, nullable=False)

    transaction_type = Column(String(30), nullable=False)

    balance_after = Column(Integer, nullable=False)

    description = Column(Text, nullable=True)

    reference_id = Column(String(255), nullable=True)

    idempotency_key = Column(
        String(255),
        unique=True,
        nullable=True
    )

    metadata = Column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb")
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.current_timestamp()
    )
