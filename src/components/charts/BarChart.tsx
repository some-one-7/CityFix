import { cn } from "@/lib/utils";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string;
  className?: string;
  compact?: boolean;
  unit?: string;
}

export function BarChart({
  data,
  height = 230,
  color = "#4F46E5",
  className,
  compact = false,
  unit = "",
}: BarChartProps) {
  const W = 640;
  const H = height;
  const padL = 28;
  const padR = 6;
  const padT = 14;
  const padB = compact ? 22 : 34;
  const max = Math.max(...data.map((item) => item.value), 1);
  const band = (W - padL - padR) / data.length;
  const barWidth = Math.min(compact ? 34 : 42, band * 0.46);

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Bar chart">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const yy = padT + (1 - ratio) * (H - padT - padB);
          return (
            <g key={ratio}>
              <line
                x1={padL}
                x2={W - padR}
                y1={yy}
                y2={yy}
                stroke="#EEF1F7"
                strokeDasharray={ratio === 0 ? "0" : "3 4"}
              />
              <text x={padL - 6} y={yy + 3} textAnchor="end" fontSize="9" fill="#A3ADC0">
                {Math.round(max * ratio)}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const barHeight = (item.value / max) * (H - padT - padB);
          const cx = padL + band * index + band / 2;
          const label = item.label.split(" ")[0];
          return (
            <g key={item.label}>
              <rect
                x={cx - barWidth / 2}
                y={H - padB - barHeight}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={item.color ?? color}
                opacity={0.92}
              >
                <title>{`${item.label}: ${item.value}${unit}`}</title>
              </rect>
              <text
                x={cx}
                y={H - padB - barHeight - 6}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fill="#64748B"
              >
                {item.value}
              </text>
              <text x={cx} y={H - (compact ? 6 : 10)} textAnchor="middle" fontSize="9.5" fill="#94A3B8">
                {compact ? label : item.label.length > 16 ? item.label.slice(0, 15) + "…" : item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
