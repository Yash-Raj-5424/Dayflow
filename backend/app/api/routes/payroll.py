import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models.payroll import Payroll
from app.models.user import User
from app.schemas.payroll import PayrollOut, PayrollUpdate

router = APIRouter(prefix="/payroll", tags=["payroll"])


def _get_payroll_or_404(db: Session, employee_id: uuid.UUID) -> Payroll:
    payroll = db.query(Payroll).filter(Payroll.employee_id == employee_id).first()
    if payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll has not been configured for this employee",
        )
    return payroll


@router.get("/me", response_model=PayrollOut)
def read_my_payroll(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Payroll:
    return _get_payroll_or_404(db, current_user.id)


@router.get("", response_model=list[PayrollOut])
def list_payroll(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[Payroll]:
    return db.query(Payroll).all()


@router.get("/{employee_id}", response_model=PayrollOut)
def read_employee_payroll(
    employee_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Payroll:
    return _get_payroll_or_404(db, employee_id)


@router.put("/{employee_id}", response_model=PayrollOut)
def update_employee_payroll(
    employee_id: uuid.UUID,
    payload: PayrollUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Payroll:
    if db.get(User, employee_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    payroll = db.query(Payroll).filter(Payroll.employee_id == employee_id).first()
    net_salary = payload.basic_salary + payload.allowances - payload.deductions

    if payroll is None:
        payroll = Payroll(
            employee_id=employee_id,
            basic_salary=payload.basic_salary,
            allowances=payload.allowances,
            deductions=payload.deductions,
            net_salary=net_salary,
            effective_date=payload.effective_date,
        )
        db.add(payroll)
    else:
        payroll.basic_salary = payload.basic_salary
        payroll.allowances = payload.allowances
        payroll.deductions = payload.deductions
        payroll.net_salary = net_salary
        payroll.effective_date = payload.effective_date

    db.commit()
    db.refresh(payroll)
    return payroll
