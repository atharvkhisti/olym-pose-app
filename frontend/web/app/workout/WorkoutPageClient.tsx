"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  WorkoutLayout,
  WorkoutCamera,
  WorkoutStats,
  WorkoutControls,
  ExerciseSelect,
} from "@/components/workout";
import { useWorkoutStore } from "@/store/workout.store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function WorkoutPageClient() {
  const { checkBackendHealth } = useWorkoutStore();

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();

    // Periodically check backend health
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  return (
    <WorkoutLayout>
      {/* Back button */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Main workout area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Camera Section - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exercise Selection */}
          <ExerciseSelect />
          
          <WorkoutCamera />
          <WorkoutControls />
        </div>

        {/* Stats Section - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <h2 className="text-lg font-semibold text-content-primary mb-4">
              Workout Stats
            </h2>
            <WorkoutStats />

            {/* TODO: Add workout history section */}
            {/* TODO: Add charts for session stats */}
          </div>
        </div>
      </div>

      {/* TODO: Add workout summary modal on completion */}
    </WorkoutLayout>
  );
}
