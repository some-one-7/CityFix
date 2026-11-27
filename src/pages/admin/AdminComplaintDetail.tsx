import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  EyeOff,
  MapPin,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Wrench,
  X,
} from "lucide-react";
import { useComplaint, useComplaints } from "@/store/ComplaintsContext";
import { useToast } from "@/store/ToastContext";
import { Panel } from "@/components/admin/Panel";
import { PriorityScorePanel } from "@/components/complaint/PriorityScore";
import { StatusTimeline } from "@/components/complaint/StatusTimeline";
import { CityMap } from "@/components/map/CityMap";
import { Avatar, EmptyState } from "@/components/ui/Avatar";
import { PriorityChip, StatusChip, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, categoryMeta } from "@/lib/constants";
import { priorityFromScore, scoreFromFactors } from "@/data/complaints";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import type { CategoryId, StatusId } from "@/types";

const ACTIONS: {
  status: StatusId;
  label: string;
  description: string;
  icon: typeof Search;
}[] = [
  {
    status: "review",
    label: "Mark Under Review",
    description: "Validate details and assign a ward officer",
    icon: Search,
  },
  {
    status: "progress",
    label: "Mark In Progress",
    description: "Field crew dispatched to the location",
    icon: Wrench,
  },
  {
    status: "resolved",
    label: "Mark Resolved",
    description: "Work completed and verified on site",
    icon: CheckCircle2,
  },
];

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { complaints, updateStatus, updateComplaint, escalateComplaint } = useComplaints();
  const complaint = useComplaint(id);
  const [note, setNote] = useState("");

  // Escalation modal state
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [authorityTag, setAuthorityTag] = useState("@RivertonRoads");
  const [escalationSla, setEscalationSla] = useState("Urgent 24hr");
  const [escalationNote, setEscalationNote] = useState("");

  // Edit AI modal state
  const [isEditAiOpen, setIsEditAiOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryId>(complaint?.category ?? "roads");
  const [editAiSummary, setEditAiSummary] = useState(complaint?.aiSummary ?? "");
  const [editSeverity, setEditSeverity] = useState(complaint?.factors?.severity ?? 80);

  if (!complaint) {
    return (
      <EmptyState
        icon={Search}
        title="Complaint not found"
        description="This complaint isn't in the demo dataset."
        action={<Button onClick={() => navigate("/admin/complaints")}>Back to complaints</Button>}
      />
    );
  }

  const category = categoryMeta(complaint.category);
  const Icon = category.icon;
  const currentIndex = ["submitted", "review", "progress", "resolved"].indexOf(complaint.status);

  const changeStatus = (status: StatusId, label: string) => {
    updateStatus(
      complaint.id,
      status,
      status === "resolved"
        ? "Marked resolved by city operations. Field verification recorded in the admin demo."
        : undefined
    );
    toast({
      title: `${label.replace("Mark ", "")} saved`,
      description: `${complaint.id} updated locally for this demo.`,
      variant: status === "resolved" ? "success" : "info",
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          All complaints
        </Link>
        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
          <span>Complaints</span>
          <ChevronRight size={11} />
          <span className="font-mono font-medium text-slate-600">{complaint.id}</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", category.tint)}>
              <Icon size={11} />
              {category.label}
            </span>
            <StatusChip status={complaint.status} size="sm" />
            <PriorityChip priority={complaint.priority} score={complaint.score} size="sm" />
            <Tag tone="neutral">{complaint.id}</Tag>
            {complaint.escalatedTo && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                <Building2 size={11} /> {complaint.escalatedTo}
              </span>
            )}
            {complaint.aiEdited && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                <Check size={10} /> Edited by Admin
              </span>
            )}
          </div>
          <h2 className="max-w-2xl text-[20px] font-extrabold leading-tight sm:text-[24px]">
            {complaint.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              {complaint.location}
            </span>
            <span>Submitted {formatDate(complaint.date)}</span>
            <span>Updated {timeAgo(complaint.updated)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(complaint.id);
              toast({ title: "Complaint ID copied", variant: "info" });
            }}
          >
            <Copy size={13} /> Copy ID
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-4">
          <Panel title="Evidence" subtitle="Reporter-uploaded photo" flush>
            {complaint.photo ? (
              <div className="relative">
                <img
                  src={complaint.photo}
                  alt={`Evidence for ${complaint.title}`}
                  className="h-60 w-full object-cover sm:h-80"
                />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600 backdrop-blur">
                    1 image
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600 backdrop-blur">
                    Uploaded {formatDate(complaint.date, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center bg-slate-50 text-[11px] text-slate-400">
                No photo evidence attached
              </div>
            )}
          </Panel>

          <Panel title="Complaint details" subtitle="As submitted by the citizen">
            <p className="text-[13px] leading-relaxed text-slate-600">{complaint.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Category", value: category.short },
                { label: "Area", value: complaint.area },
                { label: "Severity factors", value: `${complaint.factors.severity}/100` },
                { label: "Confirmations", value: `${complaint.upvotes}` },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 px-2.5 py-2">
                  <p className="text-[9.5px] font-medium uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] font-semibold text-slate-700">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="AI summary & classification"
            subtitle={complaint.aiEdited ? `Adjusted by operations · ${complaint.aiEditedAt || "Today"}` : "Generated by NagarMitra triage engine"}
            action={
              <div className="flex items-center gap-1.5">
                {complaint.aiEdited ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    <Check size={10} /> Edited by Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                    <Sparkles size={11} /> AI Suggested
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditCategory(complaint.category);
                    setEditAiSummary(complaint.aiSummary);
                    setEditSeverity(complaint.factors.severity);
                    setIsEditAiOpen(true);
                  }}
                  className="focus-ring inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-[10.5px] font-semibold text-slate-600 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
                >
                  <Edit3 size={11} /> Edit Analysis
                </button>
              </div>
            }
          >
            <p className="rounded-xl border border-brand-100 bg-brand-50/50 p-3.5 text-[12.5px] leading-relaxed text-slate-700">
              {complaint.aiSummary}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center justify-between text-[10px] text-slate-400">
              <span>Category: <strong className="text-slate-600">{category.label}</strong></span>
              <span>Severity signal: <strong className="text-slate-600">{complaint.factors.severity}/100</strong></span>
            </div>
          </Panel>

          <Panel title="Location" subtitle={`${complaint.area} · illustrative map`} flush>
            <CityMap
              complaints={complaints.filter((item) => item.id === complaint.id)}
              selectedId={complaint.id}
              showLegend={false}
              className="h-[230px] rounded-none border-0"
            />
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Admin actions" subtitle="Updates the complaint locally">
            <div className="mb-3 flex items-center justify-between rounded-xl border border-line bg-slate-50/70 px-3 py-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Current status
                </p>
                <p className="text-[12.5px] font-bold text-slate-800">
                  {complaint.timeline[currentIndex]?.label ?? "Submitted"}
                </p>
              </div>
              <StatusChip status={complaint.status} size="sm" />
            </div>

            <div className="space-y-2">
              {ACTIONS.map((action) => {
                const ActionIcon = action.icon;
                const isCurrent = complaint.status === action.status;
                const isPast =
                  ["submitted", "review", "progress", "resolved"].indexOf(action.status) <
                  currentIndex;
                return (
                  <button
                    key={action.status}
                    onClick={() => changeStatus(action.status, action.label)}
                    disabled={isCurrent || isPast}
                    className={cn(
                      "focus-ring flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                      isCurrent
                        ? "border-brand-200 bg-brand-50/70"
                        : "border-line bg-white hover:border-brand-200 hover:bg-brand-50/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line disabled:hover:bg-white"
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-lg p-1.5",
                        isCurrent ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      <ActionIcon size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11.5px] font-semibold text-slate-800">
                        {action.label}
                      </span>
                      <span className="block text-[10px] leading-snug text-slate-400">
                        {action.description}
                      </span>
                    </span>
                    {isCurrent ? (
                      <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-700">
                        Now
                      </span>
                    ) : isPast ? (
                      <CheckCircle2 size={14} className="text-accent-500" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Authority Escalation status card or action button */}
            {complaint.escalatedTo ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    <Building2 size={12} /> Dispatched to Authority
                  </span>
                  <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[9px] font-bold text-amber-900">
                    {complaint.escalationSla || "Urgent 24hr"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-amber-950">
                  Handle: {complaint.escalatedTo}
                </p>
                {complaint.escalationNote && (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-amber-900">
                    "{complaint.escalationNote}"
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEscalateOpen(true)}
                className="focus-ring mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/90 py-2.5 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
              >
                <Send size={13} /> Escalate to Authority Handle
              </button>
            )}

            <div className="mt-3 border-t border-line pt-3">
              <label htmlFor="internal-note" className="field-label">
                Internal note
              </label>
              <textarea
                id="internal-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                placeholder="Add context for the field team…"
                className="field resize-none text-[11.5px]"
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                disabled={note.trim().length === 0}
                onClick={() => {
                  toast({
                    title: "Note saved to demo log",
                    description: note.trim().slice(0, 80),
                    variant: "success",
                  });
                  setNote("");
                }}
              >
                <MessageSquare size={13} /> Save note
              </Button>
            </div>
          </Panel>

          <PriorityScorePanel complaint={complaint} compact />

          <Panel
            title="Reporter"
            subtitle="Mock identity for demo"
            action={<Tag tone={complaint.reporter.anonymous ? "amber" : "teal"}>
              {complaint.reporter.anonymous ? "Anonymous" : "Verified"}
            </Tag>}
          >
            <div className="flex items-center gap-3">
              <Avatar name={complaint.reporter.anonymous ? "Anonymous Citizen" : complaint.reporter.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[12.5px] font-bold text-slate-800">
                  {complaint.reporter.anonymous ? "Anonymous citizen" : complaint.reporter.name}
                  {complaint.reporter.anonymous ? <EyeOff size={11} className="text-slate-400" /> : null}
                </p>
                <p className="text-[10.5px] text-slate-400">{complaint.reporter.phone}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Reports</p>
                <p className="text-[12px] font-bold text-slate-700">{complaint.reporter.reports}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Trust score</p>
                <p className="text-[12px] font-bold text-slate-700">{complaint.reporter.trust}%</p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-accent-600" />
              <p className="text-[10px] leading-relaxed text-slate-500">
                Reporter identity is fictional and shown for demonstration only.
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp size={11} /> {complaint.upvotes} confirmations
              </span>
              <span>{complaint.reporter.reports} past reports</span>
            </div>
          </Panel>

          <Panel title="Status timeline" subtitle="Live demo lifecycle">
            <StatusTimeline complaint={complaint} />
          </Panel>
        </div>
      </div>

      {/* Escalate to Authority Modal */}
      {isEscalateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="escalate-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-lift">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Building2 size={16} />
                </span>
                <div>
                  <h3 id="escalate-modal-title" className="text-sm font-bold text-slate-900">
                    Public Authority Escalation
                  </h3>
                  <p className="text-[10.5px] text-slate-400">Dispatch issue to municipal agency</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEscalateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Agency Handle *
                </label>
                <select
                  value={authorityTag}
                  onChange={(e) => setAuthorityTag(e.target.value)}
                  className="field mt-1 min-h-[40px] py-1.5 text-xs"
                >
                  <option value="@RivertonRoads">@RivertonRoads · Roads, Potholes & Footpaths</option>
                  <option value="@WaterBoard">@WaterBoard · Water Supply & Leakages</option>
                  <option value="@CityDrainage">@CityDrainage · Drainage, Flooding & Culverts</option>
                  <option value="@CityElectricityDept">@CityElectricityDept · Power & Streetlights</option>
                  <option value="@RivertonSanitation">@RivertonSanitation · Solid Waste & Dumps</option>
                  <option value="@TrafficPolice">@TrafficPolice · Traffic Signals & Obstructions</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Resolution SLA Target *
                </label>
                <select
                  value={escalationSla}
                  onChange={(e) => setEscalationSla(e.target.value)}
                  className="field mt-1 min-h-[40px] py-1.5 text-xs"
                >
                  <option value="Emergency 4hr">Emergency 4hr · Immediate Safety/Accident Risk</option>
                  <option value="Urgent 24hr">Urgent 24hr · High commuter impact or arterial road</option>
                  <option value="Standard 48hr">Standard 48hr · Routine municipal maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Official Dispatch Instruction
                </label>
                <textarea
                  value={escalationNote}
                  onChange={(e) => setEscalationNote(e.target.value)}
                  rows={3}
                  placeholder="Specify ward supervisor instructions, crew requirements, or safety protocols..."
                  className="field mt-1 text-xs"
                />
              </div>

              <div className="rounded-xl bg-amber-50/70 p-3 text-[10.5px] leading-relaxed text-amber-800 border border-amber-200">
                🔒 Reporter personal contact info remains confidential and is not published on public boards.
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsEscalateOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  escalateComplaint(complaint.id, authorityTag, escalationSla, escalationNote);
                  setIsEscalateOpen(false);
                  toast({
                    title: "Issue Escalated",
                    description: `Dispatched to ${authorityTag} with ${escalationSla} target.`,
                    variant: "success",
                  });
                }}
              >
                <Send size={13} /> Confirm Escalation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit AI Analysis Modal */}
      {isEditAiOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-ai-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-lift">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Edit3 size={16} />
                </span>
                <div>
                  <h3 id="edit-ai-modal-title" className="text-sm font-bold text-slate-900">
                    Edit AI Analysis
                  </h3>
                  <p className="text-[10.5px] text-slate-400">Override category, summary & severity</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditAiOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Category *
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as CategoryId)}
                  className="field mt-1 min-h-[40px] py-1.5 text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  AI Summary *
                </label>
                <textarea
                  value={editAiSummary}
                  onChange={(e) => setEditAiSummary(e.target.value)}
                  rows={3}
                  className="field mt-1 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Severity Score: {editSeverity}/100
                  </label>
                  <span className="text-[10px] text-slate-400">Multi-factor signal</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={editSeverity}
                  onChange={(e) => setEditSeverity(Number(e.target.value))}
                  className="mt-2 w-full accent-brand-600"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsEditAiOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const updatedFactors = { ...complaint.factors, severity: editSeverity };
                  const newScore = scoreFromFactors(updatedFactors);
                  updateComplaint(complaint.id, {
                    category: editCategory,
                    aiSummary: editAiSummary,
                    factors: updatedFactors,
                    score: newScore,
                    priority: priorityFromScore(newScore),
                    aiEdited: true,
                    aiEditedAt: new Date().toISOString().split("T")[0],
                  });
                  setIsEditAiOpen(false);
                  toast({
                    title: "AI Analysis Updated",
                    description: "Category and severity updated by administrator.",
                    variant: "success",
                  });
                }}
              >
                <Check size={13} /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
