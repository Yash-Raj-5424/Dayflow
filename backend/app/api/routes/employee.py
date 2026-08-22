import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models.employee import EmployeeProfile
from app.models.user import User
from app.schemas.employee import (
    EmployeeAdminUpdate,
    EmployeeListItem,
    EmployeeProfileOut,
    EmployeeSelfUpdate,
)

router = APIRouter(prefix="/employees", tags=["employees"])


def _get_or_create_profile(db: Session, user: User) -> EmployeeProfile:
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == user.id).first()
    if profile is None:
        profile = EmployeeProfile(user_id=user.id, first_name="", last_name="")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def _get_profile_or_404(db: Session, user_id: uuid.UUID) -> EmployeeProfile:
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == user_id).first()
    if profile is None:
        target_user = db.get(User, user_id)
        if target_user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        profile = EmployeeProfile(user_id=target_user.id, first_name="", last_name="")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/me", response_model=EmployeeProfileOut)
def read_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EmployeeProfile:
    return _get_or_create_profile(db, current_user)


@router.put("/me", response_model=EmployeeProfileOut)
def update_my_profile(
    payload: EmployeeSelfUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EmployeeProfile:
    profile = _get_or_create_profile(db, current_user)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("", response_model=list[EmployeeListItem])
def list_employees(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[EmployeeProfile]:
    users_without_profile = (
        db.query(User)
        .outerjoin(EmployeeProfile, EmployeeProfile.user_id == User.id)
        .filter(EmployeeProfile.id.is_(None))
        .all()
    )
    for user in users_without_profile:
        db.add(EmployeeProfile(user_id=user.id, first_name="", last_name=""))
    if users_without_profile:
        db.commit()

    return db.query(EmployeeProfile).all()


@router.get("/{employee_id}", response_model=EmployeeProfileOut)
def get_employee(
    employee_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> EmployeeProfile:
    return _get_profile_or_404(db, employee_id)


@router.put("/{employee_id}", response_model=EmployeeProfileOut)
def update_employee(
    employee_id: uuid.UUID,
    payload: EmployeeAdminUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> EmployeeProfile:
    profile = _get_profile_or_404(db, employee_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    target_user = db.get(User, employee_id)
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == employee_id).first()
    if profile is not None:
        db.delete(profile)
    db.delete(target_user)
    db.commit()