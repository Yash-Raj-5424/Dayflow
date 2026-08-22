import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserOut


class EmployeeSelfUpdate(BaseModel):
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=255)
    profile_picture: str | None = Field(default=None, max_length=500)


class EmployeeAdminUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=255)
    profile_picture: str | None = Field(default=None, max_length=500)
    job_title: str | None = Field(default=None, max_length=100)
    department: str | None = Field(default=None, max_length=100)
    joining_date: date | None = None
    documents: list[str] | None = None


class EmployeeProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    first_name: str
    last_name: str
    phone: str | None
    address: str | None
    profile_picture: str | None
    job_title: str | None
    department: str | None
    joining_date: date | None
    documents: list[str]
    created_at: datetime
    updated_at: datetime
    user: UserOut


class EmployeeListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    first_name: str
    last_name: str
    job_title: str | None
    department: str | None
    user: UserOut