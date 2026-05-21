import type { Exercise, MuscleGroup } from "./exercise";
import type { UserProfile } from "./profile";

export type WorkoutGoal = "strength" | "fat_loss" | "endurance" | "general";
export type WorkoutFocus = "full_body" | "upper" | "lower" | "custom";
export type LoadType = "strength" | "cardio" | "stretching" | "mixed";

export interface GeneratorParams {
  goal: WorkoutGoal;
  durationMinutes: 20 | 40 | 60;
  equipment: string[];
  focus: WorkoutFocus;
  targetMuscles?: MuscleGroup[];
  loadType: LoadType;
  includeWarmup?: boolean;
  includeCooldown?: boolean;
}

export interface WorkoutSetPrescription {
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface PlannedExercise {
  exercise: Exercise;
  prescription: WorkoutSetPrescription;
  order: number;
}

export interface GeneratedWorkout {
  id: string;
  createdAt: string;
  params: GeneratorParams;
  profileSnapshot: UserProfile;
  exercises: PlannedExercise[];
}

export interface CompletedSet {
  setIndex: number;
  completed: boolean;
}

export interface WorkoutHistoryEntry {
  id: string;
  startedAt: string;
  finishedAt: string;
  planned: GeneratedWorkout;
  completedExercises: {
    exerciseId: string;
    sets: CompletedSet[];
  }[];
  totalDurationSeconds: number;
}

export type GeneratorPhase = "wizard" | "plan" | "active" | "summary";
