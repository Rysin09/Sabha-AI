"""
backend/routers/export.py
──────────────────────────
GET /api/export/{job_id}/pdf   — download PDF report
GET /api/export/{job_id}/txt   — download TXT report
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, PlainTextResponse
from backend.services.job_store import get_job
from backend.services.export_service import generate_pdf, generate_txt

router = APIRouter(prefix="/api/export", tags=["export"])


def _get_done_job(job_id: str) -> dict:
    """Shared validation: job must exist and be done."""
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    if job["status"] != "done":
        raise HTTPException(status_code=409, detail="Meeting processing is not yet complete.")
    return job


@router.get("/{job_id}/pdf")
def export_pdf(job_id: str):
    """Stream the meeting report as a PDF file."""
    job = _get_done_job(job_id)
    report = {**job["result"], "source": job["source"], "language": job["language"]}

    try:
        pdf_bytes = generate_pdf(report)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(exc)}")

    safe_title = "".join(c if c.isalnum() or c in " _-" else "_" for c in report.get("title", "meeting"))
    filename = f"{safe_title[:50]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{job_id}/txt")
def export_txt(job_id: str):
    """Stream the meeting report as a plain-text file."""
    job = _get_done_job(job_id)
    report = {**job["result"], "source": job["source"], "language": job["language"]}

    txt_content = generate_txt(report)

    safe_title = "".join(c if c.isalnum() or c in " _-" else "_" for c in report.get("title", "meeting"))
    filename = f"{safe_title[:50]}.txt"

    return PlainTextResponse(
        content=txt_content,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
