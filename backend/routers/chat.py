"""
backend/routers/chat.py
────────────────────────
POST /api/chat  — ask a question about the meeting; returns answer + source chunks
"""
from fastapi import APIRouter, HTTPException
from backend.schemas import ChatRequest, ChatResponse, SourceChunk
from backend.services.job_store import get_job
from core.rag_engine import ask_question_with_sources

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest):
    """Ask a question about a processed meeting using the RAG pipeline."""
    job = get_job(body.job_id)

    if job is None:
        raise HTTPException(status_code=404, detail=f"Job '{body.job_id}' not found.")

    if job["status"] == "error":
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed for this meeting: {job.get('error_message', '')}",
        )

    if job["status"] != "done":
        raise HTTPException(
            status_code=409,
            detail=f"Meeting is still being processed. Current status: {job['status']}",
        )

    try:
        rag_result = ask_question_with_sources(
            job_id=body.job_id,
            question=body.question,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"RAG query failed: {str(exc)}",
        )

    sources = [
        SourceChunk(
            chunk_index=s["chunk_index"],
            content=s["content"],
        )
        for s in rag_result.get("sources", [])
    ]

    return ChatResponse(answer=rag_result["answer"], sources=sources)
