"""
Analytics endpoint — GET /api/v1/analytics/summary
Returns aggregated data for the Admin Analytics page charts.
No DB changes needed — queries existing tables only.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import Optional

from backend.database import get_db
from backend.models import (
    Customer, SystemUser, MasterRole,
    FileRecord, PaymentIn, PaymentOut, ModificationRequest,
)
from backend.utils import get_current_admin

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


def _month_label(year: int, month: int) -> str:
    """Return 'Jan 2026' style label."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return f"{months[month - 1]} {year}"


@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    _: SystemUser = Depends(get_current_admin),
):
    """
    Returns all chart data for the Analytics page:
    - Customer totals + individual/business split (pie)
    - New registrations last 6 months (bar)
    - Staff performance: customer count + file count per staff (bar)
    - File pipeline by status (horizontal bar)
    - Payment IN vs OUT totals per month last 6 months (line)
    - Accountant modification request stats (totals)
    """

    # ── 1. Customer stats ─────────────────────────────────────────────────────
    total_customers = db.query(func.count(Customer.id)).scalar() or 0

    individual_count = db.query(func.count(Customer.id)).filter(
        Customer.customer_type.in_(["individual", None])
    ).scalar() or 0
    business_count = db.query(func.count(Customer.id)).filter(
        Customer.customer_type == "business"
    ).scalar() or 0

    # New customers last 6 months
    now = datetime.utcnow()
    months_6 = []
    for i in range(5, -1, -1):
        dt = now - timedelta(days=30 * i)
        months_6.append((dt.year, dt.month))

    new_customers_by_month = []
    for yr, mo in months_6:
        count = db.query(func.count(Customer.id)).filter(
            extract("year", Customer.created_at) == yr,
            extract("month", Customer.created_at) == mo,
        ).scalar() or 0
        new_customers_by_month.append({
            "month": _month_label(yr, mo),
            "count": int(count),
        })

    # ── 2. Staff performance ──────────────────────────────────────────────────
    staff_role = db.query(MasterRole).filter(
        MasterRole.role_name.ilike("data_entry")
    ).first()

    staff_list = []
    if staff_role:
        staffs = db.query(SystemUser).filter(
            SystemUser.role_id == staff_role.id,
            SystemUser.is_active == True,
        ).all()
        for s in staffs:
            cust_count = db.query(func.count(Customer.id)).filter(
                Customer.created_by == s.id
            ).scalar() or 0
            file_count = db.query(func.count(FileRecord.id)).filter(
                FileRecord.assigned_to == s.id,
                FileRecord.is_deleted == False,
            ).scalar() or 0
            staff_list.append({
                "name": f"{s.first_name or ''} {s.last_name or ''}".strip() or s.email,
                "customers": int(cust_count),
                "files": int(file_count),
            })

    # ── 3. File pipeline by status ────────────────────────────────────────────
    status_rows = (
        db.query(FileRecord.status, func.count(FileRecord.id))
        .filter(FileRecord.is_deleted == False)
        .group_by(FileRecord.status)
        .all()
    )
    file_pipeline = [
        {"status": s or "unknown", "count": int(c)}
        for s, c in status_rows
    ]
    # Ensure all known statuses appear (with 0 if no data)
    known_statuses = ["draft", "login", "under_process", "sanctioned", "disbursed", "completed", "cancelled"]
    existing_map = {row["status"]: row["count"] for row in file_pipeline}
    file_pipeline = [
        {"status": st, "count": existing_map.get(st, 0)}
        for st in known_statuses
    ]

    # ── 4. Payment trends (last 6 months) ─────────────────────────────────────
    payment_trends = []
    for yr, mo in months_6:
        pay_in = db.query(func.coalesce(func.sum(PaymentIn.payment_amount), 0)).filter(
            extract("year", PaymentIn.payment_date) == yr,
            extract("month", PaymentIn.payment_date) == mo,
        ).scalar() or 0
        pay_out = db.query(func.coalesce(func.sum(PaymentOut.amount), 0)).filter(
            extract("year", PaymentOut.payment_date) == yr,
            extract("month", PaymentOut.payment_date) == mo,
        ).scalar() or 0
        payment_trends.append({
            "month": _month_label(yr, mo),
            "payment_in": float(pay_in),
            "payment_out": float(pay_out),
        })

    # ── 5. Modification requests (accountant stats) ────────────────────────────
    mod_total = db.query(func.count(ModificationRequest.id)).scalar() or 0
    mod_pending = db.query(func.count(ModificationRequest.id)).filter(
        ModificationRequest.status == "pending"
    ).scalar() or 0
    mod_approved = db.query(func.count(ModificationRequest.id)).filter(
        ModificationRequest.status.in_(["approved", "completed"])
    ).scalar() or 0
    mod_rejected = db.query(func.count(ModificationRequest.id)).filter(
        ModificationRequest.status == "rejected"
    ).scalar() or 0

    return {
        # Customer
        "total_customers": int(total_customers),
        "customer_type_split": [
            {"name": "Individual", "value": int(individual_count)},
            {"name": "Business",   "value": int(business_count)},
        ],
        "new_customers_by_month": new_customers_by_month,
        # Staff
        "staff_performance": staff_list,
        # Files
        "file_pipeline": file_pipeline,
        # Payments
        "payment_trends": payment_trends,
        # Modification requests
        "modification_requests": {
            "total":    int(mod_total),
            "pending":  int(mod_pending),
            "approved": int(mod_approved),
            "rejected": int(mod_rejected),
        },
    }
