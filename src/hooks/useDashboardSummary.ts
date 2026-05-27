import { useEffect, useMemo, useState } from "react";
import type { WorkoutHistoryEntry } from "@/types/workout";
import { getWorkoutHistory } from "@/lib/db";

export function useDashboardSummary() {
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const workouts = await getWorkoutHistory();
        setHistory(workouts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    const lastWorkout = history[0] ?? null;
    const totalSeconds = history.reduce(
      (sum, entry) => sum + entry.totalDurationSeconds,
      0
    );
    const totalMinutes = Math.floor(totalSeconds / 60);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekCount = history.findIndex(
      (entry) => new Date(entry.finishedAt).getTime() < weekAgo
    );

    return {
      history,
      lastWorkout,
      totalMinutes,
      weekCount: weekCount === -1 ? history.length : weekCount,
    };
  }, [history]);

  return { ...summary, loading };
}
