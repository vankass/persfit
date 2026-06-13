import { useState, useEffect } from "react";
import { User, Ruler, Target, Calendar, AlertCircle } from "lucide-react";
import type { UserProfile } from "@/types/profile";
import { Loader } from "@/components/Loader";
import { translate } from "@/lib/translations";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/useProfile";
import {
  ERROR_MESSAGES,
  getInvalidUserProfileFields,
  type ProfileField,
} from "@/lib/profile/validation";
import { saveProfile } from "@/lib/db";
import { ProfileActions } from "@/components/profile/ProfileActions";

export default function Profile() {
  const { user: currentUser, refreshProfile } = useProfile();
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [glowFields, setGlowFields] = useState<ProfileField[]>([]);

  useEffect(() => {
    if (currentUser) setEditedProfile(currentUser);
  }, [currentUser]);

  if (!currentUser || !editedProfile) return <Loader />;

  const handleCancel = () => {
    setEditedProfile({ ...currentUser });
    setGlowFields([]);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const invalidFields = getInvalidUserProfileFields(editedProfile);
    if (invalidFields.length > 0) {
      setGlowFields(invalidFields);
      return;
    }
    try {
      setIsSaving(true);
      await saveProfile(editedProfile);
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Не удалось сохранить профиль, попробуйте позже");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (name: keyof UserProfile, value: string) => {
    setGlowFields((prev) => prev.filter((f) => f !== name));
    setEditedProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: ["age", "height", "weight"].includes(name)
          ? value === ""
            ? ""
            : Number(value)
          : value,
      };
    });
  };

  const getFieldClass = (fieldName: ProfileField) => {
    const isError = glowFields.includes(fieldName);
    return `w-full rounded-xl bg-slate-50 transition-[box-shadow,border-color,background-color] duration-200 border ${
      isError
        ? "border-red-400 bg-red-50/30 focus-visible:ring-1 focus-visible:ring-red-400"
        : "border-slate-300 focus-visible:ring-1 focus-visible:ring-blue-400"
    }`;
  };

  const Err = ({ id }: { id: ProfileField }) => {
    if (!isEditing || !glowFields.includes(id)) return null;
    return (
      <div className="mt-1">
        <p className="text-[11px] font-medium text-red-500/90 flex items-center gap-1 px-1 leading-tight">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {ERROR_MESSAGES[id]}
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:py-10 relative">
      {isSaving && <Loader />}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 pb-5 mb-6">
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
          Профиль пользователя
        </h1>
        <div className="h-10 hidden sm:flex items-center justify-end">
          <ProfileActions
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleCancel={handleCancel}
            handleSave={handleSave}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:items-center">
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center h-fit shadow-sm">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-100">
            <User size={48} className="stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            {currentUser.name}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {translate(currentUser.gender)}, {currentUser.age} лет
          </p>
          <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-3 text-left text-sm text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Уровень:</span>
              <span className="font-semibold text-blue-600 uppercase text-xs tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                {translate(currentUser.level)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-dashed border-slate-100">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> В приложении с:
              </span>
              <span>
                {new Date(currentUser.createdAt).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full flex sm:hidden justify-center">
          <ProfileActions
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleCancel={handleCancel}
            handleSave={handleSave}
            isMobile
          />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Ruler size={18} className="text-slate-400" /> Личные данные
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Имя
                </label>
                {isEditing ? (
                  <Input
                    placeholder="2-15 символов"
                    value={editedProfile.name}
                    maxLength={15}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={getFieldClass("name")}
                  />
                ) : (
                  <div className="text-sm font-medium text-slate-700 py-1">
                    {currentUser.name}
                  </div>
                )}
                <Err id="name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Пол
                </label>
                {isEditing ? (
                  <Select
                    value={editedProfile.gender}
                    onValueChange={(v) => handleInputChange("gender", v)}
                  >
                    <SelectTrigger className={getFieldClass("gender")}>
                      <SelectValue placeholder="Твой пол" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-lg">
                      <SelectItem value="male">Мужчина</SelectItem>
                      <SelectItem value="female">Женщина</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm font-medium text-slate-700 py-1">
                    {translate(currentUser.gender)}
                  </div>
                )}
                <Err id="gender" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Возраст
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    placeholder="14-100 лет"
                    value={editedProfile.age || ""}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className={getFieldClass("age")}
                  />
                ) : (
                  <div className="text-sm font-medium text-slate-700 py-1">
                    {currentUser.age} лет
                  </div>
                )}
                <Err id="age" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Target size={18} className="text-slate-400" /> Антропометрия и
              опыт
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Вес (кг)
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    placeholder="30-300 кг"
                    value={editedProfile.weight || ""}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    className={getFieldClass("weight")}
                  />
                ) : (
                  <div className="text-sm font-medium text-slate-700 py-1">
                    {currentUser.weight} кг
                  </div>
                )}
                <Err id="weight" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Рост (см)
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    placeholder="100-250 см"
                    value={editedProfile.height || ""}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                    className={getFieldClass("height")}
                  />
                ) : (
                  <div className="text-sm font-medium text-slate-700 py-1">
                    {currentUser.height} см
                  </div>
                )}
                <Err id="height" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Уровень подготовки
                </label>
                {isEditing ? (
                  <Select
                    value={editedProfile.level}
                    onValueChange={(v) => handleInputChange("level", v)}
                  >
                    <SelectTrigger className={getFieldClass("level")}>
                      <SelectValue placeholder="Ваш спортивный опыт" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-lg">
                      <SelectItem value="beginner">Новичок</SelectItem>
                      <SelectItem value="intermediate">Средний</SelectItem>
                      <SelectItem value="expert">Продвинутый</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm font-medium text-slate-700 py-1">
                    {translate(currentUser.level)}
                  </div>
                )}
                <Err id="level" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
