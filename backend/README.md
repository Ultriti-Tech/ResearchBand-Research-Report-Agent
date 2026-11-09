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
migration or table-creation command, so provision the user table separately.
