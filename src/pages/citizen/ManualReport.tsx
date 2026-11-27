import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  ImagePlus,
  Info,
  LocateFixed,
  MapPin,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CityMap } from "@/components/map/CityMap";
import { PriorityChip } from "@/components/ui/Badge";
import { useComplaints } from "@/store/ComplaintsContext";
import { useToast } from "@/store/ToastContext";
import { CATEGORIES, TOP_CATEGORY_IDS, categoryMeta } from "@/lib/constants";
import {
  buildTimeline,
  priorityFromScore,
  scoreFromFactors,
} from "@/data/complaints";
import { cn, formatDate, mockId } from "@/lib/utils";
import type { CategoryId, Complaint, PriorityFactors } from "@/types";

const TODAY = "2026-11-25";

const SEVERITIES = [
  {
    id: "low",
    label: "Low",
    description: "Minor nuisance, no immediate risk",
    factors: { severity: 30, impact: 34, recurrence: 28, urgency: 26 },
  },
  {
    id: "medium",
    label: "Medium",
    description: "Needs attention but not urgent",
    factors: { severity: 55, impact: 58, recurrence: 50, urgency: 48 },
  },
  {
    id: "high",
    label: "High",
    description: "Affects many people every day",
    factors: { severity: 74, impact: 76, recurrence: 64, urgency: 66 },
  },
  {
    id: "critical",
    label: "Critical",
    description: "Immediate safety or health risk",
    factors: { severity: 92, impact: 88, recurrence: 72, urgency: 90 },
  },
] as const;

type SeverityId = (typeof SEVERITIES)[number]["id"];

const SAMPLE_PHOTOS = [
  { src: "/evidence/pothole.jpg", label: "Pothole" },
  { src: "/evidence/garbage.jpg", label: "Garbage" },
  { src: "/evidence/streetlight.jpg", label: "Streetlight" },
  { src: "/evidence/water.jpg", label: "Water leak" },
];

interface VoicePrefill {
  title?: string;
  description?: string;
  aiSummary?: string;
  category?: CategoryId;
  fromVoice?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
}

export default function ManualReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { addComplaint } = useComplaints();
  const [searchParams] = useSearchParams();
  const prefill = (location.state ?? {}) as VoicePrefill;

  const initialCategory = (prefill.category ??
    (searchParams.get("category") as CategoryId | null) ??
    "") as CategoryId | "";
  const initialTitle =
    prefill.title ??
    (initialCategory === "roads" ? "" : "");

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(prefill.description ?? "");
  const [category, setCategory] = useState<CategoryId | "">(initialCategory);
  const [showAllCategories, setShowAllCategories] = useState<boolean>(
    Boolean(initialCategory && !TOP_CATEGORY_IDS.includes(initialCategory as CategoryId))
  );
  const [issueLocation, setIssueLocation] = useState(prefill.fromVoice ? "Maple Market, Ward 2" : "");
  const [severity, setSeverity] = useState<SeverityId>("medium");
  const [pin, setPin] = useState({ x: 44, y: 52 });
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Complaint | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const severityMeta = SEVERITIES.find((item) => item.id === severity)!;
  const score = useMemo(
    () => scoreFromFactors(severityMeta.factors as PriorityFactors),
    [severityMeta]
  );
  const priority = priorityFromScore(score);

  const useMyLocation = () => {
    setLocating(true);
    window.setTimeout(() => {
      setIssueLocation("School Road, Ward 4");
      setPin({ x: 27, y: 38 });
      setLocating(false);
      setErrors((current) => ({ ...current, location: undefined }));
      toast({
        title: "Location captured",
        description: "Simulated GPS position for School Road, Ward 4.",
        variant: "info",
      });
    }, 900);
  };

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please choose an image file", variant: "error" });
      return;
    }
    setPhoto(URL.createObjectURL(file));
    toast({ title: "Photo attached", description: file.name, variant: "success" });
  };

  const validate = () => {
    const next: FormErrors = {};
    if (title.trim().length < 8) next.title = "Add a title of at least 8 characters.";
    if (description.trim().length < 25)
      next.description = "Please describe the issue in at least 25 characters.";
    if (!category) next.category = "Select the category that fits best.";
    if (issueLocation.trim().length < 4) next.location = "Add the area or street.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast({
        title: "Check the highlighted fields",
        description: "A few details are still missing.",
        variant: "error",
      });
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      const factors = severityMeta.factors as PriorityFactors;
      const computedScore = scoreFromFactors(factors);
      const chosenCategory = category as CategoryId;
      const id = mockId();
      const complaint: Complaint = {
        id,
        title: title.trim(),
        description: description.trim(),
        aiSummary:
          prefill.fromVoice && prefill.aiSummary
            ? prefill.aiSummary
            : `${title.trim()} reported at ${issueLocation.trim()}. ${
                severity === "critical"
                  ? "Flagged as an immediate safety risk based on the severity selected."
                  : "Logged for ward review with the submitted description and photo evidence."
              }`,
        category: chosenCategory,
        status: "submitted",
        priority,
        score: computedScore,
        factors,
        location: issueLocation.trim(),
        area: issueLocation.split(",")[0].trim(),
        date: TODAY,
        updated: TODAY,
        photo: photo ?? undefined,
        reporter: {
          name: "Ananya Rao",
          anonymous: false,
          phone: "+91 98•• ••41 20",
          reports: 7,
          trust: 92,
        },
        coordinates: pin,
        upvotes: 1,
        why: [
          `Severity rated “${severityMeta.label}” by the reporter`,
          `Located in ${issueLocation.trim()}`,
          severity === "critical"
            ? "Immediate-hazard keywords detected in the description (demo rule)"
            : "Awaiting community verification and ward triage",
        ],
        timeline: buildTimeline(TODAY, "submitted"),
      };
      addComplaint(complaint);
      setCreated(complaint);
      setSubmitting(false);
      toast({
        title: "Complaint submitted",
        description: `${id} has been added to your reports.`,
        variant: "success",
      });
    }, 950);
  };

  const resetForm = () => {
    setCreated(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setIssueLocation("");
    setPin({ x: 44, y: 52 });
    setPhoto(null);
    setSeverity("medium");
    setErrors({});
    navigate("/report/manual", { replace: true });
  };

  if (created) {
    return (
      <div className="mx-auto max-w-lg animate-fade-up">
        <div className="surface overflow-hidden">
          <div className="border-b border-line bg-gradient-to-b from-accent-50 to-white px-6 pb-6 pt-9 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg shadow-accent-500/25">
              <CheckCircle2 size={32} strokeWidth={2.2} />
            </span>
            <h1 className="mt-4 text-xl font-extrabold">Report submitted</h1>
            <p className="mx-auto mt-1.5 max-w-xs text-[12.5px] leading-relaxed text-slate-500">
              Your complaint is in the ward queue. Save the tracking ID to follow updates.
            </p>
          </div>

          <div className="space-y-4 px-5 py-5">
            <div className="rounded-xl border border-line bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Complaint ID
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(created.id);
                    toast({ title: "Complaint ID copied", variant: "info" });
                  }}
                  className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-600 hover:text-brand-700"
                >
                  <Copy size={11} /> Copy
                </button>
              </div>
              <p className="mt-1 font-mono text-lg font-bold tracking-tight text-slate-900">
                {created.id}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <PriorityChip priority={created.priority} score={created.score} size="sm" />
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-line">
                  <CalendarDays size={10} />
                  {formatDate(created.date)}
                </span>
                {created.photo ? (
                  <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-line">
                    1 photo
                  </span>
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-slate-900">{created.title}</p>
              <p className="mt-1 flex items-center gap-1 text-[11.5px] text-slate-500">
                <MapPin size={11} />
                {created.location}
              </p>
            </div>

            <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3">
              <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-brand-700">
                <Sparkles size={11} /> What happens next
              </p>
              <ol className="mt-2 space-y-1.5">
                {[
                  "Ward officer reviews the report within 48 hours",
                  "A field team is assigned and the status moves to In Progress",
                  "You get an update when the issue is marked Resolved",
                ].map((step, index) => (
                  <li key={step} className="flex gap-2 text-[11.5px] text-slate-600">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-bold text-brand-600 ring-1 ring-brand-100">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                onClick={() => navigate(`/reports/${created.id}`)}
              >
                View complaint
                <ChevronRight size={15} />
              </Button>
              <Button variant="outline" className="flex-1" onClick={resetForm}>
                Report another
              </Button>
            </div>
            <Link
              to="/reports"
              className="block text-center text-[11.5px] font-semibold text-slate-500 transition hover:text-slate-800"
            >
              View all my reports
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-[10.5px] leading-relaxed text-slate-400">
          This is a prototype. The complaint was saved in local demo state only and is not sent to
          any municipal system.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold sm:text-2xl">Report an issue</h1>
          <p className="mt-1 text-[12.5px] text-slate-500">
            A few details help the right team find and fix it faster.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[10.5px] font-medium text-slate-500">
          <CalendarDays size={12} />
          {formatDate(TODAY)}
        </div>
      </div>

      {prefill.fromVoice ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50/70 px-3.5 py-2.5">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-600" />
          <div className="flex-1">
            <p className="text-[11.5px] font-semibold text-brand-800">
              Prefilled from your voice note
            </p>
            <p className="text-[10.5px] text-brand-700/70">
              Review the transcript, choose a category and confirm the location.
            </p>
          </div>
          <Link to="/report/voice" className="text-[10.5px] font-semibold text-brand-700 underline-offset-2 hover:underline">
            Re-record
          </Link>
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <section className="surface p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold">Issue details</h2>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Step 1 of 3
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="field-label">
                Issue title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (errors.title) setErrors((current) => ({ ...current, title: undefined }));
                }}
                placeholder="e.g. Deep pothole outside the school gate"
                maxLength={90}
                className={cn("field", errors.title && "border-red-300 focus:border-red-400 focus:ring-red-100")}
                aria-invalid={Boolean(errors.title)}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.title ? (
                  <p className="text-[11px] font-medium text-red-500">{errors.title}</p>
                ) : (
                  <span />
                )}
                <span className="text-[10px] text-slate-400">{title.length}/90</span>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="field-label">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  if (errors.description)
                    setErrors((current) => ({ ...current, description: undefined }));
                }}
                rows={4}
                placeholder="What is the issue, how long has it been there, and who does it affect?"
                className={cn(
                  "field resize-none",
                  errors.description && "border-red-300 focus:border-red-400 focus:ring-red-100"
                )}
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description ? (
                <p className="mt-1 text-[11px] font-medium text-red-500">{errors.description}</p>
              ) : null}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="field-label mb-0">
                  Category <span className="text-red-500">*</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllCategories((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                >
                  {showAllCategories ? (
                    <>
                      Top 6 common <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      All 12 categories <ChevronDown size={12} />
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(showAllCategories
                  ? CATEGORIES.filter((c) => c.id !== "other")
                  : CATEGORIES.filter((c) => TOP_CATEGORY_IDS.includes(c.id))
                ).map((item) => {
                  const Icon = item.icon;
                  const active = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCategory(item.id);
                        setErrors((current) => ({ ...current, category: undefined }));
                      }}
                      className={cn(
                        "focus-ring flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[11.5px] font-medium transition",
                        active
                          ? "border-brand-400 bg-brand-50 text-brand-800 ring-2 ring-brand-100"
                          : "border-line bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <span className={cn("rounded-lg p-1.5", active ? "bg-white text-brand-600" : item.tint)}>
                        <Icon size={13} />
                      </span>
                      <span className="leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.category ? (
                <p className="mt-1 text-[11px] font-medium text-red-500">{errors.category}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="surface p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold">Location</h2>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Step 2 of 3
            </span>
          </div>

          <div>
            <label htmlFor="location" className="field-label">
              Street or area <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="location"
                  value={issueLocation}
                  onChange={(event) => {
                    setIssueLocation(event.target.value);
                    if (errors.location)
                      setErrors((current) => ({ ...current, location: undefined }));
                  }}
                  placeholder="e.g. School Road, near St. Xavier's gate"
                  className={cn(
                    "field pl-9",
                    errors.location && "border-red-300 focus:border-red-400 focus:ring-red-100"
                  )}
                  aria-invalid={Boolean(errors.location)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={useMyLocation}
                loading={locating}
                className="shrink-0"
              >
                {!locating ? <LocateFixed size={15} /> : null}
                Use my location
              </Button>
            </div>
            {errors.location ? (
              <p className="mt-1 text-[11px] font-medium text-red-500">{errors.location}</p>
            ) : null}
          </div>

          <div className="mt-3">
            <CityMap
              complaints={[]}
              pin={pin}
              showLegend={false}
              onMapClick={(coords) => {
                setPin(coords);
                toast({
                  title: "Pin moved",
                  description: "Tap another spot on the map to adjust the location.",
                  variant: "info",
                });
              }}
              className="h-[190px] sm:h-[220px]"
            >
              <div className="pointer-events-none absolute right-2.5 top-2.5 z-10 rounded-lg border border-line bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur">
                Tap the map to place the pin
              </div>
              <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 rounded-lg bg-white/90 px-2 py-1 font-mono text-[9.5px] text-slate-500 backdrop-blur">
                {`18.5${Math.round(pin.y)}° N, 73.8${Math.round(pin.x)}° E`}
              </div>
            </CityMap>
            <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-slate-400">
              <Info size={11} />
              Map and coordinates are illustrative; no mapping service is connected.
            </p>
          </div>
        </section>

        <section className="surface p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold">Evidence & severity</h2>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Step 3 of 3
            </span>
          </div>

          <div>
            <span className="field-label">Photo (optional)</span>
            {photo ? (
              <div className="relative overflow-hidden rounded-xl border border-line">
                <img src={photo} alt="Uploaded evidence preview" className="h-44 w-full object-cover sm:h-56" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-900/70 to-transparent px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-white">
                    <CheckCircle2 size={12} /> Photo ready
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="rounded-lg bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-700 transition hover:bg-white"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="rounded-lg bg-white/95 p-1.5 text-slate-700 transition hover:bg-white"
                      aria-label="Remove photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="focus-ring flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-slate-50/50 px-4 py-7 text-center transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <span className="rounded-xl bg-white p-2.5 text-brand-600 shadow-sm ring-1 ring-line">
                    <ImagePlus size={20} />
                  </span>
                  <span className="text-[12px] font-semibold text-slate-700">
                    Upload a photo
                  </span>
                  <span className="text-[10.5px] text-slate-400">
                    JPG or PNG · helps crews find the exact spot
                  </span>
                </button>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowSamples((value) => !value)}
                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <Camera size={11} />
                    {showSamples ? "Hide sample photos" : "Use a sample photo instead"}
                  </button>
                  <span className="text-[10px] text-slate-400">Demo only</span>
                </div>
                {showSamples ? (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {SAMPLE_PHOTOS.map((sample) => (
                      <button
                        key={sample.src}
                        type="button"
                        onClick={() => {
                          setPhoto(sample.src);
                          setShowSamples(false);
                          toast({ title: "Sample photo attached", description: sample.label, variant: "info" });
                        }}
                        className="focus-ring group overflow-hidden rounded-lg border border-line"
                      >
                        <img
                          src={sample.src}
                          alt={sample.label}
                          className="h-14 w-full object-cover transition group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="hidden"
              aria-label="Upload photo evidence"
            />
          </div>

          <div className="mt-4">
            <span className="field-label">How severe is it?</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SEVERITIES.map((item) => {
                const active = severity === item.id;
                const tones: Record<SeverityId, string> = {
                  low: "border-slate-300 bg-slate-50 text-slate-700",
                  medium: "border-amber-300 bg-amber-50 text-amber-800",
                  high: "border-orange-300 bg-orange-50 text-orange-800",
                  critical: "border-red-300 bg-red-50 text-red-800",
                };
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSeverity(item.id)}
                    className={cn(
                      "focus-ring rounded-xl border p-2.5 text-left transition",
                      active
                        ? cn(tones[item.id], "ring-2 ring-offset-1 ring-current/20")
                        : "border-line bg-white hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-[11.5px] font-bold">{item.label}</span>
                      <span
                        className={cn(
                          "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                          active ? "border-current bg-current" : "border-slate-300"
                        )}
                      >
                        {active ? <CheckCircle2 size={10} className="text-white" /> : null}
                      </span>
                    </span>
                    <span className="mt-1 block text-[10px] leading-snug text-slate-500">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
                <Sparkles size={11} className="text-brand-500" />
                Indicative priority from your selection
              </span>
              <PriorityChip priority={priority} score={score} size="sm" />
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
            <Info size={12} />
            Saved locally for this demo — nothing is sent to a server.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {!submitting ? <ArrowRight size={15} /> : null}
              Submit complaint
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
