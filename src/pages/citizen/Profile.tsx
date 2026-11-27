import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Trophy,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/store/ToastContext";
import { useComplaints } from "@/store/ComplaintsContext";
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
        <p className="text-[12.5px] font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{description}</p>
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

export default function Profile() {
  const { toast } = useToast();
  const { complaints } = useComplaints();
  const [updates, setUpdates] = useState(true);
  const [nearby, setNearby] = useState(true);
  const [anonymous, setAnonymous] = useState(false);

  const myReports = complaints.filter((c) => c.reporter.name === "Ananya Rao").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const upvotes = complaints.reduce((sum, c) => sum + c.upvotes, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="surface overflow-hidden">
        <div className="relative bg-brand-700 px-5 pb-12 pt-6">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[32px] border-white/[0.06]" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-200">
            Citizen profile
          </p>
          <h1 className="mt-1 text-xl font-extrabold text-white">Ananya Rao</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-brand-100">
            <MapPin size={12} /> Ward 4 · Riverton
          </p>
        </div>
        <div className="relative px-5 pb-5">
          <div className="-mt-8 flex items-end justify-between gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-brand-700 shadow-lift ring-4 ring-white">
              AR
            </div>
            <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-accent-100 bg-accent-50 px-2.5 py-1 text-[10px] font-bold text-accent-700">
              <ShieldCheck size={11} /> Verified citizen
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-slate-50/50">
            {[
              { label: "Reports", value: myReports + 4, icon: User },
              { label: "City upvotes", value: upvotes, icon: ThumbsUp },
              { label: "Resolved", value: resolved, icon: Trophy },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5 py-3">
                <span className="font-display text-lg font-extrabold text-slate-900">
                  {stat.value}
                </span>
                <span className="text-[10px] font-medium text-slate-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="surface p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-lg bg-brand-50 p-1.5 text-brand-600">
              <Bell size={14} />
            </span>
            <h2 className="text-[13.5px] font-bold">Notifications</h2>
          </div>
          <div className="divide-y divide-line">
            <Toggle
              checked={updates}
              onChange={setUpdates}
              label="Status updates"
              description="Get notified when one of your reports changes status."
            />
            <Toggle
              checked={nearby}
              onChange={setNearby}
              label="Nearby issues"
              description="Weekly digest of issues reported around Ward 4."
            />
            <Toggle
              checked={anonymous}
              onChange={setAnonymous}
              label="Report anonymously"
              description="Hide your name from public complaint views by default."
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full"
            onClick={() =>
              toast({
                title: "Preferences saved",
                description: "Demo settings stored locally for this session.",
                variant: "success",
              })
            }
          >
            Save preferences
          </Button>
        </div>

        <div className="space-y-3">
          <div className="surface p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-accent-50 p-1.5 text-accent-600">
                <Sparkles size={14} />
              </span>
              <h2 className="text-[13.5px] font-bold">Your civic impact</h2>
            </div>
            <ul className="space-y-2.5">
              {[
                "3 of your reports were resolved this month",
                "Your pothole report was confirmed 34 times",
                "You're in the top 10% of Ward 4 reporters",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-slate-600">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/admin"
            className="group surface surface-hover flex items-center gap-3 p-4"
          >
            <span className="rounded-xl bg-slate-900 p-2.5 text-white">
              <LayoutDashboard size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold text-slate-900">Admin demo</p>
              <p className="text-[10.5px] text-slate-500">
                Open the municipal operations dashboard.
              </p>
            </div>
            <ChevronRight
              size={16}
              className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
            />
          </Link>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
            <p className="text-[11px] font-semibold text-amber-800">Phase 1 prototype</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-amber-700/80">
              Accounts, notifications and verification are simulated. No personal data leaves
              this browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
