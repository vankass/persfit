import { BarChart3, TrendingUp } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { WeekBucket } from "@/lib/stats/workoutAggregates";
import { shortLabel } from "./charts/chartUtils";
import { SvgBarChart } from "./charts/SvgBarChart";
import { SvgAreaChart } from "./charts/SvgAreaChart";

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 md:h-[280px]">
      <BarChart3 className="h-8 w-8 text-slate-300" />
      <p className="mt-2 text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}

export function WorkoutCharts({ weeks }: { weeks: WeekBucket[] }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const chartHeight = isDesktop ? 280 : 220;
  const hasData = weeks.some((w) => w.count > 0);

  const barData = weeks.map((w) => ({
    label: w.label,
    displayLabel: shortLabel(w.label, !isDesktop),
    value: w.count,
  }));

  const areaData = weeks.map((w) => ({
    label: w.label,
    displayLabel: shortLabel(w.label, !isDesktop),
    value: w.minutes,
  }));

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black text-slate-900 sm:text-xl">
        Активность
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-700">
              Тренировки в неделю
            </h3>
          </div>
          {!hasData ? (
            <ChartEmpty message="Завершите тренировки, чтобы увидеть график" />
          ) : (
            <div
              className="overflow-hidden"
              style={{ height: chartHeight }}
            >
              <SvgBarChart data={barData} height={chartHeight} />
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-700">
              Минуты в неделю
            </h3>
          </div>
          {!hasData ? (
            <ChartEmpty message="Нет данных о длительности" />
          ) : (
            <div
              className="overflow-hidden"
              style={{ height: chartHeight }}
            >
              <SvgAreaChart data={areaData} height={chartHeight} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
