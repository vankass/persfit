import type { Exercise, MuscleGroup } from "@/types/exercise";
import { getAllowedExerciseLevels, type ProfileLevel, type UserProfile } from "@/types/profile";
import type { GeneratedWorkout, GeneratorParams, PlannedExercise, WorkoutIntensity } from "@/types/workout";

import { INTENSITY_LABELS, LOAD_TYPE_LABELS, FULL_BODY_ROTATION } from "./constants";
import { getSessionBudgetSeconds, computeWorkoutDurationMinutes, sumPlannedSeconds } from "./timeUtils";
import { getTargetMuscles, buildPrescription } from "./prescription";

export function getIntensityLabel(intensity: WorkoutIntensity): string {
  return INTENSITY_LABELS[intensity] ?? intensity;
}

export function getLoadTypeLabel(loadType: GeneratorParams["loadType"]): string {
  return LOAD_TYPE_LABELS[loadType] ?? loadType;
}

export const getSessionLabel = (params: GeneratorParams): string => `${getLoadTypeLabel(params.loadType)} · ${getIntensityLabel(params.intensity)}`;

export function recalculateWorkoutDuration(workout: GeneratedWorkout): GeneratedWorkout {
  return { ...workout, estimatedDurationMinutes: computeWorkoutDurationMinutes(workout.exercises, workout.params.intensity) };
}

export function filterExercises(all: Exercise[], profile: UserProfile, params: GeneratorParams): Exercise[] {
  const allowedLevels = getAllowedExerciseLevels(profile.level);
  const categories = params.loadType === "cardio" ? ["cardio", "plyometrics"] : ["strength", "powerlifting"];
  const targetMuscles = getTargetMuscles(params);

  return all.filter((ex) => {
    if (!allowedLevels.includes(ex.level)) return false;
    if (ex.primaryMuscles.includes("neck") || ex.category === "stretching") return false;
    if (profile.age >= 50 && (ex.category === "plyometrics" || ex.category === "strongman")) return false;
    if (!categories.includes(ex.category)) return false;
    if (params.equipment.length > 0 && ex.equipment && !params.equipment.includes(ex.equipment)) return false;

    if (params.focus !== "full_body") {
      if (!ex.primaryMuscles.some((m) => targetMuscles.includes(m))) return false;
    }
    return true;
  });
}

function scoreExercise(ex: Exercise, params: GeneratorParams, lastForce: string | null): number {
  let score = 0;
  if (params.loadType === "strength" && params.intensity === "high" && ex.mechanic === "compound") score += 3;
  else if (ex.mechanic === "compound") score += 1;
  if (ex.force && ex.force !== lastForce) score += 2;
  return score;
}

function pickMainExercises(pool: Exercise[], count: number, params: GeneratorParams): Exercise[] {
  const targetMuscles = getTargetMuscles(params);
  const picked: Exercise[] = [];
  const muscleCount = new Map<MuscleGroup, number>();
  let lastForce: string | null = null;
  let muscleIndex = 0;

  const available = pool.filter((ex) => {
    const isCardioBehavior = ex.category === "cardio" || ex.category === "plyometrics";
    return params.loadType === "cardio" ? isCardioBehavior : !isCardioBehavior;
  });

  while (picked.length < count && available.length > 0) {
    const targetMuscle = params.focus === "full_body"
        ? FULL_BODY_ROTATION[muscleIndex % FULL_BODY_ROTATION.length]
        : targetMuscles[muscleIndex % targetMuscles.length];

    const candidates = available.filter((ex) => {
      if (picked.some((p) => p.id === ex.id)) return false;
      if (!ex.primaryMuscles.includes(targetMuscle)) return false;
      return (muscleCount.get(targetMuscle) ?? 0) < 2;
    });

    if (candidates.length === 0) {
      muscleIndex += 1;
      if (muscleIndex > targetMuscles.length * 3) break;
      continue;
    }

    const sorted = [...candidates].sort((a, b) => scoreExercise(b, params, lastForce) - scoreExercise(a, params, lastForce));
    const chosen = sorted[0];
    
    picked.push(chosen);
    lastForce = chosen.force;
    muscleCount.set(chosen.primaryMuscles[0], (muscleCount.get(chosen.primaryMuscles[0]) ?? 0) + 1);
    muscleIndex += 1;
  }

  if (picked.length < count) {
    const remaining = available
      .filter((ex) => !picked.some((p) => p.id === ex.id))
      .sort((a, b) => scoreExercise(b, params, lastForce) - scoreExercise(a, params, lastForce));
      
    for (const ex of remaining) {
      if (picked.length >= count) break;
      const primary = ex.primaryMuscles[0];
      if ((muscleCount.get(primary) ?? 0) >= 2) continue;
      picked.push(ex);
      muscleCount.set(primary, (muscleCount.get(primary) ?? 0) + 1);
    }
  }

  return picked;
}

function buildPlannedExercises(exercises: Exercise[], params: GeneratorParams, level: ProfileLevel): PlannedExercise[] {
  return exercises.map((ex, index) => ({
    exercise: ex,
    prescription: buildPrescription(params.loadType, params.intensity, level, ex),
    order: index,
  }));
}

function sortPlannedExercises(planned: PlannedExercise[]): PlannedExercise[] {
  return [...planned].sort((a, b) => {
    if (a.exercise.mechanic === "compound" && b.exercise.mechanic === "isolation") return -1;
    if (a.exercise.mechanic === "isolation" && b.exercise.mechanic === "compound") return 1;
    return 0;
  }).map((item, index) => ({ ...item, order: index }));
}

export function generateWorkout(allExercises: Exercise[], profile: UserProfile, params: GeneratorParams): GeneratedWorkout {
  const pool = filterExercises(allExercises, profile, params);
  const budgetSeconds = getSessionBudgetSeconds(params.intensity, params.focus, profile.level);
  const maxExercises = params.focus === "full_body" ? 6 : 5;

  const picked: Exercise[] = [];

  while (picked.length < maxExercises) {
    const next = pickMainExercises(pool, picked.length + 1, params)[picked.length] ?? null;
    if (!next) break;

    const trialPlanned = buildPlannedExercises([...picked, next], params, profile.level);
    const totalIfAdded = sumPlannedSeconds(trialPlanned, params.intensity);

    if (picked.length > 0 && totalIfAdded > budgetSeconds) break; 
    picked.push(next);
  }

  const rawPlanned = buildPlannedExercises(picked, params, profile.level);
  const sortedPlanned = sortPlannedExercises(rawPlanned);

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    params,
    profileSnapshot: profile,
    exercises: sortedPlanned,
    estimatedDurationMinutes: computeWorkoutDurationMinutes(sortedPlanned, params.intensity),
  };
}

export { DEFAULT_GENERATOR_PARAMS } from "./constants";