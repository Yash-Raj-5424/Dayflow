import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.leave import LeaveStatus, LeaveType


class LeaveCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    remarks: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.start_date > self.end_date:
            raise ValueError("start_date must be on or before end_date")
        return self


class LeaveDecision(BaseModel):
    admin_comment: str | None = Field(default=None, max_length=1000)


class LeaveOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    leave_type: LeaveType
    start_date: date
    end_date: date
    remarks: str | None
    status: LeaveStatus
    admin_comment: str | None
    created_at: datetime