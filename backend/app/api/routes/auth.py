from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_email_verification_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    EmailVerificationRequest,
    Token,
    UserLogin,
    UserOut,
    UserRegister,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)) -> User:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    if db.query(User).filter(User.employee_id == payload.employee_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Employee ID already in use")

    user = User(
        employee_id=payload.employee_id,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # In production this token would be emailed to the user rather than returned.
    verification_token = create_email_verification_token(str(user.id))
    print(f"[email-verification] token for {user.email}: {verification_token}")

    return user


@router.post("/verify-email", response_model=UserOut)
def verify_email(payload: EmailVerificationRequest, db: Session = Depends(get_db)) -> User:
    token_payload = decode_token(payload.token)
    if token_payload is None or token_payload.get("type") != "email_verification":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user = db.get(User, token_payload.get("sub"))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified",
        )

    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    return Token(access_token=access_token, role=user.role)


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
