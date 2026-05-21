import type { Exercise } from "@/types/exercise";
import type { ExerciseLevel } from "@/types/profile";
import { getAllowedExerciseLevels } from "@/types/profile";

const LEVEL_ORDER: ExerciseLevel[] = [
  "beginner",
  "intermediate",
  "expert",
];

function levelDistance(a: ExerciseLevel, b: ExerciseLevel): number {
  return Math.abs(LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
}

function sharesPrimaryMuscle(a: Exercise, b: Exercise): boolean {
  return a.primaryMuscles.some((m) => b.primaryMuscles.includes(m));
}

function mechanicScore(a: Exercise, b: Exercise): number {
  if (a.mechanic === b.mechanic) return 0;
  if (a.mechanic == null || b.mechanic == null) return 1;
  return 2;
}

function forceScore(a: Exercise, b: Exercise): number {
  if (a.force === b.force) return 0;
  if (a.force == null || b.force == null) return 1;
  return 2;
}

export function getAlternatives(
  exercise: Exercise,
  pool: Exercise[],
  excludeIds: Set<string>,
  limit = 5
): Exercise[] {
  const candidates = pool.filter(
    (ex) =>
      ex.id !== exercise.id &&
      !excludeIds.has(ex.id) &&
      sharesPrimaryMuscle(ex, exercise)
  );

  const sorted = [...candidates].sort((a, b) => {
    const equipA = a.equipment === exercise.equipment ? 0 : 1;
    const equipB = b.equipment === exercise.equipment ? 0 : 1;
    if (equipA !== equipB) return equipA - equipB;

    const mechA = mechanicScore(a, exercise);
    const mechB = mechanicScore(b, exercise);
    if (mechA !== mechB) return mechA - mechB;

    const forceA = forceScore(a, exercise);
    const forceB = forceScore(b, exercise);
    if (forceA !== forceB) return forceA - forceB;

    const levelA = levelDistance(a.level, exercise.level);
    const levelB = levelDistance(b.level, exercise.level);
    return levelA - levelB;
  });

  return sorted.slice(0, limit);
}

export function buildCandidatePoolForAlternatives(
  allExercises: Exercise[],
  profileLevel: Parameters<typeof getAllowedExerciseLevels>[0],
  equipmentFilter: string[]
): Exercise[] {
  const allowedLevels = getAllowedExerciseLevels(profileLevel);

  return allExercises.filter((ex) => {
    if (!allowedLevels.includes(ex.level)) return false;
    if (ex.primaryMuscles.includes("neck")) return false;
    if (
      equipmentFilter.length > 0 &&
      ex.equipment &&
      !equipmentFilter.includes(ex.equipment)
    ) {
      return false;
    }
    return true;
  });
}
