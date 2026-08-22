import uuid
from datetime import date, datetime, timezone

import pytest
from fastapi import HTTPException

from app.api.routes.attendance import (
    check_in,
    check_out,
    read_my_attendance,
)
from app.core.dependencies import require_admin
from app.models.attendance import Attendance, AttendanceStatus
from app.models.user import User, UserRole


class FakeQuery:
    def __init__(self, records):
        self.records = records

    def filter(self, *criteria):
        records = self.records
        for criterion in criteria:
            if hasattr(criterion, "clauses"):
                clauses = criterion.clauses
                records = [
                    record
                    for record in records
                    if all(_matches(record, clause) for clause in clauses)
                ]
            else:
                records = [record for record in records if _matches(record, criterion)]
        return FakeQuery(records)

    def first(self):
        return self.records[0] if self.records else None

    def all(self):
        return self.records

    def order_by(self, *_):
        return self


def _matches(record, criterion):
    field = getattr(criterion.left, "key", None)
    value = getattr(criterion.right, "value", None)
    if criterion.operator.__name__ == "between_op":
        lower, upper = criterion.right.value
        return lower <= getattr(record, field) <= upper
    operator_name = criterion.operator.__name__
    if operator_name == "eq":
        return getattr(record, field) == value
    return True


class FakeDB:
    def __init__(self, records=None):
        self.records = records or []

    def query(self, model):
        return FakeQuery(self.records)

    def add(self, record):
        self.records.append(record)

    def commit(self):
        return None

    def refresh(self, record):
        if record.id is None:
            record.id = uuid.uuid4()

    def get(self, model, record_id):
        return next((record for record in self.records if record.id == record_id), None)


def _user(role=UserRole.EMPLOYEE):
    return User(
        id=uuid.uuid4(),
        employee_id="EMP-001",
        email="employee@example.com",
        password_hash="hash",
        role=role,
    )


def test_employee_can_check_in_once():
    employee = _user()
    db = FakeDB()

    attendance = check_in(employee, db)

    assert attendance.employee_id == employee.id
    assert attendance.status is AttendanceStatus.PRESENT
    assert attendance.check_in is not None
    with pytest.raises(HTTPException) as error:
        check_in(employee, db)
    assert error.value.status_code == 409


def test_employee_must_check_in_before_checking_out():
    employee = _user()
    db = FakeDB()

    with pytest.raises(HTTPException) as error:
        check_out(employee, db)

    assert error.value.status_code == 404


def test_employee_can_check_out_only_once():
    employee = _user()
    db = FakeDB()
    check_in(employee, db)

    attendance = check_out(employee, db)
    assert attendance.check_out is not None
    with pytest.raises(HTTPException) as error:
        check_out(employee, db)
    assert error.value.status_code == 409


def test_employee_sees_only_own_attendance():
    employee = _user()
    other_employee = _user()
    db = FakeDB(
        [
            Attendance(
                employee_id=employee.id,
                date=date.today(),
                check_in=datetime.now(timezone.utc),
                status=AttendanceStatus.PRESENT,
            ),
            Attendance(
                employee_id=other_employee.id,
                date=date.today(),
                check_in=datetime.now(timezone.utc),
                status=AttendanceStatus.PRESENT,
            ),
        ]
    )

    records = read_my_attendance(employee, db)

    assert len(records) == 1
    assert records[0].employee_id == employee.id


def test_employee_cannot_use_admin_dependency():
    with pytest.raises(HTTPException) as error:
        require_admin(_user())

    assert error.value.status_code == 403