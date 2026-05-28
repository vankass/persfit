import type {
  GeneratedWorkout,
  PlannedExercise,
  WorkoutFocus,
  WorkoutIntensity,
  WorkoutSetPrescription,
} from "@/types/workout";
import type { ProfileLevel } from "@/types/profile";
import {
  BUDGET_MAX_SECONDS,
  BUDGET_MIN_SECONDS,
  EXERCISE_TRANSITION_SECONDS,
  WORK_PER_SET_SECONDS,
} from "./constants";

export function getSessionBudgetSeconds(
  intensity: WorkoutIntensity,
  focus: WorkoutFocus,
  level: ProfileLevel
): number {
  const baseMinutes = focus === "full_body" ? 50 : focus === "custom" ? 35 : 40;
  let minutes = baseMinutes;

  if (level === "beginner") minutes -= 8;
  if (level === "expert") minutes += 8;
  if (intensity === "high") minutes += 5;
  if (intensity === "low") minutes -= 5;

  return Math.min(
    BUDGET_MAX_SECONDS,
    Math.max(BUDGET_MIN_SECONDS, minutes * 60)
  );
}

export function estimateExerciseSeconds(
  prescription: WorkoutSetPrescription,
  category: string,
  intensity: WorkoutIntensity
): number {
  const { sets, restSeconds } = prescription;
  const isCardio = category === "cardio" || category === "plyometrics";

  const workPerSet = isCardio
    ? intensity === "high"
      ? 30
      : intensity === "low"
      ? 45
      : 40
    : WORK_PER_SET_SECONDS[intensity];

  return (
    sets * workPerSet +
    Math.max(0, sets - 1) * restSeconds +
    EXERCISE_TRANSITION_SECONDS
  );
}

export function computeWorkoutDurationMinutes(
  exercises: PlannedExercise[],
  intensity: WorkoutIntensity
): number {
  if (exercises.length === 0) return 0;

  let totalSeconds = 0;
  exercises.forEach((item, index) => {
    totalSeconds += estimateExerciseSeconds(
      item.prescription,
      item.exercise.category,
      intensity
    );
    if (index > 0) totalSeconds -= EXERCISE_TRANSITION_SECONDS;
  });

  return Math.max(1, Math.round(totalSeconds / 60));
}

export function sumPlannedSeconds(
  planned: PlannedExercise[],
  intensity: WorkoutIntensity
): number {
  return planned.reduce(
    (sum, item) =>
      sum +
      estimateExerciseSeconds(
        item.prescription,
        item.exercise.category,
        intensity
      ),
    0
  );
}

export function recalculateWorkoutDuration(
  workout: GeneratedWorkout
): GeneratedWorkout {
  return {
    ...workout,
    estimatedDurationMinutes: computeWorkoutDurationMinutes(
      workout.exercises,
      workout.params.intensity
    ),
  };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMinutes(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m} мин`;
}
