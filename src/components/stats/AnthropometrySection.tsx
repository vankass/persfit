import { Link } from "react-router-dom";
import { Ruler, Scale, Activity } from "lucide-react";
import type { UserProfile } from "@/types/profile";
import {
  calcBmi,
  getBmiCategory,
  getHealthyWeightRange,
} from "@/lib/anthropometry";

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
  subtitle?: string;
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
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
      )}
    </div>
  );
}

export function AnthropometrySection({ profile }: { profile: UserProfile }) {
  const bmi = calcBmi(profile.weight, profile.height);
  const category = getBmiCategory(bmi);
  const range = getHealthyWeightRange(profile.height);

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 md:rounded-[32px] md:p-8">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 sm:text-xl">
            Антропометрия
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Данные из профиля ·{" "}
            <Link to="/profile" className="font-bold text-blue-600 hover:underline">
              изменить
            </Link>
          </p>
        </div>
        <p className="text-sm text-slate-500">
          {profile.weight} кг · {profile.height} см
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
        <MetricCard
          icon={<Scale className="h-4 w-4" />}
          title="ИМТ"
          value={bmi > 0 ? String(bmi) : "—"}
          subtitle="Индекс массы тела"
          valueClassName={category.colorClass}
        />
        <MetricCard
          icon={<Activity className="h-4 w-4" />}
          title="Категория"
          value={bmi > 0 ? category.label : "—"}
          valueClassName={`text-base font-bold leading-snug sm:text-lg ${category.colorClass}`}
        />
        <MetricCard
          icon={<Ruler className="h-4 w-4" />}
          title="Норма веса"
          value={`${range.min}–${range.max} кг`}
          subtitle="При ИМТ 18,5–24,9"
        />
      </div>
    </section>
  );
}
