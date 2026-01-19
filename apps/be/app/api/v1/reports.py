"""
Reports API endpoints.
Handles report submissions for feedback, bug reports, and inappropriate content.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from supabase import Client

from app.database.supabase import get_supabase_client
from app.api.deps import get_current_user, require_admin_role
from app.models.report import (
    ReportCreate,
    ReportUpdate,
    ReportResponse,
    ReportListResponse,
    ReportStatus,
    TargetType
)
from app.services.email import send_new_report_notification

router = APIRouter()


@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Create a new report.
    
    - Requires authentication
    - Prevents duplicate reports on the same target within 24 hours
    - Validates image URLs (max 3)
    - Sends email notification to admin
    """
    user_id = current_user.id
    
    # Check for duplicate report within 24 hours
    if report_data.target_id:
        twenty_four_hours_ago = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        
        existing_report = supabase.table("reports").select("id").eq(
            "reporter_id", user_id
        ).eq(
            "target_type", report_data.target_type.value
        ).eq(
            "target_id", report_data.target_id
        ).gte(
            "created_at", twenty_four_hours_ago
        ).execute()
        
        if existing_report.data and len(existing_report.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="You have already reported this content within the last 24 hours"
            )
    
    # Validate image URLs count
    if len(report_data.image_urls) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 3 images allowed per report"
        )
    
    # Create report
    report_insert = {
        "reporter_id": user_id,
        "report_type": report_data.report_type.value,
        "target_type": report_data.target_type.value,
        "target_id": report_data.target_id,
        "target_url": report_data.target_url,
        "description": report_data.description,
        "image_urls": report_data.image_urls,
        "status": ReportStatus.PENDING.value
    }
    
    result = supabase.table("reports").insert(report_insert).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create report"
        )
    
    report = result.data[0]
    
    # Get reporter username for email
    reporter_username = None
    try:
        user_result = supabase.table("users").select("username").eq("id", user_id).single().execute()
        if user_result.data:
            reporter_username = user_result.data.get("username")
    except Exception:
        pass
    
    # Send email notification in background
    background_tasks.add_task(
        send_new_report_notification,
        report_id=report["id"],
        report_type=report["report_type"],
        target_type=report["target_type"],
        description=report["description"],
        reporter_username=reporter_username,
        target_url=report.get("target_url")
    )
    
    return ReportResponse(
        id=report["id"],
        reporter_id=report["reporter_id"],
        report_type=report["report_type"],
        target_type=report["target_type"],
        target_id=report.get("target_id"),
        target_url=report.get("target_url"),
        description=report["description"],
        image_urls=report.get("image_urls", []),
        status=report["status"],
        admin_notes=report.get("admin_notes"),
        created_at=report["created_at"],
        resolved_at=report.get("resolved_at")
    )


@router.get("/reports", response_model=ReportListResponse)
async def list_reports(
    status_filter: Optional[ReportStatus] = Query(None, alias="status"),
    target_type: Optional[TargetType] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user = Depends(require_admin_role),
    supabase: Client = Depends(get_supabase_client)
):
    """
    List all reports with optional filters.
    
    - Requires admin role
    - Supports filtering by status and target_type
    - Paginated results
    """
    # Build query
    query = supabase.table("reports").select(
        "*, users!reporter_id(username, display_name)",
        count="exact"
    )
    
    # Apply filters
    if status_filter:
        query = query.eq("status", status_filter.value)
    if target_type:
        query = query.eq("target_type", target_type.value)
    
    # Order and paginate
    offset = (page - 1) * page_size
    query = query.order("created_at", desc=True).range(offset, offset + page_size - 1)
    
    result = query.execute()
    
    reports = []
    for report in result.data or []:
        user_data = report.get("users") or {}
        reports.append(ReportResponse(
            id=report["id"],
            reporter_id=report["reporter_id"],
            report_type=report["report_type"],
            target_type=report["target_type"],
            target_id=report.get("target_id"),
            target_url=report.get("target_url"),
            description=report["description"],
            image_urls=report.get("image_urls", []),
            status=report["status"],
            admin_notes=report.get("admin_notes"),
            created_at=report["created_at"],
            resolved_at=report.get("resolved_at"),
            reporter_username=user_data.get("username"),
            reporter_display_name=user_data.get("display_name")
        ))
    
    total = result.count or 0
    
    return ReportListResponse(
        reports=reports,
        total=total,
        page=page,
        page_size=page_size,
        has_more=(offset + page_size) < total
    )


@router.patch("/reports/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    update_data: ReportUpdate,
    current_user = Depends(require_admin_role),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Update a report's status and/or admin notes.
    
    - Requires admin role
    - Sets resolved_at when status changes to resolved/rejected
    """
    # Get existing report
    existing = supabase.table("reports").select("*").eq("id", report_id).single().execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Build update data
    update_dict = {}
    if update_data.status is not None:
        update_dict["status"] = update_data.status.value
        # Set resolved_at if status is resolved or rejected
        if update_data.status in [ReportStatus.RESOLVED, ReportStatus.REJECTED]:
            update_dict["resolved_at"] = datetime.utcnow().isoformat()
        elif update_data.status == ReportStatus.PENDING:
            update_dict["resolved_at"] = None
    
    if update_data.admin_notes is not None:
        update_dict["admin_notes"] = update_data.admin_notes
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update report
    result = supabase.table("reports").update(update_dict).eq("id", report_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update report"
        )
    
    report = result.data[0]
    
    return ReportResponse(
        id=report["id"],
        reporter_id=report["reporter_id"],
        report_type=report["report_type"],
        target_type=report["target_type"],
        target_id=report.get("target_id"),
        target_url=report.get("target_url"),
        description=report["description"],
        image_urls=report.get("image_urls", []),
        status=report["status"],
        admin_notes=report.get("admin_notes"),
        created_at=report["created_at"],
        resolved_at=report.get("resolved_at")
    )


@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    current_user = Depends(require_admin_role),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get a single report by ID.
    
    - Requires admin role
    """
    result = supabase.table("reports").select(
        "*, users!reporter_id(username, display_name)"
    ).eq("id", report_id).single().execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    report = result.data
    user_data = report.get("users") or {}
    
    return ReportResponse(
        id=report["id"],
        reporter_id=report["reporter_id"],
        report_type=report["report_type"],
        target_type=report["target_type"],
        target_id=report.get("target_id"),
        target_url=report.get("target_url"),
        description=report["description"],
        image_urls=report.get("image_urls", []),
        status=report["status"],
        admin_notes=report.get("admin_notes"),
        created_at=report["created_at"],
        resolved_at=report.get("resolved_at"),
        reporter_username=user_data.get("username"),
        reporter_display_name=user_data.get("display_name")
    )
