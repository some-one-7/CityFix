export const CITY_NAME = "Riverton";

export const OVERVIEW_STATS = {
  total: 1248,
  pending: 86,
  progress: 214,
  resolved: 948,
  highPriority: 112,
  trends: {
    total: 12.4,
    pending: -8.2,
    progress: 6.1,
    resolved: 18.7,
    highPriority: 4.3,
  },
};

export const REPORTS_TREND = [
  { label: "Jun", reports: 186, resolved: 128 },
  { label: "Jul", reports: 214, resolved: 151 },
  { label: "Aug", reports: 241, resolved: 180 },
  { label: "Sep", reports: 268, resolved: 201 },
  { label: "Oct", reports: 296, resolved: 232 },
  { label: "Nov", reports: 318, resolved: 247 },
];

export const WEEKLY_TREND = [
  { label: "Mon", reports: 38, resolved: 26 },
  { label: "Tue", reports: 44, resolved: 31 },
  { label: "Wed", reports: 41, resolved: 29 },
  { label: "Thu", reports: 52, resolved: 34 },
  { label: "Fri", reports: 61, resolved: 42 },
  { label: "Sat", reports: 47, resolved: 36 },
  { label: "Sun", reports: 35, resolved: 24 },
];

export const CATEGORY_BREAKDOWN = [
  { label: "Roads & Potholes", value: 86, color: "#4F46E5" },
  { label: "Garbage & Sanitation", value: 74, color: "#14B8A6" },
  { label: "Water Supply", value: 52, color: "#0EA5E9" },
  { label: "Streetlights", value: 46, color: "#F59E0B" },
  { label: "Public Infrastructure", value: 38, color: "#8B5CF6" },
  { label: "Other Issues", value: 22, color: "#94A3B8" },
];

export const PRIORITY_BREAKDOWN = [
  { label: "Critical", value: 24, color: "#DC2626" },
  { label: "High", value: 68, color: "#F97316" },
  { label: "Medium", value: 142, color: "#F59E0B" },
  { label: "Low", value: 84, color: "#94A3B8" },
];

export const AREA_HOTSPOTS = [
  { area: "Maple Market", ward: "Ward 2", reports: 48, resolved: 31 },
  { area: "School Road", ward: "Ward 4", reports: 41, resolved: 24 },
  { area: "Riverside", ward: "Ward 3", reports: 34, resolved: 27 },
  { area: "Sector 7", ward: "Ward 1", reports: 29, resolved: 21 },
  { area: "Ring Road", ward: "Ward 8", reports: 26, resolved: 12 },
  { area: "Greenwood", ward: "Ward 7", reports: 21, resolved: 14 },
];

export const RESOLUTION_PERFORMANCE = {
  avgDays: 4.2,
  onTimeRate: 86,
  reopened: 3.1,
  satisfaction: 4.6,
  weekly: [
    { label: "W1", value: 74 },
    { label: "W2", value: 81 },
    { label: "W3", value: 79 },
    { label: "W4", value: 88 },
  ],
};

export const VERIFICATION_QUEUE = [
  {
    id: "CF-2026-0150",
    title: "Exposed live wire near children's playground",
    location: "Central Park, Ward 3",
    submitted: "2 h ago",
    confidence: 96,
    confirmations: 7,
    flag: "Immediate hazard",
  },
  {
    id: "CF-2026-0148",
    title: "Deep pothole outside St. Xavier's School gate",
    location: "School Road, Ward 4",
    submitted: "1 d ago",
    confidence: 92,
    confirmations: 34,
    flag: "High recurrence",
  },
  {
    id: "CF-2026-0149",
    title: "Overflowing garbage bins at Maple Market",
    location: "Maple Market, Ward 2",
    submitted: "2 d ago",
    confidence: 88,
    confirmations: 27,
    flag: "Sanitation risk",
  },
  {
    id: "CF-2026-0143",
    title: "Illegal dumping behind Greenwood Apartments",
    location: "Greenwood Apartments, Ward 7",
    submitted: "Today",
    confidence: 74,
    confirmations: 22,
    flag: "Needs field check",
  },
  {
    id: "CF-2026-0146",
    title: "Broken streetlight on Rosewood Lane",
    location: "Rosewood Lane, Ward 6",
    submitted: "1 d ago",
    confidence: 69,
    confirmations: 8,
    flag: "Low confidence",
  },
];
