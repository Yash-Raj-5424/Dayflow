# Dayflow Backend

FastAPI backend for Dayflow.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

- Docs: http://localhost:8000/api/v1/docs
- Health: http://localhost:8000/api/v1/health
