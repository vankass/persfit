import { useEffect, useState } from "react";
import type { UserProfile } from "@/types/profile";
import type { WorkoutHistoryEntry } from "@/types/workout";
import type { BodyMeasurement } from "@/types/measurement";
import { getBodyMeasurements, getProfile, getWorkoutHistory } from "@/lib/db"; // Убрали лишний saveBodyMeasurement

export function useStatsData() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Загружаем ВСЕ три источника данных параллельно, это самый быстрый способ!
        const [userProfile, workouts, bodyMeasurements] = await Promise.all([
          getProfile(),
          getWorkoutHistory(),
          getBodyMeasurements(),
        ]);

        setProfile(userProfile ?? null);
        setHistory(workouts);
        setMeasurements(bodyMeasurements);
      } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { profile, history, measurements, loading };
}
