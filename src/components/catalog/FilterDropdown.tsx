import { type ReactNode, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { translate } from "@/lib/translations";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export interface CatalogFilterDropdownProps<T extends string> {
  label: string;
  icon: ReactNode;
  options: T[];
  currentValue: T;
  onChange: (value: T) => void;
}

export function CatalogFilterDropdown<T extends string>({
  label,
  icon,
  options,
  currentValue,
  onChange,
}: CatalogFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const filterList = (
    <div className="flex flex-col gap-1 p-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => {
            onChange(opt);
            setOpen(false);
          }}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left text-base font-semibold text-slate-600 active:bg-slate-100"
        >
          <span className={currentValue === opt ? "text-blue-600" : ""}>
            {opt === "all" ? "Все" : translate(opt)}
          </span>
          {currentValue === opt && <Check className="h-5 w-5 text-blue-600" />}
        </button>
      ))}
    </div>
  );

  const trigger = (
    <button
      type="button"
      className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-all ${
        currentValue !== "all"
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {icon}
      <span>{currentValue === "all" ? label : translate(currentValue)}</span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );

  if (isDesktop) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 z-100">
          {filterList}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="z-100 max-h-full">
        <DrawerHeader className="text-left border-b border-slate-50 mt-2">
          <DrawerTitle className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            {label}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Выберите категорию из списка ниже
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-2 no-scrollbar">
          {filterList}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
