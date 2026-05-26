import { useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import {
  getProfile,
  getWorkoutHistory,
  getBodyMeasurements,
  seedBodyMeasurementFromProfile,
} from "@/lib/db";
import type { UserProfile } from "@/types/profile";
import type { WorkoutHistoryEntry } from "@/types/workout";
import type { BodyMeasurement } from "@/types/measurement";
import { StatsSummaryRow } from "@/components/stats/StatsSummaryRow";
import { AnthropometrySection } from "@/components/stats/AnthropometrySection";
import { WorkoutCharts } from "@/components/stats/WorkoutCharts";
import { BodyMetricsChart } from "@/components/stats/BodyMetricsChart";
import {
  aggregateByWeek,
  buildWorkoutSummary,
  buildMetricSeries,
} from "@/lib/stats/workoutAggregates";

export default function Stats() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [userProfile, workouts] = await Promise.all([
        getProfile(),
        getWorkoutHistory(),
      ]);

      if (userProfile) {
        await seedBodyMeasurementFromProfile(userProfile);
      }

      const bodyMeasurements = await getBodyMeasurements();

      setProfile(userProfile ?? null);
      setHistory(workouts);
      setMeasurements(bodyMeasurements);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const summary = buildWorkoutSummary(history);
  const weeks = aggregateByWeek(history);
  const metricSeries = buildMetricSeries(measurements, history);

  return (
    <div className="space-y-5 pb-12">
      <header>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
          Статистика
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Прогресс тренировок и антропометрические показатели
        </p>
      </header>

      <StatsSummaryRow summary={summary} />

      {profile ? (
        <AnthropometrySection profile={profile} />
      ) : (
        <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            Заполните профиль, чтобы увидеть антропометрию
          </p>
        </section>
      )}

      <WorkoutCharts weeks={weeks} />

      <BodyMetricsChart data={metricSeries} />
    </div>
  );
}
