export type CategoryId =
  | "roads"
  | "waste"
  | "garbage"
  | "water"
  | "drainage"
  | "electricity"
  | "streetlights"
  | "infrastructure"
  | "environment"
  | "health"
  | "safety"
  | "gov_services"
  | "corruption"
  | "education"
  | "other";

export type StatusId = "submitted" | "review" | "progress" | "resolved";

export type PriorityId = "low" | "medium" | "high" | "critical";

export interface PriorityFactors {
  severity: number;
  impact: number;
  recurrence: number;
  urgency: number;
}

export interface TimelineEvent {
  status: StatusId;
  label: string;
  date: string;
  note: string;
  done: boolean;
  current: boolean;
}

export interface Reporter {
  name: string;
  anonymous: boolean;
  phone: string;
  email?: string;
  reports: number;
  trust: number;
}

export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  date: string;
  text: string;
  badge?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  aiSummary: string;
  category: CategoryId;
  status: StatusId;
  priority: PriorityId;
  score: number;
  factors: PriorityFactors;
  city?: string;
  location: string;
  area: string;
  date: string;
  updated: string;
  photo?: string;
  video?: string;
  audio?: string;
  reporter: Reporter;
  coordinates: { x: number; y: number };
  upvotes: number;
  why: string[];
  timeline: TimelineEvent[];
  resolutionNote?: string;
  comments?: Comment[];
  aiEdited?: boolean;
  aiEditedAt?: string;
  escalatedTo?: string;
  escalationSla?: string;
  escalationNote?: string;
}
