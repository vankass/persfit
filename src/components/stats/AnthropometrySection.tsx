import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ruler, Scale, Flame } from "lucide-react";
import type { UserProfile } from "@/types/profile";
import {
  calcBmi,
  getBmiCategory,
  getHealthyWeightRange,
  calcDailyCalories,
  type ActivityLevel,
} from "@/lib/anthropometry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function AnthropometrySection({ profile }: { profile: UserProfile }) {
  const bmi = calcBmi(profile.weight, profile.height);
  const category = getBmiCategory(bmi);
  const range = getHealthyWeightRange(profile.height);
  
  const [activity, setActivity] = useState<ActivityLevel>(() => {
    const saved = localStorage.getItem("persfit_user_activity");
    return (saved as ActivityLevel) || "light";
  });
  
  useEffect(() => {
    localStorage.setItem("persfit_user_activity", activity);
  }, [activity]);
  
  const calories = calcDailyCalories(profile, activity);

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 md:rounded-[32px] md:p-8">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 sm:text-xl">
            Антропометрия
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Данные из профиля ·{" "}
            <Link
              to="/profile"
              className="font-bold text-blue-600 hover:underline"
            >
              изменить
            </Link>
          </p>
        </div>
        <p className="text-sm text-slate-500">
          {profile.weight} кг · {profile.height} см
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={<Scale className="h-4 w-4" />}
          title="Индекс массы тела"
          value={bmi > 0 ? String(bmi) : "—"}
          subtitle={
            bmi > 0 ? (
              <span className={`font-semibold ${category.colorClass}`}>
                {category.label}
              </span>
            ) : (
              "Нет данных"
            )
          }
        />

        <MetricCard
          icon={<Ruler className="h-4 w-4" />}
          title="Норма веса"
          value={`${range.min}–${range.max} кг`}
          subtitle="При ИМТ 18,5–24,9"
        />

        <MetricCard
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          title="Норма калорий"
          value={calories > 0 ? `${calories} ккал` : "—"}
          subtitle={
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <span className="text-slate-400 whitespace-nowrap">
                Активность:
              </span>
              <Select
                value={activity}
                onValueChange={(value) => setActivity(value as ActivityLevel)}
              >
                <SelectTrigger
                  size="sm"
                  className="text-xs font-semibold  border-slate-300 bg-white hover:bg-slate-50 dark:bg-transparent"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectItem value="sedentary">
                    Минимальная (сидячая)
                  </SelectItem>
                  <SelectItem value="light">Слабая (1-3 тренировки)</SelectItem>
                  <SelectItem value="moderate">
                    Средняя (3-5 тренировок)
                  </SelectItem>
                  <SelectItem value="high">Высокая (каждый день)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  valueClassName = "text-slate-900",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string | React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest sm:text-xs">
          {title}
        </span>
      </div>
      <p className={`text-2xl font-black sm:text-3xl ${valueClassName}`}>
        {value}
      </p>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-500 sm:text-sm">{subtitle}</div>
      )}
    </div>
  );
}
