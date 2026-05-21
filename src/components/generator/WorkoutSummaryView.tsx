import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Dumbbell, Save } from "lucide-react";
import type { GeneratedWorkout } from "@/types/workout";
import type { SessionProgress } from "./WorkoutSessionView";
import { GOAL_LABELS } from "@/lib/workoutGenerator";

interface WorkoutSummaryViewProps {
  workout: GeneratedWorkout;
  progress: SessionProgress;
  finishedAt: string;
  onSave: () => void;
  saving: boolean;
}

function computeCompletionPercent(
  workout: GeneratedWorkout,
  progress: SessionProgress
): number {
  let totalSets = 0;
  let completed = 0;

  workout.exercises.forEach((item, i) => {
    totalSets += item.prescription.sets;
    const sets = progress.completedSets[i] ?? [];
    completed += sets.filter((s) => s.completed).length;
  });

  if (totalSets === 0) return 0;
  return Math.round((completed / totalSets) * 100);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} мин ${s} сек`;
}

export function WorkoutSummaryView({
  workout,
  progress,
  finishedAt,
  onSave,
  saving,
}: WorkoutSummaryViewProps) {
  const started = new Date(progress.startedAt).getTime();
  const finished = new Date(finishedAt).getTime();
  const durationSec = Math.max(0, Math.floor((finished - started) / 1000));
  const completion = computeCompletionPercent(workout, progress);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="mt-3 text-2xl font-black text-slate-900">
          Тренировка завершена!
        </h2>
        <p className="mt-1 text-slate-500">
          {GOAL_LABELS[workout.params.goal]} · {workout.exercises.length}{" "}
          упражнений
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
          <Clock className="mx-auto h-6 w-6 text-purple-500" />
          <p className="mt-2 text-lg font-black text-slate-900">
            {formatDuration(durationSec)}
          </p>
          <p className="text-xs font-bold uppercase text-slate-400">Время</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
          <Dumbbell className="mx-auto h-6 w-6 text-blue-500" />
          <p className="mt-2 text-lg font-black text-slate-900">{completion}%</p>
          <p className="text-xs font-bold uppercase text-slate-400">
            Подходов выполнено
          </p>
        </div>
      </div>

      <Button
        type="button"
        className="w-full rounded-2xl bg-blue-600 py-6 text-lg font-bold hover:bg-blue-700"
        onClick={onSave}
        disabled={saving}
      >
        <Save className="mr-2 h-5 w-5" />
        {saving ? "Сохранение..." : "Сохранить в историю"}
      </Button>
    </div>
  );
}
