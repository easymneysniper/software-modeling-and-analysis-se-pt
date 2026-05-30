from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.get("/", response_model=List[schemas.CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    categories = (
        db.query(models.Category)
        .filter(models.Category.is_active == True)
        .order_by(models.Category.sort_order.asc(), models.Category.name.asc())
        .all()
    )

    return categories


@router.get("/main", response_model=List[schemas.CategoryOut])
def get_main_categories(db: Session = Depends(get_db)):
    categories = (
        db.query(models.Category)
        .filter(models.Category.parent_id.is_(None))
        .filter(models.Category.is_active == True)
        .order_by(models.Category.sort_order.asc())
        .all()
    )

    return categories


@router.get("/{category_id}", response_model=schemas.CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = (
        db.query(models.Category)
        .filter(models.Category.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категорията не е намерена."
        )

    return category


@router.get("/{category_id}/children", response_model=List[schemas.CategoryOut])
def get_category_children(category_id: int, db: Session = Depends(get_db)):
    children = (
        db.query(models.Category)
        .filter(models.Category.parent_id == category_id)
        .filter(models.Category.is_active == True)
        .order_by(models.Category.sort_order.asc(), models.Category.name.asc())
        .all()
    )

    return children