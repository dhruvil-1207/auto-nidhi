from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any
from uuid import UUID
import json

from backend.database import get_db
from backend.models import SystemUser, Customer
from backend.utils import get_current_staff, record_dashboard_event, send_targeted_notification

router = APIRouter(prefix="/api/v1/service-requests", tags=["Service Requests"])

def get_service_request_query():
    return """
        SELECT 
            sr.id,
            sr.customer_id,
            c.full_name as customer_name,
            c.email as customer_email,
            c.mobile_1 as customer_mobile,
            sr.request_type,
            sr.status,
            sr.details,
            sr.remarks,
            sr.consultant_id,
            CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as consultant_name,
            sr.created_at,
            sr.updated_at,
            sr.viewed_by_consultant,
            sr.viewed_at
        FROM service_requests sr
        LEFT JOIN customer c ON sr.customer_id = c.id
        LEFT JOIN system_user u ON sr.consultant_id = u.id
    """

@router.get("/", summary="List all service requests")
def list_service_requests(
    consultant_id: Optional[str] = Query(None, description="Filter by consultant ID"),
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_staff)
):
    """
    Get all service requests.
    If the user is a staff/consultant, they should optionally filter by their ID.
    Admins can see everything.
    """
    try:
        query = get_service_request_query()
        params = {}
        
        conditions = []
        
        if consultant_id:
            conditions.append("sr.consultant_id = :consultant_id")
            params["consultant_id"] = consultant_id

        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " ORDER BY sr.created_at DESC"

        result = db.execute(text(query), params).mappings().fetchall()
        
        # Parse JSON details if stored as string/jsonb
        formatted_results = []
        for row in result:
            row_dict = dict(row)
            if isinstance(row_dict.get('details'), str):
                try:
                    row_dict['details'] = json.loads(row_dict['details'])
                except json.JSONDecodeError:
                    pass
            formatted_results.append(row_dict)
            
        return formatted_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", summary="Create a new service request")
def create_service_request(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_staff)
):
    """
    Create a new service request (can be logged by staff on behalf of customer).
    """
    try:
        customer_id = payload.get("customer_id")
        request_type = payload.get("request_type")
        details = payload.get("details", {})
        remarks = payload.get("remarks")
        consultant_id = payload.get("consultant_id")
        if not consultant_id:
            consultant_id = None

        if not request_type:
            raise HTTPException(status_code=400, detail="request_type is required")

        insert_query = text("""
            INSERT INTO service_requests 
            (customer_id, request_type, details, remarks, consultant_id)
            VALUES (:customer_id, :request_type, CAST(:details AS JSONB), :remarks, :consultant_id)
            RETURNING id, created_at, updated_at
        """)
        
        params = {
            "customer_id": customer_id,
            "request_type": request_type,
            "details": json.dumps(details) if isinstance(details, dict) else details,
            "remarks": remarks,
            "consultant_id": consultant_id
        }

        result = db.execute(insert_query, params).mappings().first()
        db.commit()
        
        # Notify consultant if assigned
        if consultant_id:
            send_targeted_notification(
                db, 
                UUID(consultant_id), 
                f"New {request_type} service request assigned to you."
            )
            db.commit()

        return {
            "id": result["id"],
            "status": "pending",
            "message": "Service Request created successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{request_id}/status", summary="Update request status")
def update_request_status(
    request_id: UUID,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_staff)
):
    """
    Update the status of a service request (e.g. pending -> processed)
    """
    try:
        status_val = payload.get("status")
        remarks = payload.get("remarks")
        
        if not status_val:
            raise HTTPException(status_code=400, detail="status is required")
            
        update_query = text("""
            UPDATE service_requests
            SET status = :status,
                remarks = CASE WHEN :remarks IS NOT NULL THEN CONCAT(remarks, '\nConsultant update: ', :remarks) ELSE remarks END,
                updated_at = NOW()
            WHERE id = :request_id
            RETURNING id, customer_id
        """)
        
        result = db.execute(update_query, {
            "request_id": str(request_id), 
            "status": status_val, 
            "remarks": remarks
        }).mappings().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Service request not found")
            
        db.commit()

        # Audit Log
        record_dashboard_event(
            db=db,
            user=current_user,
            action="UPDATE",
            table_name="service_requests",
            record_id=request_id,
            message=f"Service request {str(request_id)[:8]} updated to {status_val}"
        )
        db.commit()
            
        return {"message": "Status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{request_id}/read", summary="Mark request as viewed")
def mark_request_viewed(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_staff)
):
    """
    Mark a service request as viewed by the consultant.
    """
    try:
        update_query = text("""
            UPDATE service_requests
            SET viewed_by_consultant = TRUE,
                viewed_at = NOW()
            WHERE id = :request_id
        """)
        
        result = db.execute(update_query, {"request_id": str(request_id)})
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Service request not found")
            
        db.commit()
        return {"message": "Marked as viewed"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))