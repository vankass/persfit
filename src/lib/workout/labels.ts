import type { GeneratorParams, WorkoutIntensity } from "@/types/workout";
import { INTENSITY_LABELS } from "./constants";

export function getIntensityLabel(intensity: WorkoutIntensity): string {
  return INTENSITY_LABELS[intensity] ?? intensity;
}

export const getSessionLabel = (params: GeneratorParams): string =>
  `${getIntensityLabel(params.intensity)} интенсивность`;