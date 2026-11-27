import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Layers,
  MapPin,
  Mic,
  PenLine,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { useComplaints } from "@/store/ComplaintsContext";
import { CATEGORIES, TOP_CATEGORY_IDS, categoryMeta, statusMeta } from "@/lib/constants";
import { TRANSLATIONS, CATEGORY_LABELS } from "@/lib/translations";
import { StatusChip } from "@/components/ui/Badge";
import { ComplaintCard } from "@/components/complaint/ComplaintCard";
import { cn, timeAgo } from "@/lib/utils";

export default function Home() {
  const { complaints, selectedCity, language } = useComplaints();
  const t = TRANSLATIONS[language];
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  const nearYou = complaints.filter((c) => c.status !== "resolved").slice(0, 3);
  const openNearby = complaints.filter((c) => c.status !== "resolved").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const activity = complaints.slice(0, 3);

  const topCategories = CATEGORIES.filter((category) => TOP_CATEGORY_IDS.includes(category.id));
  const displayedCategories = isCategoriesExpanded
    ? CATEGORIES.filter((category) => category.id !== "other")
    : topCategories;

  return (
    <div className="space-y-5 sm:space-y-7 w-full max-w-full overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-700 px-5 py-7 text-white shadow-card sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[46px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-32 right-24 h-72 w-72 rounded-full border-[36px] border-white/[0.04]" />
        <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_310px]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-brand-100 ring-1 ring-inset ring-white/15">
              <MapPin size={12} />
              {selectedCity} · Ward 4
            </span>
            <h1 className="mt-4 font-display text-[26px] font-extrabold leading-[1.15] tracking-tight sm:text-[34px]">
              {t.heroTitle}
              <br />
              <span className="text-brand-200">{t.heroSubtitle}</span>
            </h1>
            <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-brand-100/90 sm:text-sm">
              {t.heroDesc}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link
                to="/report/chat"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-brand-700 shadow-sm transition hover:bg-brand-50"
              >
                {t.reportBtn}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/explore"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t.exploreBtn}
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-brand-100/80">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} /> {resolved} issues resolved nearby
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={13} /> AI-assisted triage
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-3 backdrop-blur-sm">
              <div className="rounded-xl bg-white p-3.5 text-slate-900 shadow-lift">
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Live in your ward
                  </p>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-accent-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                    Now
                  </span>
                </div>
                <div className="space-y-2.5">
                  {activity.map((item) => {
                    const meta = statusMeta(item.status);
                    const category = categoryMeta(item.category);
                    const Icon = category.icon;
                    return (
                      <div key={item.id} className="flex items-center gap-2.5">
                        <span className={cn("rounded-lg p-1.5", category.tile)}>
                          <Icon size={13} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11.5px] font-semibold text-slate-800">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {item.area} · {timeAgo(item.updated)}
                          </p>
                        </div>
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.dot)} />
                      </div>
                    );
                  })}
                </div>
                <Link
                  to="/explore"
                  className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2 text-[10.5px] font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Open full city map
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[17px] font-bold">{t.quickCategories}</h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {language === "hi"
                ? "अपने शहर में सबसे ज्यादा रिपोर्ट की जाने वाली समस्याएं।"
                : language === "te"
                ? "మీ నగరంలో అత్యధికంగా నమోదయ్యే సమస్యలు."
                : "Most common civic issues reported in your city."}
            </p>
          </div>
          <button
            onClick={() => setIsCategoriesExpanded((prev) => !prev)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:border-brand-400 hover:text-brand-600"
            aria-expanded={isCategoriesExpanded}
          >
            <Layers size={14} className="text-brand-600" />
            {isCategoriesExpanded ? (
              <>
                {t.showLessCategories}
                <ChevronUp size={13} className="text-slate-400" />
              </>
            ) : (
              <>
                {t.viewAllCategories}
                <ChevronDown size={13} className="text-slate-400" />
              </>
            )}
          </button>
        </div>

        {/* Categories grid (Row 1 always visible; Row 2 expands inline when clicked) */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3 transition-all duration-300">
          {displayedCategories.map((category) => {
            const Icon = category.icon;
            const count = complaints.filter(
              (c) => c.category === category.id || (category.id === "waste" && c.category === "garbage")
            ).length;

            return (
              <Link
                key={category.id}
                to={`/report/chat?category=${category.id}`}
                className="surface surface-hover group flex flex-col justify-between p-3 sm:p-3.5 animate-fade-in"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={cn("rounded-xl p-2.5 transition", category.tile)}>
                      <Icon size={18} />
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-medium text-slate-500">
                      {count}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-[12.5px] font-bold leading-snug text-slate-800 transition group-hover:text-brand-600">
                    {CATEGORY_LABELS[language][category.id] || category.label}
                  </h3>
                </div>
                <p className="mt-2 truncate text-[10px] text-slate-400">
                  {category.subcategories.slice(0, 2).join(" · ")}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* City pulse strip */}
      <section className="surface grid grid-cols-3 divide-x divide-line">
        {[
          { label: "Open near you", value: openNearby, icon: MapPin, tone: "text-brand-600" },
          { label: "Resolved this week", value: resolved, icon: CheckCircle2, tone: "text-accent-600" },
          { label: "Community upvotes", value: complaints.reduce((sum, c) => sum + c.upvotes, 0), icon: ThumbsUp, tone: "text-amber-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-2 py-3.5 text-center">
              <Icon size={15} className={stat.tone} />
              <span className="font-display text-lg font-extrabold leading-none text-slate-900">
                {stat.value}
              </span>
              <span className="text-[10px] font-medium text-slate-400">{stat.label}</span>
            </div>
          );
        })}
      </section>

      {/* Reports near you */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold">Reports near you</h2>
            <p className="mt-0.5 text-[12px] text-slate-500">Recent issues around Ward 4.</p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 transition hover:text-brand-700"
          >
            View all
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-2.5">
          {nearYou.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      </section>

      {/* Trust footer card */}
      <section className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
            <ShieldCheck size={18} />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-800">Every report gets a tracking ID</p>
            <p className="text-[11.5px] text-slate-500">
              Follow updates from submission to resolution, right in My Reports.
            </p>
          </div>
        </div>
        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[11.5px] font-semibold text-white transition hover:bg-slate-800"
        >
          Track my reports
          <ArrowRight size={13} />
        </Link>
      </section>
    </div>
  );
}
