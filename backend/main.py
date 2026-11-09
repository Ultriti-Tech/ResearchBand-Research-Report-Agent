from dotenv import load_dotenv
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# import files
from src.api.v1.routes import api_router
from src.db.redis import redis_client



load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):

    app.state.redis = redis_client

    try:
        await app.state.redis.set("connection_test", "connected")
        result = await app.state.redis.get("connection_test")

        print("Upstash Redis:", result)

        yield

    finally:
        pass

app = FastAPI(
    title="Application API",
    version="1.0.0",
    lifespan=lifespan,
)



@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
def health_check() -> dict[str, str]:
    return {"status": "ok"}


allowed_origins = {
    "http://localhost:5173",
    "https://researchand.ultriti.com",
    "https://researchand.ultriti.com",
    "https://researchand.ultriti.com/",
}


allowed_origins.update(
    origin.rstrip("/")
    for name in ("FRONTEND_URL", "FRONTEND_URL_2")
    if (origin := os.getenv(name))
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Retry-After"],
)


app.include_router(api_router, prefix="/api/v1")
