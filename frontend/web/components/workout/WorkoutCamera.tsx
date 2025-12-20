"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useWorkoutStore } from "@/store/workout.store";
import { Loader2, VideoOff, Camera as CameraIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// MediaPipe Pose landmark connections for drawing skeleton
const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7], // Face
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10], // Mouth
  [11, 12], // Shoulders
  [11, 13], [13, 15], // Left arm
  [12, 14], [14, 16], // Right arm
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [25, 27], [27, 29], [29, 31], // Left leg
  [24, 26], [26, 28], [28, 30], [30, 32], // Right leg
  [15, 17], [15, 19], [15, 21], [17, 19], // Left hand
  [16, 18], [16, 20], [16, 22], [18, 20], // Right hand
];

type PoseLandmarkerType = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => {
    landmarks: Array<Array<{ x: number; y: number; z: number; visibility?: number }>>;
  };
  close: () => void;
};

export function WorkoutCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarkerType | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastFrameTimeRef = useRef<number>(0);
  const FPS_LIMIT = 15; // Limit to 15 FPS for performance

  const {
    status,
    cameraPermission,
    setCameraPermission,
    sendLandmarks,
    setStatus,
    setError,
  } = useWorkoutStore();

  // Use ref to access latest status without causing re-renders
  const statusRef = useRef(status);
  statusRef.current = status;

  // Draw landmarks on canvas
  const drawPose = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>,
      width: number,
      height: number
    ) => {
      // Draw connections
      ctx.strokeStyle = "rgba(99, 102, 241, 0.6)";
      ctx.lineWidth = 3;

      for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        
        if (start && end && (start.visibility || 0) > 0.5 && (end.visibility || 0) > 0.5) {
          ctx.beginPath();
          ctx.moveTo(start.x * width, start.y * height);
          ctx.lineTo(end.x * width, end.y * height);
          ctx.stroke();
        }
      }

      // Draw landmarks
      for (const landmark of landmarks) {
        if ((landmark.visibility || 0) > 0.5) {
          ctx.fillStyle = "rgba(139, 92, 246, 0.9)";
          ctx.beginPath();
          ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.strokeStyle = "rgba(99, 102, 241, 0.9)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    },
    []
  );

  // Detection loop - runs continuously once initialized
  useEffect(() => {
    if (!isInitialized) return;

    let frameId: number | null = null;
    let lastTime = 0;
    const frameInterval = 1000 / FPS_LIMIT;

    const detectLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const poseLandmarker = poseLandmarkerRef.current;

      if (!video || !canvas || !ctx || !poseLandmarker || video.readyState < 2) {
        frameId = requestAnimationFrame(detectLoop);
        return;
      }

      const now = performance.now();
      const elapsed = now - lastTime;

      if (elapsed < frameInterval) {
        frameId = requestAnimationFrame(detectLoop);
        return;
      }

      lastTime = now - (elapsed % frameInterval);

      // Set canvas size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear and draw video (mirrored)
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      try {
        // Detect pose
        const result = poseLandmarker.detectForVideo(video, now);

        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];

          // Draw pose on mirrored canvas
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          drawPose(ctx, landmarks, canvas.width, canvas.height);
          ctx.restore();

          // Send landmarks to backend (only when detecting)
          if (statusRef.current === "detecting") {
            const formattedLandmarks = landmarks.map((lm) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility || 0,
            }));
            sendLandmarks(formattedLandmarks);
          }
        }
      } catch (error) {
        console.error("Pose detection error:", error);
      }

      frameId = requestAnimationFrame(detectLoop);
    };

    frameId = requestAnimationFrame(detectLoop);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isInitialized, drawPose, sendLandmarks]);

  // Initialize MediaPipe Pose Landmarker
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setIsLoading(true);

      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setCameraPermission("granted");

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });

        // Dynamic import of MediaPipe Tasks Vision
        const { PoseLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );

        // Initialize vision
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        // Create pose landmarker
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (!isMounted) {
          poseLandmarker.close();
          return;
        }

        poseLandmarkerRef.current = poseLandmarker;

        setIsLoading(false);
        setIsInitialized(true);
        setStatus("idle");
      } catch (error) {
        console.error("Initialization failed:", error);
        if (isMounted) {
          if (error instanceof Error && error.name === "NotAllowedError") {
            setCameraPermission("denied");
            setError("Camera access denied. Please enable camera permissions.");
          } else {
            setError(`Failed to initialize: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
          setIsLoading(false);
        }
      }
    };

    initialize();

    // Cleanup
    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setCameraPermission, setStatus, setError]);

  // Permission denied state
  if (cameraPermission === "denied") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-surface-100 to-surface-200 border border-surface-200">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-content-subtle">
          <VideoOff className="h-16 w-16" />
          <p className="text-lg font-medium">Camera Access Denied</p>
          <p className="text-sm text-center max-w-xs">
            Please enable camera permissions in your browser settings to use
            workout detection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-surface-100 to-surface-200">
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-brand-primary/50 via-brand-secondary/30 to-brand-accent/50">
        <div className="h-full w-full rounded-2xl bg-surface-50 overflow-hidden">
          {/* Loading skeleton */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface-100 z-10">
              <div className="relative">
                <CameraIcon className="h-16 w-16 text-content-subtle" />
                <Loader2 className="absolute -bottom-2 -right-2 h-8 w-8 animate-spin text-brand-primary" />
              </div>
              <p className="text-content-subtle animate-pulse">
                Initializing camera & AI model...
              </p>
            </div>
          )}

          {/* Hidden video for camera input */}
          <video
            ref={videoRef}
            className="hidden"
            autoPlay
            playsInline
            muted
          />

          {/* Canvas for rendering pose */}
          <canvas
            ref={canvasRef}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-500",
              isLoading ? "opacity-0" : "opacity-100"
            )}
          />

          {/* Status indicator */}
          {!isLoading && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div
                className={cn(
                  "h-3 w-3 rounded-full animate-pulse",
                  status === "detecting"
                    ? "bg-green-500"
                    : status === "paused"
                      ? "bg-amber-500"
                      : "bg-content-subtle"
                )}
              />
              <span className="text-sm font-medium text-white drop-shadow-lg">
                {status === "detecting"
                  ? "Live"
                  : status === "paused"
                    ? "Paused"
                    : "Ready"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
