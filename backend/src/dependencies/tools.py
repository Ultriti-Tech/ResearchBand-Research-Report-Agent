from dotenv import load_dotenv

load_dotenv()


from langchain.tools import tool
from typing import TypedDict
import requests
from bs4 import BeautifulSoup
import os
from firecrawl import Firecrawl


from fastapi import APIRouter, HTTPException, Query
from rich import print
from src.schema.ChatAgent import Patch
from src.schema.SchemaModel import NewsArticle, NewsSearchResult


from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# load clients

# fire crawl news fetching
api_key = os.getenv("FIRECRAWL_API_KEY")
firecrawl = Firecrawl(api_key=api_key) if api_key else None

# -----------------------------
# create tools


# ----------------------------
# web serach tool
def search_news(query: str) -> NewsSearchResult:
    if firecrawl is None:
        raise HTTPException(
            status_code=500,
            detail="Firecrawl API key is not configured",
        )

    try:
        result = firecrawl.search(
            query,
            sources=["news"],
            limit=5,
        )
        # Current SDK groups results by source type.
        items = getattr(result, "news", None) or []

        articles: list[NewsArticle] = []
        for item in items:
            if isinstance(item, dict):
                get = item.get
            else:
                get = lambda key, default=None: getattr(item, key, default)

            articles.append(
                {
                    "title": get("title") or "",
                    "url": get("url") or "",
                    "snippet": get("snippet") or get("description") or "",
                    "source": get("source") or "",
                    "date": get("date") or "",
                }
            )

        # print("\n"+"="*50)
        # print("query", query,"count", len(articles),"articles": articles)
        # print("\n"+"="*50)

        return {
            "query": query,
            "count": len(articles),
            "articles": articles,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"News search failed: {str(exc)}",
        )


# -----------------------
# web search tool
@tool
def web_search(query: str) -> NewsSearchResult:
    """Search the web for recent and reliable information on a topic. Returns titles, URLs, and snippets."""
    return search_news(query)


# ------------------------------
# web page - scrapping
@tool
def web_page_scrapping(url: str) -> str:
    """Scrape and return clean text content from the given URL."""

    try:
        headers = {"User-Agent": "Mozilla/5.0"}

        response = requests.get(url, headers=headers, timeout=20)

        # Don't raise automatically
        if response.status_code != 200:
            return f"Unable to scrape URL. " f"HTTP Status: {response.status_code}"

        soup = BeautifulSoup(response.text, "lxml")

        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        text = soup.get_text(separator="\n", strip=True)

        if not text.strip():
            return "Page loaded but no readable content was found."

        return text[:3000]

    except requests.Timeout:
        return "Request timed out while scraping the webpage."

    except requests.ConnectionError:
        return "Could not connect to the webpage."

    except Exception as exc:
        return f"Scraping failed: {str(exc)}"


# ----------------------------
# patch generation
# -------------------------
# patch generation prompt
patch_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an AI code editor. Suggest the smallest change that satisfies the request.
Never return an entire file. Preserve unrelated content and exact formatting.
Each old_text must be a non-empty exact substring of the original file. Use before_context
and after_context to disambiguate repeated snippets. Include a short reason per change.
Return no changes if the request is unclear or cannot be achieved safely.""",
        ),
        (
            "human",
            """File name: {file_name}

Original file content:
{code}

Requested change:
{instruction}""",
        ),
    ]
)


def generate_patch(code: str, instruction: str, file_name: str) -> Patch:
    """funtion is used to generate patch for particular portion of code"""

    print("whole data is been sent :", code)
    print("generating patch .....")
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash-lite",
        temperature=0,
        # max_retries=2,
    )
    editor_chain = patch_prompt | llm.with_structured_output(Patch)

    return editor_chain.invoke(
        {
            "code": code,
            "instruction": instruction,
            "file_name": file_name,
        }
    )
