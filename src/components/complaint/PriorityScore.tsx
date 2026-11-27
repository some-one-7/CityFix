import { Sparkles, Info, TrendingUp } from "lucide-react";
import { PRIORITY_WEIGHTS, priorityMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Complaint } from "@/types";

export function ScoreRing({
  score,
  priority,
  size = 112,
}: {
  score: number;
  priority: Complaint["priority"];
  size?: number;
}) {
  const meta = priorityMeta(priority);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 108 108" className="h-full w-full -rotate-90">
        <circle cx="54" cy="54" r={radius} fill="none" stroke="#EEF1F7" strokeWidth="9" />
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke="currentColor"
          className={meta.text}
          strokeWidth="9"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-extrabold leading-none text-slate-900">
          {score}
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
          / 100
        </span>
      </div>
    </div>
  );
}

export function PriorityScorePanel({
  complaint,
  className,
  compact = false,
}: {
  complaint: Complaint;
  className?: string;
  compact?: boolean;
}) {
  const meta = priorityMeta(complaint.priority);

  return (
    <div className={cn("surface overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-brand-50 p-1.5 text-brand-600">
            <Sparkles size={15} />
          </span>
          <div>
            <h3 className="text-sm font-bold leading-tight">Priority assessment</h3>
            <p className="text-[10px] text-slate-400">Transparent sample scoring model</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold",
            meta.chip
          )}
        >
          {meta.label}
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center gap-5">
          <ScoreRing score={complaint.score} priority={complaint.priority} size={compact ? 92 : 108} />
          <div className="flex-1 space-y-2.5">
            {PRIORITY_WEIGHTS.map((factor) => {
              const value = complaint.factors[factor.id];
              return (
                <div key={factor.id}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-600">
                      {factor.label}
                      <span className="ml-1 text-slate-400">{factor.weight}%</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-500">{value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn("h-full rounded-full", factor.color)}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!compact ? (
          <div className="mt-4 rounded-xl border border-line bg-slate-50/70 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <TrendingUp size={12} /> Why this score
            </p>
            <ul className="space-y-1.5">
              {complaint.why.map((reason) => (
                <li key={reason} className="flex gap-2 text-[11.5px] leading-relaxed text-slate-600">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-400">
          <Info size={11} className="mt-0.5 shrink-0" />
          Illustrative score using mock data. This prototype does not run AI analysis or make
          real-world prioritisation decisions.
        </p>
      </div>
    </div>
  );
}
