import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileChartColumn,
  History,
  LayoutDashboard,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export interface HeaderUser {
  name?: string;
  gender?: string;
}

interface HeaderProps {
  user: HeaderUser | null;
}

function Header({ user }: HeaderProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = useMemo(
    () => [
      {
        name: "Главная",
        to: "/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        name: "Генератор",
        to: "/generator",
        icon: <Sparkles className="w-4 h-4" />,
      },
      {
        name: "Каталог",
        to: "/catalog",
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        name: "История",
        to: "/history",
        icon: <History className="w-4 h-4" />,
      },
      {
        name: "Статистика",
        to: "/stats",
        icon: <FileChartColumn className="w-4 h-4" />,
      },
    ],
    []
  );

  return (
    <header className="max-w-7xl mx-auto flex items-center justify-between mb-6 md:mb-10 relative">
      <div className="shrink-0 flex items-center">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter select-none">
          Pers<span className="text-blue-600">Fit</span>
        </h1>
      </div>

      <nav className="hidden lg:flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              [
                "flex items-center gap-2 rounded-xl text-sm font-bold transition-all px-5 py-2.5",
                isActive
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50",
              ].join(" ")
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="bg-white/50 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-sm hidden sm:block">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-white rounded-xl transition-all hover:shadow-sm"
            onClick={() => navigate("/profile")}
          >
            <span className="text-sm font-bold text-slate-700">
              {user?.name || "Профиль"}
            </span>
            <div className="flex items-center justify-center bg-slate-100 p-1.5 rounded-lg">
              <UserRound
                className={`w-4 h-4 ${
                  user?.gender === "male" ? "text-blue-600" : "text-pink-500"
                }`}
              />
            </div>
          </Button>
        </div>

        <Button
          variant="ghost"
          className="lg:hidden p-2.5 h-auto bg-white/50 border border-slate-200/50 rounded-2xl"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 p-4 bg-white border border-slate-100 shadow-xl rounded-[24px] lg:hidden z-50 flex flex-col gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-xl font-bold transition-all w-full p-4 justify-start text-base",
                  isActive
                    ? "bg-slate-50 text-blue-600"
                    : "text-slate-700 hover:bg-slate-50",
                ].join(" ")
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}

          <div className="h-px bg-slate-100 my-2" />

          <Button
            variant="ghost"
            className="flex items-center justify-between w-full p-4 h-auto hover:bg-slate-50 rounded-xl"
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate("/profile");
            }}
          >
            <span className="font-bold text-slate-700">Мой профиль</span>
            <UserRound className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      )}
    </header>
  );
}

export default Header;
