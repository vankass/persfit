interface SessionProgressBarProps {
  exerciseIndex: number;
  total: number;
  allSetsDone: boolean;
}

export function SessionProgressBar({
  exerciseIndex,
  total,
  allSetsDone,
}: SessionProgressBarProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-500">
        <span>
          Упражнение {exerciseIndex + 1} из {total}
        </span>
        <span className="text-blue-600">
          {Math.round(((exerciseIndex + (allSetsDone ? 1 : 0)) / total) * 100)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{
            width: `${((exerciseIndex + (allSetsDone ? 0.5 : 0)) / total) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
