export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  const date = new Date(`${iso}T09:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric", year: "numeric" });
}

export function timeAgo(iso: string) {
  const date = new Date(`${iso}T09:00:00`).getTime();
  const today = new Date("2026-11-25T09:00:00").getTime();
  const days = Math.max(0, Math.round((today - date) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export function daysBetween(from: string, to: string) {
  const a = new Date(`${from}T09:00:00`).getTime();
  const b = new Date(`${to}T09:00:00`).getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Adds days to an ISO date (YYYY-MM-DD) and returns the same format. */
export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T09:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function mockId(prefix = "CF-2026-") {
  return `${prefix}${Math.floor(150 + Math.random() * 800)}`;
}
