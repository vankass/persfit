import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Exercise } from "@/types/exercise";
import type { UserProfile } from "@/types/profile";
import type {
  CompletedSet,
  GeneratedWorkout,
  GeneratorParams,
  GeneratorPhase,
  WorkoutHistoryEntry,
} from "@/types/workout";
import { getProfile, saveWorkoutHistory } from "@/lib/db";
import {
  DEFAULT_GENERATOR_PARAMS,
  generateWorkout,
} from "@/lib/workout/workoutGenerator";
import { GeneratorForm } from "@/components/generator/GeneratorForm";
import { WorkoutPlanView } from "@/components/generator/WorkoutPlanView";
import {
  WorkoutSessionView,
  type SessionProgress,
} from "@/components/generator/WorkoutSessionView";
import { WorkoutSummaryView } from "@/components/generator/WorkoutSummaryView";
import { Loader } from "@/components/Loader";

function initCompletedSets(workout: GeneratedWorkout): CompletedSet[][] {
  return workout.exercises.map((item) =>
    Array.from({ length: item.prescription.sets }, (_, i) => ({
      setIndex: i,
      completed: false,
    })),
  );
}

function calculateDuration(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.floor(diff / 1000));
}

export default function Generator() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<GeneratorPhase>("wizard");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<GeneratorParams>(
    DEFAULT_GENERATOR_PARAMS,
  );
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [sessionProgress, setSessionProgress] =
    useState<SessionProgress | null>(null);
  const [finishedAt, setFinishedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, res] = await Promise.all([
          getProfile(),
          fetch("/exercises/exercises.json"),
        ]);

        if (p) setProfile(p);
        if (res.ok) {
          const data = await res.json();
          setExercises(data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
          finishedAt,
        ),
      };

      await saveWorkoutHistory(entry);
      navigate("/history");
    } catch (error) {
      console.error("Не удалось сохранить тренировку:", error);
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!profile) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center">
        <p className="text-slate-500">
          Сначала заполните профиль в онбординге.
        </p>
      </div>
    );
  }

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
            onRegenerate={() => setPhase("wizard")}
            onStart={handleStartWorkout}
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
