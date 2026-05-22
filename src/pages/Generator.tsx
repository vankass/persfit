import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
} from "@/lib/workoutGenerator";
import { GeneratorForm } from "@/components/generator/GeneratorForm";
import { WorkoutPlanView } from "@/components/generator/WorkoutPlanView";
import {
  WorkoutSessionView,
  type SessionProgress,
} from "@/components/generator/WorkoutSessionView";
import { WorkoutSummaryView } from "@/components/generator/WorkoutSummaryView";

function initCompletedSets(workout: GeneratedWorkout): CompletedSet[][] {
  return workout.exercises.map((item) =>
    Array.from({ length: item.prescription.sets }, (_, i) => ({
      setIndex: i,
      completed: false,
    }))
  );
}

export default function Generator() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GeneratorPhase>("wizard");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<GeneratorParams>(
    DEFAULT_GENERATOR_PARAMS
  );
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [sessionProgress, setSessionProgress] =
    useState<SessionProgress | null>(null);
  const [finishedAt, setFinishedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [p, res] = await Promise.all([
        getProfile(),
        fetch("/exercises/exercises.json"),
      ]);
      if (p) setProfile(p as UserProfile);
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleGenerate = () => {
    if (!profile || exercises.length === 0) return;
    const generated = generateWorkout(exercises, profile, params);
    setWorkout(generated);
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
    if (!workout || !sessionProgress || !finishedAt) return;
    setSaving(true);
    const entry: WorkoutHistoryEntry = {
      id: crypto.randomUUID(),
      startedAt: sessionProgress.startedAt,
      finishedAt,
      planned: workout,
      completedExercises: workout.exercises.map((item, i) => ({
        exerciseId: item.exercise.id,
        sets: sessionProgress.completedSets[i] ?? [],
      })),
      totalDurationSeconds: Math.max(
        0,
        Math.floor(
          (new Date(finishedAt).getTime() -
            new Date(sessionProgress.startedAt).getTime()) /
            1000
        )
      ),
    };
    await saveWorkoutHistory(entry);
    setSaving(false);
    navigate("/history");
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
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

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {phase === "wizard" && (
        <GeneratorForm
          profile={profile}
          params={params}
          onChange={setParams}
          onGenerate={handleGenerate}
        />
      )}

      {phase === "plan" && workout && (
        <WorkoutPlanView
          workout={workout}
          allExercises={exercises}
          onWorkoutChange={setWorkout}
          onRegenerate={() => setPhase("wizard")}
          onStart={handleStartWorkout}
        />
      )}

      {phase === "active" && workout && sessionProgress && (
        <WorkoutSessionView
          workout={workout}
          progress={sessionProgress}
          onProgressChange={setSessionProgress}
          onFinish={handleFinishSession}
        />
      )}

      {phase === "summary" && workout && sessionProgress && finishedAt && (
        <WorkoutSummaryView
          workout={workout}
          progress={sessionProgress}
          finishedAt={finishedAt}
          onSave={handleSaveHistory}
          saving={saving}
        />
      )}
    </div>
  );
}
