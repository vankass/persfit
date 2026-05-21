import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { UserProfile } from "@/types/profile";
import type { GeneratorParams } from "@/types/workout";
import { DEFAULT_GENERATOR_PARAMS } from "@/lib/workoutGenerator";
import { translate } from "@/utils/translations";
import { WIZARD_STEPS, EQUIPMENT_OPTIONS, MUSCLE_OPTIONS } from "./constants";
import type { MuscleGroup } from "@/types/exercise";

interface GeneratorWizardProps {
  profile: UserProfile;
  params: GeneratorParams;
  onChange: (params: GeneratorParams) => void;
  onGenerate: () => void;
}

const GOALS: { value: GeneratorParams["goal"]; label: string; desc: string }[] = [
  { value: "strength", label: "Сила", desc: "Тяжёлые веса, мало повторений" },
  { value: "fat_loss", label: "Похудение", desc: "Интенсивность и кардио" },
  { value: "endurance", label: "Выносливость", desc: "Много повторений, короткий отдых" },
  { value: "general", label: "Общая форма", desc: "Сбалансированная нагрузка" },
];

const DURATIONS: { value: 20 | 40 | 60; label: string }[] = [
  { value: 20, label: "20 мин" },
  { value: 40, label: "40 мин" },
  { value: 60, label: "60 мин" },
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
  { value: "mixed", label: "Смешанная" },
  { value: "strength", label: "Силовая" },
  { value: "cardio", label: "Кардио" },
  { value: "stretching", label: "Растяжка" },
];

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Новичок",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

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
        "rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all active:scale-[0.98]",
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

export function GeneratorWizard({
  profile,
  params,
  onChange,
  onGenerate,
}: GeneratorWizardProps) {
  const [step, setStep] = useState(0);

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

  const canNext = () => {
    if (step === 2) return params.equipment.length > 0;
    if (step === 3 && params.focus === "custom") {
      return (params.targetMuscles?.length ?? 0) > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onGenerate();
    }
  };

  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl font-black text-slate-900">
            Генератор тренировки
          </CardTitle>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            {LEVEL_LABELS[profile.level] ?? profile.level}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Привет, {profile.name}! Шаг {step + 1} из {WIZARD_STEPS.length}:{" "}
          {WIZARD_STEPS[step]}
        </p>
        <div className="mt-3 flex gap-1">
          {WIZARD_STEPS.map((_, i) => (
            <div
              key={i}
              className={[
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-blue-500" : "bg-slate-100",
              ].join(" ")}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 0 && (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {GOALS.map((g) => (
                <OptionButton
                  key={g.value}
                  active={params.goal === g.value}
                  onClick={() => update({ goal: g.value })}
                >
                  <div className="font-bold">{g.label}</div>
                  <div className="mt-0.5 text-xs font-normal text-slate-500">
                    {g.desc}
                  </div>
                </OptionButton>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={params.includeWarmup ?? false}
                  onChange={(e) =>
                    update({ includeWarmup: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Разминка
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={params.includeCooldown ?? false}
                  onChange={(e) =>
                    update({ includeCooldown: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Заминка
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map((d) => (
              <OptionButton
                key={d.value}
                active={params.durationMinutes === d.value}
                onClick={() => update({ durationMinutes: d.value })}
                className="text-center"
              >
                {d.label}
              </OptionButton>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => toggleEquipment(eq)}
                className={[
                  "rounded-full px-3 py-2 text-xs font-bold transition-all",
                  params.equipment.includes(eq)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {translate(eq)}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
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
                      "rounded-full px-3 py-1.5 text-xs font-bold",
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
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-2 sm:grid-cols-2">
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
        )}

        <div className="flex gap-2 pt-2">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Назад
            </Button>
          )}
          <Button
            type="button"
            className="flex-1 rounded-2xl bg-blue-600 font-bold hover:bg-blue-700"
            disabled={!canNext()}
            onClick={handleNext}
          >
            {step === WIZARD_STEPS.length - 1 ? (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Сгенерировать
              </>
            ) : (
              <>
                Далее
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {step === 0 && (
          <button
            type="button"
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
            onClick={() => onChange({ ...DEFAULT_GENERATOR_PARAMS })}
          >
            Сбросить к настройкам по умолчанию
          </button>
        )}
      </CardContent>
    </Card>
  );
}
