"use client";

import { useWorkoutStore } from "@/store/workout.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkoutStats() {
  const { exercise, repCount, confidence, feedbackStatus } = useWorkoutStore();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Exercise Card */}
      <Card className="col-span-2 bg-gradient-to-br from-surface-100 to-surface-200 border-surface-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-content-subtle flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Current Exercise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-content-primary capitalize">
            {exercise}
          </p>
        </CardContent>
      </Card>

      {/* Rep Count Card */}
      <Card className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border-brand-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-content-subtle flex items-center gap-2">
            <Target className="h-4 w-4 text-brand-primary" />
            Reps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold text-brand-primary tabular-nums">
            {repCount}
          </p>
        </CardContent>
      </Card>

      {/* Confidence Card */}
      <Card className="bg-gradient-to-br from-surface-100 to-surface-200 border-surface-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-content-subtle flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-bold text-content-primary tabular-nums">
              {confidence}
            </p>
            <span className="text-lg text-content-subtle">%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-surface-200 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300 ease-out",
                confidence > 80
                  ? "bg-green-500"
                  : confidence > 50
                    ? "bg-amber-500"
                    : "bg-red-500"
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Feedback Status Card */}
      <Card className="col-span-2 bg-gradient-to-br from-surface-100 to-surface-200 border-surface-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-content-subtle flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                feedbackStatus === "Good form"
                  ? "bg-green-500 animate-pulse"
                  : feedbackStatus === "Hold steady"
                    ? "bg-amber-500 animate-pulse"
                    : feedbackStatus === "Detecting..."
                      ? "bg-blue-500 animate-pulse"
                      : "bg-content-subtle"
              )}
            />
            <p
              className={cn(
                "text-xl font-semibold",
                feedbackStatus === "Good form"
                  ? "text-green-500"
                  : feedbackStatus === "Hold steady"
                    ? "text-amber-500"
                    : feedbackStatus === "Detecting..."
                      ? "text-blue-500"
                      : "text-content-subtle"
              )}
            >
              {feedbackStatus}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
