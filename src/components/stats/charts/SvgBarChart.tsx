import { CHART, niceMax, scaleLinear } from "./chartUtils";

export interface BarChartItem {
  label: string;
  displayLabel: string;
  value: number;
}

interface SvgBarChartProps {
  data: BarChartItem[];
  valueSuffix?: string;
  barColor?: string;
  height?: number;
}

export function SvgBarChart({
  data,
  valueSuffix = "",
  barColor = "#3b82f6",
  height = 220,
}: SvgBarChartProps) {
  const width = 400;
  const innerW = width - CHART.padLeft - CHART.padRight;
  const innerH = height - CHART.padTop - CHART.padBottom;
  const maxVal = niceMax(Math.max(...data.map((d) => d.value), 1));
  const barGap = 8;
  const barW = Math.max(12, (innerW - barGap * (data.length - 1)) / data.length);

  const yTicks = [0, maxVal / 2, maxVal];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full max-w-full"
      preserveAspectRatio="xMidYMid meet"
      overflow="hidden"
      role="img"
      aria-label="Столбчатая диаграмма"
    >
      {yTicks.map((tick) => {
        const y = scaleLinear(tick, 0, maxVal, CHART.padTop, CHART.padTop + innerH);
        return (
          <g key={tick}>
            <line
              x1={CHART.padLeft}
              y1={y}
              x2={width - CHART.padRight}
              y2={y}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
            />
            <text
              x={CHART.padLeft - 6}
              y={y + 4}
              textAnchor="end"
              className="fill-slate-400 text-[10px]"
            >
              {Math.round(tick)}
            </text>
          </g>
        );
      })}

      {data.map((item, i) => {
        const barH =
          item.value > 0
            ? scaleLinear(item.value, 0, maxVal, 0, innerH)
            : 0;
        const x = CHART.padLeft + i * (barW + barGap);
        const y = CHART.padTop + innerH - barH;
        return (
          <g key={item.label}>
            <title>
              {item.label}: {item.value}
              {valueSuffix}
            </title>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(barH, item.value > 0 ? 2 : 0)}
              rx={6}
              fill={barColor}
              className="transition-opacity hover:opacity-80"
            />
            <text
              x={x + barW / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[9px]"
            >
              {item.displayLabel.length > 10
                ? `${item.displayLabel.slice(0, 9)}…`
                : item.displayLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
