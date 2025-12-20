"use client";

import { useWorkoutStore } from "@/store/workout.store";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { useState } from "react";

export function WorkoutControls() {
  const {
    status,
    cameraPermission,
    selectedExercise,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    resetWorkout,
  } = useWorkoutStore();

  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    await resetWorkout();
    setIsResetting(false);
  };

  // Disable if no camera, error, or no exercise selected (for start)
  const isDisabled = cameraPermission !== "granted" || status === "error";
  const canStart = !isDisabled && selectedExercise !== null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* No exercise selected hint */}
      {!selectedExercise && status !== "detecting" && (
        <p className="text-sm text-content-subtle">
          Select an exercise above to start
        </p>
      )}
      
      <div className="flex items-center justify-center gap-4">
        {/* Start/Pause Button */}
        {status === "detecting" ? (
          <Button
            size="lg"
            variant="outline"
            onClick={pauseWorkout}
            disabled={isDisabled}
            className="min-w-[140px] border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
          >
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={status === "paused" ? resumeWorkout : startWorkout}
            disabled={!canStart}
            className="min-w-[140px] bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:opacity-50"
          >
            <Play className="mr-2 h-5 w-5" />
            {status === "paused" ? "Resume" : "Start Workout"}
          </Button>
        )}

        {/* Reset Button */}
        <Button
          size="lg"
          variant="outline"
          onClick={handleReset}
          disabled={isDisabled || isResetting}
          className="min-w-[120px]"
        >
          {isResetting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-5 w-5" />
          )}
          Reset
        </Button>
      </div>
    </div>
  );
}
