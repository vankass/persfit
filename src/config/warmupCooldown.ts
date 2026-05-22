export interface WarmupCooldownVideoConfig {
  title: string;
  youtubeId: string;
  description: string;
}

export const WARMUP_VIDEO: WarmupCooldownVideoConfig = {
  title: "Разминка",
  youtubeId: "bMsRI5xmRjc",
  description: "Обязательно выполните разминку, чтобы избежать травм",
};

export const COOLDOWN_VIDEO: WarmupCooldownVideoConfig = {
  title: "Заминка",
  youtubeId: "GfMWcVZIFEM",
  description:
    "Заминка поможет снизить пульс, расслабить мышцы и ускорить восстановление",
};
