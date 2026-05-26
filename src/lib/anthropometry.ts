export interface BmiCategory {
  label: string;
  colorClass: string;
}

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

export function getHealthyWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  const min = Math.round(18.5 * heightM * heightM * 10) / 10;
  const max = Math.round(24.9 * heightM * heightM * 10) / 10;
  return { min, max };
}

/** Body surface area — Du Bois formula (m²) */
export function calcBsa(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const bsa = 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
  return Math.round(bsa * 100) / 100;
}
