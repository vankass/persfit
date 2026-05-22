import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from "lucide-react";
import type { WarmupCooldownVideoConfig } from "@/config/warmupCooldown";

interface WarmupCooldownBlockProps {
  config: WarmupCooldownVideoConfig;
  continueLabel: string;
  onContinue: () => void;
}

export function WarmupCooldownBlock({
  config,
  continueLabel,
  onContinue,
}: WarmupCooldownBlockProps) {
  const hasVideo = config.youtubeId.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-100 bg-white p-4 mt-30 shadow-sm sm:p-5 sm:mt-15">
        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
          {config.title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{config.description}</p>

        {hasVideo ? (
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
            <iframe
              title={config.title}
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${config.youtubeId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="mt-4 flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
            <Play className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Видео будет добавлено позже
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Выполните разминку или заминку по своему плану
            </p>
          </div>
        )}
      </div>

      <Button
        type="button"
        className="w-full rounded-2xl bg-blue-600 py-6 text-base font-bold hover:bg-blue-700"
        onClick={onContinue}
      >
        {continueLabel}
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
