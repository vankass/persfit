import { Check } from "lucide-react";
import type { CompletedSet } from "@/types/workout";

interface SetTrackerProps {
  setsCount: number;
  completedSets: CompletedSet[];
  onToggleSet: (setIndex: number) => void;
}

export function SetTracker({
  setsCount,
  completedSets,
  onToggleSet,
}: SetTrackerProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-3 font-bold text-slate-800">Подходы</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: setsCount }, (_, i) => {
          const done = completedSets.find(
            (set) => set.setIndex === i && set.completed
          );
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggleSet(i)}
              className={[
                "flex min-h-13 items-center justify-center gap-2 rounded-2xl border-2 py-4 font-bold transition-all",
                done
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200",
              ].join(" ")}
            >
              {done ? <Check className="h-5 w-5" /> : <span>{i + 1}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
