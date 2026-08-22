import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.attendance import AttendanceStatus


class AttendanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    date: date
    check_in: datetime | None
    check_out: datetime | None
    status: AttendanceStatus