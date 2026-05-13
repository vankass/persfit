export type MuscleGroup = 
  | "abdominals" | "abductors" | "adductors" | "biceps" | "calves" 
  | "chest" | "forearms" | "glutes" | "hamstrings" | "lats" 
  | "lower back" | "middle back" | "neck" | "quadriceps" 
  | "shoulders" | "traps" | "triceps";

export interface Exercise {
  id: string;
  name: string;
  force: "static" | "pull" | "push" | null;
  level: "beginner" | "intermediate" | "expert";
  mechanic: "isolation" | "compound" | null;
  equipment: string | null;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  instructions: string[];
  category: string;
  images: string[];
}