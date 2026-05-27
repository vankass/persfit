import { useMemo, useState } from "react";
import type { Exercise } from "@/types/exercise";

const ITEMS_PER_PAGE = 12;

export interface CatalogFilterState {
  searchQuery: string;
  selectedLevel: string;
  selectedCategory: string;
  selectedEquipment: string;
  selectedMuscle: string;
  selectedForce: string;
  selectedMechanic: string;
}

const INITIAL_FILTERS: CatalogFilterState = {
  searchQuery: "",
  selectedLevel: "all",
  selectedCategory: "all",
  selectedEquipment: "all",
  selectedMuscle: "all",
  selectedForce: "all",
  selectedMechanic: "all",
};

export function useCatalogFilters(exercises: Exercise[]) {
  const [filters, setFilters] = useState<CatalogFilterState>(INITIAL_FILTERS);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const resetPagination = () => setVisibleCount(ITEMS_PER_PAGE);

  const updateFilter = <K extends keyof CatalogFilterState>(
    key: K,
    value: CatalogFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    resetPagination();
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase());
      const matchesLevel =
        filters.selectedLevel === "all" || ex.level === filters.selectedLevel;
      const matchesCategory =
        filters.selectedCategory === "all" ||
        ex.category === filters.selectedCategory;
      const matchesEquipment =
        filters.selectedEquipment === "all" ||
        ex.equipment === filters.selectedEquipment;
      const matchesMuscle =
        filters.selectedMuscle === "all" ||
        (ex.primaryMuscles as string[]).includes(filters.selectedMuscle);
      const matchesForce =
        filters.selectedForce === "all" || ex.force === filters.selectedForce;
      const matchesMechanic =
        filters.selectedMechanic === "all" ||
        ex.mechanic === filters.selectedMechanic;

      return (
        matchesSearch &&
        matchesLevel &&
        matchesCategory &&
        matchesEquipment &&
        matchesMuscle &&
        matchesForce &&
        matchesMechanic
      );
    });
  }, [exercises, filters]);

  const displayedExercises = useMemo(
    () => filteredExercises.slice(0, visibleCount),
    [filteredExercises, visibleCount]
  );

  const hasMore = visibleCount < filteredExercises.length;

  const loadMore = () => setVisibleCount((prev) => prev + ITEMS_PER_PAGE);

  const clearSearch = () => updateFilter("searchQuery", "");

  return {
    filters,
    updateFilter,
    clearSearch,
    filteredExercises,
    displayedExercises,
    hasMore,
    loadMore,
  };
}
