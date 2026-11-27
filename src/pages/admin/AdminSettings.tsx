import { useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Map,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Panel } from "@/components/admin/Panel";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Badge";
import { useToast } from "@/store/ToastContext";
import { ADMIN_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-[12px] font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "focus-ring relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition",
          checked ? "bg-brand-600" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [cityName, setCityName] = useState("Riverton Municipal Corporation");
  const [ward, setWard] = useState("All wards");
  const [sla, setSla] = useState("48");
  const [autoAssign, setAutoAssign] = useState(true);
  const [autoPriority, setAutoPriority] = useState(true);
  const [citizenUpdates, setCitizenUpdates] = useState(true);
  const [highPriorityAlerts, setHighPriorityAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [email, setEmail] = useState("meera.shah@riverton.gov.demo");

  const save = () => {
    toast({
      title: "Settings saved",
      description: "Demo preferences stored locally for this session.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold sm:text-xl">Workspace settings</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Configure how NagarMitra routes and prioritises reports. Changes are local only.
          </p>
        </div>
        <Button size="sm" onClick={save}>
          <Save size={14} /> Save changes
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Panel
            title="City profile"
            subtitle="Shown to citizens across the app"
            action={
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                <Building2 size={11} /> Demo
              </span>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="city-name" className="field-label">
                  Municipality name
                </label>
                <input
                  id="city-name"
                  value={cityName}
                  onChange={(event) => setCityName(event.target.value)}
                  className="field text-[12.5px]"
                />
              </div>
              <div>
                <label htmlFor="ward" className="field-label">
                  Default ward
                </label>
                <select
                  id="ward"
                  value={ward}
                  onChange={(event) => setWard(event.target.value)}
                  className="field text-[12.5px]"
                >
                  <option>All wards</option>
                  {["Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5", "Ward 6", "Ward 7", "Ward 8"].map(
                    (item) => (
                      <option key={item}>{item}</option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="sla" className="field-label">
                  Review SLA (hours)
                </label>
                <input
                  id="sla"
                  type="number"
                  min={4}
                  max={168}
                  value={sla}
                  onChange={(event) => setSla(event.target.value)}
                  className="field text-[12.5px]"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="contact-email" className="field-label">
                  Operations contact email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="field text-[12.5px]"
                />
              </div>
            </div>
          </Panel>

          <Panel title="Operations & routing" subtitle="Automation for incoming reports">
            <div className="divide-y divide-line">
              <Toggle
                checked={autoAssign}
                onChange={setAutoAssign}
                label="Auto-assign to ward teams"
                description="Route new reports to the ward officer based on the reported location."
              />
              <Toggle
                checked={autoPriority}
                onChange={setAutoPriority}
                label="Use sample priority scoring"
                description="Show the transparent severity, impact, recurrence and urgency breakdown."
              />
            </div>
            <div className="mt-1 rounded-xl border border-line bg-slate-50/60 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700">
                <Sparkles size={12} className="text-brand-500" />
                AI triage is not connected
              </p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                Priority scores in this prototype use fixed sample weights. No model or API is
                called.
              </p>
            </div>
          </Panel>

          <Panel title="Notifications" subtitle="For the operations team">
            <div className="divide-y divide-line">
              <Toggle
                checked={citizenUpdates}
                onChange={setCitizenUpdates}
                label="Citizen status updates"
                description="Notify reporters automatically when a complaint moves stage."
              />
              <Toggle
                checked={highPriorityAlerts}
                onChange={setHighPriorityAlerts}
                label="High priority alerts"
                description="Send an immediate alert for critical reports."
              />
              <Toggle
                checked={weeklyDigest}
                onChange={setWeeklyDigest}
                label="Weekly performance digest"
                description="Email a summary of trends, hotspots and resolution performance."
              />
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2">
              <span className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
                <Bell size={12} /> Notification delivery is simulated
              </span>
              <Tag tone="neutral">Phase 2</Tag>
            </div>
          </Panel>

          <div className="flex justify-end">
            <Button onClick={save}>
              <Check size={15} /> Save changes
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Panel title="Admin profile" subtitle="Demo account">
            <div className="flex items-center gap-3">
              <Avatar name={ADMIN_NAME} size="lg" />
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-900">{ADMIN_NAME}</p>
                <p className="text-[10.5px] text-slate-500">City operations lead</p>
                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                  meera.shah@riverton.gov.demo
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Tag tone="teal">
                <ShieldCheck size={10} /> Verified admin
              </Tag>
              <Tag tone="brand">All wards</Tag>
              <Tag tone="neutral">Session demo</Tag>
            </div>
            <div className="mt-3 space-y-2 border-t border-line pt-3">
              {[
                { label: "Team members", value: "12", icon: Users },
                { label: "Assigned wards", value: "8", icon: Map },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Icon size={12} /> {item.label}
                    </span>
                    <span className="font-semibold text-slate-700">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Phase 2 integrations" subtitle="Planned, not configured">
            <ul className="space-y-2.5">
              {[
                { label: "Mapping & geocoding", icon: Map },
                { label: "Speech-to-text service", icon: Sparkles },
                { label: "AI triage model", icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-line bg-slate-50/40 px-2.5 py-2"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                      <Icon size={12} className="text-slate-400" />
                      {item.label}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Soon
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              This UI prototype has no backend, API keys or real integrations. All behavior is
              simulated locally.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
