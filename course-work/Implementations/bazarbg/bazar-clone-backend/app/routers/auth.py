from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models, schemas
from app.security import (
    hash_password,
    authenticate_user,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: schemas.UserRegister,
    db: Session = Depends(get_db)
):
    existing_email = (
        db.query(models.User)
        .filter(models.User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вече има потребител с този имейл."
        )

    existing_username = (
        db.query(models.User)
        .filter(models.User.username == user_data.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вече има потребител с това потребителско име."
        )

    user = models.User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone=user_data.phone,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        location_id=user_data.location_id,
        is_verified=False,
        is_premium=False,
        status="active"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=schemas.Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        db=db,
        username_or_email=form_data.username,
        password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Грешно потребителско име/имейл или парола.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    user_with_location = (
        db.query(models.User)
        .options(joinedload(models.User.location))
        .filter(models.User.id == user.id)
        .first()
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_with_location
    }


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user