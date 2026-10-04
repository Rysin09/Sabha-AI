"""
backend/routers/process.py
───────────────────────────
Endpoints for triggering meeting processing:
  POST /api/process/youtube   — submit a YouTube URL
"""
import os
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter

from backend.schemas import YoutubeProcessRequest, ProcessJobResponse
from backend.services.job_store import create_job
from backend.services.processing_pipeline import run_pipeline

router = APIRouter(prefix="/api/process", tags=["process"])

# Shared thread pool for CPU/IO-bound pipeline work
_executor = ThreadPoolExecutor(max_workers=2)

# ── YouTube URL ───────────────────────────────────────────────────────────────

@router.post("/youtube", response_model=ProcessJobResponse)
async def process_youtube(body: YoutubeProcessRequest):
    """Submit a YouTube URL for processing. Returns job_id immediately."""
    job_id = str(uuid.uuid4())
    create_job(job_id, source=body.url, language=body.language)

    loop = asyncio.get_event_loop()
    loop.run_in_executor(
        _executor,
        run_pipeline,
        job_id,
        body.url,
        body.language,
        None,  # no upload_dir to clean up
    )

    return ProcessJobResponse(job_id=job_id, status="queued")
