import type { WorkoutHistoryEntry } from "@/types/workout";
import type { BodyMeasurement } from "@/types/measurement";
import { calcBmi } from "@/lib/anthropometry";
import { completionPercent } from "@/lib/workout/completion";

const WEEKS_LIMIT = 10;

export interface WeekBucket {
  weekKey: string;
  label: string;
  count: number;
  minutes: number;
  avgCompletion: number;
}

export interface WorkoutSummary {
  totalWorkouts: number;
  weekCount: number;
  totalMinutes: number;
  avgCompletion: number;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startStr = weekStart.toLocaleDateString("ru-RU", opts);
  const endStr = end.toLocaleDateString("ru-RU", opts);
  if (weekStart.getMonth() === end.getMonth()) {
    return `${weekStart.getDate()}–${end.getDate()} ${end.toLocaleDateString(
      "ru-RU",
      { month: "short" }
    )}`;
  }
  return `${startStr} – ${endStr}`;
}

export function buildWorkoutSummary(
  entries: WorkoutHistoryEntry[]
): WorkoutSummary {
  const totalSeconds = entries.reduce(
    (sum, e) => sum + e.totalDurationSeconds,
    0
  );
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekCount = entries.filter(
    (e) => new Date(e.finishedAt).getTime() >= weekAgo
  ).length;
  const avgCompletion =
    entries.length > 0
      ? Math.round(
          entries.reduce((sum, e) => sum + completionPercent(e), 0) /
            entries.length
        )
      : 0;

  return {
    totalWorkouts: entries.length,
    weekCount,
    totalMinutes: Math.floor(totalSeconds / 60),
    avgCompletion,
  };
}

export function aggregateByWeek(entries: WorkoutHistoryEntry[]): WeekBucket[] {
  const map = new Map<
    string,
    { weekStart: Date; count: number; minutes: number; completions: number[] }
  >();

  for (const entry of entries) {
    let date: Date;
    if (
      typeof entry.finishedAt === "string" &&
      entry.finishedAt.includes("T")
    ) {
      date = new Date(entry.finishedAt);
    } else {
      const [year, month, day] = String(entry.finishedAt)
        .split("-")
        .map(Number);
      date = new Date(year, month - 1, day);
    }

    const weekStart = getWeekStart(date);

    const year = weekStart.getFullYear();
    const month = String(weekStart.getMonth() + 1).padStart(2, "0");
    const day = String(weekStart.getDate()).padStart(2, "0");
    const weekKey = `${year}-${month}-${day}`;

    const bucket = map.get(weekKey) ?? {
      weekStart,
      count: 0,
      minutes: 0,
      completions: [],
    };
    bucket.count += 1;
    bucket.minutes += Math.floor(entry.totalDurationSeconds / 60);
    bucket.completions.push(completionPercent(entry));
    map.set(weekKey, bucket);
  }

  const sorted = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-WEEKS_LIMIT);

  return sorted.map(([weekKey, bucket]) => ({
    weekKey,
    label: formatWeekLabel(bucket.weekStart),
    count: bucket.count,
    minutes: bucket.minutes,
    avgCompletion:
      bucket.completions.length > 0
        ? Math.round(
            bucket.completions.reduce((a, b) => a + b, 0) /
              bucket.completions.length
          )
        : 0,
  }));
}

export interface MetricChartPoint {
  date: string;
  label: string;
  weight: number;
  bmi: number;
}

export function buildMetricSeries(
  measurements: BodyMeasurement[],
  workoutEntries: WorkoutHistoryEntry[]
): MetricChartPoint[] {
  const points: { recordedAt: string; weight: number; height: number }[] = [];

  for (const m of measurements) {
    points.push({
      recordedAt: m.recordedAt,
      weight: m.weight,
      height: m.height,
    });
  }

  for (const entry of workoutEntries) {
    const snap = entry.planned.profileSnapshot;
    if (snap?.weight && snap?.height) {
      points.push({
        recordedAt: entry.finishedAt,
        weight: snap.weight,
        height: snap.height,
      });
    }
  }

  points.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));

  const seen = new Set<string>();
  const unique: MetricChartPoint[] = [];

  for (const p of points) {
    const key = `${p.recordedAt.slice(0, 10)}-${p.weight}-${p.height}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const date = new Date(p.recordedAt);
    unique.push({
      date: p.recordedAt,
      label: date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      }),
      weight: p.weight,
      bmi: calcBmi(p.weight, p.height),
    });
  }

  return unique.slice(-20);
}
