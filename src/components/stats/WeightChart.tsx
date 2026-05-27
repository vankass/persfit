"use client";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, type ChartData } from "chart.js";
import { Line } from "react-chartjs-2";
import type { BodyMeasurement } from "@/types/measurement";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface WeightChartProps {
  measurements: BodyMeasurement[];
}

export function WeightChart({ measurements }: WeightChartProps) {
  if (measurements.length === 0) return null;

  const labels = measurements.map((m) =>
    new Date(m.recordedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  );
  const weights = measurements.map((m) => m.weight);

  const chartData: ChartData<"line"> = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Вес (кг)",
        data: weights,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: "#f1f5f9" }, ticks: { color: "#94a3b8", font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } } },
    },
  };

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Динамика веса</h2>
        <p className="text-xs text-slate-400">История изменений</p>
      </div>
      <div className="h-60 w-full">
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}