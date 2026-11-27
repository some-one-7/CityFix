import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface Point {
  label: string;
  [key: string]: string | number;
}

interface Series {
  key: string;
  label: string;
  color: string;
}

interface AreaChartProps {
  data: Point[];
  series: Series[];
  height?: number;
  className?: string;
  showLegend?: boolean;
  yTicks?: number;
}

export function AreaChart({
  data,
  series,
  height = 230,
  className,
  showLegend = true,
  yTicks = 4,
}: AreaChartProps) {
  const uid = useId().replace(/[:]/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = height;
  const padL = 34;
  const padR = 10;
  const padT = 14;
  const padB = 26;

  const values = data.flatMap((point) => series.map((s) => Number(point[s.key])));
  const rawMax = Math.max(...values, 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const step = Math.ceil(rawMax / yTicks / magnitude) * magnitude;
  const max = step * yTicks;

  const x = (index: number) =>
    padL + (index * (W - padL - padR)) / Math.max(1, data.length - 1);
  const y = (value: number) => padT + (1 - value / max) * (H - padT - padB);

  const linePath = (key: string) => {
    const points = data.map((point, index) => [x(index), y(Number(point[key]))] as const);
    if (points.length === 0) return "";
    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i += 1) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const mid = (x0 + x1) / 2;
      path += ` C ${mid} ${y0}, ${mid} ${y1}, ${x1} ${y1}`;
    }
    return path;
  };

  const areaPath = (key: string) => {
    const line = linePath(key);
    const last = x(data.length - 1);
    return `${line} L ${last} ${H - padB} L ${x(0)} ${H - padB} Z`;
  };

  return (
    <div className={cn("w-full", className)}>
      {showLegend ? (
        <div className="mb-3 flex flex-wrap items-center gap-4">
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Reports trend chart"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const value = (max / yTicks) * i;
            const yy = y(value);
            return (
              <g key={i}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={yy}
                  y2={yy}
                  stroke="#EEF1F7"
                  strokeDasharray={i === 0 ? "0" : "3 4"}
                />
                <text x={padL - 8} y={yy + 3} textAnchor="end" fontSize="9.5" fill="#94A3B8">
                  {Math.round(value)}
                </text>
              </g>
            );
          })}

          {series.map((s) => (
            <g key={s.key}>
              <path d={areaPath(s.key)} fill={`url(#${uid}-${s.key})`} />
              <path
                d={linePath(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </g>
          ))}

          {data.map((point, index) => (
            <text
              key={point.label}
              x={x(index)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#94A3B8"
            >
              {point.label}
            </text>
          ))}

          {hover !== null
            ? series.map((s) => (
                <circle
                  key={s.key}
                  cx={x(hover)}
                  cy={y(Number(data[hover][s.key]))}
                  r="4"
                  fill="#fff"
                  stroke={s.color}
                  strokeWidth="2.4"
                />
              ))
            : null}

          {data.map((point, index) => {
            const bandWidth = (W - padL - padR) / Math.max(1, data.length - 1 || 1);
            return (
              <rect
                key={`band-${point.label}`}
                x={x(index) - bandWidth / 2}
                y={padT}
                width={bandWidth}
                height={H - padT - padB}
                fill="transparent"
                onMouseEnter={() => setHover(index)}
              />
            );
          })}
        </svg>

        {hover !== null ? (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-line bg-white px-2.5 py-2 shadow-card"
            style={{ left: `${(x(hover) / W) * 100}%` }}
          >
            <p className="mb-1 text-[10px] font-semibold text-slate-500">
              {data[hover].label}
            </p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                {data[hover][s.key]}
                <span className="font-normal text-slate-400">{s.label}</span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
