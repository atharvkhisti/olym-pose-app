/**
 * AI Service Communication Utility
 * Handles all communication with the FastAPI AI backend
 */

// Types for landmark data sent to backend
export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface AnalyzePayload {
  landmarks: Array<{ x: number; y: number; visibility: number }>;
  session_id: string;
  exercise: string | null;
}

// Types for backend response
export interface AnalyzeResponse {
  exercise: string;
  confidence: number;
  rep_count: number;
}

export interface ResetResponse {
  session_id: string;
  status: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
}

// Error types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

const AI_SERVICE_URL =
  process.env.NEXT_PUBLIC_AI_SERVICE_URL || "/api";

// Session ID for this browser session
let sessionId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  return sessionId;
}

/**
 * Send landmarks to backend for analysis
 */
export async function analyzePose(
  landmarks: Landmark[],
  exercise: string | null
): Promise<AnalyzeResponse> {
  // Convert landmarks to backend format (33 landmarks, x, y, visibility only)
  const formattedLandmarks = landmarks.slice(0, 33).map((lm) => ({
    x: Math.max(0, Math.min(1, lm.x)),
    y: Math.max(0, Math.min(1, lm.y)),
    visibility: Math.max(0, Math.min(1, lm.visibility)),
  }));

  const payload: AnalyzePayload = {
    landmarks: formattedLandmarks,
    session_id: getSessionId(),
    exercise,
  };

  try {
    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new AIServiceError(
        `AI service error: ${response.statusText}`,
        response.status
      );
    }

    const data: AnalyzeResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError(
      error instanceof Error ? error.message : "Failed to connect to AI service"
    );
  }
}

/**
 * Reset rep count on backend
 */
export async function resetRepCount(): Promise<ResetResponse> {
  const payload = {
    session_id: getSessionId(),
  };

  try {
    const response = await fetch(`${AI_SERVICE_URL}/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new AIServiceError(
        `AI service error: ${response.statusText}`,
        response.status
      );
    }

    const data: ResetResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError(
      error instanceof Error ? error.message : "Failed to reset rep count"
    );
  }
}

/**
 * Check if AI service is available
 */
export async function checkHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      method: "GET",
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}
