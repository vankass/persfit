import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  CompletedSet,
  GeneratedWorkout,
  GeneratorParams,
  GeneratorPhase,
  WorkoutHistoryEntry,
} from "@/types/workout";
import { generateWorkout } from "@/lib/workout/workoutGenerator";
import { DEFAULT_GENERATOR_PARAMS } from "@/lib/workout/constants";
import { GeneratorForm } from "@/components/generator/GeneratorForm";
import { WorkoutPlanView } from "@/components/generator/WorkoutPlanView";
import {
  WorkoutSessionView,
  type SessionProgress,
} from "@/components/generator/WorkoutSessionView";
import { WorkoutSummaryView } from "@/components/generator/WorkoutSummaryView";
import { Loader } from "@/components/Loader";
import { useGeneratorData } from "@/hooks/useGeneratorData";
import { saveWorkoutHistory } from "@/lib/db";

export default function Generator() {
  const navigate = useNavigate();
  const { profile, exercises, loading } = useGeneratorData();
  const [phase, setPhase] = useState<GeneratorPhase>("wizard");
  const [params, setParams] = useState<GeneratorParams>(
    DEFAULT_GENERATOR_PARAMS
  );
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [sessionProgress, setSessionProgress] =
    useState<SessionProgress | null>(null);
  const [finishedAt, setFinishedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <Loader />;
  }

  if (!profile) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center">
        <p className="text-slate-500">
          Пожалуйста, заполните профиль, чтобы сгенерировать тренировку.
        </p>
      </div>
    );
  }
  
  const handleGenerate = () => {
    if (!profile || exercises.length === 0) return;
    setWorkout(generateWorkout(exercises, profile, params));
    setPhase("plan");
  };

  const handleStartWorkout = () => {
    if (!workout) return;
    setSessionProgress({
      sessionPhase: "warmup",
      exerciseIndex: 0,
      completedSets: initCompletedSets(workout),
      startedAt: new Date().toISOString(),
    });
    setPhase("active");
  };

  const handleFinishSession = () => {
    setFinishedAt(new Date().toISOString());
    setPhase("summary");
  };

  const handleSaveHistory = async () => {
    if (saving || !workout || !sessionProgress || !finishedAt) return;

    setSaving(true);
    try {
      const entry: WorkoutHistoryEntry = {
        id: crypto.randomUUID(),
        startedAt: sessionProgress.startedAt,
        finishedAt,
        planned: workout,
        completedExercises: workout.exercises.map((item, i) => ({
          exerciseId: item.exercise.id,
          sets: sessionProgress.completedSets[i] ?? [],
        })),
        totalDurationSeconds: calculateDuration(
          sessionProgress.startedAt,
          finishedAt
        ),
      };

      await saveWorkoutHistory(entry);
      navigate("/history");
    } catch (error) {
      console.error("Не удалось сохранить тренировку:", error);
      setSaving(false);
    }
  };

  const renderPhase = () => {
    switch (phase) {
      case "wizard":
        return (
          <GeneratorForm
            profile={profile}
            params={params}
            onChange={setParams}
            onGenerate={handleGenerate}
          />
        );
      case "plan":
        return workout ? (
          <WorkoutPlanView
            workout={workout}
            allExercises={exercises}
            onWorkoutChange={setWorkout}
            onStart={handleStartWorkout}
            onBack={() => setPhase("wizard")} 
          />
        ) : null;
      case "active":
        return workout && sessionProgress ? (
          <WorkoutSessionView
            workout={workout}
            progress={sessionProgress}
            onProgressChange={setSessionProgress}
            onFinish={handleFinishSession}
          />
        ) : null;
      case "summary":
        return workout && sessionProgress && finishedAt ? (
          <WorkoutSummaryView
            workout={workout}
            progress={sessionProgress}
            finishedAt={finishedAt}
            onSave={handleSaveHistory}
            saving={saving}
          />
        ) : null;
      default:
        return null;
    }
  };

  return <div className="mx-auto max-w-3xl space-y-3">{renderPhase()}</div>;
}

function initCompletedSets(workout: GeneratedWorkout): CompletedSet[][] {
  return workout.exercises.map((item) =>
    Array.from({ length: item.prescription.sets }, (_, i) => ({
      setIndex: i,
      completed: false,
    }))
  );
}

function calculateDuration(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.floor(diff / 1000));
}