import { Activity, ChevronRight, Dumbbell } from "lucide-react";
import { translate } from "@/lib/translations";
import type { Exercise } from "@/types/exercise";
import { Button } from "@/components/ui/button";

const LEVEL_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  beginner: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  intermediate: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  expert: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  all: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
};

interface CatalogGridProps {
  exercises: Exercise[];
  hasMore: boolean;
  onSelect: (exercise: Exercise) => void;
  onLoadMore: () => void;
}

export function CatalogGrid({
  exercises,
  hasMore,
  onSelect,
  onLoadMore,
}: CatalogGridProps) {
  return (
    <div className="mx-auto max-w-7xl px-1 py-6 sm:px-0 sm:py-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {exercises.map((ex) => (
          <div
            key={ex.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(ex)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(ex);
              }
            }}
            className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 sm:rounded-[24px] sm:p-5"
          >
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-50 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10">
              <h3 className="mb-2 flex min-w-0 items-start justify-between gap-2 text-base font-black leading-tight text-slate-800 transition-colors group-hover:text-blue-600 sm:text-lg">
                <span className="min-w-0 wrap-break-word">
                  {translate(ex.name)}
                </span>
                <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-blue-500" />
              </h3>

              <div className="mb-2 flex flex-wrap gap-1">
                {ex.primaryMuscles.slice(0, 2).map((m) => (
                  <span
                    key={m}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500"
                  >
                    {translate(m)}
                  </span>
                ))}
                {ex.primaryMuscles.length > 2 ? (
                  <span className="self-center text-[10px] font-bold text-slate-400">
                    +{ex.primaryMuscles.length - 2}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-3 border-t border-slate-50 pt-3 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between sm:pt-4">
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex min-w-0 max-w-full items-center gap-1.5">
                  <div className="shrink-0 rounded-lg bg-slate-50 p-1.5">
                    <Dumbbell className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-blue-500" />
                  </div>
                  <span className="truncate text-xs font-bold text-slate-500">
                    {translate(ex.equipment)}
                  </span>
                </div>

                <div className="flex min-w-0 max-w-full items-center gap-1.5">
                  <div className="shrink-0 rounded-lg bg-slate-50 p-1.5">
                    <Activity className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-blue-500" />
                  </div>
                  <span className="truncate text-xs font-bold text-slate-500">
                    {translate(ex.category)}
                  </span>
                </div>
              </div>

              <div
                className={`flex shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider min-[400px]:self-auto ${
                  LEVEL_STYLES[ex.level]?.bg || LEVEL_STYLES.all.bg
                } ${LEVEL_STYLES[ex.level]?.text || LEVEL_STYLES.all.text}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    LEVEL_STYLES[ex.level]?.dot || LEVEL_STYLES.all.dot
                  }`}
                />
                {translate(ex.level)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-12 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl border-slate-200 px-8 py-3 font-semibold text-slate-600 shadow-sm hover:border-blue-300 hover:bg-slate-50"
            onClick={onLoadMore}
          >
            Показать еще
          </Button>
        </div>
      ) : null}
    </div>
  );
}
