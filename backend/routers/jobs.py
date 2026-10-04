"""
backend/routers/jobs.py
────────────────────────
GET /api/job/{job_id}/status  — poll processing progress
"""
from fastapi import APIRouter, HTTPException
from backend.schemas import JobStatusResponse
from backend.services.job_store import get_job

router = APIRouter(prefix="/api/job", tags=["jobs"])


@router.get("/{job_id}/status", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    """Return the current processing status of a job."""
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")

    return JobStatusResponse(
        job_id=job["job_id"],
        status=job["status"],
        step_detail=job["step_detail"],
        error_message=job.get("error_message"),
    )
