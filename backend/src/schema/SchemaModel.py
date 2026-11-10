from pydantic import BaseModel,ConfigDict
from typing import Literal

from typing import TypedDict
from datetime import datetime
from uuid import UUID


class ResearchReq(BaseModel):
    topic: str
    reportFormat:str
    


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ReportChatReq(BaseModel):
    topic: str
    report: str
    messages: list[ChatMessage]
    
class ReportHistoryResponse(BaseModel):
    id: UUID
    title: str
    status: str
    report_content: str | None
    report_critic: str | None
    sources: list[dict[str, str]] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NewsArticle(TypedDict):
    title: str
    url: str
    snippet: str
    source: str
    date: str


class NewsSearchResult(TypedDict):
    query: str
    count: int
    articles: list[NewsArticle]