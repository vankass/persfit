import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeftRight, Play, RefreshCw, Timer } from "lucide-react";
import type { Exercise } from "@/types/exercise";
import type { GeneratedWorkout, PlannedExercise } from "@/types/workout";
import { translate } from "@/utils/translations";
import { GOAL_LABELS } from "@/lib/workoutGenerator";
import {
  buildCandidatePoolForAlternatives,
  getAlternatives,
} from "@/lib/exerciseAlternatives";

interface WorkoutPlanViewProps {
  workout: GeneratedWorkout;
  allExercises: Exercise[];
  onWorkoutChange: (workout: GeneratedWorkout) => void;
  onRegenerate: () => void;
  onStart: () => void;
}

export function WorkoutPlanView({
  workout,
  allExercises,
  onWorkoutChange,
  onRegenerate,
  onStart,
}: WorkoutPlanViewProps) {
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const pool = buildCandidatePoolForAlternatives(
    allExercises,
    workout.profileSnapshot.level,
    workout.params.equipment
  );

  const excludeIds = new Set(workout.exercises.map((e) => e.exercise.id));

  const handleReplace = (index: number, newExercise: Exercise) => {
    const updated = workout.exercises.map((item, i) =>
      i === index ? { ...item, exercise: newExercise } : item
    );
    onWorkoutChange({ ...workout, exercises: updated });
    setReplaceIndex(null);
  };

  const replacingItem =
    replaceIndex !== null ? workout.exercises[replaceIndex] : null;
  const alternatives =
    replacingItem != null
      ? getAlternatives(replacingItem.exercise, pool, excludeIds)
      : [];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Ваш план</h2>
        <p className="mt-1 text-sm text-slate-500">
          {GOAL_LABELS[workout.params.goal]} · {workout.params.durationMinutes}{" "}
          мин · {workout.exercises.length} упражнений
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={onRegenerate}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Перегенерировать
          </Button>
          <Button
            type="button"
            className="rounded-2xl bg-blue-600 font-bold hover:bg-blue-700"
            onClick={onStart}
          >
            <Play className="mr-2 h-4 w-4 fill-current" />
            Начать тренировку
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {workout.exercises.map((item, index) => (
          <ExercisePlanCard
            key={`${item.exercise.id}-${index}`}
            item={item}
            index={index}
            onReplace={() => setReplaceIndex(index)}
          />
        ))}
      </div>

      <Dialog
        open={replaceIndex !== null}
        onOpenChange={(open) => !open && setReplaceIndex(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Заменить упражнение</DialogTitle>
          </DialogHeader>
          {replacingItem && (
            <p className="text-sm text-slate-500">
              Сейчас: {replacingItem.exercise.name}
            </p>
          )}
          <div className="space-y-2">
            {alternatives.length === 0 ? (
              <p className="text-sm text-slate-400">
                Альтернатив не найдено. Попробуйте расширить список оборудования.
              </p>
            ) : (
              alternatives.map((alt) => (
                <button
                  key={alt.id}
                  type="button"
                  onClick={() =>
                    replaceIndex !== null && handleReplace(replaceIndex, alt)
                  }
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/50"
                >
                  {alt.images[0] ? (
                    <img
                      src={`/exercises/images/${alt.images[0]}`}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl object-cover bg-slate-100"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900">{alt.name}</div>
                    <div className="text-xs text-slate-500">
                      {translate(alt.primaryMuscles[0])} ·{" "}
                      {translate(alt.equipment)}
                    </div>
                  </div>
                  <ArrowLeftRight className="h-4 w-4 shrink-0 text-blue-500" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExercisePlanCard({
  item,
  index,
  onReplace,
}: {
  item: PlannedExercise;
  index: number;
  onReplace: () => void;
}) {
  const { exercise, prescription } = item;
  const img = exercise.images[0];

  return (
    <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      {img ? (
        <img
          src={`/exercises/images/${img}`}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl object-cover bg-slate-50"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
          {index + 1}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900">{exercise.name}</h3>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
            #{index + 1}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {translate(exercise.primaryMuscles[0])} · {translate(exercise.level)}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
          <span>
            {prescription.sets} × {prescription.reps}
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Timer className="h-3.5 w-3.5" />
            {prescription.restSeconds} сек
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 h-8 rounded-xl px-2 text-blue-600"
          onClick={onReplace}
        >
          <ArrowLeftRight className="mr-1 h-3.5 w-3.5" />
          Заменить
        </Button>
      </div>
    </div>
  );
}
