import { useEffect } from "react";
import { Activity, X } from "lucide-react";
import { translate } from "@/lib/translations";
import type { Exercise } from "@/types/exercise";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExerciseVideosSection } from "@/components/exercise/ExerciseVideosSection";
import { useExerciseVideos } from "@/hooks/useExerciseVideos";

interface ExerciseDetailsDialogProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export function ExerciseDetailsDialog({
  exercise,
  onClose,
}: ExerciseDetailsDialogProps) {
  const { videos, loading, error, showVideos, load, reset } =
    useExerciseVideos();

  useEffect(() => {
    if (!exercise) reset();
  }, [exercise, reset]);

  return (
    <Dialog
      open={Boolean(exercise)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="fixed bottom-0 left-0 right-0 top-auto flex max-h-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-slate-200 p-0 sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-h-[min(90vh,calc(100vh-2rem))] sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-3xl"
      >
        {exercise ? (
          <>
            <DialogHeader className="flex-row items-start gap-3 space-y-0 border-b border-slate-100 p-4 sm:p-6">
              <DialogTitle className="min-w-0 flex-1 pr-2 text-left text-lg font-bold text-slate-900 wrap-break-word sm:text-xl">
                {exercise.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Подробности упражнения, изображения и пошаговая инструкция.
              </DialogDescription>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full"
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5 text-slate-500 sm:h-6 sm:w-6" />
                </Button>
              </DialogClose>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4">
                {exercise.images.map((img, index) => (
                  <div
                    key={`${img}-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-100"
                  >
                    <img
                      src={`/exercises/images/${img}`}
                      alt={`${exercise.name} шаг ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400?text=No+Image";
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4">
                <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                  <span className="mb-1 block text-xs font-bold uppercase text-slate-400">
                    Мышцы
                  </span>
                  <p className="wrap-break-word text-sm font-medium text-slate-700 sm:text-base">
                    {translate(exercise.primaryMuscles.join(", "))}
                  </p>
                </div>
                <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                  <span className="mb-1 block text-xs font-bold uppercase text-slate-400">
                    Тип
                  </span>
                  <p className="wrap-break-word text-sm font-medium text-slate-700 sm:text-base">
                    {translate(exercise.category)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Инструкция
                </h4>
                <ol className="space-y-4">
                  {exercise.instructions.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                        {i + 1}
                      </span>
                      <p className="leading-relaxed text-slate-600">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <ExerciseVideosSection
                videos={videos}
                loading={loading}
                error={error}
                showVideos={showVideos}
                onLoad={() => load(exercise.id)}
                variant="catalog"
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
