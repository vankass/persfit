import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { UserProfile } from "@/types/profile";
import type { GeneratorParams } from "@/types/workout";
import { DEFAULT_GENERATOR_PARAMS } from "@/lib/workoutGenerator";
import { translate } from "@/utils/translations";
import { EQUIPMENT_OPTIONS, MUSCLE_OPTIONS } from "./constants";
import type { MuscleGroup } from "@/types/exercise";

interface GeneratorFormProps {
  profile: UserProfile;
  params: GeneratorParams;
  onChange: (params: GeneratorParams) => void;
  onGenerate: () => void;
}

const INTENSITIES: {
  value: GeneratorParams["intensity"];
  label: string;
  desc: string;
}[] = [
  {
    value: "low",
    label: "Лёгкая",
    desc: "Больше повторений, комфортный отдых",
  },
  { value: "medium", label: "Средняя", desc: "Сбалансированная нагрузка" },
  {
    value: "high",
    label: "Высокая",
    desc: "Тяжело / короткий отдых, возможен кардио-финишер",
  },
];

const FOCUS_OPTIONS: {
  value: GeneratorParams["focus"];
  label: string;
}[] = [
  { value: "full_body", label: "Всё тело" },
  { value: "upper", label: "Верх" },
  { value: "lower", label: "Низ" },
  { value: "custom", label: "Выбор мышц" },
];

const LOAD_TYPES: { value: GeneratorParams["loadType"]; label: string }[] = [
  { value: "strength", label: "Силовая" },
  { value: "cardio", label: "Кардио" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
      {children}
    </h3>
  );
}

function OptionButton({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-h-11 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all active:scale-[0.98]",
        active
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-slate-100 bg-white text-slate-700 hover:border-slate-200",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function GeneratorForm({
  profile,
  params,
  onChange,
  onGenerate,
}: GeneratorFormProps) {
  const update = (partial: Partial<GeneratorParams>) => {
    onChange({ ...params, ...partial });
  };

  const toggleEquipment = (item: string) => {
    const next = params.equipment.includes(item)
      ? params.equipment.filter((e) => e !== item)
      : [...params.equipment, item];
    update({ equipment: next });
  };

  const toggleMuscle = (muscle: MuscleGroup) => {
    const current = params.targetMuscles ?? [];
    const next = current.includes(muscle)
      ? current.filter((m) => m !== muscle)
      : [...current, muscle];
    update({ targetMuscles: next });
  };

  const canGenerate =
    params.equipment.length > 0 &&
    (params.focus !== "custom" || (params.targetMuscles?.length ?? 0) > 0);

  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm mt-1 sm:mt-10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl font-black text-slate-900 sm:text-2xl">
            Генератор тренировки
          </CardTitle>
        </div>
        <p className="text-sm text-slate-500">
          Привет, {profile.name}! Настройте параметры и сгенерируйте план.
        </p>
      </CardHeader>

      <CardContent className="space-y-6 pb-2">
        <section className="space-y-3">
          <SectionTitle>Тип тренировки</SectionTitle>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LOAD_TYPES.map((l) => (
              <OptionButton
                key={l.value}
                active={params.loadType === l.value}
                onClick={() => update({ loadType: l.value })}
              >
                {l.label}
              </OptionButton>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>Интенсивность</SectionTitle>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {INTENSITIES.map((i) => (
              <OptionButton
                key={i.value}
                active={params.intensity === i.value}
                onClick={() => update({ intensity: i.value })}
              >
                <div className="font-bold">{i.label}</div>
                <div className="mt-0.5 text-xs font-normal text-slate-500">
                  {i.desc}
                </div>
              </OptionButton>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>Оборудование</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => toggleEquipment(eq)}
                className={[
                  "min-h-11 rounded-full px-3 py-2 text-xs font-bold transition-all sm:text-sm",
                  params.equipment.includes(eq)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {translate(eq)}
              </button>
            ))}
          </div>
          {params.equipment.length === 0 && (
            <p className="text-xs text-amber-600">
              Выберите хотя бы один вариант
            </p>
          )}
        </section>

        <section className="space-y-3">
          <SectionTitle>Фокус</SectionTitle>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FOCUS_OPTIONS.map((f) => (
              <OptionButton
                key={f.value}
                active={params.focus === f.value}
                onClick={() => update({ focus: f.value })}
                className="text-center"
              >
                {f.label}
              </OptionButton>
            ))}
          </div>
          {params.focus === "custom" && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {MUSCLE_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMuscle(m)}
                  className={[
                    "min-h-11 rounded-full px-3 py-1.5 text-xs font-bold",
                    params.targetMuscles?.includes(m)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  {translate(m)}
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="sticky border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <Button
            type="button"
            className="w-full rounded-2xl bg-blue-600 py-6 text-base font-bold hover:bg-blue-700"
            disabled={!canGenerate}
            onClick={onGenerate}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Сгенерировать
          </Button>
        </div>

        <button
          type="button"
          className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
          onClick={() => onChange({ ...DEFAULT_GENERATOR_PARAMS })}
        >
          Сбросить к настройкам по умолчанию
        </button>
      </CardContent>
    </Card>
  );
}
