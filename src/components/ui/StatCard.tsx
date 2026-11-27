import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  tone?: "brand" | "amber" | "teal" | "slate" | "red";
  hint?: string;
  className?: string;
}

const TONES = {
  brand: "bg-brand-50 text-brand-600",
  amber: "bg-amber-50 text-amber-600",
  teal: "bg-accent-50 text-accent-600",
  slate: "bg-slate-100 text-slate-600",
  red: "bg-red-50 text-red-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "brand",
  hint,
  className,
}: StatCardProps) {
  const positive = (trend ?? 0) >= 0;
  return (
    <div className={cn("surface p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between">
        <span className={cn("rounded-lg p-2", TONES[tone])}>
          <Icon size={18} strokeWidth={2} />
        </span>
        {typeof trend === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              positive ? "bg-accent-50 text-accent-700" : "bg-red-50 text-red-600"
            )}
          >
            {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(trend)}%
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
      {hint ? <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}
