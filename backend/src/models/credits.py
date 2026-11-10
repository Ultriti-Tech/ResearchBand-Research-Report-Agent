from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base


class Credit(Base):
    __tablename__ = "credits"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    balance: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    reserved_credits: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    daily_credit_limit: Mapped[int] = mapped_column(
        Integer,
        default=50,
        nullable=False,
    )

    last_reset_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "balance >= 0",
            name="check_balance_non_negative",
        ),
        CheckConstraint(
            "reserved_credits >= 0",
            name="check_reserved_credits_non_negative",
        ),
    )
