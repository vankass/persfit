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
import type { GeneratedWorkout, SessionPhase } from "@/types/workout";
import type { CompletedSet } from "@/types/workout";
import { translate } from "@/utils/translations";
import { searchExerciseVideo, type YouTubeVideo } from "@/youtubeApi";
import { COOLDOWN_VIDEO, WARMUP_VIDEO } from "@/config/warmupCooldown";
import { WarmupCooldownBlock } from "./WarmupCooldownBlock";
import { ExerciseInstructions } from "@/components/exercise/ExerciseInstructions";

export interface SessionProgress {
  sessionPhase: SessionPhase;
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
  const { sessionPhase, exerciseIndex, completedSets } = progress;
  const current = workout.exercises[exerciseIndex];
  const total = workout.exercises.length;

  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [restRunning, setRestRunning] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const currentSets = completedSets[exerciseIndex] ?? [];
  const completedCount = currentSets.filter((s) => s.completed).length;
  const allSetsDone = current
    ? completedCount >= current.prescription.sets
    : false;

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

  if (sessionPhase === "warmup") {
    return (
      <WarmupCooldownBlock
        config={WARMUP_VIDEO}
        continueLabel="Начать тренировку"
        onContinue={() =>
          onProgressChange({
            ...progress,
            sessionPhase: "workout",
            exerciseIndex: 0,
          })
        }
      />
    );
  }

  if (sessionPhase === "cooldown") {
    return (
      <WarmupCooldownBlock
        config={COOLDOWN_VIDEO}
        continueLabel="Завершить тренировку"
        onContinue={onFinish}
      />
    );
  }

  if (!current) {
    onFinish();
    return null;
  }

  const toggleSet = (setIndex: number) => {
    const sets = [...(completedSets[exerciseIndex] ?? [])];
    const existing = sets.find((s) => s.setIndex === setIndex);
    const wasCompleted = existing?.completed ?? false;
    const nowCompleted = !wasCompleted;

    if (existing) {
      existing.completed = nowCompleted;
    } else {
      sets.push({ setIndex, completed: true });
    }

    const next = [...completedSets];
    next[exerciseIndex] = sets;
    onProgressChange({ ...progress, completedSets: next });

    if (nowCompleted && setIndex < current.prescription.sets - 1) {
      setRestSecondsLeft(current.prescription.restSeconds);
      setRestRunning(true);
    } else if (!nowCompleted) {
      setRestSecondsLeft(null);
      setRestRunning(false);
    }
  };

  const goNext = () => {
    setRestSecondsLeft(null);
    setRestRunning(false);
    setShowVideos(false);
    setVideos([]);

    if (exerciseIndex >= total - 1) {
      onProgressChange({ ...progress, sessionPhase: "cooldown" });
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

  const img = current.exercise.images;

  return (
    <div className="space-y-4 pb-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-500">
          <span>
            Упражнение {exerciseIndex + 1} из {total}
          </span>
          <span className="text-blue-600">
            {Math.round(
              ((exerciseIndex + (allSetsDone ? 1 : 0)) / total) * 100
            )}
            %
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${
                ((exerciseIndex + (allSetsDone ? 0.5 : 0)) / total) * 100
              }%`,
            }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        {img.length > 0 && (
          <div className="sm:flex sm:gap-5">
            {img.length === 1 ? (
              <img
                src={`/exercises/images/${img[0]}`}
                alt=""
                className="w-full h-40 sm:h-48 rounded-2xl object-cover bg-slate-50 mb-5"
              />
            ) : (
              <>
                <div
                  className="sm:hidden relative w-full h-40 rounded-2xl overflow-hidden mb-5 cursor-pointer"
                  onClick={() =>
                    setCurrentImgIndex((prev) =>
                      prev === img.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  <img
                    src={`/exercises/images/${img[currentImgIndex]}`}
                    alt=""
                    className="w-full h-full object-cover bg-slate-50"
                  />

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {img.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImgIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {img.map((image) => (
                  <img
                    key={image}
                    src={`/exercises/images/${image}`}
                    alt=""
                    className={[
                      "hidden sm:block rounded-2xl object-cover bg-slate-50 mb-5",
                      img.length === 1 ? "w-full h-48" : "w-full h-55 flex-1",
                    ].join(" ")}
                  />
                ))}
              </>
            )}
          </div>
        )}
        <h2 className="text-lg font-black text-slate-900 sm:text-xl">
          {current.exercise.name}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {translate(current.exercise.primaryMuscles[0])} ·{" "}
          {current.prescription.sets} подходов × {current.prescription.reps}
        </p>

        <ExerciseInstructions
          instructions={current.exercise.instructions}
          className="mt-4"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 min-h-11 rounded-xl"
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
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {videos.map((v) => (
              <a
                key={v.id.videoId}
                href={`https://www.youtube.com/watch?v=${v.id.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/video relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={
                      v.snippet.thumbnails.medium?.url ||
                      v.snippet.thumbnails.default?.url ||
                      ""
                    }
                    alt={v.snippet.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/video:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/video:opacity-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      <Play className="h-5 w-5 text-red-600 fill-red-600" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                    {v.snippet.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {v.snippet.channelTitle}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
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
                  "flex min-h-13 items-center justify-center gap-2 rounded-2xl border-2 py-4 font-bold transition-all",
                  done
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200",
                ].join(" ")}
              >
                {done ? <Check className="h-5 w-5" /> : <span>{i + 1}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {restSecondsLeft !== null && (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-center sm:p-5">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <Timer className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wide">
              Отдых
            </span>
          </div>
          <p className="mt-2 text-5xl font-black text-blue-600 sm:text-6xl">
            {restSecondsLeft}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 rounded-xl"
              onClick={() => setRestRunning(!restRunning)}
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
              className="min-h-11 rounded-xl"
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

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="min-h-12 flex-1 rounded-2xl"
          onClick={goNext}
        >
          <SkipForward className="mr-2 h-4 w-4" />
          {exerciseIndex >= total - 1 ? "К заминке" : "Пропустить"}
        </Button>
        <Button
          type="button"
          className="min-h-12 flex-1 rounded-2xl bg-blue-600 font-bold hover:bg-blue-700"
          onClick={goNext}
          disabled={!allSetsDone}
        >
          Далее
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
