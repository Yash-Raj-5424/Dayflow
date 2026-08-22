import uuid
from datetime import date
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.api.routes.leaves import (
    _decide_leave_request,
    create_leave_request,
)
from app.models.attendance import AttendanceStatus
from app.models.leave import LeaveRequest, LeaveStatus, LeaveType
from app.models.user import User
from app.schemas.leave import LeaveCreate, LeaveDecision


def _employee() -> User:
    return User(
        id=uuid.uuid4(),
        employee_id="EMP-002",
        email="leave@example.com",
        password_hash="hash",
    )


def _leave_request(employee_id: uuid.UUID, leave_status=LeaveStatus.PENDING):
    return LeaveRequest(
        id=uuid.uuid4(),
        employee_id=employee_id,
        leave_type=LeaveType.PAID,
        start_date=date(2026, 8, 25),
        end_date=date(2026, 8, 26),
        status=leave_status,
    )


def test_employee_can_create_leave_request():
    employee = _employee()
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    leave_request = create_leave_request(
        LeaveCreate(
            leave_type=LeaveType.PAID,
            start_date=date(2026, 8, 25),
            end_date=date(2026, 8, 26),
            remarks="Personal leave",
        ),
        employee,
        db,
    )

    assert leave_request.employee_id == employee.id
    assert leave_request.status is LeaveStatus.PENDING
    db.commit.assert_called_once()


def test_overlapping_leave_request_is_rejected():
    employee = _employee()
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = _leave_request(employee.id)

    with pytest.raises(HTTPException) as error:
        create_leave_request(
            LeaveCreate(
                leave_type=LeaveType.SICK,
                start_date=date(2026, 8, 26),
                end_date=date(2026, 8, 27),
            ),
            employee,
            db,
        )

    assert error.value.status_code == 409
    db.commit.assert_not_called()


def test_approved_leave_creates_leave_attendance_records():
    employee = _employee()
    leave_request = _leave_request(employee.id)
    db = MagicMock()
    db.get.return_value = leave_request
    db.query.return_value.filter.return_value.first.return_value = None

    result = _decide_leave_request(
        leave_request.id,
        LeaveDecision(admin_comment="Approved"),
        LeaveStatus.APPROVED,
        db,
    )

    assert result.status is LeaveStatus.APPROVED
    assert result.admin_comment == "Approved"
    assert db.add.call_count == 2
    added_records = [call.args[0] for call in db.add.call_args_list]
    assert all(record.status is AttendanceStatus.LEAVE for record in added_records)


def test_decision_cannot_be_repeated():
    employee = _employee()
    leave_request = _leave_request(employee.id, LeaveStatus.REJECTED)
    db = MagicMock()
    db.get.return_value = leave_request

    with pytest.raises(HTTPException) as error:
        _decide_leave_request(
            leave_request.id,
            LeaveDecision(),
            LeaveStatus.APPROVED,
            db,
        )

    assert error.value.status_code == 409
    db.commit.assert_not_called()