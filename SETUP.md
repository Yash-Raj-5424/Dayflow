# Dayflow — Setup Guide

Steps to get the backend running on a fresh machine. (Frontend isn't built yet — this covers backend only.)

## Prerequisites

- Python 3.11+
- PostgreSQL (running locally, or reachable via a connection string)
- Git

## 1. Clone and enter the backend

```bash
git clone <repo-url>
cd Dayflow/backend
```

## 2. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Create the database

```bash
createdb dayflow
```

If `createdb` isn't available or you use a different Postgres user/role, create it manually instead:

```sql
CREATE DATABASE dayflow OWNER <your_postgres_user>;
```

## 4. Configure environment variables

```bash
cp .env.example .env
```

Then edit `backend/.env`:

- `DATABASE_URL` — update the username (and password/host/port if needed) to match your local Postgres setup, e.g. `postgresql+psycopg2://<user>:<password>@localhost:5432/dayflow`
- `JWT_SECRET_KEY` — replace the placeholder with a real random value:

  ```bash
  python3 -c "import secrets; print(secrets.token_urlsafe(48))"
  ```

`.env` is gitignored — every machine/environment needs its own copy. It is never committed.

## 5. Run database migrations

```bash
alembic upgrade head
```

## 6. Start the server

```bash
python run.py
# or: uvicorn app.main:app --reload
```

- API base: http://localhost:8000/api/v1
- Interactive docs: http://localhost:8000/api/v1/docs
- Health check: http://localhost:8000/api/v1/health

## Verifying it works

1. `POST /api/v1/auth/register` with an employee_id, email, password, role
2. Copy the verification token printed in the server console/log
3. `POST /api/v1/auth/verify-email` with that token
4. `POST /api/v1/auth/login` to get an access token
5. In Swagger UI, click **Authorize** and paste the raw access token (no `Bearer ` prefix — Swagger adds it), then call `GET /api/v1/auth/me`

## Adding new migrations

After changing a model:

```bash
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```
