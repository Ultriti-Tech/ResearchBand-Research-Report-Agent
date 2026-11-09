from fastapi import APIRouter

from src.api.v1.Routes import Research, ChatAgent, Auth, User

api_router = APIRouter()

api_router.include_router(User.router)
api_router.include_router(Auth.router)
api_router.include_router(Research.router)
api_router.include_router(ChatAgent.router)