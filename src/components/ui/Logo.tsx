import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  to?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  compact?: boolean;
}

export function LogoMark({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = size === "sm" ? 32 : size === "lg" ? 44 : 38;

  return (
    <div
      className={cn("relative inline-flex flex-shrink-0 select-none overflow-hidden rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105", className)}
      style={{ width: dim, height: dim }}
    >
      <img
        src="/nagarmitra-icon.png"
        alt="NagarMitra Logo"
        className="h-full w-full object-cover"
        loading="eager"
      />
    </div>
  );
}

export function Logo({ to = "/", variant = "dark", size = "md", compact }: LogoProps) {
  const content = (
    <span className="group flex items-center gap-2.5">
      <LogoMark size={size} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display tracking-tight transition-colors",
              size === "sm" ? "text-[16px]" : size === "lg" ? "text-[21px]" : "text-[18px]",
              variant === "dark" ? "text-slate-900 group-hover:text-brand-600" : "text-white"
            )}
          >
            <span className={cn("font-black", variant === "dark" ? "text-[#261E58]" : "text-white")}>
              Nagar
            </span>
            <span className="font-black text-[#F97316]">
              Mitra
            </span>
          </span>
          <span
            className={cn(
              "mt-0.5 text-[7.5px] font-bold uppercase tracking-[0.16em] hidden xs:block",
              variant === "dark" ? "text-slate-400" : "text-brand-200/80"
            )}
          >
            Civic Intelligence
          </span>
        </span>
      )}
    </span>
  );

  return (
    <Link to={to} className="focus-ring inline-flex rounded-xl" aria-label="NagarMitra home">
      {content}
    </Link>
  );
}
