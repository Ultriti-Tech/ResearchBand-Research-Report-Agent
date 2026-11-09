from dotenv import load_dotenv
import os


import ast
import logging

from fastapi import APIRouter, Depends, HTTPException

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# import files
from src.dependencies.pipeline import run_search_pipeline, to_text
from src.dependencies.agents import gemini_model
from src.schema.SchemaModel import ReportChatReq
from src.schema.ChatAgent import EditRequest
from src.dependencies.tools import generate_patch
from src.dependencies.patcher import apply_patch
from src.dependencies.agents import chatAgent

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/chatagent", tags=["chatagent"])


# -----------------------------------------
# prompts
@router.post("/", include_in_schema=False)
def chat_about_report(req: ReportChatReq):
    if not req.messages or req.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="A user message is required.")

    # response = chatAgent(req)

    conversation = [
        (
            HumanMessage(content=message.content)
            if message.role == "user"
            else AIMessage(content=message.content)
        )
        for message in req.messages
    ]
    response = gemini_model.invoke(
        [
            SystemMessage(
                content=(
                    "You are a helpful research assistant. Answer questions using "
                    "the report provided below. Be clear about uncertainty and do not "
                    "introduce claims unsupported by the report. If the report does "
                    "not contain the answer, say so.\n\n"
                    f"Topic: {req.topic}\n\nReport:\n{req.report}"
                )
            ),
            *conversation,
        ]
    )
    return {"answer": to_text(response.content)}


# ---------------------------------
# edit report agent
@router.post("/editchat")
def edit_code(request: EditRequest):
    try:

        print("instruction given : ", request.instruction)
        patch = generate_patch(request.code, request.instruction, request.file_name)

        if not patch.changes:
            return {"success": False, "message": patch.explanation}

        print("patch generated ..")

        updated, diff = apply_patch(request.code, patch)
        print("apploed pathc")

        print("---------------------------------\n updated\n", updated)
        print("---------------------------------\n diff\n", diff)

        if request.file_name.lower().endswith(".py"):
            ast.parse(updated)
        return {
            "success": True,
            "explanation": patch.explanation,
            "changes": [change.model_dump() for change in patch.changes],
            "updated_code": updated,
            "diff": diff,
        }
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except SyntaxError as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Suggested edit produced invalid Python syntax: {exc.msg}",
        ) from exc
    except Exception as exc:
        logger.exception("AI edit generation failed")
        raise HTTPException(
            status_code=502,
            detail="AI edit generation failed. Check the backend configuration and try again.",
        ) from exc
