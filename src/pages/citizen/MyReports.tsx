import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Plus, Search } from "lucide-react";
import { ComplaintCard } from "@/components/complaint/ComplaintCard";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState } from "@/components/ui/Avatar";
import { useComplaints } from "@/store/ComplaintsContext";
import type { StatusId } from "@/types";

const MY_REPORT_IDS = [
  "CF-2026-0150",
  "CF-2026-0148",
  "CF-2026-0146",
  "CF-2026-0142",
  "CF-2026-0143",
  "CF-2026-0136",
  "CF-2026-0127",
];

type Tab = StatusId | "all";

export default function MyReports() {
  const { complaints } = useComplaints();
  const [tab, setTab] = useState<Tab>("all");

  const mine = useMemo(
    () =>
      complaints
        .filter((complaint) => MY_REPORT_IDS.includes(complaint.id))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [complaints]
  );

  const filtered = tab === "all" ? mine : mine.filter((complaint) => complaint.status === tab);

  const counts = {
    all: mine.length,
    submitted: mine.filter((c) => c.status === "submitted").length,
    progress: mine.filter((c) => c.status === "progress").length,
    resolved: mine.filter((c) => c.status === "resolved").length,
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-brand-50 p-1.5 text-brand-600">
              <ClipboardList size={16} />
            </span>
            <h1 className="text-[22px] font-extrabold sm:text-2xl">My reports</h1>
          </div>
          <p className="mt-1 text-[12.5px] text-slate-500">
            {counts.all} complaints you've submitted · {counts.resolved} resolved
          </p>
        </div>
        <Link
          to="/report/manual"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={14} />
          New report
        </Link>
      </div>

      <div className="surface mb-4 flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Mobile dropdown selector (zero horizontal overflow on small screens) */}
        <div className="w-full sm:hidden">
          <label htmlFor="my-reports-filter" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Filter by status
          </label>
          <select
            id="my-reports-filter"
            value={tab}
            onChange={(e) => setTab(e.target.value as Tab)}
            className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="all">All reports ({counts.all})</option>
            <option value="submitted">Submitted ({counts.submitted})</option>
            <option value="progress">In Progress ({counts.progress})</option>
            <option value="resolved">Resolved ({counts.resolved})</option>
          </select>
        </div>

        {/* Tablet and Desktop Segmented Tab buttons */}
        <div className="hidden sm:block">
          <Segmented
            options={[
              { id: "all", label: "All", count: counts.all },
              { id: "submitted", label: "Submitted", count: counts.submitted },
              { id: "progress", label: "In Progress", count: counts.progress },
              { id: "resolved", label: "Resolved", count: counts.resolved },
            ]}
            value={tab}
            onChange={(value) => setTab(value as Tab)}
            className="w-auto"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:hidden">
          {[
            { label: "Submitted", value: counts.submitted },
            { label: "In progress", value: counts.progress },
            { label: "Resolved", value: counts.resolved },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-base font-extrabold text-slate-900">{stat.value}</p>
              <p className="text-[9.5px] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="hidden text-[11px] text-slate-400 sm:block">
          Newest first · tap a report to track it
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No ${tab === "all" ? "" : tab} reports`}
          description="Nothing here yet. Reports you submit will appear in this list with live status updates."
          action={
            <Link
              to="/report/manual"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-brand-700"
            >
              <Plus size={14} /> Report an issue
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} showUpdate />
          ))}
        </div>
      )}

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-line bg-white px-3.5 py-3">
        <span className="mt-0.5 rounded-lg bg-slate-100 p-1.5 text-slate-400">
          <ClipboardList size={13} />
        </span>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Each report has a unique complaint ID. Quote it when calling the ward office — status
          updates in this demo are stored locally for the session.
        </p>
      </div>
    </div>
  );
}
