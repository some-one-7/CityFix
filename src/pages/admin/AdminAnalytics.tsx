import { useState } from "react";
import {
  Download,
  Gauge,
  MapPin,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Wrench,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Panel } from "@/components/admin/Panel";
import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { HBarChart } from "@/components/charts/HBarChart";
import { Segmented } from "@/components/ui/Segmented";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { PriorityChip } from "@/components/ui/Badge";
import { useToast } from "@/store/ToastContext";
import { useComplaints } from "@/store/ComplaintsContext";
import {
  AREA_HOTSPOTS,
  CATEGORY_BREAKDOWN,
  PRIORITY_BREAKDOWN,
  REPORTS_TREND,
  RESOLUTION_PERFORMANCE,
  WEEKLY_TREND,
} from "@/data/analytics";
import { timeAgo } from "@/lib/utils";

export default function AdminAnalytics() {
  const { toast } = useToast();
  const { complaints } = useComplaints();
  const [range, setRange] = useState<"7d" | "6m">("6m");

  const topComplaint = [...complaints].sort((a, b) => b.upvotes - a.upvotes)[0];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold sm:text-xl">City analytics</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Operational performance for Riverton · all figures are dummy data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            options={[
              { id: "7d", label: "7 days" },
              { id: "6m", label: "6 months" },
            ]}
            value={range}
            onChange={(value) => setRange(value as "7d" | "6m")}
            size="sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast({
                title: "Analytics export queued",
                description: "Demo only — no file is generated.",
                variant: "info",
              })
            }
          >
            <Download size={14} />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <StatCard
          label="Avg. resolution time"
          value={`${RESOLUTION_PERFORMANCE.avgDays} days`}
          icon={Gauge}
          trend={-12}
          tone="brand"
          hint="Across all categories"
        />
        <StatCard
          label="On-time resolution"
          value={`${RESOLUTION_PERFORMANCE.onTimeRate}%`}
          icon={CheckCircle2}
          trend={4.2}
          tone="teal"
          hint="Within ward SLA"
        />
        <StatCard
          label="Reopened reports"
          value={`${RESOLUTION_PERFORMANCE.reopened}%`}
          icon={RotateCcw}
          trend={-0.8}
          tone="amber"
          hint="Lower is better"
        />
        <StatCard
          label="Citizen satisfaction"
          value={`${RESOLUTION_PERFORMANCE.satisfaction}/5`}
          icon={ThumbsUp}
          trend={2.6}
          tone="slate"
          hint="Based on 412 ratings"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Issues over time"
          subtitle="Reports submitted vs resolved"
          className="xl:col-span-2"
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700">
              <TrendingUp size={11} /> 76% resolution
            </span>
          }
        >
          <AreaChart
            data={range === "7d" ? WEEKLY_TREND : REPORTS_TREND}
            series={[
              { key: "reports", label: "Submitted", color: "#4F46E5" },
              { key: "resolved", label: "Resolved", color: "#14B8A6" },
            ]}
            height={256}
          />
        </Panel>

        <Panel title="Priority breakdown" subtitle="Share of all reports">
          <DonutChart data={PRIORITY_BREAKDOWN} centerLabel="Reports" />
          <div className="mt-4 rounded-lg border border-line bg-slate-50/60 p-2.5">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700">
              <Sparkles size={12} className="text-brand-500" />
              Priority mix is stable
            </p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
              Critical reports are down 2 points month-on-month, while high priority holds at 21%.
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Issues by category" subtitle="Total reports in the selected period">
          <BarChart data={CATEGORY_BREAKDOWN} height={236} />
        </Panel>

        <Panel
          title="Resolution performance"
          subtitle="Weekly on-time completion rate"
          action={
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              Target 85%
            </span>
          }
        >
          <BarChart
            data={RESOLUTION_PERFORMANCE.weekly.map((item) => ({
              ...item,
              color: item.value >= 85 ? "#14B8A6" : "#F59E0B",
            }))}
            height={170}
            compact
            unit="%"
          />
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
            {[
              { label: "Resolved this month", value: "247" },
              { label: "Avg. first response", value: "6.4 h" },
              { label: "Wards above target", value: "6 / 8" },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-display text-[15px] font-extrabold text-slate-900">
                  {item.value}
                </p>
                <p className="mt-0.5 text-[9.5px] leading-snug text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Area-wise hotspots" subtitle="Reports by neighbourhood" className="xl:col-span-1">
          <HBarChart
            data={AREA_HOTSPOTS.map((area) => ({
              label: area.area,
              value: area.reports,
              caption: area.ward.replace("Ward ", "W"),
            }))}
          />
        </Panel>

        <Panel
          title="Resolution by area"
          subtitle="Resolved vs reported, last 30 days"
          className="xl:col-span-2"
          flush
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-2.5 sm:px-5">Area</th>
                  <th className="px-4 py-2.5">Ward</th>
                  <th className="px-4 py-2.5">Reports</th>
                  <th className="px-4 py-2.5">Resolved</th>
                  <th className="px-4 py-2.5">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {AREA_HOTSPOTS.map((area) => {
                  const rate = Math.round((area.resolved / area.reports) * 100);
                  return (
                    <tr key={area.area} className="text-[11.5px] hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-semibold text-slate-700 sm:px-5">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={11} className="text-slate-300" />
                          {area.area}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{area.ward}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{area.reports}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{area.resolved}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={rate >= 70 ? "h-full rounded-full bg-accent-500" : "h-full rounded-full bg-amber-500"}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-semibold text-slate-500">
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel title="Most confirmed report" subtitle="Community engagement" flush>
          <div className="flex items-center gap-3 p-4 sm:p-5">
            {topComplaint.photo ? (
              <img
                src={topComplaint.photo}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[12px] font-semibold text-slate-800">
                {topComplaint.title}
              </p>
              <p className="mt-0.5 text-[10.5px] text-slate-400">
                {topComplaint.id} · {topComplaint.area} · {timeAgo(topComplaint.date)}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <PriorityChip priority={topComplaint.priority} score={topComplaint.score} size="sm" />
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-500">
                  <ThumbsUp size={10} /> {topComplaint.upvotes} confirmations
                </span>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="What this demo shows" subtitle="Data is illustrative" flush>
          <div className="flex items-start gap-3 p-4 sm:p-5">
            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Wrench size={18} />
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              These charts are populated with static sample data to demonstrate the analytics
              layout. No live aggregation, export or AI inference is performed in Phase 1.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
