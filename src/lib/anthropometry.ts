import type { UserProfile } from "@/types/profile";

export function calcBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 16) {
    return { label: "Выраженный дефицит массы", colorClass: "text-red-600" };
  }
  if (bmi < 18.5) {
    return { label: "Недостаточная масса тела", colorClass: "text-orange-500" };
  }
  if (bmi < 25) {
    return { label: "Нормальная масса тела", colorClass: "text-emerald-600" };
  }
  if (bmi < 30) {
    return { label: "Избыточная масса тела", colorClass: "text-amber-600" };
  }
  if (bmi < 35) {
    return { label: "Ожирение I степени", colorClass: "text-orange-600" };
  }
  if (bmi < 40) {
    return { label: "Ожирение II степени", colorClass: "text-red-500" };
  }
  return { label: "Ожирение III степени", colorClass: "text-red-700" };
}

export function getHealthyWeightRange(heightCm: number): {
  min: number;
  max: number;
} {
  const heightM = heightCm / 100;
  const min = Math.round(18.5 * heightM * heightM * 10) / 10;
  const max = Math.round(24.9 * heightM * heightM * 10) / 10;
  return { min, max };
}

export function calcDailyCalories(
  profile: UserProfile,
  activity: ActivityLevel
): number {
  const { weight, height, age, gender } = profile;

  if (weight <= 0 || height <= 0 || age <= 0) return 0;

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activity] || 1.2;

  return Math.round(bmr * multiplier);
}

export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

export interface BmiCategory {
  label: string;
  colorClass: string;
}
