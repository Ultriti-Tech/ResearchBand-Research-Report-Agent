from datetime import datetime, timezone, timedelta
from src.models.credits import Credit
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")

def reset_daily_credits(credits: Credit):
    now = datetime.now(IST)
    today = now.date()

    if (
        credits.last_reset_at is None
        or credits.last_reset_at.astimezone(IST).date() < today
    ):
        credits.balance = credits.daily_credit_limit
        credits.reserved_credits = 0
        credits.last_reset_at = now
        
        
# def reset_test_credits_per_min(credits: Credit):
#     now = datetime.now(timezone.utc)

#     if now - credits.last_reset_at >= timedelta(minutes=1):
#         credits.balance = credits.daily_credit_limit
#         credits.reserved_credits = 0
#         credits.last_reset_at = now