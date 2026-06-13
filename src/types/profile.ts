export type ProfileLevel = "beginner" | "intermediate" | "expert";
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

export interface ProfileContextType {
  user: UserProfile | null;
  refreshProfile: () => Promise<void>;
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
    case "expert":
      return ["beginner", "intermediate", "expert"];
    default:
      return ["beginner"];
  }
}

export interface BodyMeasurement {
  id: string;
  recordedAt: string;
  weight: number;
  height: number;
}