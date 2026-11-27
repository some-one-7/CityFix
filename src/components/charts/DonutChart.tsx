import { cn } from "@/lib/utils";

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: Slice[];
  total?: number;
  centerLabel?: string;
  className?: string;
  legend?: boolean;
  size?: number;
}

export function DonutChart({
  data,
  total,
  centerLabel = "Total",
  className,
  legend = true,
  size = 168,
}: DonutChartProps) {
  const sum = total ?? data.reduce((acc, item) => acc + item.value, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const gap = 3;

  let offset = 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-6", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#F1F3F8" strokeWidth="16" />
          {data.map((slice) => {
            const fraction = slice.value / Math.max(1, sum);
            const length = Math.max(0, fraction * circumference - gap);
            const dash = `${length} ${circumference - length}`;
            const dashOffset = -offset;
            offset += fraction * circumference;
            return (
              <circle
                key={slice.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="16"
                strokeDasharray={dash}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              >
                <title>{`${slice.label}: ${slice.value}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-extrabold text-slate-900">{sum}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {centerLabel}
          </span>
        </div>
      </div>

      {legend ? (
        <ul className="min-w-[140px] flex-1 space-y-2.5">
          {data.map((slice) => (
            <li key={slice.label} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ background: slice.color }} />
                {slice.label}
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-500">
                {Math.round((slice.value / Math.max(1, sum)) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
