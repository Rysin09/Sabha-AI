"""
backend/schemas.py
──────────────────
All Pydantic request and response models for the Sabha-AI API.
"""
from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional, Literal
from datetime import datetime


# ── Shared ────────────────────────────────────────────────────────────────────

class LanguageEnum(str):
    english = "english"
    hinglish = "hinglish"


# ── Process endpoints ─────────────────────────────────────────────────────────

class YoutubeProcessRequest(BaseModel):
    url: str
    language: Literal["english", "hinglish"] = "english"

    @field_validator("url")
    @classmethod
    def validate_youtube_url(cls, v: str) -> str:
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("url must start with http:// or https://")
        return v


class ProcessJobResponse(BaseModel):
    job_id: str
    status: str


# ── Job status endpoint ───────────────────────────────────────────────────────

class JobStatusResponse(BaseModel):
    job_id: str
    status: Literal["queued", "downloading", "transcribing", "summarizing",
                    "extracting", "indexing", "done", "error"]
    step_detail: str
    error_message: Optional[str] = None


# ── Meeting report endpoint ───────────────────────────────────────────────────

class MeetingReportResponse(BaseModel):
    job_id: str
    title: str
    source: str
    language: str
    transcript: str
    summary: str
    action_items: str
    key_decisions: str
    open_questions: str
    processed_at: str


# ── Chat endpoint ─────────────────────────────────────────────────────────────

class ChatHistoryEntry(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    job_id: str
    question: str
    history: list[ChatHistoryEntry] = []


class SourceChunk(BaseModel):
    chunk_index: int
    content: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]


# ── Export endpoint ───────────────────────────────────────────────────────────

class ExportFormat(str):
    pdf = "pdf"
    txt = "txt"


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
