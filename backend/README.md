# Dayflow Backend

FastAPI backend for Dayflow.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # adjust DATABASE_URL / JWT_SECRET_KEY as needed
```

Create the database (PostgreSQL must be running):

```bash
createdb dayflow
```

Apply migrations:

```bash
alembic upgrade head
```

## Run

```bash
python run.py
# or
uvicorn app.main:app --reload
```

- Docs: http://localhost:8000/api/v1/docs
- Health: http://localhost:8000/api/v1/health

## Auth

- `POST /api/v1/auth/register` — register with employee ID, email, password, role
- `POST /api/v1/auth/verify-email` — verify using the token issued at registration (logged to console in dev; would be emailed in production)
- `POST /api/v1/auth/login` — returns a JWT access token (requires verified email)
- `GET /api/v1/auth/me` — current user, requires `Authorization: Bearer <token>`

## Migrations

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```
