import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/db";
import {
  History,
  Clock,
  RotateCcw,
  Calendar,
  Dumbbell,
  Flame,
  Play,
  Zap,
  Trophy,
  Timer,
  Target,
  LucideActivity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  level: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const profile = await getProfile();
      if (profile) setUser(profile);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium">
        Загрузка данных...
      </div>
    );
  }

  return (
    <>
      <section className="bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-14 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="hidden sm:block sm:opacity-[0.1] xl:opacity-[1]">
          <div className="absolute top-[8%] left-[2%] -rotate-12 select-none pointer-events-none">
            <Dumbbell size={120} />
          </div>
          <div className="absolute bottom-[10%] right-[3%] -rotate-20 select-none pointer-events-none">
            <Trophy size={110} />
          </div>
          <div className="absolute top-[10%] right-[16%] rotate-15 select-none pointer-events-none text-blue-500">
            <Zap size={100} />
          </div>
          <div className="absolute top-[50%] right-[70%] -rotate-15 select-none pointer-events-none text-green-500">
            <LucideActivity size={90} />
          </div>
          <div className="absolute top-[60%] left-[70%] select-none pointer-events-none text-red-500">
            <Target size={80} />
          </div>
          <div className="absolute top-[70%] left-[8%] rotate-330 select-none pointer-events-none text-blue-500">
            <Timer size={70} />
          </div>
          <div className="absolute bottom-[75%] left-[30%] rotate-40 select-none pointer-events-none text-orange-500">
            <Flame size={70} />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Привет, {user?.name}!
            </h2>
            <p className="text-slate-400 font-medium text-base md:text-xl max-w-sm mx-auto leading-2">
              Готов начать тренировку?
            </p>
          </div>

          <Button
            onClick={() => {
              navigate("/generator");
            }}
            className="mt-10 w-full sm:w-auto px-10 py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
          >
            <Play size={20} className="mr-2 fill-current" />
            Начать тренировку
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatBox
          icon={<Flame className="text-orange-500" />}
          value="0"
          label="подряд"
        />
        <StatBox
          icon={<Dumbbell className="text-blue-500" />}
          value="0"
          label="всего"
        />
        <StatBox
          icon={<Calendar className="text-green-500" />}
          value="0"
          label="в неделю"
        />
        <StatBox
          icon={<Clock className="text-purple-500" />}
          value="0"
          label="мин всего"
        />
      </section>

      <section className="w-full">
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-3xl md:rounded-[32px] border border-slate-100 shadow-sm space-y-4 md:space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 md:pb-4">
            <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest">
              <div className="p-2 bg-slate-50 rounded-lg">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="text-[10px] sm:text-xs leading-[0.85rem] sm:leading-normal">
                Последняя <br className="sm:hidden" /> активность
              </div>
            </div>
            <Button
            onClick={() => {navigate("/history")}}
              variant="link"
              className="text-blue-600 font-bold text-xs md:text-sm p-0 h-auto"
            >
              Смотреть всё
            </Button>
          </div>

          <div className="py-6 sm:py-8 md:py-10 text-center">
            <div className="inline-flex p-3 md:p-4 bg-slate-50 rounded-full mb-3 md:mb-4">
              <History className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-400">
              История пуста
            </h3>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Здесь будет отображаться твой прогресс по дням
            </p>
          </div>

          <Button
            variant="secondary"
            disabled
            className="w-full py-5 md:py-6 rounded-2xl font-bold text-sm md:text-base bg-slate-50 text-slate-300 border border-transparent"
          >
            Повторить последнюю программу
          </Button>
        </div>
      </section>
    </>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  const navigate = useNavigate();

  return (
    <div 
    onClick={() => {navigate("/stats")}}
    className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-shadow">
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      <div className="text-center">
        <span className="text-2xl md:text-3xl font-black leading-none">
          {value}
        </span>
        <p className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-tighter mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}
