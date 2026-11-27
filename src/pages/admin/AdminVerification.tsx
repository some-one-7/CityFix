import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  ShieldCheck,
  ThumbsUp,
  Users,
} from "lucide-react";
import { Panel } from "@/components/admin/Panel";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Badge";
import { useToast } from "@/store/ToastContext";
import { useComplaints } from "@/store/ComplaintsContext";
import { VERIFICATION_QUEUE } from "@/data/analytics";
import { cn } from "@/lib/utils";

type Decision = "approved" | "flagged";
type Tab = "pending" | "approved" | "flagged";

export default function AdminVerification() {
  const { complaints } = useComplaints();
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [tab, setTab] = useState<Tab>("pending");

  const queue = useMemo(
    () =>
      VERIFICATION_QUEUE.map((item) => ({
        ...item,
        photo: complaints.find((complaint) => complaint.id === item.id)?.photo,
        priority: complaints.find((complaint) => complaint.id === item.id)?.priority,
      })),
    [complaints]
  );

  const counts = {
    pending: queue.filter((item) => !decisions[item.id]).length,
    approved: Object.values(decisions).filter((value) => value === "approved").length,
    flagged: Object.values(decisions).filter((value) => value === "flagged").length,
  };

  const visible = queue.filter((item) => {
    const decision = decisions[item.id];
    if (tab === "pending") return !decision;
    return decision === tab;
  });

  const decide = (id: string, decision: Decision, title: string) => {
    setDecisions((current) => ({ ...current, [id]: decision }));
    toast({
      title: decision === "approved" ? "Report verified" : "Field check requested",
      description:
        decision === "approved"
          ? `${id} approved for dispatch — ${title.slice(0, 40)}…`
          : `${id} flagged for an on-site verification visit.`,
      variant: decision === "approved" ? "success" : "info",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold sm:text-xl">Community verification</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Review crowdsourced reports and confirmations before crews are dispatched.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[10.5px] font-bold text-brand-700">
          <ShieldCheck size={12} /> {counts.pending} awaiting review
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <div className="surface flex flex-wrap items-center justify-between gap-2 p-3">
            <Segmented
              options={[
                { id: "pending", label: "Pending", count: counts.pending },
                { id: "approved", label: "Approved", count: counts.approved },
                { id: "flagged", label: "Flagged", count: counts.flagged },
              ]}
              value={tab}
              onChange={(value) => setTab(value as Tab)}
              size="sm"
            />
            <span className="px-1 text-[10.5px] text-slate-400">
              Confidence is an AI-style demo signal
            </span>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title={
                tab === "pending"
                  ? "Verification queue is clear"
                  : tab === "approved"
                    ? "No approved reports yet"
                    : "Nothing flagged"
              }
              description={
                tab === "pending"
                  ? "All submitted reports have been reviewed in this session."
                  : "Decisions you make will appear in this tab for the demo."
              }
            />
          ) : (
            <div className="space-y-3">
              {visible.map((item) => {
                const decision = decisions[item.id];
                const confidenceTone =
                  item.confidence >= 90
                    ? "bg-accent-500"
                    : item.confidence >= 80
                      ? "bg-brand-500"
                      : item.confidence >= 70
                        ? "bg-amber-500"
                        : "bg-red-500";
                return (
                  <div key={item.id} className="surface overflow-hidden">
                    <div className="flex flex-col gap-3 p-4 sm:flex-row">
                      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
                        {item.photo ? (
                          <img src={item.photo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300">
                            <ShieldCheck size={20} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Tag tone="neutral">{item.id}</Tag>
                          <Tag tone="amber">{item.flag}</Tag>
                          {decision ? (
                            <Tag tone={decision === "approved" ? "teal" : "red"}>
                              {decision === "approved" ? "Approved" : "Field check"}
                            </Tag>
                          ) : null}
                        </div>
                        <h3 className="mt-1.5 text-[13px] font-bold leading-snug text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-0.5 text-[10.5px] text-slate-400">
                          {item.location} · {item.submitted}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                          <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500">
                            <ThumbsUp size={10} /> {item.confirmations} confirmations
                          </span>
                          <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500">
                            <Users size={10} /> 3 nearby reporters
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-400">
                            Confidence
                          </span>
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn("h-full rounded-full", confidenceTone)}
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-600">
                            {item.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-slate-50/50 px-4 py-2.5">
                      <Link
                        to={`/admin/complaints/${item.id}`}
                        className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-500 transition hover:text-slate-800"
                      >
                        Open full complaint <ArrowRight size={11} />
                      </Link>
                      {decision ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-500">
                          <CheckCircle2 size={12} className="text-accent-500" />
                          Decision recorded in demo
                        </span>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => decide(item.id, "flagged", item.title)}
                            className="focus-ring inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Flag size={11} /> Field check
                          </button>
                          <button
                            onClick={() => decide(item.id, "approved", item.title)}
                            className="focus-ring inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[10.5px] font-semibold text-white transition hover:bg-brand-700"
                          >
                            <Check size={11} /> Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Panel title="How verification works" subtitle="Demo workflow">
            <ol className="space-y-3">
              {[
                {
                  title: "Citizens report and confirm",
                  text: "Nearby residents add confirmations to strengthen a report.",
                },
                {
                  title: "Sample AI confidence score",
                  text: "A simulated model ranks reports by evidence and duplication risk.",
                },
                {
                  title: "Operations reviews",
                  text: "Approve for dispatch or request an on-site field check.",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-50 text-[10px] font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[11.5px] font-semibold text-slate-800">{step.title}</p>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="Queue health" subtitle="This session">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Pending", value: counts.pending, tone: "text-amber-600" },
                { label: "Approved", value: counts.approved, tone: "text-accent-600" },
                { label: "Flagged", value: counts.flagged, tone: "text-red-600" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 py-2.5">
                  <p className={cn("font-display text-lg font-extrabold", item.tone)}>
                    {item.value}
                  </p>
                  <p className="text-[9.5px] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              Decisions persist only for this browser session and do not change the complaint
              pipeline.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
