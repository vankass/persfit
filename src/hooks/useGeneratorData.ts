import { useEffect, useState } from "react";
import type { Exercise } from "@/types/exercise";
import type { UserProfile } from "@/types/profile";
import { getProfile } from "@/lib/db";
import { loadExercises } from "@/lib/exercises";

export function useGeneratorData() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedProfile, loadedExercises] = await Promise.all([
          getProfile(),
          loadExercises(),
        ]);
        if (loadedProfile) setProfile(loadedProfile);
        setExercises(loadedExercises);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { profile, exercises, loading };
}
