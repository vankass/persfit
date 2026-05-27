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
  WorkoutIntensity,
} from "@/types/workout";

import {
  INTENSITY_LABELS,
  FULL_BODY_ROTATION,
  getMuscleRegion,
  type MuscleRegion,
  BUDGET_MAX_SECONDS,
} from "./constants";
import { getPopularityBonus } from "./exercisePopularity";
import { computeWorkoutDurationMinutes, sumPlannedSeconds } from "./timeUtils";
import { getTargetMuscles, buildPrescription } from "./prescription";

export function getIntensityLabel(intensity: WorkoutIntensity): string {
  return INTENSITY_LABELS[intensity] ?? intensity;
}

export const getSessionLabel = (params: GeneratorParams): string =>
  `Силовая · ${getIntensityLabel(params.intensity)}`;

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

    // Исключаем кардио-активности, оставляем только силовые категории
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

type RegionCounts = Record<MuscleRegion, number>;

const emptyRegionCounts = (): RegionCounts => ({ legs: 0, core: 0, upper: 0 });

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
  const regionCount = emptyRegionCounts();
  let lastForce: string | null = null;
  let muscleIndex = 0;

  // Из пула уже отфильтрованы только силовые упражнения
  const rotationLength = isFullBody
    ? FULL_BODY_ROTATION.length
    : targetMuscles.length;
  const MAX_LOOPS = rotationLength * 4;

  while (picked.length < count && pool.length > 0 && muscleIndex < MAX_LOOPS) {
    const targetMuscle = isFullBody
      ? FULL_BODY_ROTATION[muscleIndex % FULL_BODY_ROTATION.length]
      : targetMuscles[muscleIndex % targetMuscles.length];

    const currentMuscleLimit: number = isFullBody
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
      muscleIndex += 1;
      continue;
    }

    const sorted = [...candidates].sort((a, b) =>
      compareExercises(a, b, params, lastForce)
    );
    const chosen = sorted[0];

    picked.push(chosen);
    lastForce = chosen.force;
    const primary = chosen.primaryMuscles[0];
    muscleCount.set(primary, (muscleCount.get(primary) ?? 0) + 1);
    regionCount[getMuscleRegion(primary)] += 1;
    muscleIndex += 1;
  }

  if (picked.length < count) {
    const remaining = pool
      .filter((ex) => !picked.some((p) => p.id === ex.id))
      .sort((a, b) => compareExercises(a, b, params, lastForce));

    for (const ex of remaining) {
      if (picked.length >= count) break;
      const primary = ex.primaryMuscles[0];

      const currentMuscleLimit: number = isFullBody
        ? 1
        : muscleMaxCounts[primary] ?? 1;
      if ((muscleCount.get(primary) ?? 0) >= currentMuscleLimit) continue;

      picked.push(ex);
      muscleCount.set(primary, (muscleCount.get(primary) ?? 0) + 1);
      regionCount[getMuscleRegion(primary)] += 1;
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

  for (const next of fullPickedList) {
    const trialPlanned = buildPlannedExercises(
      [...picked, next],
      params,
      profile.level
    );
    const totalIfAdded = sumPlannedSeconds(trialPlanned, params.intensity);

    if (picked.length > 0 && totalIfAdded > BUDGET_MAX_SECONDS) break;
    if (picked.length < maxExercises) picked.push(next);
  }

  const rawPlanned = buildPlannedExercises(picked, params, profile.level);
  const sortedPlanned = sortPlannedExercises(rawPlanned);

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


const MINOR_MUSCLES: MuscleGroup[] = [
  "triceps",
  "biceps",
  "forearms",
  "calves",
  "abdominals",
  "shoulders",
];

interface TargetLimits {
  maxExercises: number;
  muscleMaxCounts: Partial<Record<MuscleGroup, number>>;
}

function calculateTargetLimits(
  params: GeneratorParams,
  targetMuscles: MuscleGroup[]
): TargetLimits {
  if (["full_body", "upper", "lower"].includes(params.focus)) {
    const limits: Partial<Record<MuscleGroup, number>> = {};
    const defaultLimit = params.focus === "full_body" ? 1 : 2;

    targetMuscles.forEach((m) => {
      limits[m] = defaultLimit;
    });
    return { maxExercises: 5, muscleMaxCounts: limits };
  }

  const muscleMaxCounts: Partial<Record<MuscleGroup, number>> = {};
  const majorSelected = targetMuscles.filter((m) => !MINOR_MUSCLES.includes(m));
  const minorSelected = targetMuscles.filter((m) => MINOR_MUSCLES.includes(m));

  if (targetMuscles.length === 1) {
    const singleMuscle = targetMuscles[0];
    const count = MINOR_MUSCLES.includes(singleMuscle) ? 2 : 3;
    muscleMaxCounts[singleMuscle] = count;
    return { maxExercises: count, muscleMaxCounts };
  }

  const minorAllocatedCount =
    majorSelected.length > 0 && minorSelected.length > 1 ? 1 : 2;
  let totalCalculated = 0;

  majorSelected.forEach((m) => {
    muscleMaxCounts[m] = 3;
    totalCalculated += 3;
  });

  minorSelected.forEach((m) => {
    muscleMaxCounts[m] = minorAllocatedCount;
    totalCalculated += minorAllocatedCount;
  });

  return {
    maxExercises: Math.min(totalCalculated, 6),
    muscleMaxCounts,
  };
}

