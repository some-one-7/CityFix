import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Download,
  Clock,
  Gauge,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { ComplaintTable } from "@/components/admin/ComplaintTable";
import { Panel } from "@/components/admin/Panel";
import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { StatCard } from "@/components/ui/StatCard";
import { PriorityChip, StatusChip } from "@/components/ui/Badge";
import { Segmented } from "@/components/ui/Segmented";
import { Button } from "@/components/ui/Button";
import { useComplaints } from "@/store/ComplaintsContext";
import { useToast } from "@/store/ToastContext";
import {
  ADMIN_NAME,
} from "@/lib/constants";
import {
  CATEGORY_BREAKDOWN,
  OVERVIEW_STATS,
  PRIORITY_BREAKDOWN,
  REPORTS_TREND,
  WEEKLY_TREND,
} from "@/data/analytics";
import { cn, timeAgo } from "@/lib/utils";

type Range = "7d" | "6m";
type QuickFilter = "all" | "high" | "unassigned";

export default function AdminOverview() {
  const { complaints } = useComplaints();
  const { toast } = useToast();
  const [range, setRange] = useState<Range>("6m");
  const [quick, setQuick] = useState<QuickFilter>("all");

  const highPriority = useMemo(
    () =>
      [...complaints]
        .filter((complaint) => complaint.priority === "high" || complaint.priority === "critical")
        .sort((a, b) => b.score - a.score)
        .slice(0, 4),
    [complaints]
  );

  const recent = useMemo(() => {
    const sorted = [...complaints].sort((a, b) => (a.date < b.date ? 1 : -1));
    if (quick === "high")
      return sorted.filter((c) => c.priority === "high" || c.priority === "critical");
    if (quick === "unassigned") return sorted.filter((c) => c.status === "submitted");
    return sorted;
  }, [complaints, quick]);

  const trendData = range === "7d" ? WEEKLY_TREND : REPORTS_TREND;

  const handleExportSummary = () => {
    const rows = [
      ["Metric", "Value", "Period", "Target SLA"],
      ["Total Civic Reports", OVERVIEW_STATS.total.toString(), "This Quarter", "100% triage"],
      ["Pending Triage", OVERVIEW_STATS.pending.toString(), "Current", "<48h SLA"],
      ["In Progress Crews", OVERVIEW_STATS.progress.toString(), "Current", "<72h dispatch"],
      ["Resolved", OVERVIEW_STATS.resolved.toString(), "This Quarter", ">90% resolution"],
      ["High Priority Flagged", OVERVIEW_STATS.highPriority.toString(), "Current", "Zero critical backlog"],
      ["Resolved Within SLA", "91.4%", "This Quarter", ">90% target"],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nagarmitra-executive-summary-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Executive Report Exported",
      description: "Summary CSV generated and downloaded.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page intro */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-slate-400">Thursday, 25 November 2026</p>
          <h2 className="mt-0.5 text-lg font-extrabold sm:text-xl">
            Good morning, {ADMIN_NAME.split(" ")[0]}.
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {OVERVIEW_STATS.pending} reports need review and {OVERVIEW_STATS.highPriority} are
            flagged high priority.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            options={[
              { id: "7d", label: "7 days" },
              { id: "6m", label: "6 months" },
            ]}
            value={range}
            onChange={(value) => setRange(value as Range)}
            size="sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportSummary}
          >
            <Download size={14} />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-5">
        <StatCard
          label="Total reports"
          value={OVERVIEW_STATS.total.toLocaleString()}
          icon={ClipboardList}
          trend={OVERVIEW_STATS.trends.total}
          tone="brand"
          hint="All wards · this quarter"
        />
        <StatCard
          label="Pending review"
          value={OVERVIEW_STATS.pending}
          icon={Clock}
          trend={OVERVIEW_STATS.trends.pending}
          tone="amber"
          hint="SLA target 48 hours"
        />
        <StatCard
          label="In progress"
          value={OVERVIEW_STATS.progress}
          icon={Wrench}
          trend={OVERVIEW_STATS.trends.progress}
          tone="slate"
          hint="Assigned to field crews"
        />
        <StatCard
          label="Resolved"
          value={OVERVIEW_STATS.resolved.toLocaleString()}
          icon={CheckCircle2}
          trend={OVERVIEW_STATS.trends.resolved}
          tone="teal"
          hint="76% resolution rate"
        />
        <StatCard
          label="High priority"
          value={OVERVIEW_STATS.highPriority}
          icon={AlertTriangle}
          trend={OVERVIEW_STATS.trends.highPriority}
          tone="red"
          hint="Critical and high scores"
          className="col-span-2 xl:col-span-1"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Reports over time"
          subtitle={`Submitted vs resolved · last ${range === "7d" ? "7 days" : "6 months"}`}
          className="xl:col-span-2"
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700">
              <TrendingUp size={11} />
              +18.7% resolved
            </span>
          }
        >
          <AreaChart
            data={trendData}
            series={[
              { key: "reports", label: "Reports", color: "#4F46E5" },
              { key: "resolved", label: "Resolved", color: "#14B8A6" },
            ]}
            height={248}
          />
        </Panel>

        <Panel title="Priority distribution" subtitle="Last 30 days · 318 reports">
          <DonutChart
            data={PRIORITY_BREAKDOWN}
            centerLabel="Reports"
            className="justify-center"
          />
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50/70 px-2.5 py-2">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-[10.5px] leading-relaxed text-red-700">
              24 critical reports are awaiting triage. Oldest is 6 hours old.
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Reports by category"
          subtitle="Distribution across all open wards"
          action={<span className="text-[10.5px] text-slate-400">Total 318</span>}
        >
          <BarChart data={CATEGORY_BREAKDOWN.map((item) => ({ ...item, value: item.value }))} height={228} />
        </Panel>

        <Panel
          title="High priority issues"
          subtitle="Ranked by sample priority score"
          flush
          action={
            <Link
              to="/admin/complaints"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <div className="divide-y divide-line">
            {highPriority.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/admin/complaints/${complaint.id}`}
                className="group flex items-center gap-3 px-4 py-3 transition hover:bg-brand-50/40 sm:px-5"
              >
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-50 ring-1 ring-line">
                  <span className="font-display text-[13px] font-extrabold leading-none text-slate-900">
                    {complaint.score}
                  </span>
                  <span className="mt-0.5 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                    score
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[12px] font-semibold text-slate-800 transition group-hover:text-brand-700">
                    {complaint.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-slate-400">
                    {complaint.id} · {complaint.area} · {timeAgo(complaint.date)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <PriorityChip priority={complaint.priority} size="sm" />
                  <StatusChip status={complaint.status} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      {/* Resolution performance strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Avg. resolution time", value: "4.2 days", hint: "↓ 12% vs last month", icon: Gauge, tone: "text-brand-600 bg-brand-50" },
          { label: "On-time resolution", value: "86%", hint: "Within ward SLA", icon: CheckCircle2, tone: "text-accent-600 bg-accent-50" },
          { label: "Reopened complaints", value: "3.1%", hint: "↓ 0.8 pts vs last month", icon: AlertTriangle, tone: "text-amber-600 bg-amber-50" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="surface flex items-center gap-3 p-4">
              <span className={cn("rounded-xl p-2.5", item.tone)}>
                <Icon size={18} />
              </span>
              <div>
                <p className="font-display text-lg font-extrabold leading-none text-slate-900">
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">{item.label}</p>
                <p className="text-[10px] text-slate-400">{item.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent complaints */}
      <Panel
        title="Recent complaints"
        subtitle="Newest reports across the city"
        flush
        action={
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            View all complaints <ArrowRight size={12} />
          </Link>
        }
      >
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-slate-50/50 px-4 py-2.5 sm:px-5">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick filters
          </span>
          {[
            { id: "all", label: "All reports" },
            { id: "high", label: "High priority" },
            { id: "unassigned", label: "Unassigned" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setQuick(filter.id as QuickFilter)}
              className={cn(
                "focus-ring rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition",
                quick === filter.id
                  ? "border-brand-200 bg-brand-50 text-brand-700"
                  : "border-line bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              {filter.label}
            </button>
          ))}
          <span className="ml-auto text-[10.5px] text-slate-400">{recent.length} shown</span>
        </div>
        <ComplaintTable complaints={recent.slice(0, 6)} compact />
      </Panel>
    </div>
  );
}
