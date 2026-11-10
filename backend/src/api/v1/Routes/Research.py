from dotenv import load_dotenv
import os

import json
import queue
import threading
from typing import Annotated
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select

from fastapi import APIRouter, Depends, HTTPException, status, Response

# from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from datetime import datetime, timezone

# import files
from src.dependencies.pipeline import run_search_pipeline, to_text
from src.dependencies.agents import gemini_model
from src.schema.SchemaModel import ResearchReq, ReportHistoryResponse


from src.db.database import get_db
from src.models.credits import Credit
from src.models.report_analysis import ReportAnalysis
from src.models.user import User
from src.dependencies.user import CurrentUser


from src.core.rate_limiting import (
    account_sliding_window_limit,
    account_token_bucket_limit,
)

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
        credit_reserved = False

        try:
            credits = db.scalar(select(Credit).where(Credit.user_id == user.id))

            if not credits or credits.balance < 20:
                raise HTTPException(
                    status_code=400,
                    detail="Insufficient credits",
                )

            # ---------------------
            # Reserve credits
            credits.balance -= 20
            credits.reserved_credits += 20

            db.commit()
            db.refresh(credits)

            credit_reserved = True

            # ---------------------
            # Run pipeline

            state = run_search_pipeline(
                req.topic,
                req.reportFormat,
                on_step=on_step,
            )

            # ---------------------
            # Save report

            report = ReportAnalysis(
                user_id=user.id,
                title=req.topic,
                report_content=state["report"],
                report_critic=state["feedback"],
                sources=state["sources"],
                status="completed",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )

            db.add(report)
            db.commit()
            db.refresh(report)

            # ---------------------
            # Consume reserved credits

            credits.reserved_credits -= 20

            db.commit()
            db.refresh(credits)

            # ---------------------
            # Send result

            events.put(
                {
                    "type": "result",
                    "report": state["report"],
                    "feedback": state["feedback"],
                    "sources": state["sources"],
                    "credits_balance": credits.balance,
                    "credits_reserved": credits.reserved_credits,
                    "report_id": str(report.id),
                }
            )

        except Exception as e:

            # Refund only if reserved

            if credit_reserved:
                try:
                    credits.balance += 20
                    credits.reserved_credits -= 20

                    db.commit()
                    db.refresh(credits)

                except Exception:
                    db.rollback()

            events.put(
                {
                    "type": "error",
                    "step": current["step"],
                    "message": str(e),
                }
            )

        finally:
            events.put(None)

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


# -------------------------
# report history
@router.get(
    "/history",
    response_model=list[ReportHistoryResponse],
    dependencies=[
        Depends(
            account_token_bucket_limit(
                scope="report_history",
                capacity=10,
                refill_per_second=5 / 60,
            )
        )
    ],
)
def reportHistory(
    db: Annotated[Session, Depends(get_db)],
    user: CurrentUser,
):
    try:
        report_history = db.scalars(
            select(ReportAnalysis)
            .where(ReportAnalysis.user_id == user.id)
            .order_by(ReportAnalysis.created_at.desc())
        ).all()

        return report_history

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get(
    "/history/{report_id}",
    response_model=ReportHistoryResponse,
    dependencies=[
        Depends(
            account_token_bucket_limit(
                scope="report_history",
                capacity=10,
                refill_per_second=5 / 60,
            )
        )
    ],
)
def get_report_history_item(
    report_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user: CurrentUser,
):
    report = db.scalar(
        select(ReportAnalysis).where(
            ReportAnalysis.id == report_id,
            ReportAnalysis.user_id == user.id,
        )
    )
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")

    return report
