"""API route handlers."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.src.models.schemas import SubmissionCreate, SubmissionResponse
from backend.src.services.database import (
    get_db,
    create_submission,
    list_submissions,
    get_submission,
)
from datetime import datetime

router = APIRouter(prefix="/api", tags=["submissions"])


@router.post(
    "/submissions",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_intake_request(
    submission: SubmissionCreate, db: Session = Depends(get_db)
):
    """Create a new project intake submission."""
    try:
        result = create_submission(db, submission)
        return result
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/submissions")
async def get_submissions(
    limit: int = 100, offset: int = 0, db: Session = Depends(get_db)
):
    """List all submissions with pagination."""
    if limit < 1 or limit > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="limit must be between 1 and 500",
        )

    submissions = list_submissions(db, limit, offset)
    return {
        "submissions": submissions,
        "total": len(submissions),
        "limit": limit,
        "offset": offset,
    }


@router.get("/submissions/{submission_id}")
async def get_submission_detail(submission_id: int, db: Session = Depends(get_db)):
    """Get detailed view of a specific submission."""
    submission = get_submission(db, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found"
        )
    return submission


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for container orchestration."""
    try:
        # Test database connectivity
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            },
        )
