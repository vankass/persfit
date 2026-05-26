import { scaleLinear } from "./chartUtils";

/** Extra horizontal padding for dual Y-axis labels */
const PAD = {
  top: 12,
  right: 44,
  bottom: 40,
  left: 44,
} as const;

const LEGEND_HEIGHT = 32;

export interface DualLinePoint {
  label: string;
  displayLabel: string;
  weight: number;
  bmi: number;
}

interface SvgDualLineChartProps {
  data: DualLinePoint[];
  height?: number;
}

function domainWithPadding(values: number[]): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.1 || 1;
  return [min - pad, max + pad];
}

export function SvgDualLineChart({ data, height = 260 }: SvgDualLineChartProps) {
  const svgHeight = Math.max(160, height - LEGEND_HEIGHT);
  const width = 400;
  const innerW = width - PAD.left - PAD.right;
  const innerH = svgHeight - PAD.top - PAD.bottom;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const [wMin, wMax] = domainWithPadding(data.map((d) => d.weight));
  const [bMin, bMax] = domainWithPadding(data.map((d) => d.bmi));

  const points = data.map((item, i) => {
    const x = PAD.left + (data.length > 1 ? i * stepX : innerW / 2);
    const yWeight = scaleLinear(item.weight, wMin, wMax, PAD.top + innerH, PAD.top);
    const yBmi = scaleLinear(item.bmi, bMin, bMax, PAD.top + innerH, PAD.top);
    return { ...item, x, yWeight, yBmi };
  });

  const weightPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yWeight}`)
    .join(" ");
  const bmiPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yBmi}`)
    .join(" ");

  const weightTicks = [wMin, (wMin + wMax) / 2, wMax];
  const bmiTicks = [bMin, (bMin + bMax) / 2, bMax];

  const clipId = "dual-line-clip";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 w-full flex-1">
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="h-full w-full max-w-full"
          preserveAspectRatio="xMidYMid meet"
          overflow="hidden"
          role="img"
          aria-label="График веса и ИМТ"
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x={PAD.left}
                y={PAD.top}
                width={innerW}
                height={innerH}
                rx={4}
              />
            </clipPath>
          </defs>

          <line
            x1={PAD.left}
            y1={PAD.top + innerH}
            x2={width - PAD.right}
            y2={PAD.top + innerH}
            stroke="#e2e8f0"
          />

          {weightTicks.map((tick, i) => {
            const y = scaleLinear(tick, wMin, wMax, PAD.top + innerH, PAD.top);
            return (
              <g key={`w-${i}`}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={width - PAD.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray="4 4"
                />
                <text
                  x={PAD.left - 4}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-violet-500 text-[10px]"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {bmiTicks.map((tick, i) => {
            const y = scaleLinear(tick, bMin, bMax, PAD.top + innerH, PAD.top);
            return (
              <text
                key={`b-${i}`}
                x={width - PAD.right + 4}
                y={y + 4}
                textAnchor="start"
                className="fill-blue-500 text-[10px]"
              >
                {tick.toFixed(1)}
              </text>
            );
          })}

          <g clipPath={`url(#${clipId})`}>
            <path
              d={weightPath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={bmiPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.map((p) => (
              <g key={p.label}>
                <circle cx={p.x} cy={p.yWeight} r={4} fill="#8b5cf6" />
                <circle cx={p.x} cy={p.yBmi} r={4} fill="#3b82f6" />
              </g>
            ))}
          </g>

          {points.map((p) => (
            <g key={`label-${p.label}`}>
              <title>
                {p.label}: {p.weight} кг, ИМТ {p.bmi}
              </title>
              <text
                x={p.x}
                y={svgHeight - 10}
                textAnchor="middle"
                className="fill-slate-400 text-[9px]"
              >
                {p.displayLabel.length > 8
                  ? `${p.displayLabel.slice(0, 7)}…`
                  : p.displayLabel}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex shrink-0 flex-wrap justify-center gap-4 pt-2 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
          Вес (кг)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          ИМТ
        </span>
      </div>
    </div>
  );
}
