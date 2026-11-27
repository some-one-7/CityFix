import type {
  CategoryId,
  Complaint,
  PriorityFactors,
  PriorityId,
  StatusId,
  TimelineEvent,
} from "@/types";
import { addDays } from "@/lib/utils";

const STATUS_ORDER: StatusId[] = ["submitted", "review", "progress", "resolved"];

const STEP_META: Record<StatusId, { label: string; note: string }> = {
  submitted: {
    label: "Report received",
    note: "Complaint logged and acknowledgement sent to the reporter.",
  },
  review: {
    label: "Under review",
    note: "Ward officer validating details and assigning a field team.",
  },
  progress: {
    label: "Work in progress",
    note: "Field crew dispatched. Repair work is underway at the location.",
  },
  resolved: {
    label: "Resolved",
    note: "Work verified on site and the complaint has been closed.",
  },
};

export function scoreFromFactors(factors: PriorityFactors) {
  return Math.round(
    factors.severity * 0.35 +
      factors.impact * 0.25 +
      factors.recurrence * 0.2 +
      factors.urgency * 0.2
  );
}

export function priorityFromScore(score: number): PriorityId {
  if (score >= 80) return "critical";
  if (score >= 65) return "high";
  if (score >= 45) return "medium";
  return "low";
}

export function buildTimeline(
  date: string,
  status: StatusId,
  resolutionNote?: string
): TimelineEvent[] {
  const index = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER.map((step, i) => ({
    status: step,
    label: STEP_META[step].label,
    date: addDays(date, [0, 1, 3, 6][i]),
    note:
      step === "resolved" && resolutionNote
        ? resolutionNote
        : STEP_META[step].note,
    done: i <= index,
    current: i === index,
  }));
}

type RawComplaint = Omit<
  Complaint,
  "priority" | "score" | "timeline" | "updated" | "status"
> & {
  status: StatusId;
  resolutionNote?: string;
  updated?: string;
};

const RAW: RawComplaint[] = [
  {
    id: "CF-2026-0148",
    title: "Deep pothole outside St. Xavier's School gate",
    description:
      "A deep pothole has formed right outside the school gate, spanning almost half the lane. Bikers swerve into oncoming traffic to avoid it, and it fills with water after rain so the depth is impossible to judge. Two scooters have already fallen here this week.",
    aiSummary:
      "Large, water-filled pothole beside a school entrance forcing two-wheelers into oncoming traffic. High accident risk during school drop-off hours.",
    category: "roads",
    status: "progress",
    factors: { severity: 88, impact: 82, recurrence: 70, urgency: 90 },
    location: "School Road, Ward 4",
    area: "School Road",
    date: "2026-11-22",
    photo: "/evidence/pothole.jpg",
    reporter: {
      name: "Ananya Rao",
      anonymous: false,
      phone: "+91 98•• ••41 20",
      reports: 6,
      trust: 92,
    },
    coordinates: { x: 27, y: 38 },
    upvotes: 34,
    why: [
      "Located in a 200 m school zone with 400+ daily pedestrians",
      "Third pothole report on this stretch in the last 30 days",
      "Reported by residents with verified location evidence",
    ],
  },
  {
    id: "CF-2026-0149",
    title: "Overflowing garbage bins at Maple Market",
    description:
      "The two community bins behind the vegetable stalls have not been emptied for four days. Waste is spilling onto the walking path, and stray animals are tearing open bags. The smell is strong by midday and flies are a problem for vendors.",
    aiSummary:
      "Uncollected market waste spreading onto a pedestrian path, creating a sanitation and public-health risk near food stalls.",
    category: "garbage",
    status: "review",
    factors: { severity: 74, impact: 86, recurrence: 78, urgency: 70 },
    location: "Maple Market, Ward 2",
    area: "Maple Market",
    date: "2026-11-23",
    photo: "/evidence/garbage.jpg",
    reporter: {
      name: "Rahul Verma",
      anonymous: false,
      phone: "+91 90•• ••18 77",
      reports: 3,
      trust: 78,
    },
    coordinates: { x: 63, y: 30 },
    upvotes: 27,
    why: [
      "Serves a market used by an estimated 1,200 residents daily",
      "Same location reported twice in the previous fortnight",
      "Food stalls nearby increase contamination risk",
    ],
  },
  {
    id: "CF-2026-0150",
    title: "Exposed live wire near children's playground",
    description:
      "A junction box beside the playground has its cover missing and exposed wiring is visible at knee height. Children play right next to it in the evenings. We have placed a makeshift barrier but it keeps getting moved.",
    aiSummary:
      "Open electrical junction box with exposed wiring next to a children's play area, presenting an immediate electrocution hazard.",
    category: "infrastructure",
    status: "submitted",
    factors: { severity: 92, impact: 88, recurrence: 80, urgency: 96 },
    location: "Central Park, Ward 3",
    area: "Central Park",
    date: "2026-11-25",
    photo: "/evidence/streetlight.jpg",
    reporter: {
      name: "Priya Nair",
      anonymous: true,
      phone: "Hidden",
      reports: 1,
      trust: 64,
    },
    coordinates: { x: 35, y: 51 },
    upvotes: 12,
    why: [
      "Direct safety hazard for children in an active play area",
      "Potential for serious injury — flagged for same-day triage",
      "Location is publicly accessible without supervision",
    ],
  },
  {
    id: "CF-2026-0147",
    title: "Water pipeline leaking beside Central Park",
    description:
      "Water has been flowing from a cracked pipeline onto the footpath continuously since Sunday. The path is slippery and algae is forming. A steady stream is running into the storm drain, wasting a large amount of water every day.",
    aiSummary:
      "Continuous pipeline leak beside a public park causing a slip hazard and significant daily water loss.",
    category: "water",
    status: "progress",
    factors: { severity: 68, impact: 72, recurrence: 60, urgency: 66 },
    location: "Central Park, Ward 3",
    area: "Central Park",
    date: "2026-11-20",
    photo: "/evidence/water.jpg",
    reporter: {
      name: "Imran Sheikh",
      anonymous: false,
      phone: "+91 99•• ••72 03",
      reports: 4,
      trust: 85,
    },
    coordinates: { x: 45, y: 67 },
    upvotes: 19,
    why: [
      "Ongoing water loss in a supply-stressed ward",
      "Wet footpath used by elderly residents every morning",
      "Leak is worsening — reported flow increased since first notice",
    ],
  },
  {
    id: "CF-2026-0146",
    title: "Broken streetlight on Rosewood Lane",
    description:
      "The streetlight outside house numbers 14–22 has been dark for over a week. The lane is very dark after 7 pm and residents are avoiding walking alone. The pole also makes a buzzing sound when it flickers on briefly.",
    aiSummary:
      "Non-functional streetlight leaving a residential lane unlit at night, with a reported buzzing fault in the fixture.",
    category: "streetlights",
    status: "submitted",
    factors: { severity: 55, impact: 62, recurrence: 45, urgency: 62 },
    location: "Rosewood Lane, Ward 6",
    area: "Rosewood Lane",
    date: "2026-11-24",
    photo: "/evidence/streetlight.jpg",
    reporter: {
      name: "Devika Menon",
      anonymous: false,
      phone: "+91 96•• ••55 91",
      reports: 2,
      trust: 71,
    },
    coordinates: { x: 75, y: 62 },
    upvotes: 8,
    why: [
      "Residential lane with no alternative lighting",
      "Flickering fixture may indicate an electrical fault",
      "Reported by two separate households",
    ],
  },
  {
    id: "CF-2026-0145",
    title: "Pothole cluster on Ring Road service lane",
    description:
      "A series of at least six potholes stretches across the service lane near the Ring Road junction. The surface has broken up over the last month, and auto-rickshaw drivers are driving on the wrong side of the divider to avoid the worst patches.",
    aiSummary:
      "Cluster of six potholes degrading a busy service lane, causing vehicles to cross the divider to avoid damage.",
    category: "roads",
    status: "progress",
    factors: { severity: 66, impact: 70, recurrence: 80, urgency: 60 },
    location: "Ring Road, Ward 8",
    area: "Ring Road",
    date: "2026-11-18",
    photo: "/evidence/pothole.jpg",
    reporter: {
      name: "Sunil Patil",
      anonymous: false,
      phone: "+91 98•• ••31 14",
      reports: 9,
      trust: 88,
    },
    coordinates: { x: 86, y: 74 },
    upvotes: 41,
    why: [
      "Affects a high-volume arterial service lane",
      "Repeated patching has failed at this location",
      "Unsafe vehicle movement around the median reported",
    ],
  },
  {
    id: "CF-2026-0144",
    title: "Flickering streetlights along Riverside Walk",
    description:
      "Three consecutive streetlights along the riverside promenade flicker constantly and switch off for long stretches. The walking track is popular with joggers in the early morning, and the uneven paving is hard to see in the dark.",
    aiSummary:
      "Multiple faulty streetlights on a riverside walking track, leaving uneven paving unlit during early-morning use.",
    category: "streetlights",
    status: "progress",
    factors: { severity: 44, impact: 58, recurrence: 52, urgency: 48 },
    location: "Riverside Walk, Ward 3",
    area: "Riverside",
    date: "2026-11-21",
    photo: "/evidence/streetlight.jpg",
    reporter: {
      name: "Kabir Joshi",
      anonymous: false,
      phone: "+91 97•• ••09 66",
      reports: 5,
      trust: 80,
    },
    coordinates: { x: 39, y: 82 },
    upvotes: 15,
    why: [
      "Public walking route used before sunrise",
      "Three fixtures affected along one stretch",
      "Moderate injury risk from uneven surface",
    ],
  },
  {
    id: "CF-2026-0143",
    title: "Illegal dumping behind Greenwood Apartments",
    description:
      "Construction debris and household waste are being dumped on the vacant plot behind Block C. The pile is growing every night and now blocks a service access path. Residents suspect waste from outside the ward is being brought here.",
    aiSummary:
      "Growing pile of construction and household waste on a vacant plot, blocking service access and indicating unauthorised dumping.",
    category: "garbage",
    status: "submitted",
    factors: { severity: 62, impact: 70, recurrence: 74, urgency: 55 },
    location: "Greenwood Apartments, Ward 7",
    area: "Greenwood",
    date: "2026-11-25",
    photo: "/evidence/garbage.jpg",
    reporter: {
      name: "Sneha Kulkarni",
      anonymous: false,
      phone: "+91 91•• ••82 37",
      reports: 3,
      trust: 75,
    },
    coordinates: { x: 83, y: 44 },
    upvotes: 22,
    why: [
      "Repeat dumping site flagged twice last month",
      "Blocks emergency vehicle access to Block C",
      "Waste volume increasing nightly",
    ],
  },
  {
    id: "CF-2026-0142",
    title: "Large pothole near the local market entrance",
    description:
      "There is a large pothole near the main road outside the local market. It has been there for several days and is dangerous for bikers, especially at night when it is hidden by shadows. Water collects in it and splashes pedestrians when vehicles pass.",
    aiSummary:
      "Large pothole reported near the local market, creating a safety risk for commuters.",
    category: "roads",
    status: "review",
    factors: { severity: 72, impact: 78, recurrence: 66, urgency: 70 },
    location: "Maple Market, Ward 2",
    area: "Maple Market",
    date: "2026-11-19",
    photo: "/evidence/pothole.jpg",
    reporter: {
      name: "Farhan Ali",
      anonymous: false,
      phone: "+91 95•• ••44 08",
      reports: 2,
      trust: 69,
    },
    coordinates: { x: 67, y: 24 },
    upvotes: 18,
    why: [
      "Market entrance used by heavy two-wheeler traffic",
      "Steady stream of complaints from nearby vendors",
      "Low visibility at night increases collision risk",
    ],
  },
  {
    id: "CF-2026-0141",
    title: "Garbage not collected in Ward 2 for five days",
    description:
      "Door-to-door collection has been skipped in our lane since Thursday. Households are storing waste indoors and some have started leaving bags at the corner. Please restore the collection schedule and clear the backlog.",
    aiSummary:
      "Missed household waste collection for five days across several lanes, forcing residents to store waste indoors.",
    category: "garbage",
    status: "resolved",
    factors: { severity: 58, impact: 76, recurrence: 72, urgency: 62 },
    location: "Ward 2 Collection Zone",
    area: "Maple Market",
    date: "2026-11-16",
    photo: "/evidence/garbage.jpg",
    reporter: {
      name: "Lakshmi Iyer",
      anonymous: false,
      phone: "+91 94•• ••20 55",
      reports: 11,
      trust: 95,
    },
    coordinates: { x: 22, y: 70 },
    upvotes: 56,
    why: [
      "Entire collection zone affected, not a single household",
      "Five-day backlog creating a sanitation risk",
      "High community confirmation from neighbours",
    ],
    resolutionNote:
      "Backlog cleared and the regular 7 am route restored. Collection vehicle tracking re-enabled for this zone.",
  },
  {
    id: "CF-2026-0140",
    title: "Damaged footpath near City Bus Stop",
    description:
      "The paving slabs on the footpath outside the bus stop are broken and uneven. A gap of about a foot has opened near the shelter, and an elderly commuter tripped here last week. Wheelchair users cannot pass without moving onto the road.",
    aiSummary:
      "Broken paving and an open gap on a footpath at a busy bus stop, causing a trip hazard and blocking wheelchair access.",
    category: "infrastructure",
    status: "resolved",
    factors: { severity: 52, impact: 66, recurrence: 40, urgency: 50 },
    location: "City Bus Stop, Ward 5",
    area: "City Bus Stop",
    date: "2026-11-14",
    photo: "/evidence/pothole.jpg",
    reporter: {
      name: "Mohit Saxena",
      anonymous: false,
      phone: "+91 92•• ••67 31",
      reports: 7,
      trust: 90,
    },
    coordinates: { x: 18, y: 58 },
    upvotes: 31,
    why: [
      "Blocks accessible passage for wheelchair users",
      "One injury already reported at this spot",
      "High footfall transit location",
    ],
    resolutionNote:
      "Damaged slabs replaced and the gap filled with levelled concrete. Access ramp checked and cleared for wheelchair use.",
  },
  {
    id: "CF-2026-0136",
    title: "Storm drain overflow flooding Market Street",
    description:
      "After every heavy spell of rain, the storm drain at the Market Street corner backs up and floods the junction. Shops have started using sandbags. The drain appears blocked with silt and plastic waste.",
    aiSummary:
      "Blocked storm drain causing repeat flooding of a commercial junction during rainfall, affecting shopfronts.",
    category: "water",
    status: "resolved",
    factors: { severity: 71, impact: 80, recurrence: 65, urgency: 58 },
    location: "Market Street, Ward 2",
    area: "Maple Market",
    date: "2026-11-10",
    photo: "/evidence/water.jpg",
    reporter: {
      name: "Aisha Khan",
      anonymous: false,
      phone: "+91 99•• ••05 72",
      reports: 8,
      trust: 91,
    },
    coordinates: { x: 55, y: 48 },
    upvotes: 47,
    why: [
      "Repeat flooding during every significant rainfall",
      "Direct commercial disruption to market shopfronts",
      "Blocked drain identified as the likely cause",
    ],
    resolutionNote:
      "Storm drain desilted and a damaged grate replaced. Follow-up inspection scheduled after the next rainfall.",
  },
  {
    id: "CF-2026-0130",
    title: "Low water pressure in Sector 7 households",
    description:
      "Water pressure has dropped sharply over the past two weeks. Taps on the second floor barely get a trickle between 7 and 9 am, and several families are buying tanker water. Supply returns to normal late at night.",
    aiSummary:
      "Sustained low water pressure across Sector 7 during morning peak hours, affecting upper-floor households.",
    category: "water",
    status: "resolved",
    factors: { severity: 48, impact: 74, recurrence: 58, urgency: 44 },
    location: "Sector 7, Ward 1",
    area: "Sector 7",
    date: "2026-11-08",
    photo: "/evidence/water.jpg",
    reporter: {
      name: "Ravi Deshmukh",
      anonymous: false,
      phone: "+91 98•• ••13 26",
      reports: 6,
      trust: 83,
    },
    coordinates: { x: 12, y: 26 },
    upvotes: 38,
    why: [
      "Multiple households reporting the same pressure drop",
      "Evening and morning supply below usable levels",
      "Repeated complaints from this sector over two weeks",
    ],
    resolutionNote:
      "Pressure regulator replaced at the Sector 7 valve point. Morning supply monitored for three days and confirmed normal.",
  },
  {
    id: "CF-2026-0127",
    title: "Broken bench and railing at Riverfront Park",
    description:
      "One of the benches near the eastern railing has collapsed and the railing has two loose posts. The park is used by families in the evening and the gap is close to the water edge, which feels unsafe for children.",
    aiSummary:
      "Collapsed park bench and loose railing posts near the water edge, creating a safety concern for visiting families.",
    category: "infrastructure",
    status: "resolved",
    factors: { severity: 30, impact: 40, recurrence: 35, urgency: 30 },
    location: "Riverfront Park, Ward 3",
    area: "Riverside",
    date: "2026-11-05",
    photo: "/evidence/pothole.jpg",
    reporter: {
      name: "Tara Bhatt",
      anonymous: true,
      phone: "Hidden",
      reports: 1,
      trust: 58,
    },
    coordinates: { x: 48, y: 78 },
    upvotes: 9,
    why: [
      "Railing gap is close to the water edge",
      "Low immediate usage during the week",
      "Cosmetic damage with no active hazard reported",
    ],
    resolutionNote:
      "Bench replaced and both loose railing posts re-anchored. A second inspection of the water-edge railing was completed.",
  },
  {
    id: "CF-2026-0155",
    title: "Open manhole and overflowing stormwater drain",
    description:
      "Heavy rainwater is causing sewage and drain water to spill onto the street outside the vegetable market. A concrete manhole cover has broken and is lying open, creating a severe accident hazard for pedestrians.",
    aiSummary:
      "Damaged manhole cover and sewage overflow spilling onto the market road, posing an acute sanitation and safety risk.",
    category: "drainage",
    status: "progress",
    factors: { severity: 88, impact: 82, recurrence: 65, urgency: 90 },
    location: "Market Cross Road, Ward 2",
    area: "Market Square",
    date: "2026-11-23",
    photo: "/evidence/water.jpg",
    reporter: {
      name: "Siddharth Verma",
      anonymous: false,
      phone: "+91 94•• ••18 90",
      reports: 4,
      trust: 88,
    },
    coordinates: { x: 38, y: 46 },
    upvotes: 27,
    why: [
      "Open manhole poses critical pedestrian safety risk",
      "High volume market area with pedestrian footfall",
      "Repeat blockage reported during monsoons",
    ],
  },
  {
    id: "CF-2026-0162",
    title: "Unfenced excavation pit left open near public walkway",
    description:
      "A 6-foot deep pit dug for cable laying has been left unfenced and without warning reflectors on a poorly lit bend. Two cyclists almost fell into it yesterday evening.",
    aiSummary:
      "Unbarricaded deep cable pit on pedestrian walkway with no warning signs or night reflectors.",
    category: "safety",
    status: "submitted",
    factors: { severity: 85, impact: 70, recurrence: 40, urgency: 88 },
    location: "Rosewood Lane, Ward 6",
    area: "Rosewood",
    date: "2026-11-25",
    photo: "/evidence/pothole.jpg",
    reporter: {
      name: "Meera Kulkarni",
      anonymous: false,
      phone: "+91 99•• ••33 12",
      reports: 2,
      trust: 80,
    },
    coordinates: { x: 62, y: 35 },
    upvotes: 19,
    why: [
      "Immediate physical injury risk at night",
      "Lack of barricades or warning reflectors",
    ],
  },
  {
    id: "CF-2026-0170",
    title: "Severe open waste burning along railway boundary",
    description:
      "Commercial packaging and plastic waste is being burned openly every night between 9 PM and 11 PM along the railway perimeter, causing thick toxic smoke to enter nearby apartments.",
    aiSummary:
      "Nightly open plastic and municipal waste burning causing severe smoke pollution across residential blocks.",
    category: "environment",
    status: "review",
    factors: { severity: 72, impact: 78, recurrence: 85, urgency: 68 },
    location: "Greenwood Apartments, Ward 7",
    area: "Greenwood",
    date: "2026-11-21",
    photo: "/evidence/garbage.jpg",
    reporter: {
      name: "Karan Johar",
      anonymous: true,
      phone: "Hidden",
      reports: 5,
      trust: 85,
    },
    coordinates: { x: 74, y: 60 },
    upvotes: 31,
    why: [
      "Toxic smoke affecting over 300 apartment residents",
      "Repeated violations documented over two weeks",
    ],
  },
  {
    id: "CF-2026-0178",
    title: "Non-functional toilet and water tap at Govt Primary School",
    description:
      "The student sanitation block at Ward 4 Govt School has had no running water for over five days due to a broken pipe inlet. Students and teachers have no working handwashing facility.",
    aiSummary:
      "Lack of water supply and non-functional sanitation block in municipal primary school affecting 200+ students.",
    category: "education",
    status: "submitted",
    factors: { severity: 82, impact: 80, recurrence: 55, urgency: 85 },
    location: "School Road, Ward 4",
    area: "Old Town",
    date: "2026-11-24",
    photo: "/evidence/water.jpg",
    reporter: {
      name: "Pooja Hegde",
      anonymous: false,
      phone: "+91 91•• ••55 40",
      reports: 3,
      trust: 90,
    },
    coordinates: { x: 26, y: 36 },
    upvotes: 34,
    why: [
      "Affects child hygiene and school attendance",
      "Acute water supply failure in institutional premises",
    ],
  },
  {
    id: "CF-2026-0201",
    title: "Severe waterlogging outside Metro Central Station",
    description:
      "Water level reached knee height outside the main terminal gate due to collapsed drain conduits. Commuters and city buses are stranded in peak morning hours.",
    aiSummary:
      "Critical stormwater inundation and transit blockage outside Metro Central Station affecting thousands of morning commuters.",
    category: "drainage",
    city: "Metro Heights",
    status: "progress",
    factors: { severity: 92, impact: 95, recurrence: 75, urgency: 94 },
    location: "Station Boulevard, Ward 1",
    area: "Central Terminal",
    date: "2026-11-25",
    photo: "/evidence/water.jpg",
    reporter: {
      name: "Aakash Mehta",
      anonymous: false,
      phone: "+91 98•• ••11 02",
      reports: 8,
      trust: 94,
    },
    coordinates: { x: 50, y: 45 },
    upvotes: 42,
    why: [
      "Transit node blockage during commute hours",
      "Knee-height street flood risk",
    ],
    comments: [
      {
        id: "comm-201-1",
        author: "Priya Nair",
        date: "2026-11-25",
        text: "Had to take an hour detour. Traffic police have diverted buses via 2nd Avenue.",
        badge: "Commuter",
      },
      {
        id: "comm-201-2",
        author: "Devendra S.",
        date: "2026-11-25",
        text: "Municipal pumps just started dewatering on the north side.",
        badge: "Ward 1 Resident",
      },
    ],
  },
  {
    id: "CF-2026-0202",
    title: "Broken streetlights along Bay Promenade Walkway",
    description:
      "Eight consecutive pole lights are non-functional for 200 meters along the coastal walking path, creating severe safety risks after dark.",
    aiSummary:
      "Unlit 200m coastal stretch along public promenade presenting severe nighttime pedestrian safety concern.",
    category: "electricity",
    city: "Bay City",
    status: "submitted",
    factors: { severity: 68, impact: 74, recurrence: 50, urgency: 70 },
    location: "Marine Promenade, Ward 2",
    area: "Seafront",
    date: "2026-11-26",
    photo: "/evidence/streetlight.jpg",
    reporter: {
      name: "Farhan Qureshi",
      anonymous: false,
      phone: "+91 97•• ••88 33",
      reports: 2,
      trust: 82,
    },
    coordinates: { x: 65, y: 70 },
    upvotes: 18,
    why: [
      "High evening pedestrian traffic",
      "Repeated coastal circuit tripping",
    ],
    comments: [
      {
        id: "comm-202-1",
        author: "Sneha Patel",
        date: "2026-11-26",
        text: "Very dark after 7 PM. Seniors and women avoid walking here now.",
        badge: "Verified Resident",
      },
    ],
  },
];

export const COMPLAINTS: Complaint[] = RAW.map((raw) => {
  const score = scoreFromFactors(raw.factors);
  const timeline = buildTimeline(raw.date, raw.status, raw.resolutionNote);
  const lastDone = [...timeline].reverse().find((event) => event.done);
  return {
    ...raw,
    city: raw.city ?? "Riverton",
    comments: raw.comments ?? [
      {
        id: `comm-default-${raw.id}`,
        author: "Local Resident",
        date: raw.date,
        text: "Noticed this issue worsening over the past week. Glad someone reported it on NagarMitra.",
        badge: "Verified Resident",
      },
    ],
    score,
    priority: priorityFromScore(score),
    timeline,
    updated: raw.updated ?? lastDone?.date ?? raw.date,
  };
});

export function advanceComplaint(
  complaint: Complaint,
  status: StatusId,
  resolutionNote?: string
): Complaint {
  const note = resolutionNote ?? complaint.resolutionNote;
  const timeline = buildTimeline(complaint.date, status, note);
  const lastDone = [...timeline].reverse().find((event) => event.done);
  return {
    ...complaint,
    status,
    timeline,
    resolutionNote: note,
    updated: lastDone?.date ?? complaint.updated,
  };
}

/** Categories used by the reporting forms and filters. */
export const CATEGORY_COUNTS: Record<string, number> = COMPLAINTS.reduce(
  (acc, complaint) => {
    acc[complaint.category] = (acc[complaint.category] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);
