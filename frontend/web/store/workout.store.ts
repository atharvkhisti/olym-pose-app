import { create } from "zustand";
import { analyzePose, resetRepCount, checkHealth, type Landmark, type AnalyzeResponse } from "@/lib/ai";

// Supported exercises (Phase-1)
export const SUPPORTED_EXERCISES = [
  { value: "pushups", label: "Push-ups" },
  { value: "squats", label: "Squats" },
  { value: "lunges", label: "Lunges" },
  { value: "bicep_curls", label: "Bicep Curls" },
] as const;

export type ExerciseType = (typeof SUPPORTED_EXERCISES)[number]["value"];

export type WorkoutStatus =
  | "idle"
  | "initializing"
  | "detecting"
  | "paused"
  | "error";

export type FeedbackStatus =
  | "Waiting..."
  | "Detecting..."
  | "Hold steady"
  | "Good form"
  | "Adjust position";

interface WorkoutState {
  // Status
  status: WorkoutStatus;
  feedbackStatus: FeedbackStatus;
  errorMessage: string | null;

  // Selected exercise (user picks from dropdown)
  selectedExercise: ExerciseType | null;

  // Detection results (from backend ONLY)
  exercise: string;
  repCount: number;
  confidence: number;

  // Camera state
  cameraPermission: "pending" | "granted" | "denied";
  isBackendAvailable: boolean;

  // Throttle control
  lastAnalysisTime: number;
  analysisInterval: number; // ms between API calls

  // Actions
  setStatus: (status: WorkoutStatus) => void;
  setFeedbackStatus: (status: FeedbackStatus) => void;
  setError: (message: string) => void;
  clearError: () => void;
  setCameraPermission: (permission: "pending" | "granted" | "denied") => void;
  setBackendAvailable: (available: boolean) => void;
  setSelectedExercise: (exercise: ExerciseType | null) => void;

  // Workout actions
  startWorkout: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  resetWorkout: () => Promise<void>;
  checkBackendHealth: () => Promise<void>;

  // Analysis
  sendLandmarks: (landmarks: Landmark[]) => Promise<void>;
  updateFromAnalysis: (response: AnalyzeResponse) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  // Initial state
  status: "idle",
  feedbackStatus: "Waiting...",
  errorMessage: null,

  selectedExercise: null,
  exercise: "—",
  repCount: 0,
  confidence: 0,

  cameraPermission: "pending",
  isBackendAvailable: false,

  lastAnalysisTime: 0,
  analysisInterval: 100, // 10 FPS for API calls

  // Status setters
  setStatus: (status) => set({ status }),
  setFeedbackStatus: (status) => set({ feedbackStatus: status }),

  setError: (message) =>
    set({
      status: "error",
      errorMessage: message,
      feedbackStatus: "Waiting...",
    }),

  clearError: () => set({ errorMessage: null }),

  setCameraPermission: (permission) => set({ cameraPermission: permission }),
  setBackendAvailable: (available) => set({ isBackendAvailable: available }),

  setSelectedExercise: (exercise) => {
    // When exercise changes, reset reps and notify backend
    set({
      selectedExercise: exercise,
      repCount: 0,
      confidence: 0,
      exercise: exercise ? SUPPORTED_EXERCISES.find(e => e.value === exercise)?.label || exercise : "—",
      feedbackStatus: "Waiting...",
    });
    // Reset backend session when exercise changes
    resetRepCount().catch(() => {});
  },

  // Check backend health
  checkBackendHealth: async () => {
    const health = await checkHealth();
    set({ isBackendAvailable: health !== null && health.model_loaded });
  },

  // Workout control
  startWorkout: () => {
    const { selectedExercise } = get();
    if (!selectedExercise) return;
    
    set({
      status: "detecting",
      feedbackStatus: "Detecting...",
      errorMessage: null,
    });
  },

  pauseWorkout: () =>
    set({
      status: "paused",
      feedbackStatus: "Waiting...",
    }),

  resumeWorkout: () =>
    set({
      status: "detecting",
      feedbackStatus: "Detecting...",
    }),

  resetWorkout: async () => {
    try {
      await resetRepCount();
      set({
        repCount: 0,
        confidence: 0,
        feedbackStatus: "Waiting...",
      });
    } catch {
      // Continue even if backend reset fails
      set({
        repCount: 0,
        confidence: 0,
        feedbackStatus: "Waiting...",
      });
    }
  },

  // Send landmarks to backend with throttling
  sendLandmarks: async (landmarks) => {
    const state = get();

    // Don't send if not detecting or no exercise selected
    if (state.status !== "detecting" || !state.selectedExercise) return;

    // Throttle API calls
    const now = Date.now();
    if (now - state.lastAnalysisTime < state.analysisInterval) return;

    set({ lastAnalysisTime: now });

    try {
      const response = await analyzePose(landmarks, state.selectedExercise);
      set({ isBackendAvailable: true });
      get().updateFromAnalysis(response);
    } catch (error) {
      console.error("Analysis error:", error);
      set({ 
        isBackendAvailable: false,
        feedbackStatus: "Hold steady" 
      });
    }
  },

  // Update state from backend response
  updateFromAnalysis: (response) => {
    const feedbackStatus: FeedbackStatus =
      response.confidence > 0.8
        ? "Good form"
        : response.confidence > 0.5
          ? "Hold steady"
          : "Adjust position";

    set({
      exercise: response.exercise || "—",
      repCount: response.rep_count,
      confidence: Math.round(response.confidence * 100),
      feedbackStatus,
    });
  },
}));
