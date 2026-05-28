from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime

from backend.database import get_db
from backend.models import Notification, SystemUser
from backend.utils import get_current_user 

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])

@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_user)
):
    # 1. AUTO-DELETE LOGIC: Clean up read notifications older than 3 days
    three_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=3)
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == True,
        Notification.read_at <= three_days_ago
    ).delete(synchronize_session=False)
    db.commit()

    # 2. Fetch the remaining notifications
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    return {
        "data": [
            {
                "id": str(n.id),
                "type": n.notification_type,
                "message": n.message,
                "read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "file_id": str(n.file_id) if n.file_id else None
            } for n in notifications
        ]
    }

@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    notif.read_at = func.now() # Record exact time it was read
    db.commit()
    return {"status": "success"}

@router.patch("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True, 
        "read_at": func.now() # Record exact time they were read
    })
    
    db.commit()
    return {"status": "success"}