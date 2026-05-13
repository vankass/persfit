import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Dumbbell,
  Activity,
  Loader2,
  X,
  ChevronRight,
  CheckCircle2,
  SlidersHorizontal,
  XCircle,
  Zap,
  Settings,
  ChevronDown
} from "lucide-react";
import { translate } from "../utils/translations";
import type { Exercise } from "../types/exercise";

interface FilterDropdownProps<T extends string> {
  label: string;
  icon: React.ReactNode;
  options: T[];
  currentValue: T;
  onChange: (value: T) => void;
}

const FilterDropdown = <T extends string>({
  label,
  icon,
  options,
  currentValue,
  onChange,
}: FilterDropdownProps<T>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 border
          ${
            isOpen || currentValue !== "all"
              ? "bg-blue-50 border-blue-200 text-blue-600"
              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
      >
        <span
          className={isOpen || currentValue !== "all" ? "text-blue-500" : "text-gray-400"}
        >
          {icon}
        </span>
        <span>{currentValue === "all" ? label : translate(currentValue)}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 z-50 py-2 max-h-80 overflow-y-auto no-scrollbar">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <span
                className={
                  currentValue === opt ? "text-blue-600" : "text-gray-600"
                }
              >
                {opt === "all" ? `Все` : translate(opt)}
              </span>
              {currentValue === opt && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Catalog: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // --- СОСТОЯНИЯ ФИЛЬТРОВ ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [selectedForce, setSelectedForce] = useState<string>("all");
  const [selectedMechanic, setSelectedMechanic] = useState<string>("all");

  const ITEMS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    fetch("/exercises/exercises.json")
      .then((res) => res.json())
      .then((data) => {
        setExercises(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Универсальный сброс пагинации
  const resetScroll = () => setVisibleCount(ITEMS_PER_PAGE);

  // --- ЛОГИКА ФИЛЬТРАЦИИ ---
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesLevel =
        selectedLevel === "all" || ex.level === selectedLevel;
      const matchesCategory =
        selectedCategory === "all" || ex.category === selectedCategory;
      const matchesEquipment =
        selectedEquipment === "all" || ex.equipment === selectedEquipment;

      // Используем приведение к string[], чтобы .includes работал корректно без any
      const matchesMuscle =
        selectedMuscle === "all" ||
        (ex.primaryMuscles as string[]).includes(selectedMuscle);
      const matchesForce =
        selectedForce === "all" || ex.force === selectedForce;
      const matchesMechanic =
        selectedMechanic === "all" || ex.mechanic === selectedMechanic;

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
  }, [
    searchQuery,
    selectedLevel,
    selectedCategory,
    selectedEquipment,
    selectedMuscle,
    selectedForce,
    selectedMechanic,
    exercises,
  ]);

  const displayedExercises = useMemo(() => {
    return filteredExercises.slice(0, visibleCount);
  }, [filteredExercises, visibleCount]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const levelStyles: Record<string, { bg: string; text: string; dot: string }> =
    {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative z-20 bg-gray-50/95 backdrop-blur-md border-b border-gray-100 pt-3">
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-black text-gray-900 mb-5 tracking-tight">
            Каталог
            <span className="text-blue-600 text-sm font-medium ml-2 bg-blue-50 px-3 py-1 rounded-full">
              {filteredExercises.length}
            </span>
          </h1>

          <div className="space-y-4">
            {/* ПОИСК */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Поиск упражнения..."
                className="block w-full pl-11 pr-12 py-3.5 bg-white border-none rounded-2xl text-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetScroll();
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    resetScroll();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* СЕТКА ФИЛЬТРОВ */}
            <div className="bg-gray-50/80 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto">
                <div className="flex gap-2 no-scrollbar pb-2">
                  <FilterDropdown
                    label="Уровень"
                    icon={<SlidersHorizontal className="w-4 h-4" />}
                    options={["all", "beginner", "intermediate", "expert"]}
                    currentValue={selectedLevel}
                    onChange={(val) => {
                      setSelectedLevel(val);
                      resetScroll();
                    }}
                  />
                  <FilterDropdown
                    label="Тип"
                    icon={<Activity className="w-4 h-4" />}
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
                    currentValue={selectedCategory}
                    onChange={(val) => {
                      setSelectedCategory(val);
                      resetScroll();
                    }}
                  />
                  <FilterDropdown
                    label="Снаряд"
                    icon={<Dumbbell className="w-4 h-4" />}
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
                    currentValue={selectedEquipment}
                    onChange={(val) => {
                      setSelectedEquipment(val);
                      resetScroll();
                    }}
                  />
                  <FilterDropdown
                    label="Мышцы"
                    icon={<Activity className="w-4 h-4" />}
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
                    currentValue={selectedMuscle}
                    onChange={(val) => {
                      setSelectedMuscle(val);
                      resetScroll();
                    }}
                  />
                  <FilterDropdown
                    label="Механика"
                    icon={<Settings className="w-4 h-4" />}
                    options={["all", "compound", "isolation"]}
                    currentValue={selectedMechanic}
                    onChange={(val) => {
                      setSelectedMechanic(val);
                      resetScroll();
                    }}
                  />
                  <FilterDropdown
                    label="Усилие"
                    icon={<Zap className="w-4 h-4" />}
                    options={["all", "push", "pull", "static"]}
                    currentValue={selectedForce}
                    onChange={(val) => {
                      setSelectedForce(val);
                      resetScroll();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ТВОЙ ОРИГИНАЛЬНЫЙ СПИСОК УПРАЖНЕНИЙ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayedExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="group relative bg-white p-5 rounded-[24px] border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Фоновый декоративный элемент при наведении */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

              <div className="relative z-10">
                <h3 className="flex justify-between text-lg font-black text-gray-800 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                  {translate(ex.name)}
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </h3>

                {/* Короткий список мышц (первые две) */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {ex.primaryMuscles.slice(0, 2).map((m) => (
                    <span
                      key={m}
                      className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase"
                    >
                      {translate(m)}
                    </span>
                  ))}
                  {ex.primaryMuscles.length > 2 && (
                    <span className="text-[10px] text-gray-400 font-bold self-center">
                      +{ex.primaryMuscles.length - 2}
                    </span>
                  )}
                </div>
              </div>
              {/* Нижняя панель с доп. инфо */}
              <div className="relative z-10 pt-4 border-t border-gray-50 flex items-center justify-between">
                {/* Группа иконок (слева) */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-gray-50 rounded-lg">
                      <Dumbbell className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {translate(ex.equipment)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-gray-50 rounded-lg">
                      <Activity className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {translate(ex.category)}
                    </span>
                  </div>
                </div>

                {/* УРОВЕНЬ ТЕПЕРЬ ТУТ (справа) */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    levelStyles[ex.level]?.bg || levelStyles.all.bg
                  } ${levelStyles[ex.level]?.text || levelStyles.all.text}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      levelStyles[ex.level]?.dot || levelStyles.all.dot
                    }`}
                  />
                  {translate(ex.level)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* КНОПКА ЗАГРУЗИТЬ ЕЩЕ (Новый элемент для производительности) */}
        {visibleCount < filteredExercises.length && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 hover:border-blue-300 transition-all shadow-sm"
            >
              Показать еще
            </button>
          </div>
        )}
      </div>

      {/* ТВОЕ ОРИГИНАЛЬНОЕ МОДАЛЬНОЕ ОКНО */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedExercise.name}
              </h2>
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-8">
                {selectedExercise.images.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100"
                  >
                    <img
                      src={`/exercises/images/${img}`}
                      alt={`${selectedExercise.name} step ${index}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400?text=No+Image";
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <span className="block text-xs text-gray-400 uppercase font-bold mb-1">
                    Мышцы
                  </span>
                  <p className="text-gray-700 font-medium">
                    {translate(selectedExercise.primaryMuscles.join(", "))}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <span className="block text-xs text-gray-400 uppercase font-bold mb-1">
                    Тип
                  </span>
                  <p className="text-gray-700 font-medium">
                    {translate(selectedExercise.category)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Инструкция
                </h4>
                <ol className="space-y-4">
                  {selectedExercise.instructions.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-gray-600 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
