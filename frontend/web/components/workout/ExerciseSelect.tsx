"use client";

import { useWorkoutStore, SUPPORTED_EXERCISES, type ExerciseType } from "@/store/workout.store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dumbbell } from "lucide-react";

export function ExerciseSelect() {
  const { selectedExercise, setSelectedExercise, status } = useWorkoutStore();

  // Disable during active workout
  const isDisabled = status === "detecting";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-content-subtle flex items-center gap-2">
        <Dumbbell className="h-4 w-4" />
        Exercise
      </label>
      <Select
        value={selectedExercise || ""}
        onValueChange={(value) => setSelectedExercise(value as ExerciseType)}
        disabled={isDisabled}
      >
        <SelectTrigger
          className="w-full bg-surface-100 border-surface-200 text-content-primary h-12"
        >
          <SelectValue placeholder="Select exercise to begin" />
        </SelectTrigger>
        <SelectContent className="bg-surface-100 border-surface-200">
          {SUPPORTED_EXERCISES.map((exercise) => (
            <SelectItem
              key={exercise.value}
              value={exercise.value}
              className="text-content-primary focus:bg-brand-primary/20 focus:text-content-primary"
            >
              {exercise.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isDisabled && (
        <p className="text-xs text-content-subtle">
          Pause workout to change exercise
        </p>
      )}
    </div>
  );
}
