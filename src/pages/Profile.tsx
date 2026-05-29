import { useState, useEffect } from "react";
import { User, Ruler, Target, Edit2, Check, X, Calendar } from "lucide-react";
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
  getInvalidUserProfileFields,
  type ProfileField,
} from "@/lib/profile/validation";
import { saveProfile } from "@/lib/db";

export default function Profile() {
  const { user: currentUser, refreshProfile } = useProfile();

  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [glowFields, setGlowFields] = useState<ProfileField[]>([]);

  useEffect(() => {
    if (currentUser) {
      setEditedProfile(currentUser);
    }
  }, [currentUser]);

  if (!currentUser || !editedProfile) {
    return <Loader />;
  }

  const handleCancel = () => {
    setEditedProfile({ ...currentUser });
    setGlowFields([]);
    setIsEditing(false);
  };

  const getInvalidFields = (): ProfileField[] => {
    return getInvalidUserProfileFields(editedProfile);
  };

  const triggerGlow = (fields: ProfileField[]) => {
    setGlowFields([]);
    window.requestAnimationFrame(() => {
      setGlowFields(fields);
      window.setTimeout(() => setGlowFields([]), 650);
    });
  };

  const getFieldClass = (fieldName: ProfileField) => {
    const isError = glowFields.includes(fieldName);
    return `w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none transition-[box-shadow,background-color] duration-200 ${
      isError
        ? "pf-error-glow border-red-500 ring-2 ring-red-100"
        : "border-slate-300 focus:ring-2 focus:ring-blue-500"
    }`;
  };

  const handleSave = async () => {
    const invalidFields = getInvalidFields();
    if (invalidFields.length > 0) {
      triggerGlow(invalidFields);
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

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Неизвестно";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:py-10 relative">
      {isSaving && <Loader />}

      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Профиль пользователя
          </h1>
        </div>

        <div className="h-10 hidden sm:flex items-center justify-end">
          <ProfileActions
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleCancel={handleCancel}
            handleSave={handleSave}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <span>{formatDate(currentUser.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="w-full flex sm:hidden justify-center">
          <ProfileActions
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleCancel={handleCancel}
            handleSave={handleSave}
            isMobile={true}
          />
        </div>

        <div className="md:col-span-2 space-y-7">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-36">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Ruler size={18} className="text-slate-400" />
              Личные данные
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <div className="py-1 text-sm font-medium text-slate-700">
                    {currentUser.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Пол
                </label>
                {isEditing ? (
                  <Select
                    value={editedProfile.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
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
                  <div className="py-1 text-sm font-medium text-slate-700">
                    {translate(currentUser.gender)}
                  </div>
                )}
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
                  <div className="py-1 text-sm font-medium text-slate-700">
                    {currentUser.age} лет
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-36">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Target size={18} className="text-slate-400" />
              Антропометрия и опыт
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <div className="py-1 text-sm font-medium text-slate-700">
                    {currentUser.weight} кг
                  </div>
                )}
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
                  <div className="py-1 text-sm font-medium text-slate-700">
                    {currentUser.height} см
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Уровень подготовки
                </label>
                {isEditing ? (
                  <Select
                    value={editedProfile.level}
                    onValueChange={(value) => handleInputChange("level", value)}
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
                  <div className="py-1 text-sm font-medium text-slate-700">
                    {translate(currentUser.level)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileActionsProps {
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  handleCancel: () => void;
  handleSave: () => void;
  isMobile?: boolean;
}

function ProfileActions({
  isEditing,
  setIsEditing,
  handleCancel,
  handleSave,
  isMobile = false,
}: ProfileActionsProps) {
  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer ${
          isMobile ? "w-full py-2.5" : ""
        }`}
      >
        <Edit2 size={16} />
        <span>{isMobile ? "Редактировать" : "Редактировать профиль"}</span>
      </button>
    );
  }

  return (
    <div className={`flex gap-2 ${isMobile ? "w-full" : ""}`}>
      <button
        onClick={handleCancel}
        className={`flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          isMobile ? "flex-1 py-2.5" : ""
        }`}
      >
        <X size={16} />
        <span>Отмена</span>
      </button>
      <button
        onClick={handleSave}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer ${
          isMobile ? "flex-1 py-2.5" : ""
        }`}
      >
        <Check size={16} />
        <span>Сохранить</span>
      </button>
    </div>
  );
}
