from pydantic import BaseModel
from typing import Literal

from typing import TypedDict

class ResearchReq(BaseModel):
    topic: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ReportChatReq(BaseModel):
    topic: str
    report: str
    messages: list[ChatMessage]
    
    

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