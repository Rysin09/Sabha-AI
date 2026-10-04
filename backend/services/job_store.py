"""
backend/services/job_store.py
─────────────────────────────
In-memory job state store.  Each job is a dict keyed by UUID string.

Structure of a job entry:
{
    "job_id":        str,
    "status":        "queued" | "downloading" | "transcribing" | "summarizing"
                     | "extracting" | "indexing" | "done" | "error",
    "step_detail":   str,           # Human-readable progress detail
    "error_message": str | None,
    "source":        str,           # Original URL or filename
    "language":      str,           # "english" | "hinglish"
    "result": {
        "title":          str,
        "transcript":     str,
        "summary":        str,
        "action_items":   str,
        "key_decisions":  str,
        "open_questions": str,
        "processed_at":   str,      # ISO timestamp
    } | None
}
"""
import threading
from typing import Optional

# The single shared in-memory store.
# In production, replace with Redis or a DB.
_store: dict[str, dict] = {}
_lock = threading.Lock()


def create_job(job_id: str, source: str, language: str) -> dict:
    job = {
        "job_id": job_id,
        "status": "queued",
        "step_detail": "Queued for processing",
        "error_message": None,
        "source": source,
        "language": language,
        "result": None,
    }
    with _lock:
        _store[job_id] = job
    return job


def get_job(job_id: str) -> Optional[dict]:
    with _lock:
        return _store.get(job_id)


def update_job(job_id: str, **kwargs) -> None:
    """Partial update: pass any subset of job fields as kwargs."""
    with _lock:
        if job_id in _store:
            _store[job_id].update(kwargs)


def set_status(job_id: str, status: str, step_detail: str = "") -> None:
    update_job(job_id, status=status, step_detail=step_detail)


def set_error(job_id: str, message: str) -> None:
    update_job(job_id, status="error", error_message=message, step_detail="Failed")


def set_result(job_id: str, result: dict) -> None:
    update_job(job_id, status="done", result=result, step_detail="Complete")


def all_jobs() -> list[dict]:
    with _lock:
        return list(_store.values())
