import { Button } from "@/components/ui/button";
import { Dumbbell, Zap, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="xl:w-85 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-3">
      <div className="p-2 bg-slate-50 rounded-xl w-fit border border-slate-100">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mt-1">{desc}</p>
      </div>
    </div>
  );
}

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-5 mb-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
          Pers<span className="text-blue-600">Fit</span>
        </h1>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
          Простой инструмент для создания индивидуальных тренировок, поиска
          упражнений и фиксации результатов.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button
          size="lg"
          className="h-16 px-10 text-xl rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105"
          onClick={() => navigate("/onboarding")}
        >
          Создать профиль
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
        <FeatureCard
          icon={<Zap className="w-6 h-6 text-orange-500" />}
          title="Гибкий генератор"
          desc="Сборка занятий под индивидуальные параметры."
        />
        <FeatureCard
          icon={<Dumbbell className="w-6 h-6 text-blue-500" />}
          title="Каталог с техникой"
          desc="Поиск упражнений по фильтрам с текстовым описанием и видео-примерами."
        />
        <FeatureCard
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          title="Статистика"
          desc="Следи за графиками своего прогресса."
        />
      </div>
    </div>
  );
}
