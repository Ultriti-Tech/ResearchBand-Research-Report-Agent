from dotenv import load_dotenv
import os

import json
import queue
import threading

from fastapi import APIRouter, Depends, HTTPException

# from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# import files
from src.dependencies.pipeline import run_search_pipeline, to_text
from src.dependencies.agents import gemini_model
from src.schema.SchemaModel import ResearchReq

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
def research(req: ResearchReq):
    print(req.topic)
    print(req.reportFormat)
    events = queue.Queue()
    current = {"step": None}  # remembers which step is running, for error reporting

    def on_step(step, status):
        current["step"] = step
        events.put({"type": "status", "step": step, "status": status})

    def worker():
        try:
            print("="*50,req.reportFormat)
            state = run_search_pipeline(req.topic, req.reportFormat, on_step=on_step)
            events.put(
                {
                    "type": "result",
                    "report": state["report"],
                    "feedback": state["feedback"],
                    "sources": state["sources"],
                }
            )
        except Exception as e:
            events.put({"type": "error", "step": current["step"], "message": str(e)})
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
