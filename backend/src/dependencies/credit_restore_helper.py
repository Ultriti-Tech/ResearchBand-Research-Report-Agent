from datetime import datetime
from zoneinfo import ZoneInfo

from src.models.credits import Credit
from src.dependencies.user import CurrentUser

IST = ZoneInfo("Asia/Kolkata")

# ------------------------------------
# dail reset for free version
def reset_daily_credits(
    credits: Credit,
    current_user: CurrentUser
):
    plan = (current_user.purchased or "").lower()

    if plan != "free":
        return

    now = datetime.now(IST)
    last_reset = credits.last_daily_reset_at

    if (
        last_reset is None
        or last_reset.astimezone(IST).date() < now.date()
    ):
        credits.balance = credits.daily_credit_limit
        credits.reserved_credits = 0
        credits.last_daily_reset_at = now

# ---------------------------------
# monthly credit reset for [ monthly, yearly plan ]
def reset_monthly_credits(
    credits: Credit,
    current_user: CurrentUser,
    monthly_allowance: int
):
    plan = (current_user.purchased or "").lower()

    if plan not in ("monthly", "yearly"):
        return

    now = datetime.now(IST)
    last_reset = credits.last_monthly_reset_at

    if (
        last_reset is None
        or last_reset.astimezone(IST).month != now.month
        or last_reset.astimezone(IST).year != now.year
    ):
        credits.balance = monthly_allowance
        credits.reserved_credits = 0
        credits.last_monthly_reset_at = now