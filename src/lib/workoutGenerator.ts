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
  WorkoutGoal,
  WorkoutSetPrescription,
} from "@/types/workout";

const UPPER_MUSCLES: MuscleGroup[] = [
  "chest",
  "shoulders",
  "lats",
  "middle back",
  "lower back",
  "biceps",
  "triceps",
  "traps",
  "forearms",
];

const LOWER_MUSCLES: MuscleGroup[] = [
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abdominals",
  "abductors",
  "adductors",
];

const FULL_BODY_ROTATION: MuscleGroup[] = [
  "chest",
  "lats",
  "quadriceps",
  "shoulders",
  "hamstrings",
  "abdominals",
  "glutes",
  "triceps",
  "biceps",
  "calves",
];

function getTargetMuscles(params: GeneratorParams): MuscleGroup[] {
  if (params.focus === "upper") return UPPER_MUSCLES;
  if (params.focus === "lower") return LOWER_MUSCLES;
  if (params.focus === "custom" && params.targetMuscles?.length) {
    return params.targetMuscles;
  }
  return FULL_BODY_ROTATION;
}

function getCategoriesForParams(params: GeneratorParams): string[] {
  switch (params.loadType) {
    case "strength":
      return ["strength", "powerlifting"];
    case "cardio":
      return ["cardio", "plyometrics"];
    case "stretching":
      return ["stretching"];
    case "mixed":
      if (params.goal === "fat_loss") {
        return ["strength", "cardio", "plyometrics"];
      }
      if (params.goal === "endurance") {
        return ["strength", "cardio", "plyometrics"];
      }
      return ["strength", "cardio", "stretching"];
    default:
      return ["strength"];
  }
}

function getMainExerciseCount(duration: 20 | 40 | 60): number {
  if (duration === 20) return 4 + Math.floor(Math.random() * 2);
  if (duration === 40) return 6 + Math.floor(Math.random() * 3);
  return 8 + Math.floor(Math.random() * 3);
}

export function filterExercises(
  all: Exercise[],
  profile: UserProfile,
  params: GeneratorParams
): Exercise[] {
  const allowedLevels = getAllowedExerciseLevels(profile.level);
  const categories = getCategoriesForParams(params);
  const targetMuscles = getTargetMuscles(params);
  const isFullBody = params.focus === "full_body";

  return all.filter((ex) => {
    if (!allowedLevels.includes(ex.level)) return false;
    if (ex.primaryMuscles.includes("neck")) return false;

    if (profile.age >= 50) {
      if (ex.category === "plyometrics" || ex.category === "strongman") {
        return false;
      }
    }

    if (!categories.includes(ex.category)) return false;

    if (
      params.equipment.length > 0 &&
      ex.equipment &&
      !params.equipment.includes(ex.equipment)
    ) {
      return false;
    }

    if (!isFullBody) {
      const matchesMuscle = ex.primaryMuscles.some((m) =>
        targetMuscles.includes(m)
      );
      if (!matchesMuscle) return false;
    }

    return true;
  });
}

export function buildPrescription(
  goal: WorkoutGoal,
  profileLevel: ProfileLevel,
  category: string
): WorkoutSetPrescription {
  const presets: Record<WorkoutGoal, WorkoutSetPrescription> = {
    strength: { sets: 4, reps: "4-6", restSeconds: 120 },
    fat_loss: { sets: 3, reps: "12-15", restSeconds: 45 },
    endurance: { sets: 3, reps: "15-20", restSeconds: 30 },
    general: { sets: 3, reps: "8-12", restSeconds: 60 },
  };

  const base = { ...presets[goal] };

  if (category === "cardio" || category === "plyometrics") {
    return { sets: 3, reps: "30-45 сек", restSeconds: 30 };
  }
  if (category === "stretching") {
    return { sets: 1, reps: "30-60 сек", restSeconds: 15 };
  }

  if (profileLevel === "beginner" && base.sets > 2) {
    base.sets -= 1;
  }
  if (profileLevel === "advanced" && base.sets < 5) {
    base.sets += 1;
  }

  return base;
}

function scoreExercise(
  ex: Exercise,
  goal: WorkoutGoal,
  lastForce: "push" | "pull" | "static" | null
): number {
  let score = 0;
  if (goal === "strength" || goal === "general") {
    if (ex.mechanic === "compound") score += 3;
  }
  if (goal === "fat_loss" && ex.mechanic === "compound") score += 1;
  if (ex.force && ex.force !== lastForce) score += 2;
  return score;
}

function pickMainExercises(
  pool: Exercise[],
  count: number,
  params: GeneratorParams,
  goal: WorkoutGoal
): Exercise[] {
  const targetMuscles = getTargetMuscles(params);
  const picked: Exercise[] = [];
  const muscleCount = new Map<MuscleGroup, number>();
  let lastForce: "push" | "pull" | "static" | null = null;
  let muscleIndex = 0;

  const available = pool.filter(
    (ex) => ex.category !== "stretching" && ex.category !== "cardio"
  );

  while (picked.length < count && available.length > 0) {
    const targetMuscle =
      params.focus === "full_body"
        ? FULL_BODY_ROTATION[muscleIndex % FULL_BODY_ROTATION.length]
        : targetMuscles[muscleIndex % targetMuscles.length];

    const candidates = available.filter((ex) => {
      if (picked.some((p) => p.id === ex.id)) return false;
      if (!ex.primaryMuscles.includes(targetMuscle)) return false;
      const countForMuscle = muscleCount.get(targetMuscle) ?? 0;
      if (countForMuscle >= 2) return false;
      return true;
    });

    if (candidates.length === 0) {
      muscleIndex += 1;
      if (muscleIndex > targetMuscles.length * 3) break;
      continue;
    }

    const sorted = [...candidates].sort(
      (a, b) => scoreExercise(b, goal, lastForce) - scoreExercise(a, goal, lastForce)
    );
    const chosen = sorted[0];
    picked.push(chosen);
    lastForce = chosen.force;
    const primary = chosen.primaryMuscles[0];
    muscleCount.set(primary, (muscleCount.get(primary) ?? 0) + 1);
    muscleIndex += 1;
  }

  if (picked.length < count) {
    const remaining = available
      .filter((ex) => !picked.some((p) => p.id === ex.id))
      .sort(
        (a, b) => scoreExercise(b, goal, lastForce) - scoreExercise(a, goal, lastForce)
      );
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

function pickStretchExercise(
  all: Exercise[],
  profile: UserProfile,
  params: GeneratorParams,
  excludeIds: Set<string>
): Exercise | null {
  const allowedLevels = getAllowedExerciseLevels(profile.level);
  const candidates = all.filter(
    (ex) =>
      ex.category === "stretching" &&
      allowedLevels.includes(ex.level) &&
      !excludeIds.has(ex.id) &&
      !ex.primaryMuscles.includes("neck")
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickCardioIfNeeded(
  pool: Exercise[],
  goal: WorkoutGoal,
  excludeIds: Set<string>
): Exercise | null {
  if (goal !== "fat_loss" && goal !== "endurance") return null;
  const cardio = pool.filter(
    (ex) =>
      (ex.category === "cardio" || ex.category === "plyometrics") &&
      !excludeIds.has(ex.id)
  );
  if (cardio.length === 0) return null;
  return cardio[Math.floor(Math.random() * cardio.length)];
}

export function generateWorkout(
  allExercises: Exercise[],
  profile: UserProfile,
  params: GeneratorParams
): GeneratedWorkout {
  const pool = filterExercises(allExercises, profile, params);
  const mainCount = getMainExerciseCount(params.durationMinutes);
  const mainExercises = pickMainExercises(pool, mainCount, params, params.goal);

  const excludeIds = new Set(mainExercises.map((e) => e.id));
  const planned: PlannedExercise[] = [];
  let order = 0;

  if (params.includeWarmup) {
    const warmup = pickStretchExercise(allExercises, profile, params, excludeIds);
    if (warmup) {
      excludeIds.add(warmup.id);
      planned.push({
        exercise: warmup,
        prescription: buildPrescription(
          params.goal,
          profile.level,
          warmup.category
        ),
        order: order++,
      });
    }
  }

  for (const ex of mainExercises) {
    planned.push({
      exercise: ex,
      prescription: buildPrescription(params.goal, profile.level, ex.category),
      order: order++,
    });
  }

  const cardio = pickCardioIfNeeded(pool, params.goal, excludeIds);
  if (cardio) {
    excludeIds.add(cardio.id);
    planned.push({
      exercise: cardio,
      prescription: buildPrescription(
        params.goal,
        profile.level,
        cardio.category
      ),
      order: order++,
    });
  }

  if (params.includeCooldown) {
    const cooldown = pickStretchExercise(
      allExercises,
      profile,
      params,
      excludeIds
    );
    if (cooldown) {
      planned.push({
        exercise: cooldown,
        prescription: buildPrescription(
          params.goal,
          profile.level,
          cooldown.category
        ),
        order: order++,
      });
    }
  }

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    params,
    profileSnapshot: profile,
    exercises: planned,
  };
}

export const GOAL_LABELS: Record<WorkoutGoal, string> = {
  strength: "Сила",
  fat_loss: "Похудение",
  endurance: "Выносливость",
  general: "Общая форма",
};

export const DEFAULT_GENERATOR_PARAMS: GeneratorParams = {
  goal: "general",
  durationMinutes: 40,
  equipment: ["body only", "dumbbell"],
  focus: "full_body",
  loadType: "mixed",
  includeWarmup: true,
  includeCooldown: true,
};
