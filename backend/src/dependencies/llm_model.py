
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
import os


# Load API keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_API_KEY_BACKUP = os.getenv("YOUR_SECOND_GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# Validate configuration
if not GOOGLE_API_KEY:
    raise ValueError("Primary Gemini API key is missing")

if not GROQ_API_KEY:
    raise ValueError("Groq API key is missing")

if not GOOGLE_API_KEY_BACKUP:
    raise ValueError("Secondary Gemini API key is missing")


# 1. Primary Gemini
gemini_primary = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    google_api_key=GOOGLE_API_KEY,
    temperature=0,
    max_retries=1,
)

# 2. Groq backup
groq_backup = ChatGroq(
    model="openai/gpt-oss-20b",
    groq_api_key=GROQ_API_KEY,
    temperature=0,
    max_retries=1,
)

# 3. Secondary Gemini
gemini_secondary = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    google_api_key=GOOGLE_API_KEY_BACKUP,
    temperature=0,
    max_retries=1,
)


# Automatic fallback chain
llm_model = gemini_primary.with_fallbacks(
    [
        groq_backup,
        gemini_secondary
    ]
)


# Usage
# response = llm_model.invoke("Explain RAG")
# print(response.content)
