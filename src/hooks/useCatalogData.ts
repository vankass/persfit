import { useEffect, useState } from "react";
import type { Exercise } from "@/types/exercise";
import { loadExercises } from "@/lib/exercises";

export function useCatalogData() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExercises()
      .then((data) => setExercises(data))
      .catch((error) => {
        console.error("Ошибка загрузки каталога:", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { exercises, isLoading };
}
