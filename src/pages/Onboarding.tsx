import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Scale, Ruler, Baby, Users, Dumbbell } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getProfile, saveProfile } from "@/lib/db";

export default function Onboarding() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    level: "",
  });

  type FieldName = keyof typeof formData;
  const [glowFields, setGlowFields] = useState<FieldName[]>([]);

  const fieldStyles =
    "w-full rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-400";
  const labelStyles =
    "text-sm font-medium flex items-center gap-2 text-slate-600 select-none";

  const isInvalid: Record<FieldName, (value: string) => boolean> = {
    name: (v) => v.trim().length < 2,
    gender: (v) => !v,
    age: (v) => {
      if (!v) return true;
      const n = Number(v);
      return !Number.isFinite(n) || n < 14 || n > 100;
    },
    weight: (v) => {
      if (!v) return true;
      const n = Number(v);
      return !Number.isFinite(n) || n < 30 || n > 300;
    },
    height: (v) => {
      if (!v) return true;
      const n = Number(v);
      return !Number.isFinite(n) || n < 100 || n > 250;
    },
    level: (v) => !v,
  };

  const getInvalidFields = () => {
    const invalid: FieldName[] = [];
    (Object.keys(formData) as FieldName[]).forEach((field) => {
      if (isInvalid[field](formData[field])) invalid.push(field);
    });
    return invalid;
  };

  const triggerGlow = (fields: FieldName[]) => {
    setGlowFields([]);
    window.requestAnimationFrame(() => {
      setGlowFields(fields);
      window.setTimeout(() => setGlowFields([]), 650);
    });
  };

  const getFieldClass = (fieldName: FieldName) => {
    const shouldGlow = glowFields.includes(fieldName);
    return [
      fieldStyles,
      "transition-[box-shadow,background-color] duration-200",
      "ring-0 bg-slate-50",
      shouldGlow ? "pf-error-glow" : "",
    ].join(" ");
  };

  const handleFinish = async () => {
    const invalidFields = getInvalidFields();

    if (invalidFields.length > 0) {
      triggerGlow(invalidFields);
      return;
    }

    try {
      await saveProfile({
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        createdAt: new Date().toISOString(),
      });

      console.log("Данные успешно сохранены в IDB");
      console.log(getProfile());
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4 ">
      <style>{`
        @keyframes pfErrorGlow {
          0% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
          55% { box-shadow: 0 0 0 1px rgba(239, 68, 68, 1), 0 0 4px rgba(239, 68, 68, 1); }
          100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
        }
        .pf-error-glow {
          animation: pfErrorGlow 0.8s ease-out 0s 1;
        }
      `}</style>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center text-slate-800 select-none">
            Расскажи о себе
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* ИМЯ И ПОЛ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelStyles}>
                <User className="w-4 h-4 text-blue-500" /> Имя
              </label>
              <Input
                placeholder="Как тебя зовут?"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, name: value }));
                }}
                className={getFieldClass("name")}
              />
            </div>

            <div className="space-y-3">
              <label className={labelStyles}>
                <Users className="w-4 h-4 text-pink-500" /> Пол
              </label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, gender: value }));
                }}
                className={[
                  "flex gap-4 rounded-xl p-1.5 -m-1",
                  glowFields.includes("gender") ? "pf-error-glow" : "",
                ].join(" ")}
              >
                <div className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem
                    value="male"
                    id="male"
                    className={`transition-colors ${
                      formData.gender === "male"
                        ? "border-blue-500 text-blue-500"
                        : "border-slate-300"
                    }`}
                  />
                  <label
                    htmlFor="male"
                    className={`text-sm font-medium cursor-pointer transition-colors select-none ${
                      formData.gender === "male"
                        ? "text-blue-500"
                        : "text-slate-600"
                    }`}
                  >
                    Мужской
                  </label>
                </div>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem
                    value="female"
                    id="female"
                    className={`transition-colors ${
                      formData.gender === "female"
                        ? "border-pink-500 text-pink-500"
                        : "border-slate-300"
                    }`}
                  />
                  <label
                    htmlFor="female"
                    className={`text-sm font-medium cursor-pointer transition-colors select-none ${
                      formData.gender === "female"
                        ? "text-pink-500"
                        : "text-slate-600"
                    }`}
                  >
                    Женский
                  </label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* ВЕС, РОСТ, ВОЗРАСТ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={labelStyles}>
                <Scale className="w-4 h-4 text-green-500" /> Вес (кг)
              </label>
              <Input
                type="number"
                min="30"
                max="300"
                placeholder="30-300"
                value={formData.weight}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, weight: value }));
                }}
                className={getFieldClass("weight")}
              />
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <Ruler className="w-4 h-4 text-purple-500" /> Рост (см)
              </label>
              <Input
                type="number"
                min="100"
                max="250"
                placeholder="100-250"
                value={formData.height}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, height: value }));
                }}
                className={getFieldClass("height")}
              />
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <Baby className="w-4 h-4 text-orange-500" /> Возраст
              </label>
              <Input
                type="number"
                min="14"
                max="100"
                placeholder="14-100"
                value={formData.age}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, age: value }));
                }}
                className={getFieldClass("age")}
              />
            </div>
          </div>

          {/* УРОВЕНЬ ПОДГОТОВКИ */}
          <div className="space-y-2">
            <label className={labelStyles}>
              <Dumbbell className="w-4 h-4 text-slate-700" /> Уровень подготовки
            </label>
            <Select
              value={formData.level}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, level: value }));
              }}
            >
              <SelectTrigger className={getFieldClass("level")}>
                <SelectValue placeholder="Ваш спортивный опыт" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-lg">
                <SelectItem value="beginner">Новичок (с нуля)</SelectItem>
                <SelectItem value="intermediate">
                  Средний (занимался)
                </SelectItem>
                <SelectItem value="advanced">Продвинутый (атлет)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full py-7 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98] mt-2"
            onClick={handleFinish}
          >
            Готово
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}