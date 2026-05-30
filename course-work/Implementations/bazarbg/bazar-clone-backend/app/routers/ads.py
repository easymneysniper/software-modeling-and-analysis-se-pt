import os
import shutil
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(
    prefix="/ads",
    tags=["Ads"]
)

UPLOAD_DIR = "app/static/uploads/ads"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}


def get_category_with_children_ids(db: Session, category_id: int) -> List[int]:
    category_ids = [category_id]

    children = (
        db.query(models.Category)
        .filter(models.Category.parent_id == category_id)
        .all()
    )

    for child in children:
        category_ids.append(child.id)

    return category_ids


def ensure_upload_dir_exists():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def check_ad_owner(ad: models.Ad, current_user: models.User):
    if ad.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можеш да променяш само свои обяви."
        )


def save_uploaded_image(file: UploadFile) -> str:
    ensure_upload_dir_exists()

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Позволени са само JPG, PNG и WEBP снимки."
        )

    extension = os.path.splitext(file.filename or "")[1].lower()

    if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        extension = ".jpg"

    file_name = f"{uuid4().hex}{extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/static/uploads/ads/{file_name}"


@router.get("/me/list", response_model=List[schemas.AdListOut])
def get_my_ads(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ads = (
        db.query(models.Ad)
        .options(
            joinedload(models.Ad.user).joinedload(models.User.location),
            joinedload(models.Ad.category),
            joinedload(models.Ad.location),
            joinedload(models.Ad.images)
        )
        .filter(models.Ad.user_id == current_user.id)
        .order_by(models.Ad.created_at.desc())
        .all()
    )

    return ads


@router.get("/user/{user_id}/list", response_model=List[schemas.AdListOut])
def get_user_ads(user_id: int, db: Session = Depends(get_db)):
    ads = (
        db.query(models.Ad)
        .options(
            joinedload(models.Ad.user).joinedload(models.User.location),
            joinedload(models.Ad.category),
            joinedload(models.Ad.location),
            joinedload(models.Ad.images)
        )
        .filter(models.Ad.user_id == user_id)
        .order_by(models.Ad.created_at.desc())
        .all()
    )

    return ads


@router.get("/", response_model=List[schemas.AdListOut])
def get_ads(
    q: Optional[str] = Query(default=None),
    category_id: Optional[int] = Query(default=None),
    location_id: Optional[int] = Query(default=None),
    min_price: Optional[float] = Query(default=None),
    max_price: Optional[float] = Query(default=None),
    status_filter: str = Query(default="active"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = (
        db.query(models.Ad)
        .options(
            joinedload(models.Ad.user).joinedload(models.User.location),
            joinedload(models.Ad.category),
            joinedload(models.Ad.location),
            joinedload(models.Ad.images)
        )
    )

    if status_filter:
        query = query.filter(models.Ad.status == status_filter)

    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                models.Ad.title.like(search_pattern),
                models.Ad.description.like(search_pattern)
            )
        )

    if category_id:
        category_ids = get_category_with_children_ids(db, category_id)
        query = query.filter(models.Ad.category_id.in_(category_ids))

    if location_id:
        query = query.filter(models.Ad.location_id == location_id)

    if min_price is not None:
        query = query.filter(models.Ad.price >= min_price)

    if max_price is not None:
        query = query.filter(models.Ad.price <= max_price)

    ads = (
        query
        .order_by(models.Ad.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return ads


@router.get("/{ad_id}", response_model=schemas.AdDetailOut)
def get_ad(ad_id: int, db: Session = Depends(get_db)):
    ad = (
        db.query(models.Ad)
        .options(
            joinedload(models.Ad.user).joinedload(models.User.location),
            joinedload(models.Ad.category),
            joinedload(models.Ad.location),
            joinedload(models.Ad.images)
        )
        .filter(models.Ad.id == ad_id)
        .first()
    )

    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обявата не е намерена."
        )

    ad.views_count += 1
    db.commit()
    db.refresh(ad)

    return ad


@router.post("/", response_model=schemas.AdDetailOut, status_code=status.HTTP_201_CREATED)
def create_ad(
    ad_data: schemas.AdCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    category = (
        db.query(models.Category)
        .filter(models.Category.id == ad_data.category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категорията не е намерена."
        )

    if ad_data.location_id:
        location = (
            db.query(models.Location)
            .filter(models.Location.id == ad_data.location_id)
            .first()
        )

        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Локацията не е намерена."
            )

    ad = models.Ad(
        user_id=current_user.id,
        category_id=ad_data.category_id,
        location_id=ad_data.location_id,
        title=ad_data.title,
        description=ad_data.description,
        price=ad_data.price,
        currency=ad_data.currency,
        is_negotiable=ad_data.is_negotiable,
        item_condition=ad_data.item_condition,
        address_area=ad_data.address_area,
        phone_visible=ad_data.phone_visible,
        status=ad_data.status,
        published_at=datetime.now(),
        expires_at=datetime.now() + timedelta(days=30)
    )

    db.add(ad)
    db.commit()
    db.refresh(ad)

    return ad


@router.put("/{ad_id}", response_model=schemas.AdDetailOut)
def update_ad(
    ad_id: int,
    ad_data: schemas.AdUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ad = (
        db.query(models.Ad)
        .filter(models.Ad.id == ad_id)
        .first()
    )

    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обявата не е намерена."
        )

    check_ad_owner(ad, current_user)

    update_data = ad_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(ad, field, value)

    db.commit()
    db.refresh(ad)

    return ad


@router.delete("/{ad_id}")
def delete_ad(
    ad_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ad = (
        db.query(models.Ad)
        .filter(models.Ad.id == ad_id)
        .first()
    )

    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обявата не е намерена."
        )

    check_ad_owner(ad, current_user)

    ad.status = "deleted"

    db.commit()

    return {
        "message": "Обявата е маркирана като изтрита."
    }


@router.get("/{ad_id}/images", response_model=List[schemas.AdImageOut])
def get_ad_images(ad_id: int, db: Session = Depends(get_db)):
    images = (
        db.query(models.AdImage)
        .filter(models.AdImage.ad_id == ad_id)
        .order_by(models.AdImage.sort_order.asc(), models.AdImage.id.asc())
        .all()
    )

    return images


@router.post("/{ad_id}/images", response_model=List[schemas.AdImageOut])
def upload_ad_images(
    ad_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ad = (
        db.query(models.Ad)
        .filter(models.Ad.id == ad_id)
        .first()
    )

    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обявата не е намерена."
        )

    check_ad_owner(ad, current_user)

    existing_images_count = (
        db.query(models.AdImage)
        .filter(models.AdImage.ad_id == ad_id)
        .count()
    )

    if existing_images_count + len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Можеш да качиш максимум 10 снимки към една обява."
        )

    created_images = []

    for index, file in enumerate(files):
        image_url = save_uploaded_image(file)

        image = models.AdImage(
            ad_id=ad_id,
            image_url=image_url,
            sort_order=existing_images_count + index,
            is_main=(existing_images_count == 0 and index == 0)
        )

        db.add(image)
        created_images.append(image)

    db.commit()

    for image in created_images:
        db.refresh(image)

    return created_images


@router.delete("/{ad_id}/images/{image_id}")
def delete_ad_image(
    ad_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ad = (
        db.query(models.Ad)
        .filter(models.Ad.id == ad_id)
        .first()
    )

    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обявата не е намерена."
        )

    check_ad_owner(ad, current_user)

    image = (
        db.query(models.AdImage)
        .filter(models.AdImage.id == image_id)
        .filter(models.AdImage.ad_id == ad_id)
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Снимката не е намерена."
        )

    if image.image_url.startswith("/static/uploads/ads/"):
        file_name = image.image_url.replace("/static/uploads/ads/", "")
        file_path = os.path.join(UPLOAD_DIR, file_name)

        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(image)
    db.commit()

    remaining_images = (
        db.query(models.AdImage)
        .filter(models.AdImage.ad_id == ad_id)
        .order_by(models.AdImage.sort_order.asc(), models.AdImage.id.asc())
        .all()
    )

    if remaining_images and not any(img.is_main for img in remaining_images):
        remaining_images[0].is_main = True
        db.commit()

    return {
        "message": "Снимката е изтрита успешно."
    }