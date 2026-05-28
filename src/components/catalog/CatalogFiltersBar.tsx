import {
  Search,
  Dumbbell,
  Activity,
  SlidersHorizontal,
  XCircle,
  Zap,
  Settings,
} from "lucide-react";
import { CatalogFilterDropdown } from "@/components/catalog/FilterDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CatalogFilterState } from "@/hooks/useCatalogFilters";

interface CatalogFiltersBarProps {
  totalCount: number;
  filters: CatalogFilterState;
  onFilterChange: <K extends keyof CatalogFilterState>(
    key: K,
    value: CatalogFilterState[K]
  ) => void;
  onClearSearch: () => void;
}

export function CatalogFiltersBar({
  totalCount,
  filters,
  onFilterChange,
  onClearSearch,
}: CatalogFiltersBarProps) {
  return (
    <div className="relative z-20 border-b border-slate-100 bg-slate-50/95 backdrop-blur-md">
      <div className="px-1 pb-1 sm:px-0">
        <h1 className="mb-4 flex flex-wrap items-center gap-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Каталог
          <span className="rounded-full bg-blue-100/40 px-3 py-1 text-sm font-medium text-blue-600">
            {totalCount}
          </span>
        </h1>

        <div className="space-y-4">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 sm:left-3.5" />
            <Input
              type="search"
              placeholder="Поиск упражнения..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange("searchQuery", e.target.value)}
              className="h-auto rounded-2xl border-0 bg-white py-3 pl-10 pr-11 text-sm shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 sm:py-3.5 sm:pl-11 sm:pr-12"
            />
            {filters.searchQuery ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={onClearSearch}
                aria-label="Очистить поиск"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            ) : null}
          </div>

          <div className="-mx-2 bg-slate-50/80 px-2 backdrop-blur-sm sm:mx-0 sm:px-0">
            <div className="mx-auto max-w-7xl">
              <div className="flex snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
                <CatalogFilterDropdown
                  label="Уровень"
                  icon={<SlidersHorizontal className="h-4 w-4" />}
                  options={["all", "beginner", "intermediate", "expert"]}
                  currentValue={filters.selectedLevel}
                  onChange={(val) => onFilterChange("selectedLevel", val)}
                />
                <CatalogFilterDropdown
                  label="Тип"
                  icon={<Activity className="h-4 w-4" />}
                  options={[
                    "all",
                    "strength",
                    "stretching",
                    "cardio",
                    "powerlifting",
                    "plyometrics",
                    "olympic weightlifting",
                    "strongman",
                  ]}
                  currentValue={filters.selectedCategory}
                  onChange={(val) => onFilterChange("selectedCategory", val)}
                />
                <CatalogFilterDropdown
                  label="Снаряд"
                  icon={<Dumbbell className="h-4 w-4" />}
                  options={[
                    "all",
                    "body only",
                    "dumbbell",
                    "barbell",
                    "kettlebells",
                    "bands",
                    "cable",
                    "machine",
                    "medicine ball",
                    "exercise ball",
                    "e-z curl bar",
                    "foam roll",
                    "other",
                  ]}
                  currentValue={filters.selectedEquipment}
                  onChange={(val) => onFilterChange("selectedEquipment", val)}
                />
                <CatalogFilterDropdown
                  label="Мышцы"
                  icon={<Activity className="h-4 w-4" />}
                  options={[
                    "all",
                    "abdominals",
                    "abductors",
                    "adductors",
                    "biceps",
                    "calves",
                    "chest",
                    "forearms",
                    "glutes",
                    "hamstrings",
                    "lats",
                    "lower back",
                    "middle back",
                    "neck",
                    "quadriceps",
                    "shoulders",
                    "traps",
                    "triceps",
                  ]}
                  currentValue={filters.selectedMuscle}
                  onChange={(val) => onFilterChange("selectedMuscle", val)}
                />
                <CatalogFilterDropdown
                  label="Механика"
                  icon={<Settings className="h-4 w-4" />}
                  options={["all", "compound", "isolation"]}
                  currentValue={filters.selectedMechanic}
                  onChange={(val) => onFilterChange("selectedMechanic", val)}
                />
                <CatalogFilterDropdown
                  label="Усилие"
                  icon={<Zap className="h-4 w-4" />}
                  options={["all", "push", "pull", "static"]}
                  currentValue={filters.selectedForce}
                  onChange={(val) => onFilterChange("selectedForce", val)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
