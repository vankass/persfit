import { Check, Edit2, X } from "lucide-react";

interface ProfileActionsProps {
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  handleCancel: () => void;
  handleSave: () => void;
  isMobile?: boolean;
}

export function ProfileActions({
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
