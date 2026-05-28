import { useState } from "react";
import {
  Loader2,
  History as HistoryIcon,
  Trash2,
  RotateCcw,
} from "lucide-react";
import type { WorkoutHistoryEntry } from "@/types/workout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { translate } from "@/lib/translations";
import { completionPercent } from "@/lib/workout/completion";
import { useHistoryData } from "@/hooks/useHistoryData";
import { getSessionLabel } from "@/lib/workout/labels";
import { Loader } from "@/components/Loader";
import { useNavigate } from "react-router-dom";
import { DialogDescription } from "@radix-ui/react-dialog";
import { formatDate, formatMinutes } from "@/lib/workout/timeUtils";

export default function History() {
  const { entries, loading, deletingId, removeEntry } = useHistoryData();
  const [selected, setSelected] = useState<WorkoutHistoryEntry | null>(null);

  const navigate = useNavigate();

  const handleDelete = async (id: string, fromDialog = false) => {
    const removed = await removeEntry(id);
    if (removed && (fromDialog || selected?.id === id)) {
      setSelected(null);
    }
  };

  const handleRepeatWorkout = (entry: WorkoutHistoryEntry) => {
    navigate("/generator", { state: { repeatWorkout: entry.planned } });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 pb-12 sm:px-0">
      <h1 className="text-xl font-black text-slate-900 sm:text-3xl">
        История тренировок
      </h1>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white py-12 text-center shadow-sm sm:py-16">
          <HistoryIcon className="mx-auto h-8 w-8 text-slate-300 sm:h-10 sm:w-10" />
          <h3 className="mt-3 font-bold text-slate-400 text-base sm:text-lg">
            История пуста
          </h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm px-4">
            Завершите тренировку в генераторе, чтобы увидеть записи
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-4"
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelected(entry)}
                className="h-auto min-w-0 flex-1 items-center justify-start gap-3 p-0 text-left hover:bg-transparent sm:gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-12 sm:w-12">
                  <HistoryIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 whitespace-normal sm:text-base">
                    {formatDate(entry.finishedAt)}{" "}
                  </p>
                  <p className="text-xs text-slate-500 whitespace-normal sm:text-sm mt-0.5 sm:mt-0">
                    {getSessionLabel(entry.planned.params)}
                  </p>
                  <p className="text-xs text-slate-500 whitespace-normal sm:text-sm mt-0.5 sm:mt-0">
                    {entry.planned.exercises.length} упражнений ·{" "}
                    {formatMinutes(entry.totalDurationSeconds)}
                  </p>
                </div>
              </Button>

              <div className="flex items-center justify-between sm:justify-end gap-1 border-t border-slate-50 pt-2 sm:border-t-0 sm:pt-0 sm:gap-0.5">
                <p className="text-base font-black text-emerald-600 sm:text-lg ml-3 sm:mr-2 cursor-default">
                  {completionPercent(entry)}%
                </p>
                <div className="flex items-center gap-1 sm:gap-0.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Повторить тренировку"
                    onClick={() => handleRepeatWorkout(entry)}
                    className="h-10 w-10 shrink-0 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors sm:h-11 sm:w-11"
                  >
                    <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Удалить тренировку"
                    disabled={deletingId === entry.id}
                    onClick={() => handleDelete(entry.id)}
                    className="h-10 w-10 shrink-0 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors sm:h-11 sm:w-11"
                  >
                    {deletingId === entry.id ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl sm:max-w-lg p-5 sm:p-6">
          {selected && (
            <>
              <DialogHeader className="text-left pr-8 sm:pr-0">
                <DialogTitle className="text-base sm:text-lg leading-tight">
                  {formatDate(selected.finishedAt)}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500">
                  {getSessionLabel(selected.planned.params)} <br />≈{" "}
                  {selected.planned.estimatedDurationMinutes ?? 0} мин ·{" "}
                  {completionPercent(selected)}% подходов
                </DialogDescription>
              </DialogHeader>

              <ul className="space-y-2 sm:space-y-3">
                {selected.planned.exercises.map((item, i) => {
                  const sets = selected.completedExercises[i]?.sets ?? [];
                  const done = sets.filter((s) => s.completed).length;
                  return (
                    <li
                      key={`${item.exercise.id}-${i}`}
                      className="rounded-xl border border-slate-200 p-2.5 sm:p-3"
                    >
                      <p className="text-sm font-bold text-slate-900 sm:text-base">
                        {item.exercise.name}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        {translate(item.exercise.primaryMuscles[0])} · {done}/
                        {item.prescription.sets} подходов
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-3">
                <Button
                  type="button"
                  className="py-6 sm:py-7 w-full rounded-2xl bg-blue-600 font-bold text-white hover:bg-blue-700 text-sm sm:text-base"
                  onClick={() => handleRepeatWorkout(selected)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Повторить тренировку
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="py-4 w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm sm:text-base"
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
