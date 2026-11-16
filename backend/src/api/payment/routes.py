from fastapi import APIRouter

from src.api.payment.Routes import Razorpay, Trasaction

api_router_p = APIRouter()

api_router_p.include_router(Razorpay.router)
api_router_p.include_router(Trasaction.router)