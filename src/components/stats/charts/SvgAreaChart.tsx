import { CHART, niceMax, scaleLinear } from "./chartUtils";

export interface AreaChartItem {
  label: string;
  displayLabel: string;
  value: number;
}

interface SvgAreaChartProps {
  data: AreaChartItem[];
  strokeColor?: string;
  fillColor?: string;
  valueSuffix?: string;
  height?: number;
}

export function SvgAreaChart({
  data,
  strokeColor = "#10b981",
  fillColor = "#10b981",
  valueSuffix = " мин",
  height = 220,
}: SvgAreaChartProps) {
  const width = 400;
  const innerW = width - CHART.padLeft - CHART.padRight;
  const innerH = height - CHART.padTop - CHART.padBottom;
  const maxVal = niceMax(Math.max(...data.map((d) => d.value), 1));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((item, i) => {
    const x = CHART.padLeft + (data.length > 1 ? i * stepX : innerW / 2);
    const y = scaleLinear(
      item.value,
      0,
      maxVal,
      CHART.padTop + innerH,
      CHART.padTop
    );
    return { ...item, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${CHART.padTop + innerH} L ${points[0].x} ${CHART.padTop + innerH} Z`
      : "";

  const yTicks = [0, maxVal / 2, maxVal];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full max-w-full"
      preserveAspectRatio="xMidYMid meet"
      overflow="hidden"
      role="img"
      aria-label="График динамики"
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

      {areaPath && (
        <path d={areaPath} fill={fillColor} fillOpacity={0.15} stroke="none" />
      )}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {points.map((p) => (
        <g key={p.label}>
          <title>
            {p.label}: {p.value}
            {valueSuffix}
          </title>
          <circle
            cx={p.x}
            cy={p.y}
            r={4}
            fill={strokeColor}
            className="transition-opacity hover:opacity-70"
          />
          <text
            x={p.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-slate-400 text-[9px]"
          >
            {p.displayLabel.length > 10
              ? `${p.displayLabel.slice(0, 9)}…`
              : p.displayLabel}
          </text>
        </g>
      ))}
    </svg>
  );
}
