import {
  Pod, PodMember, PodEvent, PodRecord, PodDiscussionPost, PodFile, PodInvitation,
  PodRole, EventRsvpStatus, EventLocationType, PodKind, PodActivityItem,
} from "@/types/pod";

// ─── Current user (demo persona, matches the rest of the app's nav) ────────
export const CURRENT_USER = {
  name: "Jason Lamin",
  email: "jason.lamin@lenoxparkinc.com",
  org: "Lenox Park Solutions",
};

// Anchor date for this demo's "today" — independent of the real calendar so
// the events below (Jul 28 – Aug 19) stay believably upcoming/overdue.
export const POD_TODAY_ISO = "2026-07-25";
const POD_TODAY = new Date(`${POD_TODAY_ISO}T00:00:00`);

export function daysFromToday(dateISO: string): number {
  const d = new Date(`${dateISO}T00:00:00`);
  return Math.round((d.getTime() - POD_TODAY.getTime()) / 86400000);
}

export function isUpcoming(dateISO: string): boolean {
  return daysFromToday(dateISO) >= 0;
}

export function fmtEventDate(dateISO: string): { month: string; day: string; full: string } {
  const d = new Date(`${dateISO}T00:00:00`);
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = d.toLocaleDateString("en-US", { day: "2-digit" });
  const full = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  return { month, day, full };
}

/** Parses labels like "Today", "2h ago", "1d ago", "9d ago" into a comparable recency score (lower = more recent). */
export function recencyRank(label: string): number {
  const l = label.toLowerCase();
  if (l === "today" || l.includes("h ago") || l === "just now") return 0;
  const dayMatch = l.match(/(\d+)d ago/);
  if (dayMatch) return parseInt(dayMatch[1], 10);
  const weekMatch = l.match(/(\d+)w ago/);
  if (weekMatch) return parseInt(weekMatch[1], 10) * 7;
  if (l === "yesterday") return 1;
  return 999;
}

export function nextUpcomingEvent(pod: Pod): PodEvent | null {
  const upcoming = pod.events.filter((e) => isUpcoming(e.dateISO)).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  return upcoming[0] ?? null;
}

// ─── Display helpers ────────────────────────────────────────────────────────
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// A small, fixed set of vivid-but-readable avatar colors — cycled by name so
// the same person always renders the same color across the app.
const AVATAR_PALETTE = [
  { bg: "bg-[#00b8a9]", text: "text-white" },
  { bg: "bg-[#4361ee]", text: "text-white" },
  { bg: "bg-[#7c3aed]", text: "text-white" },
  { bg: "bg-[#f59e0b]", text: "text-white" },
  { bg: "bg-[#ef4784]", text: "text-white" },
  { bg: "bg-[#0891b2]", text: "text-white" },
  { bg: "bg-[#16a34a]", text: "text-white" },
  { bg: "bg-[#f97316]", text: "text-white" },
];

export function avatarStyle(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export const POD_KIND_LABEL: Record<PodKind, string> = {
  community: "Community POD",
  vendor: "Vendor POD",
  deal: "Deal POD",
};

export const POD_KIND_RECORD_LABEL: Record<PodKind, string> = {
  community: "Records",
  vendor: "Vendors",
  deal: "Deals",
};

// ─── Filler member pool — used to pad rosters up to a realistic headcount
// without hand-writing dozens of near-duplicate literals. ───────────────────
const FILLER_POOL: { name: string; org: string }[] = [
  { name: "Maya Chen", org: "Northvale Partners" },
  { name: "Rahul Desai", org: "Harborline Capital" },
  { name: "Priya Tan", org: "Lenox Park Solutions" },
  { name: "Kim Barrett", org: "Ashford Street Partners" },
  { name: "Sofia Nunes", org: "Trailwind Asset Management" },
  { name: "Devin Marsh", org: "Pinnacle Vista Advisors" },
  { name: "Anna Reid", org: "Northvale Partners" },
  { name: "Thomas Moreau", org: "Harborline Capital" },
  { name: "Nicole Brooks", org: "Meridian Capital" },
  { name: "Owen Castellan", org: "Blackstone Credit & Insurance" },
  { name: "Renee Kowalski", org: "Blackstone Credit & Insurance" },
  { name: "Grace Umeh", org: "Blackstone Infrastructure Partners" },
  { name: "Felix Nakamura", org: "Multi-Asset Investing" },
  { name: "Isabelle Ortega", org: "Strategic Partners" },
  { name: "Julia Marchetti", org: "Blackstone Private Equity" },
  { name: "Theo Sandoval", org: "Blackstone Growth" },
  { name: "Naomi Fisch", org: "Blackstone Life Sciences" },
  { name: "Elena Rourke", org: "Blackstone Real Estate" },
  { name: "Marcus Ihle", org: "Blackstone Real Estate" },
  { name: "Dana Whitfield", org: "Blackstone Credit & Insurance" },
];

function fillerMember(i: number, role: PodRole, lastActive: string): PodMember {
  const p = FILLER_POOL[i % FILLER_POOL.length];
  // Beyond one lap through the pool, suffix the name so it stays unique
  // instead of repeating — keeps padMembers safe for any target count.
  const lap = Math.floor(i / FILLER_POOL.length);
  const name = lap === 0 ? p.name : `${p.name} ${lap + 1}`;
  const email = `${name.toLowerCase().replace(/\s+/g, ".")}@${p.org.toLowerCase().replace(/[^a-z]+/g, "")}.com`;
  return { id: `m-fill-${i}`, name, email, org: p.org, role, lastActive };
}

function padMembers(base: PodMember[], targetCount: number): PodMember[] {
  const members = [...base];
  const existingNames = new Set(members.map((m) => m.name));
  let i = 0;
  // Bounded by targetCount itself, so this always terminates even if the
  // filler pool is smaller than the number of members still needed.
  while (members.length < targetCount && i < targetCount * 2) {
    const candidate = fillerMember(i, "member", "1w ago");
    if (!existingNames.has(candidate.name)) {
      existingNames.add(candidate.name);
      members.push({ ...candidate, id: `${candidate.id}-${members.length}` });
    }
    i++;
  }
  return members;
}

// ─── POD 1 — Lenox Park Co-Investment POD (Deal POD) ───────────────────────
const coinvestMembers: PodMember[] = [
  { id: "m-jl", name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", org: "Lenox Park Solutions", role: "member", lastActive: "Today" },
  { id: "m-ef", name: "Esteban Fernandez", email: "esteban.fernandez@lenoxparkinc.com", org: "Lenox Park Solutions", role: "member", lastActive: "Yesterday" },
  { id: "m-pt", name: "Priya Tan", email: "priya.tan@lenoxparkinc.com", org: "Lenox Park Solutions", role: "member", lastActive: "Jul 22" },
  { id: "m-mc", name: "Maya Chen", email: "maya.chen@northvalepartners.com", org: "Northvale Partners", role: "member", lastActive: "2h ago" },
  { id: "m-rd", name: "Rahul Desai", email: "rahul.desai@harborlinecapital.com", org: "Harborline Capital", role: "member", lastActive: "Jul 23" },
];

const coinvestEvents: PodEvent[] = [
  {
    id: "ev-deal-review",
    podId: "pod-coinvest",
    title: "Deal Review",
    dateISO: "2026-07-28",
    startTime: "9:00 AM",
    endTime: "10:00 AM",
    timezone: "Eastern Time",
    location: { type: "zoom", detail: "us02web.zoom.us" },
    agenda: "Walk through the three confirmed deals ahead of sponsor sign-off.",
    createdBy: "Jason Lamin",
    createdDateLabel: "Jul 24",
    invitees: [
      { name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", status: "no_response", isHost: true },
      { name: "Esteban Fernandez", email: "esteban.fernandez@lenoxparkinc.com", status: "no_response" },
      { name: "Maya Chen", email: "maya.chen@northvalepartners.com", status: "attending" },
      { name: "Rahul Desai", email: "rahul.desai@harborlinecapital.com", status: "maybe" },
    ],
    documents: [
      { id: "doc-deal-memo", name: "Deal Review Pre-Read", sizeLabel: "2.10 MB", uploadedBy: "Jason Lamin", uploadedDate: "Jul 24, 2026", visibility: "pod" },
    ],
  },
  {
    id: "ev-quarterly-sync",
    podId: "pod-coinvest",
    title: "Quarterly Co-Investment Sync",
    dateISO: "2026-08-19",
    startTime: "1:00 PM",
    endTime: "2:00 PM",
    timezone: "Eastern Time",
    location: { type: "zoom", detail: "us02web.zoom.us" },
    createdBy: "Jason Lamin",
    createdDateLabel: "Jul 24",
    invitees: [
      { name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", status: "attending", isHost: true },
      { name: "Priya Tan", email: "priya.tan@lenoxparkinc.com", status: "no_response" },
      { name: "Esteban Fernandez", email: "esteban.fernandez@lenoxparkinc.com", status: "no_response" },
    ],
    documents: [],
  },
];

const coinvestDiscussion: PodDiscussionPost[] = [
  {
    id: "d-coinvest-1",
    podId: "pod-coinvest",
    author: "Jason Lamin",
    authorOrg: "Lenox Park Solutions",
    dateLabel: "2h ago",
    body: "Pre-read for the Jul 28 deal review is attached — section 3 has the updated Meridian Logistics terms. Comments in this thread stay attached to the event.",
    eventThreadTitle: "Deal Review",
    eventId: "ev-deal-review",
    attachment: { name: "Deal Review Pre-Read", sizeLabel: "2.10 MB", alsoInFiles: true },
    likes: 2,
    replies: 2,
    isNew: true,
  },
  {
    id: "d-coinvest-2",
    podId: "pod-coinvest",
    author: "Esteban Fernandez",
    authorOrg: "Lenox Park Solutions",
    dateLabel: "Yesterday",
    body: "Can we do a 30-minute walkthrough of the pre-read before the review? Voting on times below — whichever wins becomes a POD event.",
    poll: {
      question: "Pick a time for the pre-read walkthrough",
      options: [
        { id: "p1", label: "Tue Jul 28 · 10:00 am ET", votes: 2 },
        { id: "p2", label: "Wed Jul 29 · 2:00 pm ET", votes: 1 },
        { id: "p3", label: "Thu Jul 30 · 9:30 am ET", votes: 0 },
      ],
      votedCount: 2,
      totalVoters: 2,
      myVoteOptionId: "p1",
    },
    likes: 2,
    replies: 4,
    isNew: true,
  },
  {
    id: "d-coinvest-3",
    podId: "pod-coinvest",
    author: "Maya Chen",
    authorOrg: "Northvale Partners",
    dateLabel: "Jul 23",
    body: "Site visit notes on Meridian Logistics are positive — occupancy is ahead of the sponsor's underwriting. Happy to share the full write-up if useful for diligence.",
    likes: 3,
    replies: 1,
    isNew: true,
  },
];

const coinvestRecords: PodRecord[] = [
  {
    id: "r-meridian", podId: "pod-coinvest", name: "Meridian Logistics Portfolio", category: "Industrial real estate",
    addedByLabel: "the sponsor", addedDateLabel: "2h ago", status: "listed", confirmation: "confirmed", confirmedDateLabel: "Jul 19",
    contactName: "Dana Reyes", website: "meridiancapital.com",
    signal: { initials: ["MC", "RD", "JL"], text: "4 investors reviewing" },
    aiSummary: "Four investors in this POD have reviewed the materials; two describe the sponsor as responsive and one asked for more detail on the operating partner.",
    notes: [
      { id: "n1", author: "Maya Chen", authorTag: "Reviewing", dateLabel: "2h ago", body: "Sponsor answered our questions quickly. Notes stay inside this POD." },
      { id: "n2", author: "Rahul Desai", authorTag: "Introduced", dateLabel: "Jul 23", body: "Met the sponsor last week. Materials come directly from them." },
    ],
  },
  {
    id: "r-northvale", podId: "pod-coinvest", name: "Northvale Infrastructure Co-Invest", category: "Infrastructure",
    addedByLabel: "the sponsor", addedDateLabel: "Jul 20", status: "listed", confirmation: "confirmed", confirmedDateLabel: "Jul 18",
    contactName: "Dana Reyes",
    signal: { initials: ["PT", "MC", "JL"], text: "3 investors participated" },
    aiSummary: "Three investors participated in the sponsor's walkthrough call; feedback centered on the toll-revenue assumptions.",
    notes: [
      { id: "n3", author: "Priya Tan", authorTag: "Participated", dateLabel: "Jul 20", body: "Solid asset. Would like updated traffic data before the review." },
    ],
  },
  {
    id: "r-harborline", podId: "pod-coinvest", name: "Harborline Credit Sidecar", category: "Private credit",
    addedByLabel: "the sponsor", addedDateLabel: "Jul 23", status: "listed", confirmation: "confirmed", confirmedDateLabel: "Jul 21",
    contactName: "Dana Reyes",
    signal: { initials: ["RD", "PT"], text: "2 investors introduced" },
    notes: [],
  },
  {
    id: "r-bridgeway", podId: "pod-coinvest", name: "Bridgeway Logistics SPV", category: "Industrial real estate",
    addedByLabel: "Rahul Desai", addedDateLabel: "Jul 24", status: "awaiting", confirmation: "sent",
    signal: { initials: ["RD"], text: "sent to the sponsor" },
    notes: [],
  },
  {
    id: "r-keystone", podId: "pod-coinvest", name: "Keystone Medical Office", category: "Healthcare real estate",
    addedByLabel: "Maya Chen", addedDateLabel: "Jul 22", status: "awaiting", confirmation: "reviewing",
    signal: { initials: ["MC"], text: "sponsor reviewing" },
    notes: [],
  },
];

const coinvestFiles: PodFile[] = [
  { id: "f-coinvest-1", podId: "pod-coinvest", name: "Deal Review Pre-Read", sizeLabel: "2.10 MB", uploadedBy: "Jason Lamin", uploadedDateLabel: "Jul 24, 2026", source: "event" },
  { id: "f-coinvest-2", podId: "pod-coinvest", name: "Meridian Logistics — Site Visit Notes", sizeLabel: "640 KB", uploadedBy: "Maya Chen", uploadedDateLabel: "Jul 23, 2026", source: "discussion" },
  { id: "f-coinvest-3", podId: "pod-coinvest", name: "POD Charter 2026", sizeLabel: "145 KB", uploadedBy: "Jason Lamin", uploadedDateLabel: "Jun 24, 2026", source: "pod" },
];

const coinvestActivity: PodActivityItem[] = [
  { id: "a-c1", type: "event", timestamp: "9:05 am", eventId: "ev-deal-review" },
  { id: "a-c2", type: "file_share", timestamp: "2h ago", sharedBy: "Jason Lamin", fileName: "Deal Review Pre-Read", eventTitle: "Deal Review" },
  { id: "a-c3", type: "member_joined", timestamp: "Jul 23", memberName: "Rahul Desai", memberEmail: "rahul.desai@harborlinecapital.com", memberOrg: "Harborline Capital" },
  { id: "a-c4", type: "member_joined", timestamp: "Jul 20", memberName: "Maya Chen", memberEmail: "maya.chen@northvalepartners.com", memberOrg: "Northvale Partners" },
];

const podCoinvest: Pod = {
  id: "pod-coinvest",
  name: "Lenox Park Co-Investment POD",
  kind: "deal",
  category: "Co-Investment",
  description: "Sponsor-administered POD for a live co-investment programme.",
  hostedBy: "Meridian Capital",
  administeredBy: "Dana Reyes",
  administeredByOrg: "Meridian Capital",
  joinPolicy: "invite_only",
  members: padMembers(coinvestMembers, 24),
  pendingInvitations: [
    { id: "inv-c1", email: "anna.reid@northvale.com", role: "member", invitedBy: "Jason Lamin", invitedDate: "Jul 23", opened: true },
    { id: "inv-c2", email: "t.moreau@harborline.com", role: "member", invitedBy: "Priya Tan", invitedDate: "Jul 21", opened: false },
  ],
  events: coinvestEvents,
  discussion: coinvestDiscussion,
  records: coinvestRecords,
  files: coinvestFiles,
  activity: coinvestActivity,
  digestEnabled: true,
  lastActivityLabel: "today",
  activityTrend: [0.2, 0.35, 0.3, 0.55, 0.5, 0.8, 1],
  weeklyInsight: "Meridian Capital confirmed a new deal for this POD and 2 proposed deals are awaiting sponsor confirmation before the deal review on Jul 28.",
};

// ─── POD 2 — LPS Company (Community POD) ───────────────────────────────────
const lpsMembers: PodMember[] = [
  { id: "m-jl-2", name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", org: "Lenox Park Solutions", role: "admin", lastActive: "Today" },
  { id: "m-ef-2", name: "Esteban Fernandez", email: "esteban.fernandez@lenoxparkinc.com", org: "Lenox Park Solutions", role: "member", lastActive: "Yesterday" },
];

const lpsEvents: PodEvent[] = [
  {
    id: "ev-gov-board",
    podId: "pod-lps",
    title: "Governance Board Meeting",
    dateISO: "2026-08-05",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    timezone: "Eastern Time",
    location: { type: "zoom", detail: "us02web.zoom.us" },
    agenda: "H1 2026 review with the advisory board.",
    createdBy: "Jason Lamin",
    createdDateLabel: "Jul 24",
    invitees: [
      { name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", status: "attending", isHost: true },
      { name: "Esteban Fernandez", email: "esteban.fernandez@lenoxparkinc.com", status: "no_response" },
    ],
    documents: [
      { id: "doc-h1-memo", name: "H1 2026 Summer Advisory Board Memo", sizeLabel: "3.53 MB", uploadedBy: "Jason Lamin", uploadedDate: "Jul 24, 2026", visibility: "pod" },
    ],
  },
];

const lpsDiscussion: PodDiscussionPost[] = [
  {
    id: "d-lps-1",
    podId: "pod-lps",
    author: "Jason Lamin",
    authorOrg: "Lenox Park Solutions",
    authorRole: "Admin",
    dateLabel: "Jul 24",
    body: "Welcome to LPS Company. Use this thread for anything that does not need a meeting — decisions get posted here so new members can catch up in one scroll.",
    pinned: true,
    likes: 2,
    replies: 0,
  },
  {
    id: "d-lps-2",
    podId: "pod-lps",
    author: "Jason Lamin",
    authorOrg: "Lenox Park Solutions",
    authorRole: "Admin",
    dateLabel: "11:17 am",
    body: "Shared the H1 2026 summer advisory board memo ahead of Aug 5 — section 3 is the one that needs eyes before we meet.",
    eventThreadTitle: "Governance Board Meeting",
    eventId: "ev-gov-board",
    attachment: { name: "H1 2026 Summer Advisory Board Memo", sizeLabel: "3.53 MB", alsoInFiles: true },
    likes: 2,
    replies: 1,
    isNew: true,
  },
  {
    id: "d-lps-3",
    podId: "pod-lps",
    author: "Esteban Fernandez",
    authorOrg: "Lenox Park Solutions",
    dateLabel: "11:20 am",
    body: "Thanks Jason — will read through section 3 before Wednesday.",
    likes: 1,
    replies: 0,
    isNew: true,
  },
];

const lpsFiles: PodFile[] = [
  { id: "f-lps-1", podId: "pod-lps", name: "H1 2026 Summer Advisory Board Memo", sizeLabel: "3.53 MB", uploadedBy: "Jason Lamin", uploadedDateLabel: "Jul 24, 2026", source: "event" },
];

const lpsActivity: PodActivityItem[] = [
  { id: "a-l1", type: "event", timestamp: "Upcoming", eventId: "ev-gov-board" },
  { id: "a-l2", type: "file_share", timestamp: "11:17 am", sharedBy: "Jason Lamin", fileName: "H1 2026 Summer Advisory Board Memo", eventTitle: "Governance Board Meeting" },
  { id: "a-l3", type: "member_joined", timestamp: "11:07 am", memberName: "Esteban Fernandez", memberEmail: "esteban.fernandez@lenoxparkinc.com", memberOrg: "Lenox Park Solutions" },
  { id: "a-l4", type: "member_joined", timestamp: "11:06 am", memberName: "Jason Lamin", memberEmail: "jason.lamin@lenoxparkinc.com", memberOrg: "Lenox Park Solutions" },
];

const podLps: Pod = {
  id: "pod-lps",
  name: "LPS Company",
  kind: "community",
  category: "Community & Ecosystems",
  description: "Company POD for sharing content.",
  hostedBy: "Lenox Park Solutions",
  createdBy: "Jason Lamin",
  createdByRole: "Admin",
  joinPolicy: "invite_only",
  members: lpsMembers,
  pendingInvitations: [],
  events: lpsEvents,
  discussion: lpsDiscussion,
  records: [],
  files: lpsFiles,
  activity: lpsActivity,
  digestEnabled: true,
  lastActivityLabel: "today",
  activityTrend: [0.1, 0.2, 0.15, 0.4, 0.5, 0.7, 0.9],
  weeklyInsight: "2 members joined and 1 document was shared ahead of the Governance Board Meeting on Aug 5.",
};

// ─── POD 3 — Racial Equity Asset Lab (Vendor POD) ──────────────────────────
const realMembers: PodMember[] = [
  { id: "m-jl-3", name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", org: "Lenox Park Solutions", role: "admin", lastActive: "Today" },
  { id: "m-ef-3", name: "Esteban Fernandez", email: "esteban.fernandez@lenoxparkinc.com", org: "Lenox Park Solutions", role: "member", lastActive: "Yesterday" },
  { id: "m-kb", name: "Kim Barrett", email: "kim.barrett@ashfordstreet.com", org: "Ashford Street Partners", role: "member", lastActive: "1d ago" },
  { id: "m-sn", name: "Sofia Nunes", email: "sofia.nunes@trailwindam.com", org: "Trailwind Asset Management", role: "member", lastActive: "Jul 21" },
  { id: "m-dm", name: "Devin Marsh", email: "devin.marsh@pinnaclevista.com", org: "Pinnacle Vista Advisors", role: "member", lastActive: "Jul 15" },
];

const realDiscussion: PodDiscussionPost[] = [
  {
    id: "d-real-1",
    podId: "pod-real",
    author: "Kim Barrett",
    authorOrg: "Ashford Street Partners",
    dateLabel: "1d ago",
    body: "Refreshed our Ashford Street Partners listing with updated AUM and strategy focus — let me know if the record needs anything else.",
    likes: 3,
    replies: 2,
    isNew: true,
  },
  {
    id: "d-real-2",
    podId: "pod-real",
    author: "Sofia Nunes",
    authorOrg: "Trailwind Asset Management",
    dateLabel: "Jul 21",
    body: "Suggested Oakbend Investment Group this week — diverse-owned, strong track record in middle-market credit. Awaiting their administrator's confirmation.",
    likes: 2,
    replies: 1,
    isNew: true,
  },
  {
    id: "d-real-3",
    podId: "pod-real",
    author: "Jason Lamin",
    authorOrg: "Lenox Park Solutions",
    authorRole: "Admin",
    dateLabel: "Jul 15",
    body: "Reminder: members can request a meeting with any listed firm directly from its record — a good topic for the next lab session.",
    pinned: true,
    likes: 4,
    replies: 0,
  },
];

const realRecords: PodRecord[] = [
  {
    id: "r-ashford", podId: "pod-real", name: "Ashford Street Partners", category: "Asset management",
    addedByLabel: "Kim Barrett", addedDateLabel: "1d ago", status: "listed", confirmation: "confirmed", confirmedDateLabel: "Jul 24",
    signal: { initials: ["KB", "SN", "DM"], text: "5 members work with them" },
    aiSummary: "Members with long relationships point to responsive reporting and client service; one recent intro call is still in follow-up.",
    notes: [
      { id: "n-real1", author: "Devin Marsh", authorTag: "Works with them", dateLabel: "Jul 24", body: "Been an LP for 3 years — reporting is consistently on time." },
    ],
  },
  {
    id: "r-trailwind", podId: "pod-real", name: "Trailwind Asset Management", category: "Asset management",
    addedByLabel: "Sofia Nunes", addedDateLabel: "Jul 21", status: "listed", confirmation: "confirmed", confirmedDateLabel: "Jul 21",
    signal: { initials: ["SN", "DM"], text: "2 members met with them" },
    notes: [],
  },
  {
    id: "r-pinnacle", podId: "pod-real", name: "Pinnacle Vista Advisors", category: "Asset management",
    addedByLabel: "Devin Marsh", addedDateLabel: "Jul 15", status: "listed", confirmation: "confirmed", confirmedDateLabel: "Jul 15",
    signal: { initials: ["DM", "KB"], text: "4 members following" },
    notes: [],
  },
  {
    id: "r-lantern", podId: "pod-real", name: "Lantern Ridge Capital", category: "Asset management",
    addedByLabel: "Sofia Nunes", addedDateLabel: "Jul 23", status: "awaiting", confirmation: "sent",
    signal: { initials: ["SN"], text: "sent to their administrator" },
    notes: [],
  },
  {
    id: "r-oakbend", podId: "pod-real", name: "Oakbend Investment Group", category: "Asset management",
    addedByLabel: "Kim Barrett", addedDateLabel: "Jul 19", status: "awaiting", confirmation: "reviewing",
    signal: { initials: ["KB"], text: "administrator reviewing" },
    notes: [],
  },
];

const realFiles: PodFile[] = [
  { id: "f-real-1", podId: "pod-real", name: "Diverse-Owned Manager Screening Criteria", sizeLabel: "310 KB", uploadedBy: "Jason Lamin", uploadedDateLabel: "Jul 15, 2026", source: "pod" },
];

const realActivity: PodActivityItem[] = [
  { id: "a-r1", type: "file_share", timestamp: "1d ago", sharedBy: "Kim Barrett", fileName: "Ashford Street Partners — refreshed listing" },
  { id: "a-r2", type: "member_joined", timestamp: "Jul 21", memberName: "Sofia Nunes", memberEmail: "sofia.nunes@trailwindam.com", memberOrg: "Trailwind Asset Management" },
  { id: "a-r3", type: "member_joined", timestamp: "Jul 15", memberName: "Devin Marsh", memberEmail: "devin.marsh@pinnaclevista.com", memberOrg: "Pinnacle Vista Advisors" },
];

const podReal: Pod = {
  id: "pod-real",
  name: "Racial Equity Asset Lab",
  kind: "vendor",
  category: "Managers & Research",
  description: "A member-curated list of diverse-owned asset management firms.",
  hostedBy: "Lenox Park Solutions",
  createdBy: "Jason Lamin",
  createdByRole: "Admin",
  joinPolicy: "request",
  members: padMembers(realMembers, 41),
  pendingInvitations: [],
  events: [],
  discussion: realDiscussion,
  records: realRecords,
  files: realFiles,
  activity: realActivity,
  digestEnabled: false,
  lastActivityLabel: "1d ago",
  activityTrend: [0.3, 0.4, 0.35, 0.5, 0.6, 0.55, 0.75],
  weeklyInsight: "Kim Barrett refreshed the Ashford Street listing and 2 suggested firms are awaiting permission. Members can request a meeting with any listed firm from its record.",
};

// ─── POD 4 — Lenox Park Operating Committee (Vendor POD) ───────────────────
const opsMembers: PodMember[] = [
  { id: "m-jl-4", name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", org: "Lenox Park Solutions", role: "admin", lastActive: "Today" },
  { id: "m-pt-4", name: "Priya Tan", email: "priya.tan@lenoxparkinc.com", org: "Lenox Park Solutions", role: "admin", lastActive: "2d ago" },
];

const opsEvents: PodEvent[] = [
  {
    id: "ev-quarterly-review",
    podId: "pod-ops",
    title: "Quarterly Review",
    dateISO: "2026-08-01",
    startTime: "1:00 PM",
    endTime: "2:00 PM",
    timezone: "Eastern Time",
    location: { type: "zoom", detail: "us02web.zoom.us" },
    createdBy: "Priya Tan",
    createdDateLabel: "Jul 20",
    invitees: [
      { name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", status: "attending", isHost: false },
      { name: "Priya Tan", email: "priya.tan@lenoxparkinc.com", status: "attending", isHost: true },
      { name: "Thomas Moreau", email: "thomas.moreau@harborlinecapital.com", status: "no_response" },
    ],
    documents: [],
  },
];

const opsDiscussion: PodDiscussionPost[] = [
  {
    id: "d-ops-1",
    podId: "pod-ops",
    author: "Priya Tan",
    authorOrg: "Lenox Park Solutions",
    authorRole: "Admin",
    dateLabel: "2d ago",
    body: "Vendor renewal cycle starts next month — flag anyone whose service level has slipped so we can raise it at the quarterly review.",
    likes: 1,
    replies: 0,
  },
];

const opsRecords: PodRecord[] = [
  {
    id: "r-ops-1", podId: "pod-ops", name: "Clearview Data Services", category: "Reporting & analytics",
    addedByLabel: "Priya Tan", addedDateLabel: "Jul 19", status: "listed", confirmation: "confirmed", confirmedDateLabel: "Jul 19",
    signal: { initials: ["JL", "PT"], text: "2 members work with them" },
    notes: [],
  },
  {
    id: "r-ops-2", podId: "pod-ops", name: "Northstar Fund Administration", category: "Fund administration",
    addedByLabel: "Jason Lamin", addedDateLabel: "Jul 12", status: "listed", confirmation: "confirmed", confirmedDateLabel: "Jul 12",
    signal: { initials: ["JL"], text: "1 member works with them" },
    notes: [],
  },
  {
    id: "r-ops-3", podId: "pod-ops", name: "Beacon Compliance Partners", category: "Compliance",
    addedByLabel: "Thomas Moreau", addedDateLabel: "Jul 22", status: "awaiting", confirmation: "reviewing",
    signal: { initials: ["TM"], text: "administrator reviewing" },
    notes: [],
  },
];

const opsFiles: PodFile[] = [
  { id: "f-ops-1", podId: "pod-ops", name: "Vendor Renewal Checklist 2026", sizeLabel: "98 KB", uploadedBy: "Priya Tan", uploadedDateLabel: "Jul 19, 2026", source: "pod" },
];

const opsActivity: PodActivityItem[] = [
  { id: "a-o1", type: "event", timestamp: "2d ago", eventId: "ev-quarterly-review" },
  { id: "a-o2", type: "member_joined", timestamp: "Jul 18", memberName: "Thomas Moreau", memberEmail: "thomas.moreau@harborlinecapital.com", memberOrg: "Harborline Capital" },
];

const podOps: Pod = {
  id: "pod-ops",
  name: "Lenox Park Operating Committee",
  kind: "vendor",
  category: "Advisory & Governance",
  description: "Vendor POD for the firm's service-provider oversight.",
  hostedBy: "Lenox Park Solutions",
  createdBy: "Jason Lamin",
  createdByRole: "Admin",
  joinPolicy: "invite_only",
  members: padMembers(opsMembers, 9),
  pendingInvitations: [
    { id: "inv-o1", email: "n.brooks@meridiancapital.com", role: "viewer", invitedBy: "Jason Lamin", invitedDate: "Jul 24", opened: false },
    { id: "inv-o2", email: "a.reid@northvale.com", role: "viewer", invitedBy: "Jason Lamin", invitedDate: "Jul 22", opened: false },
  ],
  events: opsEvents,
  discussion: opsDiscussion,
  records: opsRecords,
  files: opsFiles,
  activity: opsActivity,
  digestEnabled: true,
  lastActivityLabel: "2d ago",
  activityTrend: [0.4, 0.3, 0.35, 0.3, 0.4, 0.5, 0.65],
  weeklyInsight: "3 vendors are listed for the committee and 1 is awaiting administrator confirmation ahead of the Aug 1 quarterly review.",
};

// ─── POD 5 — Lenox Park Solutions Advisory Board (Community POD) ──────────
const advisoryMembers: PodMember[] = [
  { id: "m-jl-5", name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", org: "Lenox Park Solutions", role: "admin", lastActive: "9d ago" },
  { id: "m-ef-5", name: "Esteban Fernandez", email: "esteban.fernandez@lenoxparkinc.com", org: "Lenox Park Solutions", role: "member", lastActive: "9d ago" },
  { id: "m-gh", name: "Grace Umeh", email: "grace.umeh@blackstone.com", org: "Blackstone Infrastructure Partners", role: "member", lastActive: "12d ago" },
];

const advisoryDiscussion: PodDiscussionPost[] = [
  {
    id: "d-adv-1",
    podId: "pod-advisory",
    author: "Jason Lamin",
    authorOrg: "Lenox Park Solutions",
    authorRole: "Admin",
    dateLabel: "9d ago",
    body: "Welcome to the Advisory Board POD — this is the quiet home for board materials between meetings.",
    pinned: true,
    likes: 2,
    replies: 0,
  },
];

const advisoryFiles: PodFile[] = [
  { id: "f-adv-1", podId: "pod-advisory", name: "Advisory Board Bylaws", sizeLabel: "210 KB", uploadedBy: "Jason Lamin", uploadedDateLabel: "Jun 30, 2026", source: "pod" },
];

const advisoryActivity: PodActivityItem[] = [
  { id: "a-ad1", type: "member_joined", timestamp: "9d ago", memberName: "Esteban Fernandez", memberEmail: "esteban.fernandez@lenoxparkinc.com", memberOrg: "Lenox Park Solutions" },
];

const podAdvisory: Pod = {
  id: "pod-advisory",
  name: "Lenox Park Solutions Advisory Board",
  kind: "community",
  category: "Advisory & Governance",
  description: "Community POD for advisory board members between meetings.",
  hostedBy: "Lenox Park Solutions",
  createdBy: "Jason Lamin",
  createdByRole: "Admin",
  joinPolicy: "invite_only",
  members: padMembers(advisoryMembers, 12),
  pendingInvitations: [],
  events: [],
  discussion: advisoryDiscussion,
  records: [],
  files: advisoryFiles,
  activity: advisoryActivity,
  digestEnabled: true,
  lastActivityLabel: "9d ago",
  activityTrend: [0.2, 0.15, 0.2, 0.1, 0.15, 0.1, 0.08],
  weeklyInsight: "It's been quiet — no new activity since the bylaws were shared on Jun 30.",
};

// ─── POD 6 — Networking POD Testing (Community POD, dormant) ──────────────
const testingMembers: PodMember[] = [
  { id: "m-jl-6", name: "Jason Lamin", email: "jason.lamin@lenoxparkinc.com", org: "Lenox Park Solutions", role: "admin", lastActive: "26d ago" },
];

const podTesting: Pod = {
  id: "pod-testing",
  name: "Networking POD Testing",
  kind: "community",
  category: "Community & Ecosystems",
  description: "Sandbox POD used to test the networking template.",
  hostedBy: "Lenox Park Solutions",
  createdBy: "Jason Lamin",
  createdByRole: "Admin",
  joinPolicy: "invite_only",
  members: padMembers(testingMembers, 4),
  pendingInvitations: [],
  events: [],
  discussion: [],
  records: [],
  files: [],
  activity: [],
  digestEnabled: false,
  isDormant: true,
  dormantLabel: "26 days quiet",
  lastActivityLabel: "26d ago",
  activityTrend: [0.05, 0.05, 0, 0, 0, 0, 0],
  weeklyInsight: "This POD has been quiet for 26 days — archive it or start a new thread to bring it back.",
};

export const MOCK_PODS: Pod[] = [podCoinvest, podLps, podReal, podOps, podAdvisory, podTesting];

// ─── Discoverable — not yet joined, shown on the Discover PODs page ────────
export const DISCOVERABLE_PODS: {
  id: string; name: string; kind: PodKind; category: string; description: string;
  hostedBy: string; memberCount: number; joinPolicy: "request" | "open";
}[] = [
  {
    id: "disc-emerging-managers", name: "Emerging Managers Vendor List", kind: "vendor",
    category: "Managers & Research", description: "Cross-LP curated list of emerging and diverse-owned managers.",
    hostedBy: "RoundTables Network", memberCount: 128, joinPolicy: "request",
  },
  {
    id: "disc-esg-roundtable", name: "ESG Reporting Roundtable", kind: "community",
    category: "Community & Ecosystems", description: "Peer group trading notes on ESG and impact reporting practices.",
    hostedBy: "RoundTables Network", memberCount: 64, joinPolicy: "open",
  },
  {
    id: "disc-infra-coinvest", name: "Infrastructure Co-Investment Network", kind: "deal",
    category: "Co-Investment", description: "Sponsor-run network surfacing infrastructure co-investment opportunities.",
    hostedBy: "Northvale Partners", memberCount: 37, joinPolicy: "request",
  },
];

export function joinDiscoverablePod(discId: string): Pod | null {
  const idx = DISCOVERABLE_PODS.findIndex((d) => d.id === discId);
  if (idx === -1) return null;
  const d = DISCOVERABLE_PODS[idx];
  const pod: Pod = {
    id: d.id.replace("disc-", "pod-"),
    name: d.name,
    kind: d.kind,
    category: d.category,
    description: d.description,
    hostedBy: d.hostedBy,
    joinPolicy: d.joinPolicy,
    members: [{ id: `m-${d.id}-you`, name: CURRENT_USER.name, email: CURRENT_USER.email, org: CURRENT_USER.org, role: "member", lastActive: "Today" }],
    pendingInvitations: [],
    events: [],
    discussion: [],
    records: [],
    files: [],
    activity: [{ id: `a-${d.id}-join`, type: "member_joined", timestamp: "Just now", memberName: CURRENT_USER.name, memberEmail: CURRENT_USER.email, memberOrg: CURRENT_USER.org }],
    digestEnabled: true,
    lastActivityLabel: "today",
    activityTrend: [0, 0, 0, 0, 0, 0, 0.1],
    weeklyInsight: `You joined ${d.name}.`,
  };
  MOCK_PODS.unshift(pod);
  DISCOVERABLE_PODS.splice(idx, 1);
  return pod;
}

// ─── Getters ────────────────────────────────────────────────────────────────
// Vendor and Deal PODs are still modeled in the mock data (and reachable by
// direct mutation), but pod creation is currently Community-only — so every
// list/discovery surface in the PODs tab shows Community PODs exclusively.
export function getAllPods(): Pod[] {
  return MOCK_PODS.filter((p) => p.kind === "community");
}

export function getDiscoverablePods(): typeof DISCOVERABLE_PODS {
  return DISCOVERABLE_PODS.filter((d) => d.kind === "community");
}

export function getPodById(id: string): Pod | undefined {
  return MOCK_PODS.find((p) => p.id === id);
}

export function getEventById(podId: string, eventId: string): PodEvent | undefined {
  return getPodById(podId)?.events.find((e) => e.id === eventId);
}

function updatePod(id: string, patch: Partial<Pod>): Pod | null {
  const idx = MOCK_PODS.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated: Pod = { ...MOCK_PODS[idx], ...patch };
  MOCK_PODS[idx] = updated;
  return updated;
}

// ─── Mutations — RSVP & events ──────────────────────────────────────────────
export function rsvpToEvent(podId: string, eventId: string, status: EventRsvpStatus): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const events = pod.events.map((e) => {
    if (e.id !== eventId) return e;
    const exists = e.invitees.some((i) => i.email === CURRENT_USER.email);
    const invitees = exists
      ? e.invitees.map((i) => (i.email === CURRENT_USER.email ? { ...i, status } : i))
      : [...e.invitees, { name: CURRENT_USER.name, email: CURRENT_USER.email, status }];
    return { ...e, invitees };
  });
  return updatePod(podId, { events });
}

export interface NewEventInput {
  title: string;
  dateISO: string;
  startTime: string;
  endTime: string;
  location: { type: EventLocationType; detail: string };
  agenda?: string;
}

export function addEvent(podId: string, input: NewEventInput): { pod: Pod; event: PodEvent } | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const event: PodEvent = {
    id: `ev-${podId}-${pod.events.length + 1}-${Math.floor(input.dateISO.replace(/-/g, "").length)}`,
    podId,
    title: input.title,
    dateISO: input.dateISO,
    startTime: input.startTime,
    endTime: input.endTime,
    timezone: "Eastern Time",
    location: input.location,
    agenda: input.agenda,
    createdBy: CURRENT_USER.name,
    createdDateLabel: "Just now",
    invitees: [{ name: CURRENT_USER.name, email: CURRENT_USER.email, status: "attending", isHost: true }],
    documents: [],
  };
  const updated = updatePod(podId, { events: [...pod.events, event] });
  return updated ? { pod: updated, event } : null;
}

export function addEventInvitees(podId: string, eventId: string, entries: { name: string; email: string }[]): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const events = pod.events.map((e) =>
    e.id !== eventId
      ? e
      : { ...e, invitees: [...e.invitees, ...entries.map((p) => ({ name: p.name, email: p.email, status: "no_response" as EventRsvpStatus }))] }
  );
  return updatePod(podId, { events });
}

export function uploadEventDocument(podId: string, eventId: string, name: string, visibility: "event" | "pod"): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const doc = { id: `doc-${Date.now() % 100000}-${name.length}`, name, sizeLabel: "1.2 MB", uploadedBy: CURRENT_USER.name, uploadedDate: "Just now", visibility };
  const events = pod.events.map((e) => (e.id !== eventId ? e : { ...e, documents: [...e.documents, doc] }));
  let files = pod.files;
  if (visibility === "pod") {
    files = [...pod.files, { id: `f-${doc.id}`, podId, name, sizeLabel: doc.sizeLabel, uploadedBy: CURRENT_USER.name, uploadedDateLabel: "Just now", source: "event" as const }];
  }
  return updatePod(podId, { events, files });
}

// ─── Mutations — discussion ─────────────────────────────────────────────────
export function postDiscussion(podId: string, body: string, attachment?: { name: string; sizeLabel: string }): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const post: PodDiscussionPost = {
    id: `d-${podId}-${pod.discussion.length + 1}`,
    podId,
    author: CURRENT_USER.name,
    authorOrg: CURRENT_USER.org,
    dateLabel: "Just now",
    body,
    attachment: attachment ? { ...attachment, alsoInFiles: true } : undefined,
    likes: 0,
    replies: 0,
    isNew: true,
  };
  const files = attachment
    ? [...pod.files, { id: `f-${post.id}`, podId, name: attachment.name, sizeLabel: attachment.sizeLabel, uploadedBy: CURRENT_USER.name, uploadedDateLabel: "Just now", source: "discussion" as const }]
    : pod.files;
  return updatePod(podId, { discussion: [post, ...pod.discussion], files });
}

export function postPoll(podId: string, body: string, question: string, optionLabels: string[]): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const post: PodDiscussionPost = {
    id: `d-${podId}-${pod.discussion.length + 1}`,
    podId,
    author: CURRENT_USER.name,
    authorOrg: CURRENT_USER.org,
    dateLabel: "Just now",
    body,
    poll: {
      question,
      options: optionLabels.filter(Boolean).map((label, i) => ({ id: `p-${podId}-${pod.discussion.length + 1}-${i}`, label, votes: 0 })),
      votedCount: 0,
      totalVoters: 1,
    },
    likes: 0,
    replies: 0,
    isNew: true,
  };
  return updatePod(podId, { discussion: [post, ...pod.discussion] });
}

export function addReply(podId: string, postId: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const discussion = pod.discussion.map((p) => (p.id !== postId ? p : { ...p, replies: p.replies + 1 }));
  return updatePod(podId, { discussion });
}

export function toggleLikePost(podId: string, postId: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const discussion = pod.discussion.map((p) =>
    p.id !== postId ? p : { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
  );
  return updatePod(podId, { discussion });
}

export function voteOnPoll(podId: string, postId: string, optionId: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const discussion = pod.discussion.map((p) => {
    if (p.id !== postId || !p.poll) return p;
    const alreadyVoted = !!p.poll.myVoteOptionId;
    const options = p.poll.options.map((o) => {
      if (o.id === p.poll!.myVoteOptionId) return { ...o, votes: Math.max(0, o.votes - 1) };
      return o;
    }).map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o));
    return {
      ...p,
      poll: {
        ...p.poll,
        options,
        myVoteOptionId: optionId,
        votedCount: alreadyVoted ? p.poll.votedCount : p.poll.votedCount + 1,
        totalVoters: alreadyVoted ? p.poll.totalVoters : p.poll.totalVoters + 1,
      },
    };
  });
  return updatePod(podId, { discussion });
}

export function createEventFromPoll(podId: string, postId: string): { pod: Pod; event: PodEvent } | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const post = pod.discussion.find((p) => p.id === postId);
  if (!post?.poll) return null;
  const best = [...post.poll.options].sort((a, b) => b.votes - a.votes)[0];
  const result = addEvent(podId, {
    title: post.poll.question,
    dateISO: "2026-07-28",
    startTime: best.label.split("·")[1]?.trim() ?? "10:00 AM",
    endTime: "10:30 AM",
    location: { type: "zoom", detail: "us02web.zoom.us" },
    agenda: `Scheduled from the POD poll: ${best.label}`,
  });
  if (!result) return null;
  const discussion = result.pod.discussion.map((p) => (p.id !== postId || !p.poll ? p : { ...p, poll: { ...p.poll, createdEventId: result.event.id } }));
  const updated = updatePod(podId, { discussion });
  return updated ? { pod: updated, event: result.event } : null;
}

// ─── Mutations — records (deals / vendors) ─────────────────────────────────
export interface NewRecordInput {
  name: string;
  category: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  context?: string;
}

export function addRecord(podId: string, input: NewRecordInput): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const record: PodRecord = {
    id: `r-${podId}-${pod.records.length + 1}`,
    podId,
    name: input.name,
    category: input.category,
    website: input.website,
    addedByLabel: CURRENT_USER.name,
    addedDateLabel: "Just now",
    status: "awaiting",
    confirmation: "sent",
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    signal: { initials: [initialsOf(CURRENT_USER.name)], text: pod.kind === "deal" ? "sent to the sponsor" : "sent to their administrator" },
    aiSummary: input.context,
    notes: [],
  };
  return updatePod(podId, { records: [record, ...pod.records] });
}

export function addRecordNote(podId: string, recordId: string, body: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const records = pod.records.map((r) =>
    r.id !== recordId ? r : { ...r, notes: [...r.notes, { id: `n-${recordId}-${r.notes.length + 1}`, author: CURRENT_USER.name, dateLabel: "Just now", body }] }
  );
  return updatePod(podId, { records });
}

export function withdrawRecord(podId: string, recordId: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  return updatePod(podId, { records: pod.records.filter((r) => r.id !== recordId) });
}

export function resendRecord(podId: string, recordId: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const records = pod.records.map((r) => (r.id !== recordId ? r : { ...r, addedDateLabel: "Just now" }));
  return updatePod(podId, { records });
}

// ─── Mutations — members & invitations ─────────────────────────────────────
export interface InviteEntry {
  email: string;
  role: PodRole;
}

export function inviteMembers(podId: string, entries: InviteEntry[]): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const invitations: PodInvitation[] = entries.map((e, i) => ({
    id: `inv-${podId}-${pod.pendingInvitations.length + i + 1}`,
    email: e.email,
    role: e.role,
    invitedBy: CURRENT_USER.name,
    invitedDate: "Just now",
    opened: false,
  }));
  return updatePod(podId, { pendingInvitations: [...invitations, ...pod.pendingInvitations] });
}

export function revokeInvitation(podId: string, invitationId: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  return updatePod(podId, { pendingInvitations: pod.pendingInvitations.filter((i) => i.id !== invitationId) });
}

export function updateMemberRole(podId: string, memberId: string, role: PodRole): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const members = pod.members.map((m) => (m.id !== memberId ? m : { ...m, role }));
  return updatePod(podId, { members });
}

export function removeMember(podId: string, memberId: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  return updatePod(podId, { members: pod.members.filter((m) => m.id !== memberId) });
}

// ─── Mutations — files & settings ───────────────────────────────────────────
export function uploadPodFile(podId: string, name: string, sizeLabel: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  const file: PodFile = { id: `f-${podId}-${pod.files.length + 1}`, podId, name, sizeLabel, uploadedBy: CURRENT_USER.name, uploadedDateLabel: "Just now", source: "pod" };
  return updatePod(podId, { files: [file, ...pod.files] });
}

export function toggleDigest(podId: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  return updatePod(podId, { digestEnabled: !pod.digestEnabled });
}

export function togglePinPod(podId: string): Pod | null {
  const pod = getPodById(podId);
  if (!pod) return null;
  return updatePod(podId, { pinned: !pod.pinned });
}

// ─── Create a new POD ───────────────────────────────────────────────────────
export interface NewPodInput {
  kind: PodKind;
  name: string;
  description: string;
  hostOrg: string;
  joinPolicy: Pod["joinPolicy"];
  inviteEmails: string[];
}

export function createPod(input: NewPodInput): Pod {
  const id = `pod-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${MOCK_PODS.length + 1}`;
  const pod: Pod = {
    id,
    name: input.name,
    kind: input.kind,
    category: input.kind === "deal" ? "Co-Investment" : input.kind === "vendor" ? "Managers & Research" : "Community & Ecosystems",
    description: input.description || "New POD.",
    hostedBy: input.hostOrg,
    createdBy: CURRENT_USER.name,
    createdByRole: "Admin",
    joinPolicy: input.joinPolicy,
    members: [{ id: `m-${id}-1`, name: CURRENT_USER.name, email: CURRENT_USER.email, org: CURRENT_USER.org, role: "admin", lastActive: "Today" }],
    pendingInvitations: input.inviteEmails.map((email, i) => ({
      id: `inv-${id}-${i + 1}`, email, role: "member" as PodRole, invitedBy: CURRENT_USER.name, invitedDate: "Just now", opened: false,
    })),
    events: [],
    discussion: [],
    records: [],
    files: [],
    activity: [],
    digestEnabled: true,
    lastActivityLabel: "today",
    activityTrend: [0, 0, 0, 0, 0, 0, 0.1],
    weeklyInsight: `${input.name} was just created — invite members to get things moving.`,
  };
  MOCK_PODS.unshift(pod);
  return pod;
}

// ─── "Needs You" dashboard cards ────────────────────────────────────────────
export interface NeedsYouCard {
  id: string;
  kind: "rsvp" | "document" | "invitation";
  title: string;
  subtitle: string;
  podId: string;
  primaryLabel: string;
}

export function getNeedsYouCards(): NeedsYouCard[] {
  const cards: NeedsYouCard[] = [];
  for (const pod of getAllPods()) {
    const dueEvent = pod.events.find((e) => e.invitees.some((i) => i.email === CURRENT_USER.email && i.status === "no_response"));
    if (dueEvent) {
      cards.push({
        id: `needs-rsvp-${dueEvent.id}`,
        kind: "rsvp",
        title: `${dueEvent.title} needs your response.`,
        subtitle: pod.name,
        podId: pod.id,
        primaryLabel: "RSVP yes",
      });
    }
  }
  const withNewDoc = getAllPods().find((p) => p.discussion.some((d) => d.isNew && d.attachment));
  if (withNewDoc) {
    const doc = withNewDoc.discussion.find((d) => d.isNew && d.attachment)!;
    cards.push({
      id: `needs-doc-${doc.id}`,
      kind: "document",
      title: `${doc.attachment!.name} was shared recently.`,
      subtitle: withNewDoc.name,
      podId: withNewDoc.id,
      primaryLabel: "Read memo",
    });
  }
  const withUnopened = getAllPods().find((p) => p.pendingInvitations.some((i) => !i.opened));
  if (withUnopened) {
    const count = withUnopened.pendingInvitations.filter((i) => !i.opened).length;
    cards.push({
      id: `needs-invite-${withUnopened.id}`,
      kind: "invitation",
      title: `${count} invitation${count === 1 ? "" : "s"} you sent ${count === 1 ? "is" : "are"} still unopened.`,
      subtitle: withUnopened.name,
      podId: withUnopened.id,
      primaryLabel: "Send reminder",
    });
  }
  return cards;
}
