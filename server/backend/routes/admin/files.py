from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import datetime

from backend.database import get_db
from backend.models import (
    FileRecord, SystemUser, FinanceInfo, CustomerDocument, Customer,
    PaymentIn, PaymentOut, InsurancePayment, RTOPayment, InsuranceInfo,
)
from backend.utils import get_current_staff, get_current_admin, record_dashboard_event, send_targeted_notification

router = APIRouter(prefix="/api/v1/files", tags=["Admin Files"])

class FileCreate(BaseModel):
    customer_id: UUID
    bank_id: UUID
    file_type: str
    status: str
    docket_date: Optional[str] = None
    remarks: Optional[str] = None

class FileUpdate(BaseModel):
    file_type: Optional[str] = None
    status: Optional[str] = None
    docket_date: Optional[str] = None
    remarks: Optional[str] = None
    assigned_to: Optional[UUID] = None

class DocumentStatusUpdate(BaseModel):
    status: str # 'verified', 'rejected', etc.
    rejection_reason: Optional[str] = None

def generate_file_number(db: Session) -> str:
    current_year = datetime.datetime.now().year
    prefix = f"FILE/{current_year}/"
    
    # Find the highest existing file number for the current year
    highest_file = db.query(FileRecord).filter(
        FileRecord.file_number.like(f"{prefix}%")
    ).order_by(FileRecord.file_number.desc()).first()

    if highest_file and highest_file.file_number.startswith(prefix):
        try:
            last_seq = int(highest_file.file_number.split('/')[-1])
            new_seq = last_seq + 1
        except ValueError:
            new_seq = 1
    else:
        new_seq = 1

    return f"{prefix}{new_seq:03d}"

@router.get("/")
def list_files(
    page: int = 1, 
    limit: int = 20, 
    status: Optional[str] = None, 
    file_type: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(FileRecord).filter(FileRecord.is_deleted == False)
    
    if status:
        query = query.filter(FileRecord.status == status)
    if file_type:
        query = query.filter(FileRecord.file_type == file_type)

    total = query.count()
    files = query.offset((page - 1) * limit).limit(limit).all()
    
    data = [{
        "id": str(f.id),              
        "file_number": f.file_number, 
        "customer": f.customer.full_name if f.customer else "N/A",
        "type": f.file_type.replace('_', ' ').title() if f.file_type else "N/A",     
        "status": f.status.title(),
        "bank": f.finance_info.bank.bank_name if f.finance_info and f.finance_info.bank else "—",
        "assigned": f.assignee.first_name if f.assignee else "Unassigned",
        "created": f.created_at.strftime("%Y-%m-%d")
    } for f in files]
    
    return {"data": data, "total": total, "page": page, "limit": limit}

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_file(payload: FileCreate, db: Session = Depends(get_db), current_user: SystemUser = Depends(get_current_staff)):
    
    # Auto-generate the file number securely
    new_file_num = generate_file_number(db)

    new_file = FileRecord(
        customer_id=payload.customer_id,
        created_by_user_id=current_user.id,
        assigned_to=current_user.id,
        file_number=new_file_num,
        file_type=payload.file_type,
        status=payload.status,
        remarks=payload.remarks
    )
    db.add(new_file)
    db.flush() # Flush to get the file ID for FinanceInfo

    # Create the associated FinanceInfo to link the bank
    new_finance_info = FinanceInfo(
        file_id=new_file.id,
        bank_id=payload.bank_id
    )
    db.add(new_finance_info)

    try:
        record_dashboard_event(
            db,
            current_user,
            action="created file",
            table_name="file_record",
            record_id=new_file.id,
            message=f"File {new_file.file_number} was created",
            preference_key="added",
            new_values={
                "id": str(new_file.id),
                "file_number": new_file.file_number,
                "customer_id": str(new_file.customer_id),
                "file_type": new_file.file_type,
                "status": new_file.status,
                "bank_id": str(payload.bank_id),
            },
        )
        db.commit()
        db.refresh(new_file)
        return {"status": "success", "id": str(new_file.id), "file_number": new_file.file_number}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{file_id}/", status_code=200)
def update_file(
    file_id: UUID,
    payload: FileUpdate,
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_staff)
):
    file = db.query(FileRecord).filter(
        FileRecord.id == file_id,
        FileRecord.is_deleted == False
    ).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if payload.file_type is not None:
        file.file_type = payload.file_type
    if payload.status is not None:
        file.status = payload.status
    if payload.remarks is not None:
        file.remarks = payload.remarks
    if payload.docket_date is not None:
        try:
            file.docket_date = datetime.date.fromisoformat(payload.docket_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid docket_date format. Use YYYY-MM-DD.")
    if payload.assigned_to is not None:
        file.assigned_to = payload.assigned_to

    file.updated_at = datetime.datetime.utcnow()

    try:
        record_dashboard_event(
            db,
            current_user,
            action="updated file",
            table_name="file_record",
            record_id=file.id,
            message=f"File {file.file_number} was updated",
            preference_key="updated",
        )
        db.commit()
        db.refresh(file)
        return {"status": "success", "id": str(file.id), "file_number": file.file_number}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{file_id}/", status_code=200)
def delete_file(
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_admin)
):
    file = db.query(FileRecord).filter(
        FileRecord.id == file_id,
        FileRecord.is_deleted == False
    ).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    file.is_deleted = True
    file.updated_at = datetime.datetime.utcnow()

    try:
        record_dashboard_event(
            db,
            current_user,
            action="deleted file",
            table_name="file_record",
            record_id=file.id,
            message=f"File {file.file_number} was deleted",
            preference_key="deleted",
        )
        db.commit()
        return {"status": "success", "message": f"File {file.file_number} deleted"}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{file_id}/detail")
def get_file_detail(
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_staff),
):
    """Full file detail — used by the FileDetailDrawer component on all pages."""
    file = db.query(FileRecord).filter(
        FileRecord.id == file_id,
        FileRecord.is_deleted == False,
    ).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    def safe_date(d):
        if d is None:
            return None
        if hasattr(d, "isoformat"):
            return d.isoformat()
        return str(d)

    # Finance / Loan info
    finance = file.finance_info
    finance_data = None
    if finance:
        finance_data = {
            "lan_number":     finance.lan_number,
            "loan_amount":    float(finance.loan_amount or 0),
            "emi_amount":     float(finance.emi_amount or 0),
            "no_of_months":   finance.no_of_months,
            "irr_percentage": float(finance.irr_percentage or 0),
            "bank":           finance.bank.bank_name if finance.bank else None,
        }

    # Insurance info
    insurance = file.insurance_info
    insurance_data = None
    if insurance:
        insurance_data = {
            "policy_number":   insurance.policy_number,
            "valid_from":      safe_date(insurance.valid_from),
            "valid_to":        safe_date(insurance.valid_to),
            "premium_amount":  float(insurance.premium_amount or 0),
            "idv_amount":      float(insurance.idv_amount or 0),
            "company":         insurance.insurance_company.company_name if insurance.insurance_company else None,
            "type":            insurance.insurance_type.insurance_type_name if insurance.insurance_type else None,
        }

    # Payment counts
    pay_in_count  = db.query(PaymentIn).filter(PaymentIn.file_id == file_id).count()
    pay_out_count = db.query(PaymentOut).filter(PaymentOut.file_id == file_id).count()
    rto_count     = db.query(RTOPayment).filter(RTOPayment.file_id == file_id, RTOPayment.is_deleted == False).count()
    ins_count     = db.query(InsurancePayment).filter(InsurancePayment.file_id == file_id, InsurancePayment.is_deleted == False).count()

    return {
        "id":           str(file.id),
        "file_number":  file.file_number or "—",
        "file_type":    file.file_type or "—",
        "status":       file.status or "—",
        "docket_date":  safe_date(file.docket_date),
        "remarks":      file.remarks,
        "created_at":   safe_date(file.created_at),
        "updated_at":   safe_date(file.updated_at),
        # Relations
        "customer": {
            "id":       str(file.customer.id) if file.customer else None,
            "name":     file.customer.full_name if file.customer else "—",
            "mobile":   file.customer.mobile_1 if file.customer else "—",
            "email":    file.customer.email if file.customer else "—",
            "type":     file.customer.customer_type if file.customer else "—",
        },
        "assigned_to": (
            f"{file.assignee.first_name or ''} {file.assignee.last_name or ''}".strip()
            if file.assignee else "Unassigned"
        ),
        "created_by": (
            f"{file.creator.first_name or ''} {file.creator.last_name or ''}".strip()
            if file.creator else "—"
        ),
        # Detailed data
        "finance":   finance_data,
        "insurance": insurance_data,
        # Payment summary counts
        "payment_in_count":  pay_in_count,
        "payment_out_count": pay_out_count,
        "rto_count":         rto_count,
        "insurance_payment_count": ins_count,
    }


@router.patch("/{file_id}/documents/{document_id}/status")
def update_document_status(
    file_id: UUID,
    document_id: UUID,
    payload: DocumentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: SystemUser = Depends(get_current_staff)
):
    # 1. Fetch the document
    doc = db.query(CustomerDocument).filter(
        CustomerDocument.id == document_id,
        CustomerDocument.file_id == file_id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2. Update status
    doc.status = payload.status
    if payload.status == 'rejected':
        doc.rejection_reason = payload.rejection_reason
    else:
        doc.rejection_reason = None
        
    doc.updated_at = datetime.datetime.utcnow()

    # 3. Find the customer's SystemUser ID to notify them
    customer_user = db.query(SystemUser).join(
        Customer, Customer.email == SystemUser.email
    ).filter(Customer.id == doc.customer_id).first()

    if customer_user:
        # 4. Send targeted notification to the Customer
        notif_msg = f"Your document '{doc.label}' has been {payload.status}."
        if payload.status == 'rejected':
            notif_msg += " Please re-upload."

        send_targeted_notification(
            db=db,
            target_user_id=customer_user.id,
            message=notif_msg,
            notification_type="document_rejected" if payload.status == 'rejected' else "document_approved",
            file_id=file_id
        )

    db.commit()
    return {"status": "success", "message": "Document status updated and customer notified."}