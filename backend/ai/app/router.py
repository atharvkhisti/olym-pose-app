"""API endpoints."""

from fastapi import APIRouter, HTTPException

from .schemas import AnalyzeRequest, AnalyzeResponse, ResetRequest, ResetResponse, HealthResponse
from .infer import classifier
from .rep_counter import sessions

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    if not classifier.is_loaded:
        raise HTTPException(503, "Model not loaded")
    
    exercise, confidence, rep_count = classifier.predict(
        req.landmarks, req.session_id, req.exercise
    )
    return AnalyzeResponse(exercise=exercise, confidence=confidence, rep_count=rep_count)


@router.post("/reset", response_model=ResetResponse)
def reset(req: ResetRequest) -> ResetResponse:
    sessions.reset(req.session_id)
    return ResetResponse(session_id=req.session_id)


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Health check endpoint for Docker/load balancer."""
    model_status = "loaded" if classifier.is_loaded else "not_loaded"
    return HealthResponse(
        status="ok" if classifier.is_loaded else "loading",
        model_loaded=classifier.is_loaded,
        model_status=model_status
    )
