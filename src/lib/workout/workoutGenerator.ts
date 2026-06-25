import type { Exercise, MuscleGroup } from "@/types/exercise";
import {
  getAllowedExerciseLevels,
  type ProfileLevel,
  type UserProfile,
} from "@/types/profile";
import type {
  GeneratedWorkout,
  GeneratorParams,
  PlannedExercise,
} from "@/types/workout";

import {
  BUDGET_MAX_SECONDS,
  FULL_BODY_ROTATION,
  getMuscleRegion,
  type MuscleRegion,
} from "./constants";
import { getPopularityBonus } from "./exercisePopularity";
import { getTargetMuscles, buildPrescription } from "./prescription";
import { computeWorkoutDurationMinutes, sumPlannedSeconds } from "./timeUtils";
import { calculateTargetLimits } from "./limits";

type RegionCounts = Record<MuscleRegion, number>;

export function generateWorkout(
  allExercises: Exercise[],
  profile: UserProfile,
  params: GeneratorParams
): GeneratedWorkout {
  const pool = filterExercises(allExercises, profile, params);

  const targetMuscles = getTargetMuscles(params);
  const { maxExercises, muscleMaxCounts } = calculateTargetLimits(
    params,
    targetMuscles
  );

  const fullPickedList = pickMainExercises(
    pool,
    maxExercises,
    params,
    muscleMaxCounts
  );

  const picked: Exercise[] = [];
  let finalPlanned: PlannedExercise[] = [];

  for (const next of fullPickedList) {
    const trialPlanned = buildPlannedExercises(
      [...picked, next],
      params,
      profile.level
    );
    
    const totalIfAdded = sumPlannedSeconds(trialPlanned, params.intensity);

    if (picked.length > 0 && totalIfAdded > BUDGET_MAX_SECONDS) break;

    if (picked.length < maxExercises) {
      picked.push(next);
      finalPlanned = trialPlanned;
    }
  }

  const sortedPlanned = sortPlannedExercises(finalPlanned);

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    params,
    profileSnapshot: profile,
    exercises: sortedPlanned,
    estimatedDurationMinutes: computeWorkoutDurationMinutes(
      sortedPlanned,
      params.intensity
    ),
  };
}

function pickMainExercises(
  pool: Exercise[],
  count: number,
  params: GeneratorParams,
  muscleMaxCounts: Partial<Record<MuscleGroup, number>>
): Exercise[] {
  const targetMuscles = getTargetMuscles(params);
  const isFullBody = params.focus === "full_body";
  const picked: Exercise[] = [];
  const muscleCount = new Map<MuscleGroup, number>();
  const regionCount = { legs: 0, core: 0, upper: 0 };
  let lastForce: string | null = null;

  let loopCounter = 0;
  const rotation = isFullBody ? FULL_BODY_ROTATION : targetMuscles;

  while (picked.length < count && pool.length > 0 && loopCounter < 100) {
    const targetMuscle = rotation[loopCounter % rotation.length];
    const currentMuscleLimit = isFullBody
      ? 1
      : muscleMaxCounts[targetMuscle] ?? 2;

    const candidates = pool.filter((ex) => {
      if (picked.some((p) => p.id === ex.id)) return false;
      if (!ex.primaryMuscles.includes(targetMuscle)) return false;
      if ((muscleCount.get(targetMuscle) ?? 0) >= currentMuscleLimit)
        return false;
      if (isFullBody && !passesFullBodyRegionCap(ex, regionCount)) return false;
      return true;
    });

    if (candidates.length === 0) {
      loopCounter += 1;
      if (loopCounter > rotation.length * 2 && picked.length === 0) break;
      continue;
    }

    const chosen = [...candidates].sort((a, b) =>
      compareExercises(a, b, params, lastForce)
    )[0];

    picked.push(chosen);
    lastForce = chosen.force;
    const primary = chosen.primaryMuscles[0];
    muscleCount.set(primary, (muscleCount.get(primary) ?? 0) + 1);
    regionCount[getMuscleRegion(primary)] += 1;
    loopCounter += 1;
  }

  if (picked.length < count) {
    const remaining = pool
      .filter((ex) => !picked.some((p) => p.id === ex.id))
      .sort((a, b) => compareExercises(a, b, params, lastForce));

    for (const ex of remaining) {
      if (picked.length >= count) break;
      const primary = ex.primaryMuscles[0];
      const currentMuscleLimit = isFullBody ? 1 : muscleMaxCounts[primary] ?? 1;

      if ((muscleCount.get(primary) ?? 0) >= currentMuscleLimit) continue;

      picked.push(ex);
      muscleCount.set(primary, (muscleCount.get(primary) ?? 0) + 1);
    }
  }

  return picked;
}

function buildPlannedExercises(
  exercises: Exercise[],
  params: GeneratorParams,
  level: ProfileLevel
): PlannedExercise[] {
  return exercises.map((ex, index) => ({
    exercise: ex,
    prescription: buildPrescription("strength", params.intensity, level, ex),
    order: index,
  }));
}

function sortPlannedExercises(planned: PlannedExercise[]): PlannedExercise[] {
  return [...planned]
    .sort((a, b) => {
      if (
        a.exercise.mechanic === "compound" &&
        b.exercise.mechanic === "isolation"
      )
        return -1;
      if (
        a.exercise.mechanic === "isolation" &&
        b.exercise.mechanic === "compound"
      )
        return 1;
      return 0;
    })
    .map((item, index) => ({ ...item, order: index }));
}

function filterExercises(
  all: Exercise[],
  profile: UserProfile,
  params: GeneratorParams
): Exercise[] {
  const allowedLevels = getAllowedExerciseLevels(profile.level);
  const targetMuscles = getTargetMuscles(params);

  return all.filter((ex) => {
    if (!allowedLevels.includes(ex.level)) return false;
    if (ex.primaryMuscles.includes("neck") || ex.category === "stretching")
      return false;
    if (!["strength", "powerlifting"].includes(ex.category)) return false;

    if (
      params.equipment.length > 0 &&
      ex.equipment &&
      !params.equipment.includes(ex.equipment)
    ) {
      return false;
    }

    if (params.focus !== "full_body") {
      if (!ex.primaryMuscles.some((m) => targetMuscles.includes(m)))
        return false;
    }
    return true;
  });
}

function scoreExercise(
  ex: Exercise,
  params: GeneratorParams,
  lastForce: string | null
): number {
  let score = 0;
  if (params.intensity === "high" && ex.mechanic === "compound") score += 3;
  else if (ex.mechanic === "compound") score += 1;
  if (ex.force && ex.force !== lastForce) score += 2;

  if (params.trainingLocation === "gym") {
    if (ex.equipment === "barbell") score += 6;
    if (ex.equipment === "machine") score += 5;
    if (ex.equipment === "dumbbell") score += 5;
    if (ex.equipment === "body only") score -= 4;
  } else if (params.trainingLocation === "home") {
    if (ex.equipment === "body only") score += 5;
    if (ex.equipment === "bands") score += 4;
    if (ex.equipment === "dumbbell") score += 3;
  }

  score += getPopularityBonus(ex.id);
  return score;
}

function passesFullBodyRegionCap(
  ex: Exercise,
  regionCount: RegionCounts
): boolean {
  const region = getMuscleRegion(ex.primaryMuscles[0]);
  if (region === "legs" && regionCount.legs >= 1) return false;
  if (region === "core" && regionCount.core >= 1) return false;
  return true;
}

const compareExercises = (
  a: Exercise,
  b: Exercise,
  params: GeneratorParams,
  lastForce: string | null
) => scoreExercise(b, params, lastForce) - scoreExercise(a, params, lastForce);
