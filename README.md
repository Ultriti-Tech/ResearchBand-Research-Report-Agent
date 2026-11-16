# ResearchMind

**Turn a research question into a source-linked first draft.**

ResearchMind is an AI-assisted research workspace that helps users explore a topic, review an organized draft with source links, and ask follow-up questions in one interface. It is a working prototype for human-reviewed research preparation—not an authoritative source or a substitute for expert judgment.

> **Preview:** No genuine application screenshots were present in the repository when this README was prepared. See [screenshots/README.md](./screenshots/README.md) for capture instructions; no placeholder is presented as an actual screenshot.

## Table of contents

- [Project overview](#project-overview)
- [Features](#features)
- [Application preview](#application-preview)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Using the application](#using-the-application)
- [API overview](#api-overview)
- [Engineering notes](#engineering-notes)
- [Validation, limitations, and roadmap](#validation-limitations-and-roadmap)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Project overview

Early-stage research can involve moving between discovery, note-taking, drafting, and review tools. ResearchMind brings those activities into a browser-based workspace: a user submits a topic, follows progress as a report is prepared, inspects source links and a separate critique, and can continue with report-focused questions or edits.

The project is intended for students, analysts, writers, product teams, and other knowledge workers who need an initial orientation to a topic. Users should independently verify generated claims and sources, especially before relying on them for consequential decisions or publication.

## Features

### Implemented

- **Topic-based research:** Submit a topic and receive a structured initial report.
- **Custom report format:** Specify custom section instructions, depth, tone, or citation preferences.
- **Visible progress:** Follow status updates while a report is being prepared.
- **Source links and review:** Inspect returned sources and a critique alongside the report.
- **Report-focused assistant:** Ask follow-up questions in the context of the current report.
- **Research history:** Revisit saved reports with their title, preview, creation date, and critique.
- **User-controlled edits:** Request report changes and review proposed diffs before applying them.
- **Export and editing controls:** Copy, download (Markdown, Word, PDF print), and directly edit report content.
- **Accounts and sign-in:** Register and log in; authenticated routes accept the JWT as a bearer token or HttpOnly cookie.
- **Research credits & billing:**
  - New accounts receive 50 initial credits on signup.
  - Research runs reserve 20 credits, refunded on pipeline error.
  - Report chat costs 1 credit; AI edits cost 2 credits.
  - Razorpay payment gateway integration supporting Free, Top-up (50 credits for ₹50), Monthly (600 credits for ₹499), and Yearly (800 credits/mo for ₹4,999) tiers.
  - Separate tracking for daily (`last_daily_reset_at`) and monthly (`last_monthly_reset_at`) credit resets.
- **Mobile-responsive workspace:**
  - Responsive navigation with collapsible mobile drawer, touch targets, and compact credit balance indicator.
  - Adaptive research input card (`flex-col sm:flex-row`).
  - Mobile segmented view switcher (`📄 Report` vs `💬 AI Assistant`) on screens `< 900px` to avoid endless scrolling.
  - Full-screen modal overlays for pricing, formatting, and responsive toasts.
  - Horizontal overflow safeguards on Markdown tables, code blocks, and patch diffs.
- **Request limits:** Redis-backed rate limits apply to selected account and IP-based routes.

### Not implemented / not claimed

- Role-based access or persistent chat history.
- Account deletion (the current endpoint is a placeholder) or enterprise administration.
- Formal model-quality evaluation or measured productivity outcomes.
- Production-grade operational guarantees.

## Application preview

No application screenshots are currently available. Add genuine captures at the paths below to show the product; until then these remain capture instructions, not images.

| Screen to capture | Suggested path | What it should show |
|---|---|---|
| Research workspace | `screenshots/research-workspace.png` | Topic entry and a generated report with source links |
| About page | `screenshots/about-page.png` | Product purpose and the research workflow |
| Assistant edit review | `screenshots/assistant-edit-review.png` | A proposed change awaiting user review |

See [screenshots/README.md](./screenshots/README.md).

## Architecture

The browser UI communicates with a FastAPI service. The service coordinates topic research and generative-AI capabilities through external providers and returns report content, source links, and progress updates. The frontend displays those results and supports report-focused follow-up and user-reviewed edits.

```mermaid
flowchart LR
    U[User] --> UI[React 19 web application]
    UI -->|HTTP, JWT auth, streamed progress| API[FastAPI service]
    UI -->|Razorpay checkout| PG[Razorpay Payment Gateway]
    PG -->|Payment verification| API
    API --> Search[Firecrawl web search & scrape]
    API --> Model[Google Gemini LLM]
    API --> Accounts[(PostgreSQL database)]
    API --> Limits[(Upstash Redis rate limits)]
    Search --> API
    Model --> API
    API -->|Report, sources, critique, status| UI
    UI -->|Follow-up questions or edit requests| API
    API -->|Answer or proposed edit| UI
```

This is a high-level product view, not a complete internal design specification. A configured SQL database stores user accounts, research reports, critiques, subscriptions, payments, and credit transactions; Redis supports selected rate limits. Chat conversations are not durably stored.

## Technology stack

| Category | Technology | Purpose |
|---|---|---|
| Frontend | React 19, React DOM | Component-based browser interface |
| Frontend tooling | Vite 8 | Local development and frontend builds |
| Styling | Tailwind CSS 4 and project CSS | Layout and presentation |
| Backend | Python, FastAPI, Uvicorn | HTTP service and local ASGI server |
| Validation | Pydantic, pydantic-settings | Request, response, and environment settings validation |
| AI orchestration | LangChain, LangGraph | Integrating model and research workflows |
| Generative AI | Google Gemini through `langchain-google-genai` | Report and report-assistant functionality |
| Web research | Firecrawl through `firecrawl-py` | External research/search capability |
| Payment gateway | Razorpay Python SDK, Razorpay Checkout JS | Order creation, payment verification, and billing |
| Account, billing, and report data | SQLAlchemy, PostgreSQL (`psycopg`) | User accounts, credits, payments, subscriptions, and generated research reports |
| Rate limiting | Upstash Redis | Shared counters for selected IP- and account-based limits |
| Development tools | npm, ESLint, Python, pip | Frontend dependency management, linting, and backend setup |

## Repository structure

```text
.
├── backend/
│   ├── main.py                     # FastAPI entrypoint and route mounting
│   ├── requirements.txt            # Python dependencies
│   ├── pyproject.toml              # Python project metadata
│   └── src/
│       ├── api/
│       │   ├── v1/                 # V1 API endpoints (auth, users, research, chat, credits)
│       │   │   ├── routes.py
│       │   │   └── Routes/
│       │   └── payment/            # Payment endpoints (Razorpay orders, verification)
│       │       ├── routes.py
│       │       └── Routes/
│       ├── config/                 # Pydantic application settings
│       ├── core/                   # Authentication (JWT/bcrypt) and rate limiting
│       ├── db/                     # PostgreSQL (SQLAlchemy) and Redis connections
│       ├── dependencies/           # Research pipeline, LLM agents, tools, user auth
│       ├── models/                 # SQLAlchemy ORM models (User, Credit, Payment, Subscription, CreditTransaction, ReportAnalysis)
│       ├── payment/                # Razorpay client and utility helpers
│       └── schema/                 # Pydantic request/response schemas
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api.js                  # Frontend API integration
│       ├── Components/             # Shared UI (Navbar, Sidebar, ReportView, ChatBot, FormatForm, FloatingAlert)
│       └── Pages/                  # Application views (HomePage, ResultPage, ReportHistory, Payment, About, Auth)
├── screenshots/                    # Instructions for adding real captures
├── PROJECT_REPORT.md
└── PUBLIC_PROJECT_DOCUMENTATION.md
```

## Getting started

### Prerequisites

- Python 3.11 or newer.
- Node.js and npm compatible with the versions required by the frontend lockfile.
- API credentials for the external services used by the flows you want to run (Google Gemini, Firecrawl, Upstash Redis, Razorpay).

### 1. Clone the repository

```powershell
git clone https://github.com/Ultriti-Tech/reserach0banf.git
Set-Location reserach0banf
```

### 2. Configure and start the backend

From the repository root in PowerShell:

```powershell
py -3.11 -m venv backend\.venv
.\backend\.venv\Scripts\Activate.ps1
Set-Location backend
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at `http://127.0.0.1:8000` by default. Keep this terminal open.

### 3. Configure and start the frontend

Open a second terminal at the repository root:

```powershell
Set-Location frontend
npm ci
```

Create `frontend\.env` (or `frontend\.env.local`) with:

```dotenv
VITE_BASE_URL=http://127.0.0.1:8000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Then start the development server:

```powershell
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`). The backend permits the local Vite origin by default.

## Environment configuration

Create a local `backend\.env` file and supply credentials for the integrations you use:

```dotenv
# Database and Security
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/ResearchAgentDb
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External AI and Research Providers
GOOGLE_API_KEY=your_google_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
GROQ_API_KEY=your_groq_api_key

# Redis Rate Limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Razorpay Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Optional frontend origins for deployments
FRONTEND_URL=
FRONTEND_URL_2=
```

Account registration/login requires a configured database and `JWT_SECRET_KEY`. Selected rate limits require Upstash Redis credentials. Razorpay orders and signature verification require `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

## Using the application

1. Start the backend and frontend using the setup steps.
2. Open the Vite development URL in a browser.
3. Register an account or sign in (new accounts receive 50 credits).
4. Enter a research topic, optionally customize the format instructions, and submit it.
5. Review the report, streamed progress updates, critique, and source links.
6. On mobile screens, use the segmented tab bar (`📄 Report` / `💬 AI Assistant`) to switch views conveniently.
7. Ask follow-up questions or switch to Edit Assistant to instruct changes to the draft.
8. Click on your credit balance in the navigation bar to review plans or purchase top-ups / subscriptions via Razorpay.

## API overview

### V1 Application Routes (`/api/v1`)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register an account, initialize its 50-credit balance, and return a JWT and account details. |
| `POST` | `/api/v1/auth/login` | Authenticate an account and return a JWT, account details, and current credit balance. |
| `POST` | `/api/v1/auth/logout` | Clear the auth cookie; clients must also remove any locally stored bearer token. |
| `GET` | `/api/v1/users/getUser` | Return the authenticated user's account details and credit balance; evaluates plan resets. |
| `DELETE` | `/api/v1/users/account` | Placeholder only; currently returns the authenticated user ID and does not delete the account. |
| `POST` | `/api/v1/research/` | Reserve 20 credits and start authenticated topic research; stream progress, result, or error using SSE. Failed runs refund the charge. Limited to 1 request per account per hour. |
| `GET` | `/api/v1/research/history` | Return the authenticated user's saved reports, including report content and critique, newest first. |
| `GET` | `/api/v1/research/history/{report_id}` | Return one saved report with its sources; only the owning user can access it. |
| `POST` | `/api/v1/chatagent/` | Ask an authenticated report-focused follow-up question (costs 1 credit); returns a JSON answer. |
| `POST` | `/api/v1/chatagent/editchat` | Request an authenticated report edit (costs 2 credits) and receive a proposed patch for review. |
| `POST` | `/api/v1/creditTransaction/credit` | Allocate purchased credits and record transaction history following payment verification. |

### Payment Routes (`/api/payment`)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/payment/create-order` | Create a Razorpay order for a selected plan (`topup`, `monthly`, `yearly`) and record a pending payment. |
| `POST` | `/api/payment/transaction/verify` | Authenticated HMAC-SHA256 signature verification and order ownership confirmation. |
| `POST` | `/api/payment/verify-payment` | Direct signature validation utility. |

Request schemas and implementation details are documented in [PROJECT_REPORT.md](./PROJECT_REPORT.md).

## Engineering notes

- **Human review is part of the workflow:** source links are available for inspection, and assistant-proposed changes are reviewable before use.
- **Progressive feedback:** the research request provides streamed progress/results rather than requiring users to wait without status.
- **Typed service boundary:** FastAPI and Pydantic (`pydantic-settings`) are used for HTTP routing, request validation, and environment configuration.
- **Persisted research & billing:** report content, critique, sources, payments, subscriptions, and credit ledger records are stored with the owning account; chat conversations are not persisted.
- **Credit balance:** account credit balances are tracked in PostgreSQL with separate timestamps for daily (`last_daily_reset_at`) and monthly (`last_monthly_reset_at`) allowances.
- **Authentication and limits:** authenticated routes resolve the user from a JWT supplied in a bearer header or cookie; selected routes use Redis-backed IP/account limits.

## Validation, limitations, and roadmap

### Validation status

Frontend build and lint checks and backend Python compilation were run during development of the application. No automated test suite, API test report, model evaluation, or benchmark results were verified for this repository. These checks do not establish production readiness or guarantee research accuracy.

### Current limitations

- Generated research and answers may be incomplete or incorrect; users must validate sources and claims.
- No persistent chat history, role-based access, or implemented account deletion.
- External integrations require valid configuration and network access.
- Payment flow currently combines client verification with credit fulfillment; production deployment requires automated webhook handlers (`order.paid`).
- The repository does not specify an open-source license.
- No genuine product screenshots or measured performance results are currently included.

### Potential next steps

- Add automated unit, API, and browser-level tests.
- Implement server-to-server Razorpay webhooks (`POST /api/payment/webhook`) with signature verification.
- Harden authentication and rate limiting, and add operational safeguards before public deployment.
- Add report/chat persistence only with a defined ownership, privacy, and retention policy.
- Add evaluation procedures for source quality and report reliability.
- Capture and maintain genuine screenshots and document supported deployment configurations.

## Documentation

- [Detailed technical project report](./PROJECT_REPORT.md)
- [Public project documentation](./PUBLIC_PROJECT_DOCUMENTATION.md)
- [Screenshot capture instructions](./screenshots/README.md)

## Contributing

The repository does not currently include a contribution guide or a formal contribution policy. For a proposed change, open an issue or pull request in the repository and describe the motivation, scope, and validation performed; maintainers can confirm whether it fits the project's direction.

## License

No `LICENSE` file or license declaration was found in the repository. All rights remain with their respective owners; do not assume permission to reuse, modify, or redistribute this project.

## Author

Repository organization: [Ultriti-Tech](https://github.com/Ultriti-Tech). No individual author profile or contact link was verified in the project metadata.
