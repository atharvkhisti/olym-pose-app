"""Request/response schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field


class Landmark(BaseModel):
    x: float = Field(..., ge=0.0, le=1.0)
    y: float = Field(..., ge=0.0, le=1.0)
    visibility: float = Field(default=1.0, ge=0.0, le=1.0)


class AnalyzeRequest(BaseModel):
    landmarks: List[Landmark] = Field(..., min_length=33, max_length=33)
    session_id: str
    exercise: Optional[str] = None


class AnalyzeResponse(BaseModel):
    exercise: str
    confidence: float
    rep_count: int


class ResetRequest(BaseModel):
    session_id: str


class ResetResponse(BaseModel):
    session_id: str
    status: str = "reset"


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
