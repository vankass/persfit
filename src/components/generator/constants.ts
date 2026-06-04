import type { MuscleGroup } from "@/types/exercise";

export const HOME_BASE_EQUIPMENT = ["body only"] as const;

export const HOME_EXTRA_EQUIPMENT = [
  "dumbbell",
  "kettlebells",
  "pull up bar",
  "parallel bars",
  "barbell",
  "bands",
  "medicine ball",
  "exercise ball",
] as const;

export const ALL_GENERATOR_EQUIPMENT: string[] = [
  ...HOME_BASE_EQUIPMENT,
  ...HOME_EXTRA_EQUIPMENT,
  "e-z curl bar",
  "cable",
  "machine",
  "other",
];

export function buildHomeEquipment(extras: string[]): string[] {
  return [...HOME_BASE_EQUIPMENT, ...extras.filter((e) => e !== "body only")];
}

export function getHomeExtrasFromEquipment(equipment: string[]): string[] {
  return equipment.filter((e) =>
    (HOME_EXTRA_EQUIPMENT as readonly string[]).includes(e)
  );
}

export function toggleHomeExtra(extras: string[], key: string): string[] {
  return extras.includes(key)
    ? extras.filter((e) => e !== key)
    : [...extras, key];
}

export const MUSCLE_OPTIONS: MuscleGroup[] = [
  "chest",
  "lats",
  "shoulders",
  "biceps",
  "triceps",
  "abdominals",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "middle back",
  "lower back",
  "traps",
  "forearms",
];
