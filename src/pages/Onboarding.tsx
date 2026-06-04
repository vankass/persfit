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
import {
  User,
  Scale,
  Ruler,
  Baby,
  Users,
  Dumbbell,
  AlertCircle,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveProfile } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import type { ProfileGender, ProfileLevel } from "@/types/profile";
import {
  ERROR_MESSAGES,
  getInvalidProfileFields,
  type ProfileField,
} from "@/lib/profile/validation";
import { FormLabel } from "@/components/onboarding/OnboardingFormLabel";

interface OnboardingProps {
  onComplete: () => Promise<void>;
}

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

  const clearFieldError = (fieldName: ProfileField) => {
    if (glowFields.includes(fieldName)) {
      setGlowFields((prev) => prev.filter((field) => field !== fieldName));
    }
  };

  const getFieldClass = (fieldName: ProfileField) => {
    const isError = glowFields.includes(fieldName);
    return `w-full rounded-xl bg-slate-50 transition-[box-shadow,border-color,background-color] duration-200 border ${
      isError
        ? "border-red-400 bg-red-50/30 focus-visible:ring-1 focus-visible:ring-red-400"
        : "border-slate-100 focus-visible:ring-1 focus-visible:ring-blue-400"
    }`;
  };

  const handleFinish = async () => {
    const invalidFields = getInvalidProfileFields(formData);

    if (invalidFields.length > 0) {
      setGlowFields(invalidFields);
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
      console.error("Ошибка профиля:", error);
      alert("Не удалось сохранить профиль, попробуйте позже");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Card className="flex max-h-[min(92dvh,44rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border-none shadow-2xl">
        <CardHeader className="shrink-0 pb-2">
          <CardTitle className="text-2xl font-bold text-center text-slate-800 select-none">
            Расскажи о себе
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col">
              <FormLabel icon={User} iconClassName="text-blue-500">
                Имя
              </FormLabel>
              <div className="mt-1">
                <Input
                  placeholder="Как тебя зовут?"
                  value={formData.name}
                  maxLength={15}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    clearFieldError("name");
                  }}
                  className={getFieldClass("name")}
                />
              </div>
              <div className="mt-1">
                {glowFields.includes("name") && (
                  <p className="text-[11px] font-medium text-red-500/90 flex items-center gap-1 px-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {ERROR_MESSAGES.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <FormLabel icon={Users} iconClassName="text-pink-500">
                Пол
              </FormLabel>
              <div className="mt-1 flex items-center">
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, gender: value }));
                    clearFieldError("gender");
                  }}
                  className={`flex gap-4 rounded-xl p-1.5 w-full border transition-colors ${
                    glowFields.includes("gender")
                      ? "border-red-300 bg-red-50/20"
                      : "border-transparent"
                  }`}
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
              <div className="mt-1">
                {glowFields.includes("gender") && (
                  <p className="text-[11px] font-medium text-red-500/90 flex items-center gap-1 px-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {ERROR_MESSAGES.gender}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col">
              <FormLabel icon={Scale} iconClassName="text-green-500">
                Вес (кг)
              </FormLabel>
              <div className="mt-1">
                <Input
                  type="number"
                  placeholder="30-300"
                  value={formData.weight}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      weight: e.target.value,
                    }));
                    clearFieldError("weight");
                  }}
                  className={getFieldClass("weight")}
                />
              </div>
              <div className="mt-1">
                {glowFields.includes("weight") && (
                  <p className="text-[11px] font-medium text-red-500/90 flex items-center gap-0.5 px-0.5 leading-tight">
                    <AlertCircle className="w-3 h-3 shrink-0 inline mr-0.5" />
                    {ERROR_MESSAGES.weight}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <FormLabel icon={Ruler} iconClassName="text-purple-500">
                Рост (см)
              </FormLabel>
              <div className="mt-1">
                <Input
                  type="number"
                  placeholder="100-250"
                  value={formData.height}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      height: e.target.value,
                    }));
                    clearFieldError("height");
                  }}
                  className={getFieldClass("height")}
                />
              </div>
              <div className="mt-1">
                {glowFields.includes("height") && (
                  <p className="text-[11px] font-medium text-red-500/90 flex items-center gap-0.5 px-0.5 leading-tight">
                    <AlertCircle className="w-3 h-3 shrink-0 inline mr-0.5" />
                    {ERROR_MESSAGES.height}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <FormLabel icon={Baby} iconClassName="text-orange-500">
                Возраст
              </FormLabel>
              <div className="mt-1">
                <Input
                  type="number"
                  placeholder="16-110"
                  value={formData.age}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, age: e.target.value }));
                    clearFieldError("age");
                  }}
                  className={getFieldClass("height")}
                />
              </div>
              <div className="mt-1">
                {glowFields.includes("age") && (
                  <p className="text-[11px] font-medium text-red-500/90 flex items-center gap-0.5 px-0.5 leading-tight">
                    <AlertCircle className="w-3 h-3 shrink-0 inline mr-0.5" />
                    {ERROR_MESSAGES.age}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <FormLabel icon={Dumbbell} iconClassName="text-slate-700">
              Уровень подготовки
            </FormLabel>
            <div className="mt-1">
              <Select
                value={formData.level}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, level: value }));
                  clearFieldError("level");
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
            <div className="mt-1">
              {glowFields.includes("level") && (
                <p className="text-[11px] font-medium text-red-500/90 flex items-center gap-1 px-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {ERROR_MESSAGES.level}
                </p>
              )}
            </div>
          </div>

          <Button
            className="w-full py-6 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98] mt-2"
            onClick={handleFinish}
          >
            Готово
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
