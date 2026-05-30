from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)


@router.get("/me", response_model=List[schemas.FavoriteOut])
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    favorites = (
        db.query(models.FavoriteAd)
        .options(
            joinedload(models.FavoriteAd.ad).joinedload(models.Ad.user).joinedload(models.User.location),
            joinedload(models.FavoriteAd.ad).joinedload(models.Ad.category),
            joinedload(models.FavoriteAd.ad).joinedload(models.Ad.location)
        )
        .filter(models.FavoriteAd.user_id == current_user.id)
        .order_by(models.FavoriteAd.created_at.desc())
        .all()
    )

    return favorites


@router.get("/user/{user_id}", response_model=List[schemas.FavoriteOut])
def get_user_favorites(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можеш да виждаш само своите любими обяви."
        )

    favorites = (
        db.query(models.FavoriteAd)
        .options(
            joinedload(models.FavoriteAd.ad).joinedload(models.Ad.user).joinedload(models.User.location),
            joinedload(models.FavoriteAd.ad).joinedload(models.Ad.category),
            joinedload(models.FavoriteAd.ad).joinedload(models.Ad.location)
        )
        .filter(models.FavoriteAd.user_id == user_id)
        .order_by(models.FavoriteAd.created_at.desc())
        .all()
    )

    return favorites


@router.post("/", response_model=schemas.FavoriteOut, status_code=status.HTTP_201_CREATED)
def add_favorite(
    favorite_data: schemas.FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ad = (
        db.query(models.Ad)
        .filter(models.Ad.id == favorite_data.ad_id)
        .first()
    )

    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обявата не е намерена."
        )

    existing = (
        db.query(models.FavoriteAd)
        .filter(models.FavoriteAd.user_id == current_user.id)
        .filter(models.FavoriteAd.ad_id == favorite_data.ad_id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Тази обява вече е добавена в любими."
        )

    favorite = models.FavoriteAd(
        user_id=current_user.id,
        ad_id=favorite_data.ad_id
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return favorite


@router.delete("/{favorite_id}")
def remove_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    favorite = (
        db.query(models.FavoriteAd)
        .filter(models.FavoriteAd.id == favorite_id)
        .first()
    )

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Любимата обява не е намерена."
        )

    if favorite.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можеш да премахваш само свои любими обяви."
        )

    db.delete(favorite)
    db.commit()

    return {
        "message": "Обявата е премахната от любими."
    }


@router.delete("/ad/{ad_id}")
def remove_favorite_by_ad(
    ad_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    favorite = (
        db.query(models.FavoriteAd)
        .filter(models.FavoriteAd.user_id == current_user.id)
        .filter(models.FavoriteAd.ad_id == ad_id)
        .first()
    )

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Любимата обява не е намерена."
        )

    db.delete(favorite)
    db.commit()

    return {
        "message": "Обявата е премахната от любими."
    }