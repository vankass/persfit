import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface FormLabelProps {
  icon: LucideIcon;
  iconClassName?: string;
  children: ReactNode;
}

export function FormLabel({
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
