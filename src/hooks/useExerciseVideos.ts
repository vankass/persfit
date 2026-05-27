import { useCallback, useState } from "react";
import { searchExerciseVideo, type YouTubeVideo } from "@/lib/youtubeApi";

export function useExerciseVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVideos, setShowVideos] = useState(false);
  const [loadedForId, setLoadedForId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setVideos([]);
    setError("");
    setShowVideos(false);
    setLoadedForId(null);
  }, []);

  const load = async (exerciseId: string) => {
    if (loadedForId === exerciseId && videos.length > 0) {
      setShowVideos(true);
      return;
    }

    setLoading(true);
    setError("");
    setShowVideos(true);

    try {
      const results = await searchExerciseVideo(exerciseId);
      setVideos(results);
      setLoadedForId(exerciseId);
    } catch (err) {
      setVideos([]);
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить видео"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    videos,
    loading,
    error,
    showVideos,
    load,
    reset,
  };
}
