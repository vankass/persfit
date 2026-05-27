import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Exercise } from "@/types/exercise";
import { useCatalogData } from "@/hooks/useCatalogData";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { CatalogFiltersBar } from "@/components/catalog/CatalogFiltersBar";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { ExerciseDetailsDialog } from "@/components/catalog/ExerciseDetailsDialog";

export default function Catalog() {
  const { exercises, isLoading } = useCatalogData();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const {
    filters,
    updateFilter,
    clearSearch,
    filteredExercises,
    displayedExercises,
    hasMore,
    loadMore,
  } = useCatalogFilters(exercises);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-0 pb-12">
      <CatalogFiltersBar
        totalCount={filteredExercises.length}
        filters={filters}
        onFilterChange={updateFilter}
        onClearSearch={clearSearch}
      />
      <CatalogGrid
        exercises={displayedExercises}
        hasMore={hasMore}
        onSelect={setSelectedExercise}
        onLoadMore={loadMore}
      />
      <ExerciseDetailsDialog
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}
