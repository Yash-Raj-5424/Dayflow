from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import attendance, auth, employee, health, leaves, payroll
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(attendance.router, prefix=settings.API_V1_PREFIX)
app.include_router(leaves.router, prefix=settings.API_V1_PREFIX)
app.include_router(employee.router, prefix=settings.API_V1_PREFIX)
app.include_router(payroll.router, prefix=settings.API_V1_PREFIX)
