from datetime import datetime, timedelta, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models.attendance import Attendance, AttendanceStatus
from app.models.user import User
from app.schemas.attendance import AttendanceOut

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _today() -> datetime.date:
    return datetime.now(timezone.utc).date()


def _get_attendance_for_date(db: Session, employee_id: uuid.UUID, attendance_date):
    return (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == employee_id,
            Attendance.date == attendance_date,
        )
        .first()
    )


@router.post("/check-in", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def check_in(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Attendance:
    attendance_date = _today()
    if _get_attendance_for_date(db, current_user.id, attendance_date) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already recorded for today",
        )

    attendance = Attendance(
        employee_id=current_user.id,
        date=attendance_date,
        check_in=datetime.now(timezone.utc),
        status=AttendanceStatus.PRESENT,
    )
    db.add(attendance)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already recorded for today",
        ) from None
    db.refresh(attendance)
    return attendance


@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Attendance:
    attendance = _get_attendance_for_date(db, current_user.id, _today())
    if attendance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Check in before checking out",
        )
    if attendance.check_in is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Check in before checking out",
        )
    if attendance.check_out is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already checked out",
        )

    attendance.check_out = datetime.now(timezone.utc)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.get("/me", response_model=list[AttendanceOut])
def read_my_attendance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Attendance]:
    return (
        db.query(Attendance)
        .filter(Attendance.employee_id == current_user.id)
        .order_by(Attendance.date.desc())
        .all()
    )


@router.get("/me/weekly", response_model=list[AttendanceOut])
def read_my_weekly_attendance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Attendance]:
    end_date = _today()
    start_date = end_date - timedelta(days=6)
    return (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.id,
            Attendance.date.between(start_date, end_date),
        )
        .order_by(Attendance.date.asc())
        .all()
    )


@router.get("/all", response_model=list[AttendanceOut])
def read_all_attendance(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[Attendance]:
    return db.query(Attendance).order_by(Attendance.date.desc()).all()


@router.get("/{employee_id}", response_model=list[AttendanceOut])
def read_employee_attendance(
    employee_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[Attendance]:
    if db.get(User, employee_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee_id)
        .order_by(Attendance.date.desc())
        .all()
    )