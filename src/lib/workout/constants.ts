import type { MuscleGroup } from "@/types/exercise";
import type { GeneratorParams, WorkoutIntensity } from "@/types/workout";

export const UPPER_MUSCLES: MuscleGroup[] = ["chest", "shoulders", "lats", "middle back", "lower back", "biceps", "triceps", "traps", "forearms"];
export const LOWER_MUSCLES: MuscleGroup[] = ["quadriceps", "hamstrings", "glutes", "calves", "abdominals", "abductors", "adductors"];
export const FULL_BODY_ROTATION: MuscleGroup[] = ["chest", "lats", "quadriceps", "shoulders", "hamstrings", "abdominals", "glutes", "triceps", "biceps", "calves"];

export const SMALL_MUSCLE_GROUPS: MuscleGroup[] = ["biceps", "triceps", "shoulders", "abdominals", "calves", "forearms"];

export const EXERCISE_TRANSITION_SECONDS = 75; 
export const BUDGET_MIN_SECONDS = 28 * 60;
export const BUDGET_MAX_SECONDS = 65 * 60;

export const WORK_PER_SET_SECONDS: Record<WorkoutIntensity, number> = { low: 40, medium: 45, high: 55 };
export const INTENSITY_LABELS: Record<WorkoutIntensity, string> = { low: "Лёгкая", medium: "Средняя", high: "Высокая" };
export const LOAD_TYPE_LABELS: Record<GeneratorParams["loadType"], string> = { strength: "Силовая", cardio: "Кардио" };

export const DEFAULT_GENERATOR_PARAMS: GeneratorParams = {
  intensity: "medium",
  equipment: ["body only"],
  trainingLocation: "home",
  focus: "full_body",
  loadType: "strength",
};