"""FastAPI application."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .router import router
from .infer import classifier


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Try to load models, but don't fail if it doesn't work
    # Health endpoint will report loading status
    try:
        classifier.load()
    except Exception as e:
        import logging
        logging.error(f"Model loading failed during startup: {e}")
        # Continue anyway - health endpoint will show "loading" status
    yield


app = FastAPI(title="Exercise Classifier", lifespan=lifespan)

# Enable CORS for frontend
# In production, set CORS_ORIGINS env var to comma-separated list of allowed origins
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health_check():
    """Health check endpoint for Docker/load balancer."""
    return {"status": "healthy"}
