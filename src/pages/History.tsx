import { useEffect, useState } from "react";
import {
  Loader2,
  History as HistoryIcon,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { deleteWorkoutHistory, getWorkoutHistory } from "@/lib/db";
import type { WorkoutHistoryEntry } from "@/types/workout";
import {
  getSessionLabel,
} from "@/lib/workout/workoutGenerator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getWorkoutHistory().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string, fromDialog = false) => {
    if (
      !window.confirm(
        "Удалить эту тренировку из истории? Действие нельзя отменить."
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteWorkoutHistory(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (fromDialog || selected?.id === id) {
        setSelected(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-12">
      <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
        История тренировок
      </h1>

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
            <div
              key={entry.id}
              className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-4"
            >
              <button
                type="button"
                onClick={() => setSelected(entry)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-12 sm:w-12">
                  <HistoryIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">
                    {getSessionLabel(entry.planned.params)}
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
              <button
                type="button"
                aria-label="Удалить тренировку"
                disabled={deletingId === entry.id}
                onClick={() => handleDelete(entry.id)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                {deletingId === entry.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {getSessionLabel(selected.planned.params)} —{" "}
                  {formatDate(selected.finishedAt)}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500">
                ≈ {selected.planned.estimatedDurationMinutes ?? 0} мин · Выполнено{" "}
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
                        {translate(item.exercise.primaryMuscles[0])} · {done}/
                        {item.prescription.sets} подходов
                      </p>
                    </li>
                  );
                })}
              </ul>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={deletingId === selected.id}
                onClick={() => handleDelete(selected.id, true)}
              >
                {deletingId === selected.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Удалить запись
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
