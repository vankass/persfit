import type { Exercise, MuscleGroup } from "./exercise";
import type { UserProfile } from "./profile";

/** @deprecated legacy history entries */
export type LegacyWorkoutGoal = "strength" | "fat_loss" | "endurance" | "general";

export type WorkoutIntensity = "low" | "medium" | "high";
export type WorkoutFocus = "full_body" | "upper" | "lower" | "custom";
export type LoadType = "strength" | "cardio";
export type TrainingLocation = "home" | "gym";

/** @deprecated legacy history entries */
export type LegacyLoadType = LoadType | "stretching" | "mixed";

export type SessionPhase = "warmup" | "workout" | "cooldown";

export interface GeneratorParams {
  intensity: WorkoutIntensity;
  equipment: string[];
  trainingLocation: TrainingLocation;
  focus: WorkoutFocus;
  targetMuscles?: MuscleGroup[];
  loadType: LoadType;
}

/** @deprecated stored in old history snapshots */
export interface LegacyGeneratorParams {
  goal?: LegacyWorkoutGoal;
  durationMinutes?: 20 | 40 | 60;
  intensity?: WorkoutIntensity;
  equipment?: string[];
  focus?: WorkoutFocus;
  targetMuscles?: MuscleGroup[];
  loadType?: LoadType;
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
  estimatedDurationMinutes: number;
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
