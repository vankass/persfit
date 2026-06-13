import { Loader } from "@/components/Loader";
import { StatsSummaryRow } from "@/components/stats/StatsSummaryRow";
import { AnthropometrySection } from "@/components/stats/AnthropometrySection";
import { ActivityCalendar } from "@/components/stats/ActivityCalendar";
import { buildWorkoutSummary } from "@/lib/stats/workoutAggregates";
import { useStatsData } from "@/hooks/useStatsData";
import { WeightChart } from "@/components/stats/WeightChart";

export default function Stats() {
  const { profile, history, measurements, loading } = useStatsData();

  if (loading) {
    return <Loader />;
  }

  const summary = buildWorkoutSummary(history);

  return (
    <div className="space-y-5 pb-12">
      <header>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
          Статистика
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Прогресс тренировок и анализ тела
        </p>
      </header>

      <StatsSummaryRow summary={summary} />

      {profile ? (
        <AnthropometrySection profile={profile} />
      ) : (
        <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            Заполните профиль, чтобы увидеть анализ тела
          </p>
        </section>
      )}

      <WeightChart measurements={measurements} />

      <ActivityCalendar history={history} />
    </div>
  );
}
