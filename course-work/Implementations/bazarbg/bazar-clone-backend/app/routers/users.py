from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models, schemas
from app.security import get_current_user, hash_password, verify_password

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


def load_user_with_location(db: Session, user_id: int):
    return (
        db.query(models.User)
        .options(joinedload(models.User.location))
        .filter(models.User.id == user_id)
        .first()
    )


@router.get("/", response_model=List[schemas.UserOut])
def get_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    users = (
        db.query(models.User)
        .options(joinedload(models.User.location))
        .order_by(models.User.id.desc())
        .all()
    )

    return users


@router.put("/me/profile", response_model=schemas.UserOut)
def update_my_profile(
    profile_data: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing_username = (
        db.query(models.User)
        .filter(models.User.username == profile_data.username)
        .filter(models.User.id != current_user.id)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вече има потребител с това потребителско име."
        )

    if profile_data.location_id:
        location = (
            db.query(models.Location)
            .filter(models.Location.id == profile_data.location_id)
            .first()
        )

        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Локацията не е намерена."
            )

    current_user.username = profile_data.username
    current_user.first_name = profile_data.first_name
    current_user.last_name = profile_data.last_name
    current_user.phone = profile_data.phone
    current_user.location_id = profile_data.location_id

    db.commit()

    return load_user_with_location(db, current_user.id)


@router.put("/me/email", response_model=schemas.UserOut)
def update_my_email(
    email_data: schemas.UserEmailUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(email_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Текущата парола не е правилна."
        )

    existing_email = (
        db.query(models.User)
        .filter(models.User.email == email_data.email)
        .filter(models.User.id != current_user.id)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вече има потребител с този имейл."
        )

    current_user.email = email_data.email

    db.commit()

    return load_user_with_location(db, current_user.id)


@router.put("/me/password")
def update_my_password(
    password_data: schemas.UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Текущата парола не е правилна."
        )

    current_user.password_hash = hash_password(password_data.new_password)

    db.commit()

    return {
        "message": "Паролата е сменена успешно."
    }


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(models.User)
        .options(joinedload(models.User.location))
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Потребителят не е намерен."
        )

    return user
