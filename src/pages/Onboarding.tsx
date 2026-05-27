import { useState, type ReactNode } from "react";
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
import {
  User,
  Scale,
  Ruler,
  Baby,
  Users,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveProfile } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import type { ProfileGender, ProfileLevel } from "@/types/profile";
import {
  getInvalidProfileFields,
  type ProfileField,
} from "@/lib/profile/validation";

export default function Onboarding({ onComplete }: OnboardingProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    level: "",
  });

  const [glowFields, setGlowFields] = useState<ProfileField[]>([]);

  const getFieldClass = (fieldName: ProfileField) => {
    const isError = glowFields.includes(fieldName);
    return `w-full rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-400 transition-[box-shadow,background-color] duration-200 ring-0 bg-slate-50 ${
      isError ? "pf-error-glow" : ""
    }`;
  };

  const handleFinish = async () => {
    const invalidFields = getInvalidProfileFields(formData);

    if (invalidFields.length > 0) {
      setGlowFields(invalidFields);
      window.setTimeout(() => setGlowFields([]), 650);
      return;
    }

    try {
      await saveProfile({
        name: formData.name,
        gender: formData.gender as ProfileGender,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        level: formData.level as ProfileLevel,
        createdAt: new Date().toISOString(),
      });
      await onComplete();
      navigate("/dashboard");
    } catch (error) {
      console.error("Ошибка сохранения профиля:", error);
      alert("Не удалось сохранить профиль, попробуйте позже");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="flex max-h-[min(92dvh,44rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border-none shadow-2xl">
        <CardHeader className="shrink-0 pb-2">
          <CardTitle className="text-2xl font-bold text-center text-slate-800 select-none">
            Расскажи о себе
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FormLabel icon={User} iconClassName="text-blue-500">
                Имя
              </FormLabel>
              <Input
                placeholder="Как тебя зовут?"
                value={formData.name}
                maxLength={15}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, name: value }));
                }}
                className={getFieldClass("name")}
              />
            </div>

            <div className="space-y-3">
              <FormLabel icon={Users} iconClassName="text-pink-500">
                Пол
              </FormLabel>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <FormLabel icon={Scale} iconClassName="text-green-500">
                Вес (кг)
              </FormLabel>
              <Input
                type="number"
                placeholder="30-300"
                min={30}
                max={300}
                value={formData.weight}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, weight: value }));
                }}
                className={getFieldClass("weight")}
              />
            </div>

            <div className="space-y-2">
              <FormLabel icon={Ruler} iconClassName="text-purple-500">
                Рост (см)
              </FormLabel>
              <Input
                type="number"
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
              <FormLabel icon={Baby} iconClassName="text-orange-500">
                Возраст
              </FormLabel>
              <Input
                type="number"
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

          <div className="space-y-2">
            <FormLabel icon={Dumbbell} iconClassName="text-slate-700">
              Уровень подготовки
            </FormLabel>
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
                <SelectItem value="expert">Продвинутый (атлет)</SelectItem>
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

interface OnboardingProps {
  onComplete: () => Promise<void>;
}

interface FormLabelProps {
  icon: LucideIcon;
  iconClassName?: string;
  children: ReactNode;
}

function FormLabel({
  icon: Icon,
  iconClassName = "",
  children,
}: FormLabelProps) {
  return (
    <label className="text-sm font-medium flex items-center gap-2 text-slate-600 select-none">
      <Icon className={`w-4 h-4 ${iconClassName}`} />
      {children}
    </label>
  );
}
