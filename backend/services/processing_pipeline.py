"""
backend/services/processing_pipeline.py
─────────────────────────────────────────
Background processing pipeline that ties together all core/ modules.
Called from routers via ThreadPoolExecutor so the ASGI event loop is never blocked.
"""
import os
import shutil
import uuid
from datetime import datetime, timezone

from backend.services.job_store import set_status, set_result, set_error
from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarize import summarize, generate_title
from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.rag_engine import build_rag_chain


def run_pipeline(job_id: str, source: str, language: str, upload_dir: str | None = None) -> None:
    """
    Full meeting processing pipeline.  Runs synchronously in a worker thread.

    Args:
        job_id:     Unique job identifier (also used as ChromaDB collection namespace).
        source:     Either a YouTube URL or an absolute path to the uploaded file.
        language:   "english" or "hinglish".
        upload_dir: If the source was an uploaded file, the directory it lives in.
                    Will be deleted after processing to free disk space.
    """
    try:
        # ── Step 1: Download / convert audio ─────────────────────────────────
        set_status(job_id, "downloading", "Downloading and preparing audio...")
        chunks = process_input(source)

        # ── Step 2: Transcribe ────────────────────────────────────────────────
        set_status(job_id, "transcribing", f"Transcribing audio ({len(chunks)} chunks)...")
        transcript = transcribe_all(chunks, language=language)

        # Clean up chunk files (they were written to disk by process_input)
        for chunk_path in chunks:
            try:
                if os.path.exists(chunk_path):
                    os.remove(chunk_path)
            except OSError:
                pass

        # ── Step 3: Summarise ─────────────────────────────────────────────────
        set_status(job_id, "summarizing", "Generating meeting summary...")
        summary = summarize(transcript)
        title = generate_title(transcript)

        # ── Step 4: Extract insights ──────────────────────────────────────────
        set_status(job_id, "extracting", "Extracting action items, decisions, and questions...")
        action_items = extract_action_items(transcript)
        key_decisions = extract_key_decisions(transcript)
        open_questions = extract_questions(transcript)

        # ── Step 5: Build RAG index ───────────────────────────────────────────
        set_status(job_id, "indexing", "Building knowledge index for Q&A...")
        build_rag_chain(transcript, job_id)

        # ── Step 6: Persist result ────────────────────────────────────────────
        result = {
            "title": title,
            "transcript": transcript,
            "summary": summary,
            "action_items": action_items,
            "key_decisions": key_decisions,
            "open_questions": open_questions,
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }
        set_result(job_id, result)

    except Exception as exc:
        set_error(job_id, str(exc))
        raise

    finally:
        # Clean up the upload temp directory (if this was a file upload job)
        if upload_dir and os.path.exists(upload_dir):
            try:
                shutil.rmtree(upload_dir)
            except OSError:
                pass
