import { Dumbbell, Calendar, Clock } from "lucide-react";
import type { WorkoutSummary } from "@/lib/stats/workoutAggregates";

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm md:rounded-[28px] md:p-6">
      <div className="rounded-xl bg-slate-50 p-2">{icon}</div>
      <div className="text-center">
        <span className="text-2xl font-black leading-none md:text-3xl">
          {value}
        </span>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-slate-400 md:text-xs">
          {label}
        </p>
      </div>
    </div>
  );
}

export function StatsSummaryRow({ summary }: { summary: WorkoutSummary }) {
  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-3">
      <StatBox
        icon={<Dumbbell className="text-blue-500" />}
        value={String(summary.totalWorkouts)}
        label="всего"
      />
      <StatBox
        icon={<Calendar className="text-green-500" />}
        value={String(summary.weekCount)}
        label="за 7 дней"
      />
      <StatBox
        icon={<Clock className="text-purple-500" />}
        value={String(summary.totalMinutes)}
        label="мин всего"
      />
    </section>
  );
}
