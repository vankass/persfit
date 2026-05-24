import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-3 font-medium select-none">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span>Загрузка данных...</span>
    </div>
  );
}