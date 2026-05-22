import type { Exercise, MuscleGroup } from "@/types/exercise";
import {
  getAllowedExerciseLevels,
  type ProfileLevel,
  type UserProfile,
} from "@/types/profile";
import type {
  GeneratedWorkout,
  GeneratorParams,
  LegacyGeneratorParams,
  LegacyWorkoutGoal,
  LoadType,
  PlannedExercise,
  WorkoutFocus,
  WorkoutIntensity,
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

const EXERCISE_TRANSITION_SECONDS = 75;
const BUDGET_MIN_SECONDS = 28 * 60;
const BUDGET_MAX_SECONDS = 65 * 60;

const WORK_PER_SET_SECONDS: Record<WorkoutIntensity, number> = {
  low: 40,
  medium: 45,
  high: 55,
};

const INTENSITY_LABELS: Record<WorkoutIntensity, string> = {
  low: "Лёгкая",
  medium: "Средняя",
  high: "Высокая",
};

const LEGACY_GOAL_LABELS: Record<string, string> = {
  strength: "Сила",
  fat_loss: "Похудение",
  endurance: "Выносливость",
  general: "Общая форма",
};

const LEGACY_GOAL_SESSION_LABELS: Record<LegacyWorkoutGoal, string> = {
  strength: "Силовая · Высокая",
  fat_loss: "Силовая · Высокая",
  endurance: "Силовая · Средняя",
  general: "Силовая · Средняя",
};

export function getGoalLabel(goal: string): string {
  return LEGACY_GOAL_LABELS[goal] ?? goal;
}

export function getIntensityLabel(
  intensity: WorkoutIntensity | string
): string {
  return INTENSITY_LABELS[intensity as WorkoutIntensity] ?? intensity;
}

export function getSessionLabel(
  params: GeneratorParams | LegacyGeneratorParams
): string {
  if (params.intensity != null && params.loadType != null) {
    return `${getLoadTypeLabel(params.loadType)} · ${getIntensityLabel(
      params.intensity
    )}`;
  }
  const legacyGoal = params.goal;
  if (legacyGoal && legacyGoal in LEGACY_GOAL_SESSION_LABELS) {
    return LEGACY_GOAL_SESSION_LABELS[legacyGoal as LegacyWorkoutGoal];
  }
  if (legacyGoal) {
    return getGoalLabel(legacyGoal);
  }
  return "Тренировка";
}

function resolveIntensity(
  params: GeneratorParams | LegacyGeneratorParams
): WorkoutIntensity {
  if (params.intensity) return params.intensity;
  const goal = params.goal;
  if (goal === "fat_loss" || goal === "strength") return "high";
  if (goal === "endurance") return "medium";
  return "medium";
}

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
    case "cardio":
      return ["cardio", "plyometrics"];
    case "strength":
    default:
      return ["strength", "powerlifting"];
  }
}

function getMinimumDistinctMuscles(params: GeneratorParams): number {
  if (params.focus === "full_body") return 4;
  if (params.focus === "upper" || params.focus === "lower") return 3;
  if (params.focus === "custom" && params.targetMuscles?.length) {
    return Math.min(params.targetMuscles.length, 4);
  }
  return 3;
}

function getMaxExercises(focus: WorkoutFocus): number {
  if (focus === "full_body") return 6;
  return 5;
}

export function getSessionBudgetSeconds(
  intensity: WorkoutIntensity,
  focus: WorkoutFocus,
  level: ProfileLevel
): number {
  const baseMinutes = focus === "full_body" ? 50 : focus === "custom" ? 35 : 40;

  let minutes = baseMinutes;
  if (level === "beginner") minutes -= 8;
  if (level === "advanced") minutes += 8;
  if (intensity === "high") minutes += 5;
  if (intensity === "low") minutes -= 5;

  const seconds = minutes * 60;
  return Math.min(BUDGET_MAX_SECONDS, Math.max(BUDGET_MIN_SECONDS, seconds));
}

export function estimateExerciseSeconds(
  prescription: WorkoutSetPrescription,
  category: string,
  intensity: WorkoutIntensity
): number {
  const { sets, restSeconds } = prescription;

  if (category === "cardio" || category === "plyometrics") {
    const workPerSet =
      intensity === "high" ? 30 : intensity === "low" ? 45 : 40;
    return (
      sets * workPerSet +
      Math.max(0, sets - 1) * restSeconds +
      EXERCISE_TRANSITION_SECONDS
    );
  }

  const workPerSet = WORK_PER_SET_SECONDS[intensity];
  return (
    sets * workPerSet +
    Math.max(0, sets - 1) * restSeconds +
    EXERCISE_TRANSITION_SECONDS
  );
}

export function computeWorkoutDuration(
  exercises: PlannedExercise[],
  params: GeneratorParams
): number {
  return computeWorkoutDurationWithIntensity(
    exercises,
    params.loadType,
    params.intensity
  );
}

export function recalculateWorkoutDuration(
  workout: GeneratedWorkout
): GeneratedWorkout {
  const intensity = resolveIntensity(workout.params);
  const loadType = workout.params.loadType ?? "strength";
  const minutes = computeWorkoutDurationWithIntensity(
    workout.exercises,
    loadType,
    intensity
  );
  return { ...workout, estimatedDurationMinutes: minutes };
}

function computeWorkoutDurationWithIntensity(
  exercises: PlannedExercise[],
  _loadType: LoadType,
  intensity: WorkoutIntensity
): number {
  if (exercises.length === 0) return 0;

  let totalSeconds = 0;
  exercises.forEach((item, index) => {
    totalSeconds += estimateExerciseSeconds(
      item.prescription,
      item.exercise.category,
      intensity
    );
    if (index > 0) {
      totalSeconds -= EXERCISE_TRANSITION_SECONDS;
    }
  });

  return Math.max(1, Math.round(totalSeconds / 60));
}

function countDistinctMuscles(exercises: Exercise[]): number {
  const muscles = new Set<MuscleGroup>();
  for (const ex of exercises) {
    if (ex.primaryMuscles[0]) muscles.add(ex.primaryMuscles[0]);
  }
  return muscles.size;
}

function sumPlannedSeconds(
  planned: PlannedExercise[],
  intensity: WorkoutIntensity
): number {
  return planned.reduce(
    (sum, item) =>
      sum +
      estimateExerciseSeconds(
        item.prescription,
        item.exercise.category,
        intensity
      ),
    0
  );
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
  loadType: LoadType,
  intensity: WorkoutIntensity,
  profileLevel: ProfileLevel,
  category: string
): WorkoutSetPrescription {
  if (category === "stretching") {
    return { sets: 1, reps: "30-60 сек", restSeconds: 15 };
  }

  if (category === "cardio" || category === "plyometrics") {
    const cardioPresets: Record<WorkoutIntensity, WorkoutSetPrescription> = {
      low: { sets: 3, reps: "40-50 сек", restSeconds: 40 },
      medium: { sets: 3, reps: "30-45 сек", restSeconds: 30 },
      high: { sets: 4, reps: "20-30 сек", restSeconds: 20 },
    };
    const base = { ...cardioPresets[intensity] };
    if (profileLevel === "beginner" && base.sets > 2) base.sets -= 1;
    if (profileLevel === "advanced" && base.sets < 5) base.sets += 1;
    return base;
  }

  const strengthPresets: Record<WorkoutIntensity, WorkoutSetPrescription> = {
    low: { sets: 3, reps: "12-15", restSeconds: 60 },
    medium: { sets: 3, reps: "8-12", restSeconds: 60 },
    high: { sets: 4, reps: "4-6", restSeconds: 120 },
  };

  const base =
    loadType === "cardio"
      ? {
          low: { sets: 3, reps: "40-50 сек", restSeconds: 40 },
          medium: { sets: 3, reps: "30-45 сек", restSeconds: 30 },
          high: { sets: 4, reps: "20-30 сек", restSeconds: 20 },
        }[intensity]
      : { ...strengthPresets[intensity] };

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
  params: GeneratorParams,
  lastForce: "push" | "pull" | "static" | null
): number {
  let score = 0;
  if (params.loadType === "strength" && params.intensity === "high") {
    if (ex.mechanic === "compound") score += 3;
  } else if (ex.mechanic === "compound") {
    score += 1;
  }
  if (ex.force && ex.force !== lastForce) score += 2;
  return score;
}

function pickMainExercises(
  pool: Exercise[],
  count: number,
  params: GeneratorParams
): Exercise[] {
  const targetMuscles = getTargetMuscles(params);
  const picked: Exercise[] = [];
  const muscleCount = new Map<MuscleGroup, number>();
  let lastForce: "push" | "pull" | "static" | null = null;
  let muscleIndex = 0;

  const available = pool.filter((ex) => {
    if (ex.category === "stretching") return false;
    if (params.loadType === "cardio") {
      return ex.category === "cardio" || ex.category === "plyometrics";
    }
    return ex.category !== "cardio" && ex.category !== "plyometrics";
  });

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
      (a, b) =>
        scoreExercise(b, params, lastForce) -
        scoreExercise(a, params, lastForce)
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
        (a, b) =>
          scoreExercise(b, params, lastForce) -
          scoreExercise(a, params, lastForce)
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

function pickNextExercise(
  pool: Exercise[],
  alreadyPicked: Exercise[],
  params: GeneratorParams
): Exercise | null {
  const batch = pickMainExercises(pool, alreadyPicked.length + 1, params);
  if (batch.length <= alreadyPicked.length) return null;
  return batch[batch.length - 1];
}

function pickCardioFinisher(
  pool: Exercise[],
  params: GeneratorParams,
  excludeIds: Set<string>
): Exercise | null {
  if (params.loadType !== "strength" || params.intensity !== "high") {
    return null;
  }
  const cardio = pool.filter(
    (ex) =>
      (ex.category === "cardio" || ex.category === "plyometrics") &&
      !excludeIds.has(ex.id)
  );
  if (cardio.length === 0) return null;
  return cardio[Math.floor(Math.random() * cardio.length)];
}

function buildPlannedExercises(
  exercises: Exercise[],
  params: GeneratorParams,
  level: ProfileLevel
): PlannedExercise[] {
  return exercises.map((ex, index) => ({
    exercise: ex,
    prescription: buildPrescription(
      params.loadType,
      params.intensity,
      level,
      ex.category
    ),
    order: index,
  }));
}

export function generateWorkout(
  allExercises: Exercise[],
  profile: UserProfile,
  params: GeneratorParams
): GeneratedWorkout {
  const pool = filterExercises(allExercises, profile, params);
  const budgetSeconds = getSessionBudgetSeconds(
    params.intensity,
    params.focus,
    profile.level
  );
  const minMuscles = getMinimumDistinctMuscles(params);
  const maxExercises = getMaxExercises(params.focus);

  const picked: Exercise[] = [];

  while (picked.length < maxExercises) {
    const next = pickNextExercise(pool, picked, params);
    if (!next) break;

    const trialPlanned = buildPlannedExercises(
      [...picked, next],
      params,
      profile.level
    );
    const totalIfAdded = sumPlannedSeconds(trialPlanned, params.intensity);
    const musclesCovered = countDistinctMuscles([...picked, next]);

    if (
      picked.length > 0 &&
      totalIfAdded > budgetSeconds &&
      musclesCovered >= minMuscles
    ) {
      break;
    }

    picked.push(next);
  }

  let planned = buildPlannedExercises(picked, params, profile.level);
  const excludeIds = new Set(picked.map((e) => e.id));

  const cardio = pickCardioFinisher(pool, params, excludeIds);
  if (cardio) {
    const cardioPrescription = buildPrescription(
      params.loadType,
      params.intensity,
      profile.level,
      cardio.category
    );
    const cardioSeconds = estimateExerciseSeconds(
      cardioPrescription,
      cardio.category,
      params.intensity
    );
    const currentSeconds = sumPlannedSeconds(planned, params.intensity);
    const remaining = budgetSeconds - currentSeconds;

    if (remaining >= cardioSeconds) {
      planned = [
        ...planned,
        {
          exercise: cardio,
          prescription: cardioPrescription,
          order: planned.length,
        },
      ];
    }
  }

  const estimatedDurationMinutes = computeWorkoutDurationWithIntensity(
    planned,
    params.loadType,
    params.intensity
  );

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    params,
    profileSnapshot: profile,
    exercises: planned,
    estimatedDurationMinutes,
  };
}

export const LOAD_TYPE_LABELS: Record<GeneratorParams["loadType"], string> = {
  strength: "Силовая",
  cardio: "Кардио",
};

export const LEGACY_LOAD_TYPE_LABELS: Record<string, string> = {
  ...LOAD_TYPE_LABELS,
  mixed: "Смешанная",
  stretching: "Растяжка",
};

export function getLoadTypeLabel(loadType: string): string {
  return LEGACY_LOAD_TYPE_LABELS[loadType] ?? loadType;
}

export function getPlannedDurationMinutes(workout: GeneratedWorkout): number {
  if (workout.estimatedDurationMinutes != null) {
    return workout.estimatedDurationMinutes;
  }
  const legacy = workout.params as LegacyGeneratorParams;
  if (legacy.durationMinutes != null) {
    return legacy.durationMinutes;
  }
  const intensity = resolveIntensity(workout.params);
  const loadType = workout.params.loadType ?? "strength";
  return computeWorkoutDurationWithIntensity(
    workout.exercises,
    loadType,
    intensity
  );
}

export const DEFAULT_GENERATOR_PARAMS: GeneratorParams = {
  intensity: "medium",
  equipment: ["body only"],
  focus: "full_body",
  loadType: "strength",
};
