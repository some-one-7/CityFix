import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { priorityMeta, statusMeta } from "@/lib/constants";
import type { PriorityId, StatusId } from "@/types";

export function Dot({ className }: { className?: string }) {
  return <span className={cn("h-1.5 w-1.5 rounded-full", className)} />;
}

export function StatusChip({
  status,
  size = "md",
  className,
}: {
  status: StatusId;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = statusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        meta.chip,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Dot className={cn(meta.dot, status === "progress" && "animate-pulse")} />
      {meta.label}
    </span>
  );
}

export function PriorityChip({
  priority,
  score,
  size = "md",
  className,
}: {
  priority: PriorityId;
  score?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = priorityMeta(priority);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        meta.chip,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Dot className={meta.dot} />
      {meta.label}
      {typeof score === "number" ? (
        <span className="font-mono text-[10px] font-bold opacity-70">{score}</span>
      ) : null}
    </span>
  );
}

export function Tag({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "brand" | "teal" | "amber" | "red";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600",
    brand: "bg-brand-50 text-brand-700",
    teal: "bg-accent-50 text-accent-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
