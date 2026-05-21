export type ProfileLevel = "beginner" | "intermediate" | "advanced";
export type ProfileGender = "male" | "female";

export interface UserProfile {
  name: string;
  gender: ProfileGender;
  age: number;
  weight: number;
  height: number;
  level: ProfileLevel;
  createdAt: string;
}

export type ExerciseLevel = "beginner" | "intermediate" | "expert";

export function getAllowedExerciseLevels(
  profileLevel: ProfileLevel
): ExerciseLevel[] {
  switch (profileLevel) {
    case "beginner":
      return ["beginner"];
    case "intermediate":
      return ["beginner", "intermediate"];
    case "advanced":
      return ["beginner", "intermediate", "expert"];
    default:
      return ["beginner"];
  }
}
