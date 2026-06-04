import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { UserProfile } from "@/types/profile";
import type { GeneratorParams, TrainingLocation } from "@/types/workout";
import { DEFAULT_GENERATOR_PARAMS } from "@/lib/workout/constants";
import { translate } from "@/lib/translations";
import {
  ALL_GENERATOR_EQUIPMENT,
  buildHomeEquipment,
  getHomeExtrasFromEquipment,
  HOME_EXTRA_EQUIPMENT,
  toggleHomeExtra,
  MUSCLE_OPTIONS,
} from "./constants";
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
    desc: "Больше повторений и умеренный темп",
  },
  { value: "medium", label: "Средняя", desc: "Сбалансированная нагрузка" },
  {
    value: "high",
    label: "Высокая",
    desc: "Меньше повторений и больше отдыха между подходами",
  },
];

const FOCUS_OPTIONS: { value: GeneratorParams["focus"]; label: string }[] = [
  { value: "full_body", label: "Всё тело" },
  { value: "upper", label: "Верх" },
  { value: "lower", label: "Низ" },
  { value: "custom", label: "Выбор мышц" },
];

const LOCATION_OPTIONS: { value: TrainingLocation; label: string }[] = [
  { value: "home", label: "Дома" },
  { value: "gym", label: "В зале" },
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
      className={`min-h-11 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all active:scale-[0.98] ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-slate-100 bg-white text-slate-700 hover:border-slate-200"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function EquipmentChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-full px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
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
  const trainingLocation =
    params.trainingLocation ??
    (params.equipment.length >= ALL_GENERATOR_EQUIPMENT.length
      ? "gym"
      : "home");

  const update = (partial: Partial<GeneratorParams>) => {
    onChange({ ...params, loadType: "strength", ...partial });
  };

  const setLocation = (location: TrainingLocation) => {
    if (location === "gym") {
      update({
        trainingLocation: "gym",
        equipment: [...ALL_GENERATOR_EQUIPMENT],
      });
    } else {
      update({
        trainingLocation: "home",
        equipment: buildHomeEquipment([]),
      });
    }
  };

  const homeExtras = getHomeExtrasFromEquipment(params.equipment);

  const toggleHomeEquipment = (key: string) => {
    const nextExtras = toggleHomeExtra(homeExtras, key);
    update({
      trainingLocation: "home",
      equipment: buildHomeEquipment(nextExtras),
    });
  };

  const toggleMuscle = (muscle: MuscleGroup) => {
    const current = params.targetMuscles ?? [];
    const isSelected = current.includes(muscle);
    const next = isSelected
      ? current.filter((m) => m !== muscle)
      : [...current, muscle];
    update({ targetMuscles: next });
  };

  const hasEquipment =
    trainingLocation === "gym" || params.equipment.includes("body only");
  const hasValidFocus =
    params.focus !== "custom" || (params.targetMuscles?.length ?? 0) > 0;
  const canGenerate = hasEquipment && hasValidFocus;

  return (
    <Card className="mt-1 rounded-3xl border-slate-100 shadow-sm sm:mt-10 px-3 py-5">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-slate-900 sm:text-3xl">
          Генератор тренировки
        </CardTitle>
        <p className="text-sm text-slate-500">
          Привет, {profile.name}! Настройте параметры и сгенерируйте план.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
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

        <section className="space-y-4">
          <SectionTitle>Где тренируетесь?</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {LOCATION_OPTIONS.map((loc) => (
              <OptionButton
                key={loc.value}
                active={trainingLocation === loc.value}
                onClick={() => setLocation(loc.value)}
                className="text-center"
              >
                {loc.label}
              </OptionButton>
            ))}
          </div>

          {trainingLocation === "gym" ? (
            <p className="text-sm text-slate-500">
              Учитывается всё оборудование зала
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                Что есть дома
              </p>
              <div className="flex flex-wrap gap-2">
                {HOME_EXTRA_EQUIPMENT.map((item) => (
                  <EquipmentChip
                    key={item}
                    active={homeExtras.includes(item)}
                    onClick={() => toggleHomeEquipment(item)}
                  >
                    {translate(item)}
                  </EquipmentChip>
                ))}
              </div>
            </div>
          )}

          {!hasEquipment && (
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
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 animation-fade-in">
              {MUSCLE_OPTIONS.map((m) => {
                const isSelected = params.targetMuscles?.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMuscle(m)}
                    className={`min-h-11 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {translate(m)}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="pt-2">
          <Button
            type="button"
            className="w-full rounded-2xl bg-blue-600 py-6 text-base font-bold text-white hover:bg-blue-700 transition-colors"
            disabled={!canGenerate}
            onClick={onGenerate}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Сгенерировать
          </Button>
        </div>

        <button
          type="button"
          className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors block mt-2"
          onClick={() => onChange({ ...DEFAULT_GENERATOR_PARAMS })}
        >
          Сбросить к настройкам по умолчанию
        </button>
      </CardContent>
    </Card>
  );
}
