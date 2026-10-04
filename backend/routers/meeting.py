"""
backend/routers/meeting.py
───────────────────────────
GET /api/meeting/{job_id}  — retrieve full meeting report once processing is done
"""
from fastapi import APIRouter, HTTPException
from backend.schemas import MeetingReportResponse
from backend.services.job_store import get_job

router = APIRouter(prefix="/api/meeting", tags=["meeting"])


@router.get("/{job_id}", response_model=MeetingReportResponse)
def get_meeting_report(job_id: str):
    """Return the full processed meeting report."""
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")

    if job["status"] == "error":
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {job.get('error_message', 'Unknown error')}",
        )

    if job["status"] != "done":
        raise HTTPException(
            status_code=409,
            detail=f"Meeting is still being processed. Current status: {job['status']}",
        )

    result = job["result"]
    return MeetingReportResponse(
        job_id=job_id,
        title=result["title"],
        source=job["source"],
        language=job["language"],
        transcript=result["transcript"],
        summary=result["summary"],
        action_items=result["action_items"],
        key_decisions=result["key_decisions"],
        open_questions=result["open_questions"],
        processed_at=result["processed_at"],
    )
