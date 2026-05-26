export const CHART = {
  padTop: 12,
  padRight: 8,
  padBottom: 36,
  padLeft: 36,
} as const;

export function scaleLinear(
  value: number,
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number
): number {
  if (domainMax === domainMin) return (rangeMin + rangeMax) / 2;
  const t = (value - domainMin) / (domainMax - domainMin);
  return rangeMax - t * (rangeMax - rangeMin);
}

export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const n = value / base;
  if (n <= 1) return base;
  if (n <= 2) return 2 * base;
  if (n <= 5) return 5 * base;
  return 10 * base;
}

export function shortLabel(label: string, mobile: boolean): string {
  if (!mobile) return label;
  const parts = label.split(" ");
  return parts.length > 2 ? parts.slice(0, 2).join(" ") : label;
}
