from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func

from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)


@router.get("/me", response_model=List[schemas.MessageOut])
def get_my_messages(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    messages = (
        db.query(models.Message)
        .options(
            joinedload(models.Message.sender).joinedload(models.User.location),
            joinedload(models.Message.receiver).joinedload(models.User.location)
        )
        .filter(
            or_(
                models.Message.sender_id == current_user.id,
                models.Message.receiver_id == current_user.id
            )
        )
        .order_by(models.Message.created_at.desc())
        .all()
    )

    return messages


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    unread_count = (
        db.query(func.count(models.Message.id))
        .filter(models.Message.receiver_id == current_user.id)
        .filter(models.Message.is_read == False)
        .scalar()
    )

    return {
        "unread_count": unread_count
    }


@router.get("/user/{user_id}", response_model=List[schemas.MessageOut])
def get_user_messages(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можеш да виждаш само своите съобщения."
        )

    messages = (
        db.query(models.Message)
        .options(
            joinedload(models.Message.sender).joinedload(models.User.location),
            joinedload(models.Message.receiver).joinedload(models.User.location)
        )
        .filter(
            or_(
                models.Message.sender_id == user_id,
                models.Message.receiver_id == user_id
            )
        )
        .order_by(models.Message.created_at.desc())
        .all()
    )

    return messages


@router.get("/conversation/{user_two_id}", response_model=List[schemas.MessageOut])
def get_my_conversation(
    user_two_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    messages = (
        db.query(models.Message)
        .options(
            joinedload(models.Message.sender).joinedload(models.User.location),
            joinedload(models.Message.receiver).joinedload(models.User.location)
        )
        .filter(
            or_(
                and_(
                    models.Message.sender_id == current_user.id,
                    models.Message.receiver_id == user_two_id
                ),
                and_(
                    models.Message.sender_id == user_two_id,
                    models.Message.receiver_id == current_user.id
                )
            )
        )
        .order_by(models.Message.created_at.asc())
        .all()
    )

    return messages


@router.post("/", response_model=schemas.MessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    message_data: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    receiver = (
        db.query(models.User)
        .filter(models.User.id == message_data.receiver_id)
        .first()
    )

    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Получателят не е намерен."
        )

    if receiver.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не можеш да изпратиш съобщение до себе си."
        )

    if message_data.ad_id:
        ad = (
            db.query(models.Ad)
            .filter(models.Ad.id == message_data.ad_id)
            .first()
        )

        if not ad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Обявата не е намерена."
            )

    blocked = (
        db.query(models.Blacklist)
        .filter(models.Blacklist.blocker_user_id == message_data.receiver_id)
        .filter(models.Blacklist.blocked_user_id == current_user.id)
        .first()
    )

    if blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Не можеш да изпратиш съобщение до този потребител."
        )

    message = models.Message(
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        ad_id=message_data.ad_id,
        message_text=message_data.message_text
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


@router.put("/conversation/{user_two_id}/read")
def mark_conversation_as_read(
    user_two_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    unread_messages = (
        db.query(models.Message)
        .filter(models.Message.sender_id == user_two_id)
        .filter(models.Message.receiver_id == current_user.id)
        .filter(models.Message.is_read == False)
        .all()
    )

    for message in unread_messages:
        message.is_read = True

    db.commit()

    return {
        "message": "Разговорът е маркиран като прочетен."
    }


@router.put("/{message_id}/read")
def mark_message_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    message = (
        db.query(models.Message)
        .filter(models.Message.id == message_id)
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Съобщението не е намерено."
        )

    if message.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можеш да маркираш като прочетени само свои получени съобщения."
        )

    message.is_read = True

    db.commit()

    return {
        "message": "Съобщението е маркирано като прочетено."
    }