import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Layers,
  MapPin,
  Radar,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { CityMap } from "@/components/map/CityMap";
import { Panel } from "@/components/admin/Panel";
import { PriorityChip, StatusChip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useComplaints } from "@/store/ComplaintsContext";
import { useToast } from "@/store/ToastContext";
import { CATEGORIES, PRIORITIES, categoryMeta } from "@/lib/constants";
import { AREA_HOTSPOTS } from "@/data/analytics";
import { cn, timeAgo } from "@/lib/utils";
import type { CategoryId, PriorityId } from "@/types";

export default function AdminMap() {
  const { complaints } = useComplaints();
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [priority, setPriority] = useState<PriorityId | "all">("all");
  const [density, setDensity] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(complaints[0]?.id ?? null);

  const filtered = useMemo(
    () =>
      complaints.filter(
        (complaint) =>
          (category === "all" || complaint.category === category) &&
          (priority === "all" || complaint.priority === priority)
      ),
    [complaints, category, priority]
  );

  const selected =
    filtered.find((complaint) => complaint.id === selectedId) ?? filtered[0] ?? null;

  const mix = PRIORITIES.map((item) => ({
    ...item,
    count: filtered.filter((complaint) => complaint.priority === item.id).length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold sm:text-xl">Live issue map</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {filtered.length} issues plotted across 8 wards · priority-coded markers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDensity((value) => !value)}
            className={cn(
              "focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[11.5px] font-semibold transition",
              density
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-line bg-white text-slate-600 hover:border-slate-300"
            )}
            aria-pressed={density}
          >
            <Layers size={14} />
            Density
          </button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast({
                title: "Map refreshed",
                description: "Demo marker positions are static sample data.",
                variant: "info",
              })
            }
          >
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
      </div>

      <div className="surface flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "focus-ring shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition",
              category === "all"
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            All categories
          </button>
          {CATEGORIES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={cn(
                  "focus-ring inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition",
                  category === item.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <Icon size={11} />
                {item.short}
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <SlidersHorizontal size={12} className="text-slate-400" />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as PriorityId | "all")}
            className="h-8 rounded-lg border border-line bg-white px-2 text-[11px] font-medium text-slate-600 outline-none focus:border-brand-400"
            aria-label="Filter map by priority"
          >
            <option value="all">All priorities</option>
            {PRIORITIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_345px]">
        <div className="surface min-w-0 p-2">
          <CityMap
            complaints={filtered}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            density={density}
            className="h-[400px] sm:h-[480px] lg:h-[560px]"
          >
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-line bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                Live demo map
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">{filtered.length} pins</span>
            </div>
            <div className="pointer-events-none absolute right-3 top-3 z-10 hidden items-center gap-1.5 rounded-lg border border-line bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm backdrop-blur sm:flex">
              <Radar size={12} className="text-brand-500" />
              {density ? "Density overlay on" : "Density overlay off"}
            </div>
          </CityMap>
        </div>

        <div className="space-y-4">
          {selected ? (
            <div className="surface animate-fade-in overflow-hidden">
              {selected.photo ? (
                <img src={selected.photo} alt="" className="h-28 w-full object-cover" />
              ) : (
                <div className="flex h-24 items-center justify-center bg-slate-100 text-slate-300">
                  <MapPin size={24} />
                </div>
              )}
              <div className="p-3.5">
                <div className="flex flex-wrap items-center gap-1">
                  <StatusChip status={selected.status} size="sm" />
                  <PriorityChip priority={selected.priority} score={selected.score} size="sm" />
                </div>
                <h3 className="mt-2 text-[13px] font-bold leading-snug text-slate-900">
                  {selected.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-[10.5px] text-slate-500">
                  <MapPin size={10} />
                  {selected.location}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {categoryMeta(selected.category).label} · {selected.id} · reported{" "}
                  {timeAgo(selected.date)}
                </p>
                <Link
                  to={`/admin/complaints/${selected.id}`}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-[11px] font-semibold text-white transition hover:bg-brand-700"
                >
                  Open complaint
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <Panel title="No issue selected" subtitle="Adjust filters to see markers">
              <p className="text-[11.5px] text-slate-500">
                There are no complaints matching this category and priority combination.
              </p>
            </Panel>
          )}

          <Panel title="Priority mix" subtitle="Filtered markers">
            <div className="space-y-2.5">
              {mix.map((item) => {
                const total = filtered.length || 1;
                return (
                  <div key={item.id}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className={cn("h-1.5 w-1.5 rounded-full", item.marker)} />
                        {item.label}
                      </span>
                      <span className="font-semibold text-slate-500">{item.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn("h-full rounded-full", item.marker)}
                        style={{ width: `${(item.count / total) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel
            title="Report hotspots"
            subtitle="Areas ranked by volume"
            action={<span className="text-[10px] text-slate-400">30 days</span>}
          >
            <ul className="space-y-2.5">
              {AREA_HOTSPOTS.slice(0, 4).map((area, index) => (
                <li key={area.area} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-[9px] font-bold text-slate-500">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-slate-700">{area.area}</p>
                    <p className="text-[9.5px] text-slate-400">{area.ward}</p>
                  </div>
                  <span className="font-mono text-[10.5px] font-semibold text-slate-500">
                    {area.reports}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
