import uuid
from datetime import date
from decimal import Decimal
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.api.routes.payroll import (
    list_payroll,
    read_employee_payroll,
    read_my_payroll,
    update_employee_payroll,
)
from app.models.payroll import Payroll
from app.models.user import User
from app.schemas.payroll import PayrollUpdate


def _user() -> User:
    return User(
        id=uuid.uuid4(),
        employee_id="EMP-003",
        email="payroll@example.com",
        password_hash="hash",
    )


def _payroll(employee_id: uuid.UUID) -> Payroll:
    return Payroll(
        id=uuid.uuid4(),
        employee_id=employee_id,
        basic_salary=Decimal("50000"),
        allowances=Decimal("5000"),
        deductions=Decimal("2000"),
        net_salary=Decimal("53000"),
        effective_date=date(2026, 1, 1),
    )


def test_employee_sees_own_payroll():
    employee = _user()
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = _payroll(employee.id)

    payroll = read_my_payroll(employee, db)

    assert payroll.employee_id == employee.id


def test_employee_without_payroll_gets_404():
    employee = _user()
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as error:
        read_my_payroll(employee, db)

    assert error.value.status_code == 404


def test_admin_can_list_all_payroll():
    admin = _user()
    db = MagicMock()
    records = [_payroll(uuid.uuid4()), _payroll(uuid.uuid4())]
    db.query.return_value.all.return_value = records

    result = list_payroll(db, admin)

    assert result == records


def test_admin_creates_payroll_when_none_exists():
    admin = _user()
    target_employee_id = uuid.uuid4()
    db = MagicMock()
    db.get.return_value = _user()
    db.query.return_value.filter.return_value.first.return_value = None

    payload = PayrollUpdate(
        basic_salary=Decimal("60000"),
        allowances=Decimal("4000"),
        deductions=Decimal("1000"),
        effective_date=date(2026, 2, 1),
    )

    payroll = update_employee_payroll(target_employee_id, payload, db, admin)

    assert payroll.employee_id == target_employee_id
    assert payroll.net_salary == Decimal("63000")
    db.add.assert_called_once()
    db.commit.assert_called_once()


def test_admin_updates_existing_payroll():
    admin = _user()
    target_employee_id = uuid.uuid4()
    existing = _payroll(target_employee_id)
    db = MagicMock()
    db.get.return_value = _user()
    db.query.return_value.filter.return_value.first.return_value = existing

    payload = PayrollUpdate(
        basic_salary=Decimal("70000"),
        allowances=Decimal("0"),
        deductions=Decimal("0"),
        effective_date=date(2026, 3, 1),
    )

    payroll = update_employee_payroll(target_employee_id, payload, db, admin)

    assert payroll is existing
    assert payroll.basic_salary == Decimal("70000")
    assert payroll.net_salary == Decimal("70000")
    db.add.assert_not_called()


def test_updating_payroll_for_unknown_employee_returns_404():
    admin = _user()
    db = MagicMock()
    db.get.return_value = None

    payload = PayrollUpdate(basic_salary=Decimal("50000"), effective_date=date(2026, 1, 1))

    with pytest.raises(HTTPException) as error:
        update_employee_payroll(uuid.uuid4(), payload, db, admin)

    assert error.value.status_code == 404


def test_reading_unknown_employee_payroll_returns_404():
    admin = _user()
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as error:
        read_employee_payroll(uuid.uuid4(), db, admin)

    assert error.value.status_code == 404


def test_deductions_cannot_exceed_earnings():
    with pytest.raises(ValidationError):
        PayrollUpdate(
            basic_salary=Decimal("1000"),
            allowances=Decimal("0"),
            deductions=Decimal("5000"),
            effective_date=date(2026, 1, 1),
        )
