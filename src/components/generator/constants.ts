import type { MuscleGroup } from "@/types/exercise";

export const EQUIPMENT_OPTIONS = [
  "body only",
  "dumbbell",
  "barbell",
  "kettlebells",
  "bands",
  "cable",
  "machine",
  "medicine ball",
  "exercise ball",
  "e-z curl bar",
  "foam roll",
  "other",
] as const;

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

export const WIZARD_STEPS = [
  "Цель",
  "Длительность",
  "Оборудование",
  "Фокус",
  "Тип нагрузки",
] as const;
