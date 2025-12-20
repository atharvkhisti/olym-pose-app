"use client";

import { ReactNode } from "react";
import { useWorkoutStore } from "@/store/workout.store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

interface WorkoutLayoutProps {
  children: ReactNode;
}

export function WorkoutLayout({ children }: WorkoutLayoutProps) {
  const { status, errorMessage, isBackendAvailable } = useWorkoutStore();

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="border-b border-surface-200 bg-surface-100/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-content-primary">
                Workout Session
              </h1>
              <p className="text-sm text-content-subtle">
                AI-powered exercise detection and rep counting
              </p>
            </div>
            {/* Backend status indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isBackendAvailable ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">AI Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-content-subtle" />
                  <span className="text-content-subtle">AI Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {status === "error" && errorMessage && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer info */}
      <div className="border-t border-surface-200 bg-surface-100/50">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-content-subtle text-center">
            Position yourself in frame so your full body is visible. For best
            results, ensure good lighting and a clear background.
          </p>
        </div>
      </div>
    </div>
  );
}
