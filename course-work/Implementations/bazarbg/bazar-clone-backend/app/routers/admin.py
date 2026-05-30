from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import get_current_admin_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/stats", response_model=schemas.AdminStatsOut)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    users_count = db.query(models.User).count()

    active_ads_count = (
        db.query(models.Ad)
        .filter(models.Ad.status == "active")
        .count()
    )

    pending_reports_count = (
        db.query(models.Report)
        .filter(models.Report.status == "pending")
        .count()
    )

    messages_count = db.query(models.Message).count()

    return {
        "users_count": users_count,
        "active_ads_count": active_ads_count,
        "pending_reports_count": pending_reports_count,
        "messages_count": messages_count
    }


@router.get("/users", response_model=List[schemas.UserOut])
def get_admin_users(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    users = (
        db.query(models.User)
        .order_by(models.User.created_at.desc())
        .all()
    )

    return users


@router.patch("/users/{user_id}/status", response_model=schemas.UserOut)
def update_user_status(
    user_id: int,
    status_data: schemas.AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    allowed_statuses = ["active", "inactive", "blocked"]

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Невалиден статус."
        )

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Потребителят не е намерен."
        )

    if user.id == admin_user.id and status_data.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не можеш да блокираш собствения си админ профил."
        )

    user.status = status_data.status

    db.commit()
    db.refresh(user)

    return user


@router.get("/reports", response_model=List[schemas.AdminReportOut])
def get_admin_reports(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    rows = (
        db.query(models.Report, models.User, models.Ad)
        .join(models.User, models.Report.reporter_id == models.User.id)
        .join(models.Ad, models.Report.ad_id == models.Ad.id)
        .order_by(models.Report.created_at.desc())
        .all()
    )

    reports = []

    for report, reporter, ad in rows:
        reports.append({
            "id": report.id,
            "reporter_id": report.reporter_id,
            "reporter_username": reporter.username,
            "ad_id": report.ad_id,
            "ad_title": ad.title,
            "reason": report.reason,
            "description": report.description,
            "status": report.status,
            "reviewed_by": report.reviewed_by,
            "created_at": report.created_at,
            "reviewed_at": report.reviewed_at
        })

    return reports


@router.patch("/reports/{report_id}", response_model=schemas.AdminReportOut)
def update_report_status(
    report_id: int,
    status_data: schemas.AdminReportStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    allowed_statuses = ["pending", "reviewed", "resolved", "rejected"]

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Невалиден статус на сигнал."
        )

    row = (
        db.query(models.Report, models.User, models.Ad)
        .join(models.User, models.Report.reporter_id == models.User.id)
        .join(models.Ad, models.Report.ad_id == models.Ad.id)
        .filter(models.Report.id == report_id)
        .first()
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сигналът не е намерен."
        )

    report, reporter, ad = row

    report.status = status_data.status
    report.reviewed_by = admin_user.id
    report.reviewed_at = datetime.now()

    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "reporter_id": report.reporter_id,
        "reporter_username": reporter.username,
        "ad_id": report.ad_id,
        "ad_title": ad.title,
        "reason": report.reason,
        "description": report.description,
        "status": report.status,
        "reviewed_by": report.reviewed_by,
        "created_at": report.created_at,
        "reviewed_at": report.reviewed_at
    }


@router.delete("/ads/{ad_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_ad(
    ad_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
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

    ad.status = "deleted"

    db.commit()

    return None