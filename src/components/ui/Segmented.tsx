import { cn } from "@/lib/utils";

export interface SegmentOption {
  id: string;
  label: string;
  count?: number;
}

interface SegmentedProps {
  options: SegmentOption[];
  value: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
  className?: string;
  fullWidth?: boolean;
}

export function Segmented({
  options,
  value,
  onChange,
  size = "md",
  className,
  fullWidth,
}: SegmentedProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-line bg-slate-50 p-1",
        fullWidth && "flex w-full",
        className
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition",
              fullWidth && "flex-1",
              size === "sm" ? "h-7 px-2.5 text-[11px]" : "h-8 px-3 text-xs",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px font-mono text-[10px]",
                  active ? "bg-brand-50 text-brand-700" : "bg-slate-200/70 text-slate-500"
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
