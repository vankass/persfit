import type { Exercise, MuscleGroup } from "@/types/exercise";
import type { GeneratorParams, WorkoutIntensity, WorkoutSetPrescription } from "@/types/workout";
import type { ProfileLevel } from "@/types/profile";
import { SMALL_MUSCLE_GROUPS, UPPER_MUSCLES, LOWER_MUSCLES, FULL_BODY_ROTATION } from "./constants";

export function getTargetMuscles(params: GeneratorParams): MuscleGroup[] {
  if (params.focus === "upper") return UPPER_MUSCLES;
  if (params.focus === "lower") return LOWER_MUSCLES;
  if (params.focus === "custom" && params.targetMuscles?.length) return params.targetMuscles;
  return FULL_BODY_ROTATION;
}

export function buildPrescription(
  loadType: GeneratorParams["loadType"], 
  intensity: WorkoutIntensity, 
  profileLevel: ProfileLevel, 
  exercise: Exercise
): WorkoutSetPrescription {
  const category = exercise.category;
  const primaryMuscle = exercise.primaryMuscles[0];

  if (category === "cardio" || category === "plyometrics" || loadType === "cardio") {
    const cardioPresets: Record<WorkoutIntensity, WorkoutSetPrescription> = {
      low: { sets: 3, reps: "40-50 сек", restSeconds: 40 },
      medium: { sets: 3, reps: "30-45 сек", restSeconds: 30 },
      high: { sets: 4, reps: "20-30 сек", restSeconds: 20 },
    };
    const base = { ...cardioPresets[intensity] };
    if (profileLevel === "beginner" && base.sets > 2) base.sets -= 1;
    if (profileLevel === "expert" && base.sets < 5) base.sets += 1;
    return base;
  }

  const isSmallMuscle = primaryMuscle && SMALL_MUSCLE_GROUPS.includes(primaryMuscle);
  const isIsolation = exercise.mechanic === "isolation";

  if (isSmallMuscle || isIsolation) {
    const isolationPresets: Record<WorkoutIntensity, WorkoutSetPrescription> = {
      low: { sets: 3, reps: "15-20", restSeconds: 45 },
      medium: { sets: 3, reps: "10-12", restSeconds: 60 },
      high: { sets: 3, reps: "8-10", restSeconds: 75 },
    };
    const base = { ...isolationPresets[intensity] };
    if (profileLevel === "beginner" && base.sets > 2) base.sets -= 1;
    if (profileLevel === "expert" && base.sets < 5) base.sets += 1;
    return base;
  }

  const strengthPresets: Record<WorkoutIntensity, WorkoutSetPrescription> = {
    low: { sets: 3, reps: "12-15", restSeconds: 60 },
    medium: { sets: 3, reps: "8-12", restSeconds: 90 },
    high: { sets: 4, reps: "4-6", restSeconds: 120 },
  };

  const base = { ...strengthPresets[intensity] };
  if (profileLevel === "beginner" && base.sets > 2) base.sets -= 1;
  if (profileLevel === "expert" && base.sets < 5) base.sets += 1;

  return base;
}