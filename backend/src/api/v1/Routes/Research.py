from dotenv import load_dotenv
import os

import json
import queue
import threading
from typing import Annotated
from sqlalchemy.orm import Session
from sqlalchemy import select

from fastapi import APIRouter, Depends, HTTPException, status, Response

# from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# import files
from src.dependencies.pipeline import run_search_pipeline, to_text
from src.dependencies.agents import gemini_model
from src.schema.SchemaModel import ResearchReq


from src.db.database import get_db
from src.models.credits import Credit
from src.models.user import User
from src.dependencies.user import CurrentUser


from src.core.rate_limiting import account_sliding_window_limit

router = APIRouter(prefix="/research", tags=["research"])


# ---------------------
# process pipeline
@router.post(
    "/",
    dependencies=[
        Depends(
            account_sliding_window_limit(
                scope="research",
                limit=1,
                window_seconds=3600,
            )
        )
    ],
)
def research(
    req: ResearchReq,
    db: Annotated[Session, Depends(get_db)],
    user: CurrentUser,
):
    print(req.topic)
    print(req.reportFormat)
    events = queue.Queue()
    current = {"step": None}  # remembers which step is running, for error reporting

    def on_step(step, status):
        current["step"] = step
        events.put({"type": "status", "step": step, "status": status})

    def worker():
        try:
            print("=" * 50, req.reportFormat)

            # ----------------------
            # reserve the credit for the process - 20

            credits = db.scalar(select(Credit).where(Credit.user_id == user.id))

            if not credits or credits.balance < 20:
                raise HTTPException(status_code=400, detail="Insufficient credits")

            credits.balance -= 20
            credits.reserved_credits += 20

            try:
                db.commit()
                db.refresh(credits)
            except Exception:
                db.rollback()
                raise

            state = run_search_pipeline(req.topic, req.reportFormat, on_step=on_step)
            events.put(
                {
                    "type": "result",
                    "report": state["report"],
                    "feedback": state["feedback"],
                    "sources": state["sources"],
                    "credits_balance": credits.balance,
                    "credits_reserved": credits.reserved_credits,
                }
            )

            credits.reserved_credits -= 20

            try:
                db.commit()
                db.refresh(credits)
            except Exception:
                db.rollback()
                raise

        except Exception as e:
            events.put({"type": "error", "step": current["step"], "message": str(e)})

            credits.balance += 20
            credits.reserved_credits -= 20

            try:
                db.commit()
                db.refresh(credits)
            except Exception:
                db.rollback()
                raise

        finally:
            events.put(None)  # signals end of stream

    threading.Thread(target=worker, daemon=True).start()

    def stream():
        while True:
            item = events.get()
            if item is None:
                break
            yield f"data: {json.dumps(item)}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
