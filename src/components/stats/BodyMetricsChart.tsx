import { LineChart as LineChartIcon } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { MetricChartPoint } from "@/lib/stats/workoutAggregates";
import { shortLabel } from "./charts/chartUtils";
import { SvgDualLineChart } from "./charts/SvgDualLineChart";

export function BodyMetricsChart({ data }: { data: MetricChartPoint[] }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const chartHeight = isDesktop ? 300 : 220;
  const showChart = data.length >= 2;

  const lineData = data.map((p) => ({
    label: p.label,
    displayLabel: shortLabel(p.label, !isDesktop),
    weight: p.weight,
    bmi: p.bmi,
  }));

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 md:rounded-[32px] md:p-8">
      <div className="mb-4 flex items-center gap-2">
        <LineChartIcon className="h-4 w-4 text-violet-500" />
        <div>
          <h2 className="text-lg font-black text-slate-900 sm:text-xl">
            Динамика веса и ИМТ
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            По истории измерений
          </p>
        </div>
      </div>

      {!showChart ? (
        <div className="flex h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 md:h-[280px]">
          <LineChartIcon className="h-8 w-8 text-slate-300" />
          <p className="mt-2 max-w-xs text-center text-sm font-medium text-slate-400">
            {data.length === 1
              ? "Измените вес или рост в профиле, чтобы увидеть динамику"
              : "Недостаточно точек для графика"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden" style={{ height: chartHeight }}>
          <SvgDualLineChart data={lineData} height={chartHeight} />
        </div>
      )}
    </section>
  );
}
