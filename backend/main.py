from dotenv import load_dotenv
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import files
from src.api.v1.routes import api_router


app = FastAPI(title="ResearchMind API")

load_dotenv()


@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
def health_check() -> dict[str, str]:
    return {"status": "ok"}


allowed_origins = {
    "http://localhost:5173",
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
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix="/api/v1")
