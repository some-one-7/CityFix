import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ADMIN_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/complaints", label: "All Complaints", icon: ClipboardList, badge: "14" },
  { to: "/admin/map", label: "Live Map", icon: Map },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/verification", label: "Community Verification", icon: ShieldCheck, badge: "5" },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const TITLES: { match: string; title: string; subtitle: string }[] = [
  { match: "/admin/complaints/", title: "Complaint detail", subtitle: "Full report, evidence and resolution actions" },
  { match: "/admin/complaints", title: "All complaints", subtitle: "Search, triage and manage every civic report" },
  { match: "/admin/map", title: "Live issue map", subtitle: "City-wide distribution and priority density" },
  { match: "/admin/analytics", title: "Analytics", subtitle: "Performance, hotspots and resolution health" },
  { match: "/admin/verification", title: "Community verification", subtitle: "Validate crowdsourced reports before dispatch" },
  { match: "/admin/settings", title: "Settings", subtitle: "Workspace, routing rules and notifications" },
  { match: "/admin", title: "City overview", subtitle: "Riverton · live civic operations summary" },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const crumb =
    TITLES.filter((item) => location.pathname.startsWith(item.match)).slice(-1)[0] ?? TITLES[TITLES.length - 1];

  return (
    <div className="min-h-screen bg-canvas">
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col bg-[#0B1220] transition-transform duration-300 lg:translate-x-0",
          collapsed ? "lg:w-[80px]" : "lg:w-[268px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-white/5 px-5",
            collapsed ? "lg:justify-center lg:px-0" : "justify-between"
          )}
        >
          <div className={cn(collapsed && "lg:hidden")}>
            <Logo variant="light" to="/admin" size="sm" />
          </div>
          {collapsed ? (
            <span className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Map size={18} />
            </span>
          ) : null}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
          <p
            className={cn(
              "mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500",
              collapsed && "lg:text-center lg:px-0"
            )}
          >
            {collapsed ? "•••" : "Operations"}
          </p>
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition",
                    collapsed && "lg:justify-center lg:px-0",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} strokeWidth={isActive ? 2.3 : 2} className="shrink-0" />
                    <span className={cn("flex-1 truncate", collapsed && "lg:hidden")}>
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                          collapsed && "lg:hidden",
                          isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className={cn("mt-5 rounded-xl border border-white/5 bg-white/[0.03] p-3", collapsed && "lg:hidden")}>
            <p className="text-[11px] font-semibold text-white">Prototype mode</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-slate-400">
              Status changes, search and filters are simulated locally in this demo.
            </p>
          </div>
        </nav>

        <div className="border-t border-white/5 p-3">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-1.5 py-1.5",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[11px] font-bold text-brand-200 ring-1 ring-inset ring-white/10">
              MS
            </span>
            <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
              <p className="truncate text-[12px] font-semibold text-white">{ADMIN_NAME}</p>
              <p className="truncate text-[10px] text-slate-500">City operations lead</p>
            </div>
            <button
              className={cn(
                "rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white",
                collapsed && "lg:hidden"
              )}
              aria-label="Account options"
              title="Demo account"
            >
              <Settings size={15} />
            </button>
          </div>
          <button
            onClick={() => setCollapsed((value) => !value)}
            className="mt-2 hidden w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium text-slate-500 transition hover:bg-white/5 hover:text-slate-300 lg:flex"
          >
            {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
            <span className={cn(collapsed && "hidden")}>Collapse sidebar</span>
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[80px]" : "lg:pl-[268px]"
        )}
      >
        <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-line p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={17} />
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-display text-[15px] font-bold text-slate-900 sm:text-base">
                  {crumb.title}
                </h1>
                <p className="hidden truncate text-[11px] text-slate-400 sm:block">{crumb.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 md:inline-flex">
                Demo data
              </span>
              <button
                className="relative rounded-lg border border-line bg-white p-2 text-slate-500 transition hover:text-slate-800"
                aria-label="Notifications"
                title="3 new notifications (demo)"
              >
                <Bell size={16} />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                <ExternalLink size={13} />
                <span className="hidden sm:inline">Citizen app</span>
              </Link>
              <span className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700 ring-1 ring-inset ring-brand-100">
                MS
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-[1360px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
