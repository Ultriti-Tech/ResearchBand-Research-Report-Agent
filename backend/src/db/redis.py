from upstash_redis.asyncio import Redis
from dotenv import load_dotenv

load_dotenv()

redis_client = Redis.from_env()