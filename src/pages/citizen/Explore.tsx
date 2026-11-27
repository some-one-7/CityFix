import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  ThumbsUp,
  X,
} from "lucide-react";
import { CityMap } from "@/components/map/CityMap";
import { ComplaintCard } from "@/components/complaint/ComplaintCard";
import { PriorityChip, StatusChip } from "@/components/ui/Badge";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState } from "@/components/ui/Avatar";
import { useComplaints } from "@/store/ComplaintsContext";
import { CATEGORIES, STATUSES, categoryMeta } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";
import type { CategoryId, StatusId } from "@/types";

type StatusFilter = StatusId | "all";
type CategoryFilter = CategoryId | "all";
type FeedTab = "top" | "your_city" | "other_cities";

export default function Explore() {
  const { complaints, selectedCity, setSelectedCity } = useComplaints();
  const [feedTab, setFeedTab] = useState<FeedTab>("top");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(complaints[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = complaints.filter((complaint) => {
      // 1. Feed tab filtering
      const city = complaint.city ?? "Riverton";
      if (feedTab === "your_city" && city !== selectedCity) return false;
      if (feedTab === "other_cities" && city === selectedCity) return false;

      // 2. Search query
      const matchesQuery =
        !q ||
        complaint.title.toLowerCase().includes(q) ||
        complaint.location.toLowerCase().includes(q) ||
        complaint.area.toLowerCase().includes(q) ||
        complaint.id.toLowerCase().includes(q) ||
        city.toLowerCase().includes(q);

      // 3. Category
      const matchesCategory =
        category === "all" ||
        complaint.category === category ||
        (category === "waste" && complaint.category === "garbage") ||
        (category === "electricity" && complaint.category === "streetlights");

      // 4. Status
      const matchesStatus = status === "all" || complaint.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });

    // Top feed is strictly chronological: newest first
    if (feedTab === "top") {
      return result.sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    return result;
  }, [complaints, query, category, status, feedTab, selectedCity]);

  const selected =
    filtered.find((complaint) => complaint.id === selectedId) ?? filtered[0] ?? null;

  const counts = {
    all: complaints.length,
    submitted: complaints.filter((c) => c.status === "submitted").length,
    progress: complaints.filter((c) => c.status === "progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const statusOptions = [
    { id: "all", label: "All", count: counts.all },
    { id: "submitted", label: "Submitted", count: counts.submitted },
    { id: "progress", label: "In progress", count: counts.progress },
    { id: "resolved", label: "Resolved", count: counts.resolved },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-brand-50 p-1.5 text-brand-600">
              <Compass size={16} />
            </span>
            <h1 className="text-[22px] font-extrabold sm:text-2xl">
              {feedTab === "your_city" ? `Explore ${selectedCity}` : feedTab === "other_cities" ? "Other Cities" : "Top Civic Feed"}
            </h1>
          </div>
          <p className="mt-1 text-[12.5px] text-slate-500">
            {filtered.length} reports {feedTab === "your_city" ? `in ${selectedCity}` : "across monitored cities"} · updated moments ago
          </p>
        </div>
        <Link
          to="/report/chat"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Report an issue
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 3 Main Public Feed Tabs mandated by specification */}
      <div className="mb-3.5 flex items-center justify-between border-b border-line pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFeedTab("top")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition",
              feedTab === "top"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            🔥 Top (Newest)
          </button>
          <button
            onClick={() => setFeedTab("your_city")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition",
              feedTab === "your_city"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            📍 Your City ({selectedCity})
          </button>
          <button
            onClick={() => setFeedTab("other_cities")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition",
              feedTab === "other_cities"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            🌐 Other Cities
          </button>
        </div>

        {/* Change City selector */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
          <span>City:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="rounded-lg border border-line bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 outline-none"
          >
            <option value="Riverton">Riverton</option>
            <option value="Metro Heights">Metro Heights</option>
            <option value="Bay City">Bay City</option>
          </select>
        </div>
      </div>

      {/* Search + filters */}
      <div className="surface mb-4 p-3.5 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by issue, street or complaint ID…"
              className="field pl-9 pr-9 text-xs sm:text-sm"
              aria-label="Search issues"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          {/* Desktop/Tablet status segmented bar */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <SlidersHorizontal size={12} /> Status
            </span>
            <Segmented
              options={statusOptions}
              value={status}
              onChange={(value) => setStatus(value as StatusFilter)}
              size="sm"
            />
          </div>
        </div>

        {/* Mobile-only compact 2-column dropdowns for minimal space & perfect responsiveness */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Category
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryFilter)}
              className="h-9 w-full rounded-xl border border-line bg-white px-2.5 text-[11.5px] font-medium text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              aria-label="Filter by category"
            >
              <option value="all">All categories (12)</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-9 w-full rounded-xl border border-line bg-white px-2.5 text-[11.5px] font-medium text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Desktop/Tablet horizontal category pills */}
        <div className="mt-3 hidden gap-1.5 overflow-x-auto pb-0.5 sm:flex">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "focus-ring shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
              category === "all"
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            All categories
          </button>
          {CATEGORIES.map((item) => {
            const Icon = item.icon;
            const active = category === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={cn(
                  "focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <Icon size={12} />
                {item.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_350px]">
        <div className="min-w-0">
          <CityMap
            complaints={filtered}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            className="h-[330px] sm:h-[400px] lg:h-[460px]"
          >
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-line bg-white/95 px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-600 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              {filtered.length} issues mapped
            </div>
          </CityMap>

          <div className="mt-3 lg:hidden">
            {selected ? <SelectedPreview complaint={selected} /> : null}
          </div>

          <div className="mt-4">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[15px] font-bold">Reported issues</h2>
              <span className="text-[11px] text-slate-400">{filtered.length} results</span>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching issues"
                description="Try a different search term or clear your filters to see all reports."
              />
            ) : (
              <div className="space-y-2.5">
                {filtered.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            {selected ? (
              <SelectedPreview complaint={selected} />
            ) : (
              <div className="surface p-5 text-center">
                <MapPin size={20} className="mx-auto text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-600">No issue selected</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Pick a marker on the map to see its details.
                </p>
              </div>
            )}

            <div className="surface p-4">
              <h3 className="text-[12px] font-bold uppercase tracking-wide text-slate-400">
                City at a glance
              </h3>
              <div className="mt-3 space-y-2.5">
                {STATUSES.map((item) => {
                  const count = complaints.filter((c) => c.status === item.id).length;
                  const total = complaints.length || 1;
                  return (
                    <div key={item.id}>
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className={cn("h-1.5 w-1.5 rounded-full", item.dot)} />
                          {item.label}
                        </span>
                        <span className="font-semibold text-slate-500">{count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn("h-full rounded-full", item.dot)}
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                to="/reports"
                className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Go to my reports
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedPreview({
  complaint,
}: {
  complaint: NonNullable<ReturnType<typeof useComplaints>["complaints"][number]>;
}) {
  const category = categoryMeta(complaint.category);
  const Icon = category.icon;

  return (
    <div className="surface animate-fade-in overflow-hidden">
      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
        {complaint.photo ? (
          <img src={complaint.photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <Icon size={30} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          <StatusChip status={complaint.status} size="sm" />
          <PriorityChip priority={complaint.priority} score={complaint.score} size="sm" />
        </div>
        <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between">
          <span className="rounded-md bg-white/90 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-slate-600 backdrop-blur">
            {complaint.id}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium text-white/90">
            <ThumbsUp size={10} /> {complaint.upvotes}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
          {category.label}
        </p>
        <h3 className="mt-1 text-[13.5px] font-bold leading-snug text-slate-900">
          {complaint.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={10} />
            {complaint.location}
          </span>
          <span>{timeAgo(complaint.date)}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
          {complaint.aiSummary}
        </p>
        <Link
          to={`/reports/${complaint.id}`}
          className="focus-ring mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2 text-[11.5px] font-semibold text-white transition hover:bg-brand-700"
        >
          View full details
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
