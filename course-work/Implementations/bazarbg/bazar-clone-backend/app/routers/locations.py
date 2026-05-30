from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)


@router.get("/", response_model=List[schemas.LocationOut])
def get_locations(db: Session = Depends(get_db)):
    locations = (
        db.query(models.Location)
        .order_by(models.Location.id.asc())
        .all()
    )

    return locations


@router.get("/{location_id}", response_model=schemas.LocationOut)
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = (
        db.query(models.Location)
        .filter(models.Location.id == location_id)
        .first()
    )

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Локацията не е намерена."
        )

    return location
