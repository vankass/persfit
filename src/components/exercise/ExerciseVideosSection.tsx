import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { YouTubeVideo } from "@/lib/youtubeApi";

interface ExerciseVideosSectionProps {
  videos: YouTubeVideo[];
  loading: boolean;
  error: string;
  showVideos: boolean;
  onLoad: () => void;
  variant?: "catalog" | "session";
}

export function ExerciseVideosSection({
  videos,
  loading,
  error,
  showVideos,
  onLoad,
  variant = "catalog",
}: ExerciseVideosSectionProps) {
  const isCatalog = variant === "catalog";

  return (
    <div className={isCatalog ? "mt-8 border-t border-slate-100 pt-6" : "mt-4"}>
      <div
        className={
          isCatalog
            ? "mb-4 flex items-center justify-between"
            : "flex flex-wrap items-center gap-2"
        }
      >
        {isCatalog ? (
          <h4 className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
            <Play className="h-5 w-5 text-red-500" />
            Видео
          </h4>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size={isCatalog ? "lg" : "sm"}
          className={
            isCatalog
              ? "rounded-xl border-slate-200 text-xs font-semibold"
              : "min-h-11 rounded-xl"
          }
          onClick={onLoad}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2
                className={`${
                  isCatalog ? "mr-1 h-3 w-3" : "mr-2 h-4 w-4"
                } animate-spin`}
              />
              {isCatalog ? "Загрузка..." : null}
            </>
          ) : (
            <>
              <Play className={isCatalog ? "mr-1 h-3 w-3" : "mr-2 h-4 w-4"} />
              {isCatalog
                ? showVideos && videos.length > 0
                  ? "Обновить"
                  : "Найти видео"
                : "Найти видео"}
            </>
          )}
        </Button>
      </div>

      {loading && isCatalog ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : null}

      {error ? (
        <div
          className={
            isCatalog
              ? "rounded-xl bg-red-50 p-4 text-sm text-red-600"
              : "mt-2 text-sm text-red-600"
          }
        >
          {error}
        </div>
      ) : null}

      {showVideos && !loading && videos.length > 0 ? (
        <div
          className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
            isCatalog ? "" : "mt-3"
          }`}
        >
          {videos.map((video) => (
            <a
              key={video.id.videoId}
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/video relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img
                  src={
                    video.snippet.thumbnails.medium?.url ||
                    video.snippet.thumbnails.default?.url ||
                    ""
                  }
                  alt={video.snippet.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/video:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/video:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <Play className="h-5 w-5 fill-red-600 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                  {video.snippet.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {video.snippet.channelTitle}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : null}

      {showVideos && !loading && !error && videos.length === 0 && isCatalog ? (
        <p className="py-4 text-center text-sm text-slate-500">
          Видео не найдены
        </p>
      ) : null}
    </div>
  );
}
