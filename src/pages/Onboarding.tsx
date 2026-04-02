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

export default function Onboarding() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    level: "",
  });

  const handleFinish = () => {
    const isFormValid = Object.values(formData).every((value) => value !== "");

    if (!isFormValid) {
      alert("Пожалуйста, заполни все поля!");
      return;
    }

    console.log("Данные профиля:", formData);
    localStorage.setItem("user_profile", JSON.stringify(formData));
    alert("Профиль создан!");
  };

  const fieldStyles =
    "w-full rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-400";
  const labelStyles =
    "text-sm font-medium flex items-center gap-2 text-slate-600";

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4 ">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={fieldStyles}
              />
            </div>

            <div className="space-y-3">
              <label className={labelStyles}>
                <Users className="w-4 h-4 text-pink-500" /> Пол
              </label>
              <RadioGroup
                defaultValue={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
                className="flex gap-4 pt-1"
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
                    className={`text-sm font-medium cursor-pointer transition-colors ${
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
                    className={`text-sm font-medium cursor-pointer transition-colors ${
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
                placeholder="70"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className={fieldStyles}
              />
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <Ruler className="w-4 h-4 text-purple-500" /> Рост (см)
              </label>
              <Input
                type="number"
                placeholder="180"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
                className={fieldStyles}
              />
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <Baby className="w-4 h-4 text-orange-500" /> Возраст
              </label>
              <Input
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                className={fieldStyles}
              />
            </div>
          </div>

          {/* УРОВЕНЬ ПОДГОТОВКИ */}
          <div className="space-y-2">
            <label className={labelStyles}>
              <Dumbbell className="w-4 h-4 text-slate-700" /> Уровень подготовки
            </label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, level: value })
              }
            >
              <SelectTrigger className={fieldStyles}>
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
