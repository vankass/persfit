import type { WorkoutHistoryEntry } from "@/types/workout";
import React, { useState } from "react";

interface ActivityCalendarProps {
  history: WorkoutHistoryEntry[];
}

export function ActivityCalendar({ history }: ActivityCalendarProps) {
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const { workoutsMap } = React.useMemo(() => {
    const map = new Map<string, WorkoutHistoryEntry[]>();

    history.forEach((workout) => {
      if (!workout.startedAt) return;
      const d = new Date(workout.startedAt);
      if (!isNaN(d.getTime())) {
        const dateString = `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        const existing = map.get(dateString) || [];
        map.set(dateString, [...existing, workout]);
      }
    });

    return { workoutsMap: map };
  }, [history]);

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const shiftIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const blanks = Array(shiftIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarGrid = [...blanks, ...days];

  const selectedWorkouts = selectedDate ? workoutsMap.get(selectedDate) : null;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const formatSelectedDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return `${d} ${monthNames[m - 1].toLowerCase().slice(0, 3)}. ${y}`;
  };

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 w-full md:items-stretch">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm w-full flex flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Активность
            </h2>

            <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-xl border border-slate-100">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all text-xs font-bold select-none outline-none"
              >
                ←
              </button>
              <span className="text-xs font-semibold text-slate-700 px-1.5 min-w-[85px] sm:min-w-[95px] text-center select-none">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all text-xs font-bold select-none outline-none"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="h-6 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarGrid.map((day, index) => {
              if (day === null) {
                return <div key={`blank-${index}`} className="aspect-square" />;
              }

              const dateString = `${currentYear}-${String(
                currentMonth + 1
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayWorkouts = workoutsMap.get(dateString);
              const hasWorkout = !!dayWorkouts && dayWorkouts.length > 0;

              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              const isSelected = selectedDate === dateString;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDate(dateString)}
                  className={`
                    relative flex aspect-square items-center justify-center rounded-xl text-xs sm:text-sm font-medium transition-all select-none w-full outline-none p-1
                    ${
                      hasWorkout
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                    ${
                      isToday && !hasWorkout
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : ""
                    }
                    ${
                      isSelected
                        ? "ring-2 ring-slate-900 ring-offset-2 z-10"
                        : ""
                    }
                  `}
                >
                  <span>{day}</span>

                  {hasWorkout && (
                    <div className="absolute bottom-1 flex sm:bottom-1.5 gap-0.5 justify-center items-center">
                      {dayWorkouts.slice(0, 3).map((_, i) => (
                        <span
                          key={i}
                          className={`h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full ${
                            isSelected ? "bg-emerald-700" : "bg-emerald-500"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {isToday && !hasWorkout && (
                    <span className="absolute bottom-1 sm:bottom-1.5 h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-start gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-md bg-slate-100" />
            <span>Сегодня</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center gap-0.5">
              <div className="h-1 w-1 rounded-full bg-emerald-500" />
            </div>
            <span>Тренировки</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm w-full flex flex-col h-auto md:h-0 md:min-h-full">
        <div className="flex flex-col h-full flex-1">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Детали дня
              </h3>
              {selectedWorkouts && (
                <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-1.5 py-0.5 rounded-md">
                  {selectedWorkouts.length}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-slate-400">
              {selectedDate ? formatSelectedDate(selectedDate) : ""}
            </span>
          </div>

          {selectedWorkouts && selectedWorkouts.length > 0 ? (
            <div className="space-y-3 overflow-visible h-auto md:overflow-y-auto md:h-0 md:flex-grow pr-0 md:pr-1 scrollbar-thin">
              {selectedWorkouts.map((workout, index) => (
                <div
                  key={workout.id || index}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Тренировка #{index + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                        workout.planned.params.loadType === "strength"
                          ? "text-blue-700 bg-blue-50 border-blue-100"
                          : "text-amber-700 bg-amber-50 border-amber-100"
                      }`}
                    >
                      {workout.planned.params.loadType === "strength"
                        ? "Силовая"
                        : "Кардио"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-0.5 text-sm">
                    <span className="text-slate-500">Длительность:</span>
                    <span className="font-semibold text-slate-900">
                      {Math.round(workout.totalDurationSeconds / 60)} мин
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-0.5 text-sm">
                    <span className="text-slate-500">Фокус:</span>
                    <span className="font-semibold text-slate-900">
                      {workout.planned.params.focus === "full_body" &&
                        "Весь организм"}
                      {workout.planned.params.focus === "upper" && "Верх тела"}
                      {workout.planned.params.focus === "lower" && "Низ тела"}
                      {workout.planned.params.focus === "custom" &&
                        "Свой выбор"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-xs font-medium text-slate-400 block mb-1">
                      Выполнено упражнений
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (workout.completedExercises.length /
                                workout.planned.exercises.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                        {workout.completedExercises.length} /{" "}
                        {workout.planned.exercises.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-4 md:py-8">
              <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center mb-1.5">
                <span className="text-slate-400 text-base">💤</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-[200px]">
                В этот день тренировок не было
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
