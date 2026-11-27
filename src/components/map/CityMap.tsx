import { MapPin } from "lucide-react";
import { categoryMeta, priorityMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Complaint } from "@/types";

interface CityMapProps {
  complaints: Complaint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onMapClick?: (coords: { x: number; y: number }) => void;
  pin?: { x: number; y: number } | null;
  density?: boolean;
  showLegend?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const BLOCKS = [
  { x: 28, y: 26, w: 92, h: 62 },
  { x: 150, y: 18, w: 172, h: 70 },
  { x: 362, y: 24, w: 140, h: 66 },
  { x: 540, y: 26, w: 86, h: 60 },
  { x: 670, y: 18, w: 104, h: 70 },
  { x: 30, y: 136, w: 80, h: 82 },
  { x: 168, y: 132, w: 148, h: 86 },
  { x: 388, y: 132, w: 122, h: 80 },
  { x: 552, y: 122, w: 82, h: 96 },
  { x: 668, y: 132, w: 106, h: 84 },
  { x: 28, y: 266, w: 96, h: 58 },
  { x: 166, y: 256, w: 142, h: 62 },
  { x: 396, y: 258, w: 52, h: 48 },
  { x: 700, y: 262, w: 76, h: 62 },
  { x: 30, y: 368, w: 82, h: 96 },
  { x: 152, y: 356, w: 116, h: 56 },
  { x: 560, y: 360, w: 96, h: 78 },
  { x: 690, y: 372, w: 84, h: 66 },
];

function Road({ d, vertical }: { d: string; vertical?: boolean }) {
  return (
    <g>
      <path d={d} stroke="#DCE1EC" strokeWidth="17" fill="none" strokeLinecap="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path
        d={d}
        stroke="#E9EDF5"
        strokeWidth="1.1"
        fill="none"
        strokeDasharray="7 9"
        strokeLinecap="round"
      />
    </g>
  );
}

export function CityMap({
  complaints,
  selectedId,
  onSelect,
  onMapClick,
  pin,
  density = false,
  showLegend = true,
  className,
  children,
}: CityMapProps) {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onMapClick({ x: Math.min(94, Math.max(6, x)), y: Math.min(92, Math.max(8, y)) });
  };

  return (
    <div
      className={cn(
        "relative select-none overflow-hidden rounded-2xl border border-line bg-[#EDF0F6]",
        onMapClick && "cursor-crosshair",
        className
      )}
      onClick={handleClick}
    >
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <rect width="800" height="500" fill="#EDF0F6" />

        {/* Park + water */}
        <rect x="388" y="352" width="158" height="108" rx="14" fill="#D9ECDF" />
        <rect x="562" y="330" width="70" height="130" rx="12" fill="#E3EFE7" />
        <path
          d="M-20 432 C 90 410, 190 470, 300 470 C 380 470, 430 500, 470 520 L -20 520 Z"
          fill="#D8E8F6"
        />
        <path
          d="M-20 432 C 90 410, 190 470, 300 470 C 380 470, 430 500, 470 520"
          stroke="#C6DDEF"
          strokeWidth="2"
          fill="none"
        />

        {/* City blocks */}
        {BLOCKS.map((block, index) => (
          <rect
            key={index}
            x={block.x}
            y={block.y}
            width={block.w}
            height={block.h}
            rx="4"
            fill={index % 4 === 0 ? "#E4E8F1" : "#E7EAF3"}
            stroke="#DCE2ED"
            strokeWidth="0.8"
          />
        ))}

        {/* Roads */}
        <Road d="M 138 -10 L 138 510" vertical />
        <Road d="M 350 -10 L 350 510" vertical />
        <Road d="M 530 -10 L 530 510" vertical />
        <Road d="M 656 -10 L 656 510" vertical />
        <Road d="M -10 112 L 810 112" />
        <Road d="M -10 242 L 810 242" />
        <Road d="M -10 338 L 810 338" />
        <Road d="M -10 452 L 810 452" />
        <Road d="M -10 470 L 430 40 L 810 40" />
        <Road d="M 810 180 C 700 200, 610 300, 620 510" />

        {/* Labels */}
        <text x="148" y="82" fontSize="9" fill="#A6B0C2" transform="rotate(90 148 82)">
          Maple Avenue
        </text>
        <text x="360" y="200" fontSize="9" fill="#A6B0C2" transform="rotate(90 360 200)">
          School Road
        </text>
        <text x="540" y="300" fontSize="9" fill="#A6B0C2" transform="rotate(90 540 300)">
          Ring Road
        </text>
        <text x="44" y="236" fontSize="9" fill="#A6B0C2">
          Market Street
        </text>
        <text x="404" y="410" fontSize="9.5" fontWeight="600" fill="#7FAE8D">
          Central Park
        </text>
        <text x="66" y="470" fontSize="9" fontWeight="600" fill="#8FB6D3">
          Riverton Canal
        </text>
        <text x="690" y="206" fontSize="9" fill="#A6B0C2">
          Ward 7
        </text>
      </svg>

      {/* Density glows */}
      {density
        ? complaints.map((complaint) => {
            const meta = priorityMeta(complaint.priority);
            return (
              <span
                key={`density-${complaint.id}`}
                className={cn(
                  "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-2xl",
                  meta.marker
                )}
                style={{
                  left: `${complaint.coordinates.x}%`,
                  top: `${complaint.coordinates.y}%`,
                  width: complaint.priority === "critical" ? 150 : 110,
                  height: complaint.priority === "critical" ? 150 : 110,
                }}
              />
            );
          })
        : null}

      {/* Markers */}
      {complaints.map((complaint) => {
        const category = categoryMeta(complaint.category);
        const meta = priorityMeta(complaint.priority);
        const Icon = category.icon;
        const active = selectedId === complaint.id;
        return (
          <button
            key={complaint.id}
            onClick={(event) => {
              event.stopPropagation();
              onSelect?.(complaint.id);
            }}
            className={cn(
              "group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition duration-200",
              "focus-ring",
              active ? "z-20 scale-110" : "hover:scale-110"
            )}
            style={{ left: `${complaint.coordinates.x}%`, top: `${complaint.coordinates.y}%` }}
            aria-label={`${complaint.title}, ${meta.label} priority`}
            title={complaint.title}
          >
            {complaint.priority === "critical" && !active ? (
              <span className="absolute inset-0 rounded-full bg-red-400/50 animate-pulse-ring" />
            ) : null}
            <span
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white shadow-md transition",
                active ? "border-brand-600 ring-4 ring-brand-200/70" : "border-white"
              )}
            >
              <span
                className={cn(
                  "flex h-5.5 w-5.5 items-center justify-center rounded-full p-1",
                  meta.marker,
                  "text-white"
                )}
                style={{ height: 22, width: 22 }}
              >
                <Icon size={12} strokeWidth={2.4} />
              </span>
            </span>
          </button>
        );
      })}

      {/* Selected pin for reporting */}
      {pin ? (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full animate-fade-up"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm bg-brand-600" />
          <span className="relative flex items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg">
            <MapPin size={12} />
            Issue location
          </span>
        </div>
      ) : null}

      {children}

      {showLegend ? (
        <div className="absolute bottom-3 left-3 z-10 rounded-xl border border-line bg-white/95 px-3 py-2 shadow-card backdrop-blur">
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Priority
          </p>
          <div className="flex items-center gap-2.5">
            {(["low", "medium", "high", "critical"] as const).map((id) => {
              const meta = priorityMeta(id);
              return (
                <span key={id} className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                  <span className={cn("h-1.5 w-1.5 rounded-full", meta.marker)} />
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <span className="absolute top-3 right-3 z-10 rounded-md bg-white/85 px-2 py-0.5 text-[9px] font-medium text-slate-400 shadow-sm backdrop-blur">
        Illustrative map · demo data
      </span>
    </div>
  );
}
