
import time
import uuid

from fastapi import HTTPException, Request

from src.dependencies.user import CurrentUser


# =====================================================
# TOKEN BUCKET
# =====================================================

TOKEN_BUCKET_SCRIPT = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local refill_rate = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "tokens", "updated")
local tokens = tonumber(data[1]) or capacity
local updated = tonumber(data[2]) or now

tokens = math.min(
    capacity,
    tokens + math.max(0, now - updated) * refill_rate
)

local allowed = 0
local retry_after = 0

if tokens >= cost then
    tokens = tokens - cost
    allowed = 1
else
    retry_after = math.ceil((cost - tokens) / refill_rate)
end

redis.call(
    "HSET", key,
    "tokens", tokens,
    "updated", now
)

redis.call("EXPIRE", key, math.ceil(capacity / refill_rate) + 60)

return {allowed, retry_after}
"""


def token_bucket_limit(
    scope: str,
    capacity: int,
    refill_per_second: float,
):
    async def dependency(request: Request):

        redis = request.app.state.redis

        ip = request.client.host if request.client else "unknown"

        redis_key = f"rl:bucket:{scope}:ip:{ip}"

        result = await redis.eval(
            TOKEN_BUCKET_SCRIPT,
            keys=[redis_key],
            args=[
                time.time(),
                capacity,
                refill_per_second,
                1,
            ],
        )

        allowed, retry_after = result

        if not int(allowed):
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded.",
                headers={
                    "Retry-After": str(max(1, int(retry_after)))
                },
            )

    return dependency


# ACCOUNT-BASED TOKEN BUCKET

def account_token_bucket_limit(
    scope: str,
    capacity: int,
    refill_per_second: float,
):
    async def dependency(request: Request, user: CurrentUser):

        redis = request.app.state.redis

        user_id = str(user.id)

        redis_key = f"rl:bucket:{scope}:user:{user_id}"

        result = await redis.eval(
            TOKEN_BUCKET_SCRIPT,
            keys=[redis_key],
            args=[
                time.time(),
                capacity,
                refill_per_second,
                1,
            ],
        )

        allowed, retry_after = result

        if not int(allowed):
            raise HTTPException(
                status_code=429,
                detail="Account rate limit exceeded.",
                headers={
                    "Retry-After": str(max(1, int(retry_after)))
                },
            )

    return dependency


# =====================================================
# SLIDING WINDOW
# =====================================================

SLIDING_WINDOW_SCRIPT = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call("ZREMRANGEBYSCORE", key, "-inf", now - window)

local count = redis.call("ZCARD", key)

if count >= limit then
    return 0
end

redis.call("ZADD", key, now, member)
redis.call("EXPIRE", key, window)

return 1
"""


def sliding_window_limit(
    scope: str,
    limit: int,
    window_seconds: int,
):
    async def dependency(request: Request):

        redis = request.app.state.redis

        ip = request.client.host if request.client else "unknown"

        now = time.time()

        redis_key = f"rl:window:{scope}:ip:{ip}"

        allowed = await redis.eval(
            SLIDING_WINDOW_SCRIPT,
            keys=[redis_key],
            args=[
                now,
                window_seconds,
                limit,
                f"{now}:{uuid.uuid4().hex}",
            ],
        )

        if not int(allowed):
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded.",
                headers={
                    "Retry-After": str(window_seconds)
                },
            )

    return dependency


# ACCOUNT-BASED SLIDING WINDOW

def account_sliding_window_limit(
    scope: str,
    limit: int,
    window_seconds: int,
):
    async def dependency(request: Request, user: CurrentUser):

        redis = request.app.state.redis

        user_id = str(user.id)

        now = time.time()

        redis_key = f"rl:window:{scope}:user:{user_id}"

        allowed = await redis.eval(
            SLIDING_WINDOW_SCRIPT,
            keys=[redis_key],
            args=[
                now,
                window_seconds,
                limit,
                f"{now}:{uuid.uuid4().hex}",
            ],
        )

        if not int(allowed):
            raise HTTPException(
                status_code=429,
                detail="Account rate limit exceeded.",
                headers={
                    "Retry-After": str(window_seconds)
                },
            )

    return dependency
