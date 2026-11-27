import { Check, Clock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Complaint } from "@/types";

export function StatusTimeline({ complaint }: { complaint: Complaint }) {
  return (
    <ol className="relative space-y-0">
      {complaint.timeline.map((event, index) => {
        const last = index === complaint.timeline.length - 1;
        return (
          <li key={event.status} className="relative flex gap-3 pb-5 last:pb-0">
            {!last ? (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-0.5 rounded",
                  event.done ? "bg-brand-200" : "bg-slate-150 bg-slate-100"
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                event.done
                  ? event.current
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-200 bg-brand-50 text-brand-600"
                  : "border-slate-200 bg-white text-slate-300"
              )}
            >
              {event.done ? (
                event.current && event.status !== "resolved" ? (
                  <span className="h-2 w-2 rounded-full bg-white" />
                ) : (
                  <Check size={12} strokeWidth={3} />
                )
              ) : (
                <Clock size={11} />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p
                  className={cn(
                    "text-[13px] font-semibold",
                    event.done ? "text-slate-900" : "text-slate-400"
                  )}
                >
                  {event.label}
                  {event.current && event.status !== "resolved" ? (
                    <span className="ml-2 rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-600">
                      Current
                    </span>
                  ) : null}
                </p>
                <span className="text-[10.5px] font-medium text-slate-400">
                  {event.done ? formatDate(event.date, { month: "short", day: "numeric" }) : "Pending"}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{event.note}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
