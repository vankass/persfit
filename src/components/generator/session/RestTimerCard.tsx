import { Pause, Play, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestTimerCardProps {
  secondsLeft: number;
  running: boolean;
  onToggleRunning: () => void;
  onSkip: () => void;
}

export function RestTimerCard({
  secondsLeft,
  running,
  onToggleRunning,
  onSkip,
}: RestTimerCardProps) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-center sm:p-5">
      <div className="flex items-center justify-center gap-2 text-blue-700">
        <Timer className="h-5 w-5" />
        <span className="text-sm font-bold uppercase tracking-wide">Отдых</span>
      </div>
      <p className="mt-2 text-5xl font-black text-blue-600 sm:text-6xl">
        {secondsLeft}
      </p>
      <div className="mt-3 flex justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 rounded-xl"
          onClick={onToggleRunning}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11 rounded-xl"
          onClick={onSkip}
        >
          Пропустить
        </Button>
      </div>
    </div>
  );
}
