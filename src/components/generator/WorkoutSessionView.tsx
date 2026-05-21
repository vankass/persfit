import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  SkipForward,
  Timer,
} from "lucide-react";
import type { GeneratedWorkout } from "@/types/workout";
import type { CompletedSet } from "@/types/workout";
import { translate } from "@/utils/translations";
import { searchExerciseVideo, type YouTubeVideo } from "@/youtubeApi";

export interface SessionProgress {
  exerciseIndex: number;
  completedSets: CompletedSet[][];
  startedAt: string;
}

interface WorkoutSessionViewProps {
  workout: GeneratedWorkout;
  progress: SessionProgress;
  onProgressChange: (progress: SessionProgress) => void;
  onFinish: () => void;
}

export function WorkoutSessionView({
  workout,
  progress,
  onProgressChange,
  onFinish,
}: WorkoutSessionViewProps) {
  const { exerciseIndex, completedSets } = progress;
  const current = workout.exercises[exerciseIndex];
  const total = workout.exercises.length;

  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [restRunning, setRestRunning] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [showVideos, setShowVideos] = useState(false);

  const currentSets = completedSets[exerciseIndex] ?? [];
  const completedCount = currentSets.filter((s) => s.completed).length;
  const allSetsDone = completedCount >= current.prescription.sets;

  useEffect(() => {
    if (!restRunning || restSecondsLeft === null || restSecondsLeft <= 0) {
      return;
    }
    const t = window.setInterval(() => {
      setRestSecondsLeft((s) => {
        if (s === null || s <= 1) {
          setRestRunning(false);
          return null;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [restRunning, restSecondsLeft]);

  const toggleSet = (setIndex: number) => {
    const sets = [...(completedSets[exerciseIndex] ?? [])];
    const existing = sets.find((s) => s.setIndex === setIndex);
    if (existing) {
      existing.completed = !existing.completed;
    } else {
      sets.push({ setIndex, completed: true });
    }
    const next = [...completedSets];
    next[exerciseIndex] = sets;
    onProgressChange({ ...progress, completedSets: next });

    const wasCompleted = existing?.completed ?? false;
    if (!wasCompleted && setIndex < current.prescription.sets - 1) {
      setRestSecondsLeft(current.prescription.restSeconds);
      setRestRunning(true);
    }
  };

  const goNext = () => {
    setRestSecondsLeft(null);
    setRestRunning(false);
    setShowVideos(false);
    setVideos([]);
    if (exerciseIndex >= total - 1) {
      onFinish();
    } else {
      onProgressChange({
        ...progress,
        exerciseIndex: exerciseIndex + 1,
      });
    }
  };

  const loadVideos = async () => {
    setVideosLoading(true);
    setShowVideos(true);
    try {
      const results = await searchExerciseVideo(current.exercise.id);
      setVideos(results);
    } catch {
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  if (!current) {
    onFinish();
    return null;
  }

  const img = current.exercise.images[0];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-500">
          <span>
            Упражнение {exerciseIndex + 1} из {total}
          </span>
          <span className="text-blue-600">
            {Math.round(((exerciseIndex + (allSetsDone ? 1 : 0)) / total) * 100)}
            %
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${((exerciseIndex + (allSetsDone ? 0.5 : 0)) / total) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        {img ? (
          <img
            src={`/exercises/images/${img}`}
            alt=""
            className="mb-4 h-40 w-full rounded-2xl object-cover bg-slate-50"
          />
        ) : null}
        <h2 className="text-xl font-black text-slate-900">
          {current.exercise.name}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {translate(current.exercise.primaryMuscles[0])} ·{" "}
          {current.prescription.sets} подходов × {current.prescription.reps}
        </p>

        {current.exercise.instructions[0] ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {current.exercise.instructions[0]}
          </p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 rounded-xl"
          onClick={loadVideos}
          disabled={videosLoading}
        >
          {videosLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Видео техники
        </Button>

        {showVideos && videos.length > 0 && (
          <div className="mt-3 space-y-2">
            {videos.slice(0, 2).map((v) => (
              <a
                key={v.id.videoId}
                href={`https://www.youtube.com/watch?v=${v.id.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-100 p-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                {v.snippet.title}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-bold text-slate-800">Подходы</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: current.prescription.sets }, (_, i) => {
            const done = currentSets.find(
              (s) => s.setIndex === i && s.completed
            );
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleSet(i)}
                className={[
                  "flex items-center justify-center gap-2 rounded-2xl border-2 py-4 font-bold transition-all",
                  done
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200",
                ].join(" ")}
              >
                {done ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {restSecondsLeft !== null && (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <Timer className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wide">
              Отдых
            </span>
          </div>
          <p className="mt-2 text-4xl font-black text-blue-600">
            {restSecondsLeft}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                setRestRunning(!restRunning);
              }}
            >
              {restRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                setRestSecondsLeft(null);
                setRestRunning(false);
              }}
            >
              Пропустить
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-2xl"
          onClick={goNext}
        >
          <SkipForward className="mr-2 h-4 w-4" />
          {exerciseIndex >= total - 1 ? "Завершить" : "Пропустить"}
        </Button>
        <Button
          type="button"
          className="flex-1 rounded-2xl bg-blue-600 font-bold hover:bg-blue-700"
          onClick={goNext}
          disabled={!allSetsDone && exerciseIndex < total - 1}
        >
          Далее
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
