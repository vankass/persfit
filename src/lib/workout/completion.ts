import type { WorkoutHistoryEntry } from "@/types/workout";

export function completionPercent(entry: WorkoutHistoryEntry): number {
  let total = 0;
  let done = 0;

  entry.planned.exercises.forEach((item, index) => {
    total += item.prescription.sets;
    const sets = entry.completedExercises[index]?.sets ?? [];
    done += sets.filter((set) => set.completed).length;
  });

  return total > 0 ? Math.round((done / total) * 100) : 0;
}
