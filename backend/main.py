"""
Smart AI Image Captioning & Visual Understanding Platform
FastAPI entry point - loads all AI models once, then serves requests.
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv()

# ── Import routes ──────────────────────────────────────────────────────────
from routes.upload import router as upload_router
from routes.caption import router as caption_router
from routes.detect import router as detect_router
from routes.ask import router as ask_router
from routes.history import router as history_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Models are imported at module level in models/__init__.py,
    # so they are already loaded when this runs.
    import models  # noqa: F401 – triggers model loading
    yield


app = FastAPI(
    title="Smart AI Image Captioning Platform",
    version="1.0.0",
    description="Advanced visual understanding: captioning, object detection, VQA.",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://*.vercel.app",
        "https://*.hf.space",       # Hugging Face Spaces frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file serving for uploaded images ────────────────────────────────
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Register routers ───────────────────────────────────────────────────────
app.include_router(upload_router)
app.include_router(caption_router)
app.include_router(detect_router)
app.include_router(ask_router)
app.include_router(history_router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Smart AI Caption API is running."}


@app.get("/health")
def health():
    return {"status": "healthy"}
