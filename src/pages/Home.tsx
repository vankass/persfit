import { Button } from "@/components/ui/button"
import FeatureCard from "@/components/ui/shared/FeatureCard"
import { Dumbbell, Zap, TrendingUp } from "lucide-react" 
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold tracking-wide uppercase">
            Твой персональный тренер
          </div>
          <h1 className="text-6xl font-black tracking-tight text-slate-900 sm:text-7xl">
            Pers<span className="text-blue-600">Fit</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            Создай программу тренировок за 2 минуты. Техника, прогресс и мотивация в одном приложении.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            size="lg"
            className="h-16 px-10 text-xl rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105"
            onClick={() => navigate("/onboarding")}
          >
            Начать проект
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-orange-500" />}
            title="Умный генератор" 
            desc="План под твой вес, рост и цели." 
          />
          <FeatureCard 
            icon={<Dumbbell className="w-6 h-6 text-blue-500" />}
            title="Видео-база" 
            desc="Смотри технику прямо в приложении." 
          />
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            title="Трекинг" 
            desc="Следи за графиками своего прогресса." 
          />
        </div>
      </div>
    </div>
  )
}