import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Dumbbell,
  Activity,
  Loader2,
  ChevronRight,
  SlidersHorizontal,
  XCircle,
  X,
  Zap,
  Settings,
  Play,
} from "lucide-react";
import { translate } from "@/utils/translations";
import type { Exercise } from "@/types/exercise";
import { CatalogFilterDropdown } from "@/components/catalog/FilterDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchExerciseVideo, type YouTubeVideo } from "@/youtubeApi";

const ITEMS_PER_PAGE = 12;

const Catalog = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState("");
  const [showVideos, setShowVideos] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [selectedForce, setSelectedForce] = useState<string>("all");
  const [selectedMechanic, setSelectedMechanic] = useState<string>("all");

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

  const resetScroll = () => setVisibleCount(ITEMS_PER_PAGE);

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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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

  const loadVideos = async (exercise: Exercise) => {
    if (videos.length > 0 && selectedExercise?.id === exercise.id) {
      setShowVideos(true);
      return;
    }

    setVideosLoading(true);
    setVideosError("");
    setShowVideos(true);

    try {
      const results = await searchExerciseVideo(exercise.id);
      setVideos(results);
    } catch (err) {
      setVideosError(
        err instanceof Error ? err.message : "Не удалось загрузить видео"
      );
    } finally {
      setVideosLoading(false);
    }
  };

  const closeDialog = () => {
    setSelectedExercise(null);
    setVideos([]);
    setVideosError("");
    setShowVideos(false);
  };

  return (
    <div className="min-h-0 pb-12">
      <div className="relative z-20 border-b border-slate-100 bg-slate-50/95 pt-3 backdrop-blur-md">
        <div className="px-1 pb-4 sm:px-0">
          <h1 className="mb-4 flex flex-wrap items-center gap-2 text-xl font-black tracking-tight text-slate-900 sm:mb-5 sm:text-2xl">
            Каталог
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
              {filteredExercises.length}
            </span>
          </h1>

          <div className="space-y-4">
            <div className="group relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 sm:left-3.5" />
              <Input
                type="search"
                placeholder="Поиск упражнения..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetScroll();
                }}
                className="h-auto rounded-2xl border-0 bg-white py-3 pl-10 pr-11 text-sm shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 sm:py-3.5 sm:pl-11 sm:pr-12"
              />
              {searchQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => {
                    setSearchQuery("");
                    resetScroll();
                  }}
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
                    currentValue={selectedLevel}
                    onChange={(val) => {
                      setSelectedLevel(val);
                      resetScroll();
                    }}
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
                    currentValue={selectedCategory}
                    onChange={(val) => {
                      setSelectedCategory(val);
                      resetScroll();
                    }}
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
                    currentValue={selectedEquipment}
                    onChange={(val) => {
                      setSelectedEquipment(val);
                      resetScroll();
                    }}
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
                    currentValue={selectedMuscle}
                    onChange={(val) => {
                      setSelectedMuscle(val);
                      resetScroll();
                    }}
                  />
                  <CatalogFilterDropdown
                    label="Механика"
                    icon={<Settings className="h-4 w-4" />}
                    options={["all", "compound", "isolation"]}
                    currentValue={selectedMechanic}
                    onChange={(val) => {
                      setSelectedMechanic(val);
                      resetScroll();
                    }}
                  />
                  <CatalogFilterDropdown
                    label="Усилие"
                    icon={<Zap className="h-4 w-4" />}
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

      <div className="mx-auto max-w-7xl px-1 py-6 sm:px-0 sm:py-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {displayedExercises.map((ex) => (
            <div
              key={ex.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedExercise(ex)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedExercise(ex);
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
                    levelStyles[ex.level]?.bg || levelStyles.all.bg
                  } ${levelStyles[ex.level]?.text || levelStyles.all.text}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      levelStyles[ex.level]?.dot || levelStyles.all.dot
                    }`}
                  />
                  {translate(ex.level)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filteredExercises.length ? (
          <div className="mt-12 flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-slate-200 px-8 py-3 font-semibold text-slate-600 shadow-sm hover:border-blue-300 hover:bg-slate-50"
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            >
              Показать еще
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog
        open={Boolean(selectedExercise)}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="fixed bottom-0 left-0 right-0 top-auto flex max-h-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-slate-200 p-0 sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-h-[min(90vh,calc(100vh-2rem))] sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-3xl"
        >
          {selectedExercise ? (
            <>
              <DialogHeader className="flex-row items-start gap-3 space-y-0 border-b border-slate-100 p-4 sm:p-6">
                <DialogTitle className="min-w-0 flex-1 pr-2 text-left text-lg font-bold text-slate-900 wrap-break-word sm:text-xl">
                  {selectedExercise.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Подробности упражнения, изображения и пошаговая инструкция.
                </DialogDescription>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full"
                    aria-label="Закрыть"
                  >
                    <X className="h-5 w-5 text-slate-500 sm:h-6 sm:w-6" />
                  </Button>
                </DialogClose>
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4">
                  {selectedExercise.images.map((img, index) => (
                    <div
                      key={`${img}-${index}`}
                      className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-100"
                    >
                      <img
                        src={`/exercises/images/${img}`}
                        alt={`${selectedExercise.name} шаг ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400?text=No+Image";
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4">
                  <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                    <span className="mb-1 block text-xs font-bold uppercase text-slate-400">
                      Мышцы
                    </span>
                    <p className="wrap-break-word text-sm font-medium text-slate-700 sm:text-base">
                      {translate(selectedExercise.primaryMuscles.join(", "))}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                    <span className="mb-1 block text-xs font-bold uppercase text-slate-400">
                      Тип
                    </span>
                    <p className="wrap-break-word text-sm font-medium text-slate-700 sm:text-base">
                      {translate(selectedExercise.category)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Инструкция
                  </h4>
                  <ol className="space-y-4">
                    {selectedExercise.instructions.map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                          {i + 1}
                        </span>
                        <p className="leading-relaxed text-slate-600">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                {/* Видео секция */}
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
                      <Play className="h-5 w-5 text-red-500" />
                      Видео
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 text-xs font-semibold"
                      onClick={() =>
                        selectedExercise && loadVideos(selectedExercise)
                      }
                      disabled={videosLoading}
                    >
                      {videosLoading ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Загрузка...
                        </>
                      ) : showVideos && videos.length > 0 ? (
                        "Обновить"
                      ) : (
                        "Найти видео"
                      )}
                    </Button>
                  </div>

                  {videosLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  )}

                  {videosError && (
                    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                      {videosError}
                    </div>
                  )}

                  {showVideos && !videosLoading && videos.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {videos.map((video) => (
                        <a
                          key={video.id.videoId}
                          href={`https://youtube.com/watch?v=${video.id.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/video relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
                        >
                          <div className="relative aspect-video overflow-hidden bg-slate-100">
                            <img
                              src={
                                video.snippet.thumbnails.medium?.url ||
                                video.snippet.thumbnails.default.url
                              }
                              alt={video.snippet.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover/video:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/video:opacity-100">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                                <Play className="h-5 w-5 text-red-600 fill-red-600" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                              {video.snippet.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {video.snippet.channelTitle}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {showVideos &&
                    !videosLoading &&
                    !videosError &&
                    videos.length === 0 && (
                      <p className="py-4 text-center text-sm text-slate-500">
                        Видео не найдены
                      </p>
                    )}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Catalog;
