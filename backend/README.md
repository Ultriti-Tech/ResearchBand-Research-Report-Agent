(Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; (& "e:\python\Generative AI\.venv\Scripts\Activate.ps1")

uvicorn main:app --reload

## Render deployment

Set the service root directory to `backend`, the build command to
`pip install -r requirements.txt`, and the start command to:

```sh
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Do not use `--reload` for the deployed service. The `/` endpoint supports both
`GET` and `HEAD` health probes. Configure required provider credentials in
Render's environment settings.

Account registration and login also require `DATABASE_URL` and `JWT_SECRET_KEY`.
Selected IP- and account-based rate limits require the Redis environment values
expected by `Redis.from_env()`. The repository does not include a database
migration or table-creation command, so provision the user, credit, and
`report_analysis` tables separately.

New accounts receive 50 credits. The authenticated `POST /api/v1/research/`
route reserves 20 credits per run, keeps the charge after a successful run, and
refunds it if the research pipeline fails. The `GET /api/v1/users/getUser`
route returns the current account and credit balance; successful research SSE
result events include `credits_balance`. Successful runs are saved for the
authenticated user. `GET /api/v1/research/history` returns that user's saved
reports, report previews, critiques, statuses, and timestamps.
`GET /api/v1/research/history/{report_id}` returns an individual saved report,
including its sources, only when it belongs to the authenticated user.
