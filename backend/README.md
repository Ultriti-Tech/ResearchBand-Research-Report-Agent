# ResearchMind Backend Service

FastAPI service coordinating web research, LLM draft synthesis, report critique, and Razorpay billing.

## Local Development

Activate your virtual environment and run the server with Uvicorn:

```powershell
Set-Location backend
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

The service runs at `http://127.0.0.1:8000` by default.

## Deployment (Render / Docker)

Set the service root directory to `backend`, the build command to `pip install -r requirements.txt`, and the start command to:

```sh
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Do not use `--reload` for production services. The `/` endpoint supports both `GET` and `HEAD` health probes.

## Environment Variables

Configure the following environment variables in `.env`:

```dotenv
# Database & Auth
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/ResearchAgentDb
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Research and AI
GOOGLE_API_KEY=your_gemini_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
GROQ_API_KEY=your_groq_api_key

# Redis Rate Limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Razorpay Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Deployment Origins (optional)
FRONTEND_URL=
FRONTEND_URL_2=
```

## Database Models

The SQLAlchemy ORM manages the following entities:
- **`users`**: Account credentials, active status, purchased plan (`FREE`, `MONTHLY`, `YEARLY`).
- **`credits`**: Balance, reserved credits, and independent reset timestamps (`last_daily_reset_at`, `last_monthly_reset_at`).
- **`payments`**: Payment transaction status (`pending`, `paid`, `failed`), amount, plan, and Razorpay order/payment IDs.
- **`subscriptions`**: Plan tier, start date, expiration date, and status.
- **`credit_transactions`**: Append-only ledger recording amount, transaction type (`purchase`, `subscription`, `usage`, `refund`), balance after, and idempotency key.
- **`report_analysis`**: Saved research reports, critiques, sources, and timestamps.

## Credit Rules & API Routes

- **New Accounts**: Receive 50 credits on registration.
- **Research**: `POST /api/v1/research/` reserves 20 credits, streams pipeline progress via SSE, and refunds the charge on failure.
- **Report Chat & Edits**: `POST /api/v1/chatagent/` costs 1 credit; `POST /api/v1/chatagent/editchat` costs 2 credits.
- **Payment & Credits**:
  - `POST /api/payment/create-order`: Generates a Razorpay order.
  - `POST /api/payment/transaction/verify`: Validates HMAC signature and marks payment as paid.
  - `POST /api/v1/creditTransaction/credit`: Idempotently updates wallet balance and creates a transaction record.
