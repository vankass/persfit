import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, SkipForward } from "lucide-react";
import type { GeneratedWorkout, SessionPhase } from "@/types/workout";
import type { CompletedSet } from "@/types/workout";
import { translate } from "@/lib/translations";
import { COOLDOWN_VIDEO, WARMUP_VIDEO } from "@/config/warmupCooldown";
import { WarmupCooldownBlock } from "./WarmupCooldownBlock";
import { ExerciseInstructions } from "@/components/exercise/ExerciseInstructions";
import { ExerciseVideosSection } from "@/components/exercise/ExerciseVideosSection";
import { useExerciseVideos } from "@/hooks/useExerciseVideos";
import { SessionProgressBar } from "./session/SessionProgressBar";
import { ExerciseImageGallery } from "./session/ExerciseImageGallery";
import { SetTracker } from "./session/SetTracker";
import { RestTimerCard } from "./session/RestTimerCard";

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
  const {
    videos,
    loading: videosLoading,
    error: videosError,
    showVideos,
    load: loadVideos,
    reset: resetVideos,
  } = useExerciseVideos();

  const currentSets = completedSets[exerciseIndex] ?? [];
  const completedCount = currentSets.filter((s) => s.completed).length;
  const allSetsDone = current
    ? completedCount >= current.prescription.sets
    : false;

  useEffect(() => {
    if (!restRunning || restSecondsLeft === null || restSecondsLeft <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setRestSecondsLeft((value) => {
        if (value === null || value <= 1) {
          setRestRunning(false);
          return null;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restRunning, restSecondsLeft]);

  useEffect(() => {
    resetVideos();
  }, [exerciseIndex, resetVideos]);

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
    resetVideos();

    if (exerciseIndex >= total - 1) {
      onProgressChange({ ...progress, sessionPhase: "cooldown" });
    } else {
      onProgressChange({
        ...progress,
        exerciseIndex: exerciseIndex + 1,
      });
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <SessionProgressBar
        exerciseIndex={exerciseIndex}
        total={total}
        allSetsDone={allSetsDone}
      />

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <ExerciseImageGallery images={current.exercise.images} />
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

        <ExerciseVideosSection
          videos={videos}
          loading={videosLoading}
          error={videosError}
          showVideos={showVideos}
          onLoad={() => loadVideos(current.exercise.id)}
          variant="session"
        />
      </div>

      <SetTracker
        setsCount={current.prescription.sets}
        completedSets={currentSets}
        onToggleSet={toggleSet}
      />

      {restSecondsLeft !== null ? (
        <RestTimerCard
          secondsLeft={restSecondsLeft}
          running={restRunning}
          onToggleRunning={() => setRestRunning((value) => !value)}
          onSkip={() => {
            setRestSecondsLeft(null);
            setRestRunning(false);
          }}
        />
      ) : null}

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
