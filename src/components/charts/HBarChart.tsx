import { cn } from "@/lib/utils";

interface HBarChartProps {
  data: { label: string; value: number; caption?: string; color?: string }[];
  className?: string;
  color?: string;
  unit?: string;
}

export function HBarChart({
  data,
  className,
  color = "#4F46E5",
  unit = "",
}: HBarChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <ul className={cn("space-y-4", className)}>
      {data.map((item) => (
        <li key={item.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-xs font-medium text-slate-700">{item.label}</span>
            <span className="shrink-0 text-[11px] font-semibold text-slate-500">
              {item.value}
              {unit}
              {item.caption ? (
                <span className="ml-1 font-normal text-slate-400">{item.caption}</span>
              ) : null}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color ?? color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
