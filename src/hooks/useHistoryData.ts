import { useCallback, useEffect, useState } from "react";
import { deleteWorkoutHistory, getWorkoutHistory } from "@/lib/db";
import type { WorkoutHistoryEntry } from "@/types/workout";

export function useHistoryData() {
  const [entries, setEntries] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getWorkoutHistory()
      .then((data) => setEntries(data))
      .catch((error) => {
        console.error("Ошибка загрузки истории:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    if (
      !window.confirm(
        "Удалить эту тренировку из истории? Действие нельзя отменить."
      )
    ) {
      return false;
    }

    setDeletingId(id);
    try {
      await deleteWorkoutHistory(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      return true;
    } finally {
      setDeletingId(null);
    }
  }, []);

  return { entries, loading, deletingId, removeEntry };
}
