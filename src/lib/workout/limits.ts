import type { MuscleGroup } from "@/types/exercise";
import type { GeneratorParams } from "@/types/workout";

export function calculateTargetLimits(
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

interface TargetLimits {
  maxExercises: number;
  muscleMaxCounts: Partial<Record<MuscleGroup, number>>;
}

const MINOR_MUSCLES: MuscleGroup[] = [
  "triceps",
  "biceps",
  "forearms",
  "calves",
  "abdominals",
  "shoulders",
];
