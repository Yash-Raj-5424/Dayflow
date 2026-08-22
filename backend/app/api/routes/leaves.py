import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models.attendance import Attendance, AttendanceStatus
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.user import User, UserRole
from app.schemas.leave import LeaveCreate, LeaveDecision, LeaveOut

router = APIRouter(prefix="/leaves", tags=["leaves"])


@router.post("", response_model=LeaveOut, status_code=status.HTTP_201_CREATED)
def create_leave_request(
    payload: LeaveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LeaveRequest:
    overlapping_request = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == current_user.id,
            LeaveRequest.status.in_([LeaveStatus.PENDING, LeaveStatus.APPROVED]),
            LeaveRequest.start_date <= payload.end_date,
            LeaveRequest.end_date >= payload.start_date,
        )
        .first()
    )
    if overlapping_request is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Leave request overlaps an existing pending or approved request",
        )

    leave_request = LeaveRequest(
        employee_id=current_user.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        remarks=payload.remarks,
        status=LeaveStatus.PENDING,
    )
    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)
    return leave_request


@router.get("/me", response_model=list[LeaveOut])
def read_my_leave_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[LeaveRequest]:
    return (
        db.query(LeaveRequest)
        .filter(LeaveRequest.employee_id == current_user.id)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )


@router.get("", response_model=list[LeaveOut])
def read_all_leave_requests(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[LeaveRequest]:
    return db.query(LeaveRequest).order_by(LeaveRequest.created_at.desc()).all()


@router.get("/{leave_id}", response_model=LeaveOut)
def read_leave_request(
    leave_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LeaveRequest:
    query = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id)
    if current_user.role != UserRole.ADMIN:
        query = query.filter(LeaveRequest.employee_id == current_user.id)
    leave_request = query.first()
    if leave_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    return leave_request


def _decide_leave_request(
    leave_id: uuid.UUID,
    decision: LeaveDecision,
    leave_status: LeaveStatus,
    db: Session,
) -> LeaveRequest:
    leave_request = db.get(LeaveRequest, leave_id)
    if leave_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    if leave_request.status is not LeaveStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Leave request has already been decided",
        )

    if leave_status is LeaveStatus.APPROVED:
        attendance_records = []
        attendance_date = leave_request.start_date
        while attendance_date <= leave_request.end_date:
            attendance = (
                db.query(Attendance)
                .filter(
                    Attendance.employee_id == leave_request.employee_id,
                    Attendance.date == attendance_date,
                )
                .first()
            )
            if attendance is not None and (
                attendance.check_in is not None or attendance.check_out is not None
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Leave cannot be approved for a day with recorded work hours",
                )
            attendance_records.append((attendance_date, attendance))
            attendance_date += timedelta(days=1)

        for attendance_date, attendance in attendance_records:
            if attendance is None:
                db.add(
                    Attendance(
                        employee_id=leave_request.employee_id,
                        date=attendance_date,
                        status=AttendanceStatus.LEAVE,
                    )
                )
            else:
                attendance.status = AttendanceStatus.LEAVE

    leave_request.status = leave_status
    leave_request.admin_comment = decision.admin_comment
    db.commit()
    db.refresh(leave_request)
    return leave_request


@router.put("/{leave_id}/approve", response_model=LeaveOut)
def approve_leave_request(
    leave_id: uuid.UUID,
    decision: LeaveDecision,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> LeaveRequest:
    return _decide_leave_request(leave_id, decision, LeaveStatus.APPROVED, db)


@router.put("/{leave_id}/reject", response_model=LeaveOut)
def reject_leave_request(
    leave_id: uuid.UUID,
    decision: LeaveDecision,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> LeaveRequest:
    return _decide_leave_request(leave_id, decision, LeaveStatus.REJECTED, db)