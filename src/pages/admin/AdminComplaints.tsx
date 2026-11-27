import { useMemo, useState } from "react";
import { Download, FilterX, Search } from "lucide-react";
import { ComplaintTable } from "@/components/admin/ComplaintTable";
import { Panel } from "@/components/admin/Panel";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Avatar";
import { useComplaints } from "@/store/ComplaintsContext";
import { useToast } from "@/store/ToastContext";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CategoryId, PriorityId, StatusId } from "@/types";

type SortKey = "newest" | "oldest" | "priority" | "updated";

const SELECT_CLASS =
  "h-9 rounded-lg border border-line bg-white px-2.5 text-[11.5px] font-medium text-slate-600 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export default function AdminComplaints() {
  const { complaints } = useComplaints();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [status, setStatus] = useState<StatusId | "all">("all");
  const [priority, setPriority] = useState<PriorityId | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = complaints.filter((complaint) => {
      const matchesQuery =
        !q ||
        complaint.title.toLowerCase().includes(q) ||
        complaint.location.toLowerCase().includes(q) ||
        complaint.id.toLowerCase().includes(q) ||
        complaint.area.toLowerCase().includes(q);
      return (
        matchesQuery &&
        (category === "all" || complaint.category === category) &&
        (status === "all" || complaint.status === status) &&
        (priority === "all" || complaint.priority === priority)
      );
    });

    return result.sort((a, b) => {
      if (sort === "oldest") return a.date < b.date ? -1 : 1;
      if (sort === "priority") return b.score - a.score;
      if (sort === "updated") return a.updated < b.updated ? 1 : -1;
      return a.date < b.date ? 1 : -1;
    });
  }, [complaints, query, category, status, priority, sort]);

  const hasFilters =
    Boolean(query) || category !== "all" || status !== "all" || priority !== "all";

  const reset = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setPriority("all");
    setSort("newest");
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast({
        title: "No complaints to export",
        description: "Adjust your search filters and try again.",
        variant: "info",
      });
      return;
    }

    const headers = [
      "Complaint ID",
      "Title",
      "Category",
      "Status",
      "Priority",
      "Priority Score",
      "City",
      "Location",
      "Area",
      "Date Submitted",
      "Last Updated",
      "Citizen Confirmations",
      "AI Summary",
      "Reporter Privacy Status",
    ];

    const escapeCsv = (str: string) => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = filtered.map((c) => [
      escapeCsv(c.id),
      escapeCsv(c.title),
      escapeCsv(c.category),
      escapeCsv(c.status),
      escapeCsv(c.priority),
      c.score,
      escapeCsv(c.city || "Riverton"),
      escapeCsv(c.location),
      escapeCsv(c.area),
      escapeCsv(c.date),
      escapeCsv(c.updated),
      c.upvotes,
      escapeCsv(c.aiSummary),
      escapeCsv("Confidential (Protected by Platform)"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nagarmitra-complaints-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Export Complete",
      description: `Exported ${filtered.length} complaints. Personal reporter contact details redacted for privacy.`,
      variant: "success",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold sm:text-xl">Complaints</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Triage, assign and track every report across the city.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCsv}
        >
          <Download size={14} />
          Export CSV
        </Button>
      </div>

      <div className="surface p-3 sm:p-4">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by ID, issue or location…"
              className="field h-9 py-0 pl-9 text-[12px]"
              aria-label="Search complaints"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as CategoryId | "all")}
              className={SELECT_CLASS}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusId | "all")}
              className={SELECT_CLASS}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="review">Under Review</option>
              <option value="progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as PriorityId | "all")}
              className={SELECT_CLASS}
              aria-label="Filter by priority"
            >
              <option value="all">All priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className={SELECT_CLASS}
              aria-label="Sort complaints"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority score</option>
              <option value="updated">Recently updated</option>
            </select>
            {hasFilters ? (
              <button
                onClick={reset}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-line px-2.5 text-[11px] font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
              >
                <FilterX size={12} /> Reset
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2 text-[10.5px] text-slate-400">
          <span>
            Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
            {complaints.length} complaints
          </span>
          {hasFilters ? (
            <span className="rounded-full bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-600">
              Filtered
            </span>
          ) : null}
          <span className={cn("ml-auto hidden sm:block", hasFilters && "text-brand-500")}>
            Click any row to open the full complaint
          </span>
        </div>
      </div>

      <Panel
        title="Complaint queue"
        subtitle="Live demo data · status changes are saved locally"
        flush
      >
        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Search}
              title="No complaints match these filters"
              description="Try a different keyword or reset the category, status and priority filters."
              action={
                <Button size="sm" variant="outline" onClick={reset}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <ComplaintTable complaints={filtered} />
        )}
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-400">
        <span>
          {filtered.length} result{filtered.length === 1 ? "" : "s"} · prototype dataset
        </span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}
