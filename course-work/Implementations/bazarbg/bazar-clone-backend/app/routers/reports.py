from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.post("/", response_model=schemas.ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    report_data: schemas.ReportCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ad = (
        db.query(models.Ad)
        .filter(models.Ad.id == report_data.ad_id)
        .filter(models.Ad.status != "deleted")
        .first()
    )

    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обявата не е намерена."
        )

    if ad.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не можеш да докладваш собствена обява."
        )

    existing_report = (
        db.query(models.Report)
        .filter(models.Report.ad_id == report_data.ad_id)
        .filter(models.Report.reporter_id == current_user.id)
        .first()
    )

    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вече си изпратил сигнал за тази обява."
        )

    report = models.Report(
        reporter_id=current_user.id,
        ad_id=report_data.ad_id,
        reason=report_data.reason,
        description=report_data.description,
        status="pending"
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


@router.get("/me", response_model=List[schemas.ReportOut])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reports = (
        db.query(models.Report)
        .filter(models.Report.reporter_id == current_user.id)
        .order_by(models.Report.created_at.desc())
        .all()
    )

    return reports