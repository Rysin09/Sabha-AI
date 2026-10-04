"""
backend/main.py
────────────────
Sabha-AI FastAPI application entry point.

Run with:
    uvicorn backend.main:app --reload --port 8000
"""
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load .env before anything else so all os.getenv() calls across modules work
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import process, jobs, meeting, chat, export


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    # Ensure upload directory exists
    upload_dir = os.getenv("UPLOAD_DIR", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    print(f"Sabha-AI backend started. Upload dir: {upload_dir}")
    yield
    print("Sabha-AI backend shutting down.")


app = FastAPI(
    title="Sabha AI",
    description="AI-powered meeting intelligence API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(process.router)
app.include_router(jobs.router)
app.include_router(meeting.router)
app.include_router(chat.router)
app.include_router(export.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "version": "1.0.0"}
