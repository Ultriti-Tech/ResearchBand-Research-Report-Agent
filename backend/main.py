from dotenv import load_dotenv
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import files
from src.api.v1.routes import api_router


app = FastAPI(title="ResearchMind API")

load_dotenv()

allowed_origins = {
    "http://localhost:5173",
    "https://multiagent-ai-system.netlify.app",
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

