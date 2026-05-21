import { useEffect, useState } from "react";
import { Loader2, History as HistoryIcon, ChevronRight } from "lucide-react";
import { getWorkoutHistory } from "@/lib/db";
import type { WorkoutHistoryEntry } from "@/types/workout";
import { GOAL_LABELS } from "@/lib/workoutGenerator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { translate } from "@/utils/translations";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m} мин`;
}

function completionPercent(entry: WorkoutHistoryEntry): number {
  let total = 0;
  let done = 0;
  entry.planned.exercises.forEach((item, i) => {
    total += item.prescription.sets;
    const sets = entry.completedExercises[i]?.sets ?? [];
    done += sets.filter((s) => s.completed).length;
  });
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export default function History() {
  const [entries, setEntries] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WorkoutHistoryEntry | null>(null);

  useEffect(() => {
    getWorkoutHistory().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-12">
      <h1 className="text-2xl font-black text-slate-900">История тренировок</h1>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white py-16 text-center shadow-sm">
          <HistoryIcon className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 font-bold text-slate-400">История пуста</h3>
          <p className="mt-1 text-sm text-slate-400">
            Завершите тренировку в генераторе, чтобы увидеть записи
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelected(entry)}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <HistoryIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">
                  {GOAL_LABELS[entry.planned.params.goal]}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDate(entry.finishedAt)} ·{" "}
                  {entry.planned.exercises.length} упр. ·{" "}
                  {formatMinutes(entry.totalDurationSeconds)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-black text-emerald-600">
                  {completionPercent(entry)}%
                </p>
                <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {GOAL_LABELS[selected.planned.params.goal]} —{" "}
                  {formatDate(selected.finishedAt)}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500">
                {selected.planned.params.durationMinutes} мин · Выполнено{" "}
                {completionPercent(selected)}% подходов
              </p>
              <ul className="mt-4 space-y-3">
                {selected.planned.exercises.map((item, i) => {
                  const sets = selected.completedExercises[i]?.sets ?? [];
                  const done = sets.filter((s) => s.completed).length;
                  return (
                    <li
                      key={`${item.exercise.id}-${i}`}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <p className="font-bold text-slate-900">
                        {item.exercise.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {translate(item.exercise.primaryMuscles[0])} ·{" "}
                        {done}/{item.prescription.sets} подходов
                      </p>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
