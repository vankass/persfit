import { useState } from "react";
import type { Exercise } from "@/types/exercise";
import { useCatalogData } from "@/hooks/useCatalogData";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { CatalogFiltersBar } from "@/components/catalog/CatalogFiltersBar";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { ExerciseDetailsDialog } from "@/components/catalog/ExerciseDetailsDialog";
import { Loader } from "@/components/Loader";

export default function Catalog() {
  const { exercises, loading } = useCatalogData();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const {
    filters,
    updateFilter,
    clearSearch,
    filteredExercises,
    displayedExercises,
    hasMore,
    loadMore,
  } = useCatalogFilters(exercises);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
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
    </>
  );
}
