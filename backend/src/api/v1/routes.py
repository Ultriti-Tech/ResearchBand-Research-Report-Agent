from fastapi import APIRouter

from src.api.v1.Routes import Research, ChatAgent 

api_router = APIRouter()

api_router.include_router(Research.router)
api_router.include_router(ChatAgent.router)