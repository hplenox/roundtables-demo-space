// Demo data for the "AI Insights · All managers" dashboard shown at the top
// of the Lists page when no custom list is selected. This is a self-contained
// 7-manager scenario (distinct from the seeded MOCK_PORTFOLIO_MANAGERS used
// elsewhere) built to exactly match a supplied design: every headline number
// below (NAV totals, the 79%-at-or-above stat, the 43%-of-NAV concentration
// stat) is arithmetically consistent with the per-manager rows so the numbers
// never contradict each other if this is extended later.

export type PerfRating = "above" | "at" | "under" | "unrated";
export type ManagerStatus = "Active" | "New";

export interface ScorecardManager {
  id: string;
  name: string;
  location: string;
  status: ManagerStatus;
  assetClasses: string[]; // e.g. ["Hedge Fund", "Fixed Income"]
  aum: string;
  lpiScore: number | null; // raw LPI, e.g. 2.60
  lpiPercentile: number | null;
  evennessPercentile: number | null;
  transparencyPct: number | null;
  policyGrade: string | null; // letter grade
  durabilityGrade: string | null; // letter grade
  nav: number | null; // $M, null = unrated / not counted in NAV rollup
  performance: PerfRating;
  ratingRequested?: boolean;
  // Links this row to its most recent survey report (InvitedOrg + Survey in
  // mock-data.ts / mock-portfolio-org-reports.ts) so clicking through works.
  orgId: string;
  surveyId: string;
}

export const SCORECARD_MANAGERS: ScorecardManager[] = [
  {
    id: "sc-advent",
    name: "Advent Capital Management, LLC",
    location: "New York, NY",
    status: "Active",
    assetClasses: ["Hedge Fund"],
    aum: "$8.7B",
    orgId: "org-advent",
    surveyId: "survey-2026-dei-lenox",
    lpiScore: 2.60,
    lpiPercentile: 80,
    evennessPercentile: 78,
    transparencyPct: 92.9,
    policyGrade: "B+",
    durabilityGrade: "A-",
    nav: 42.5,
    performance: "above",
  },
  {
    id: "sc-halcyon",
    name: "Halcyon Growth Equity",
    location: "Chicago, IL",
    status: "Active",
    assetClasses: ["Private Equity"],
    aum: "$12.4B",
    orgId: "org-halcyon",
    surveyId: "survey-2026-dei-lenox",
    lpiScore: 3.12,
    lpiPercentile: 85,
    evennessPercentile: 82,
    transparencyPct: 96.0,
    policyGrade: "A-",
    durabilityGrade: "A",
    nav: 85.0,
    performance: "above",
  },
  {
    id: "sc-aurelia",
    name: "Aurelia Real Assets",
    location: "Miami, FL",
    status: "Active",
    assetClasses: ["Real Estate"],
    aum: "$6.1B",
    orgId: "org-aurelia",
    surveyId: "survey-2026-dei-lenox",
    lpiScore: 2.05,
    lpiPercentile: 77,
    evennessPercentile: 74,
    transparencyPct: 88.0,
    policyGrade: "B-",
    durabilityGrade: "B+",
    nav: 30.2,
    performance: "at",
  },
  {
    id: "sc-kessler-voss",
    name: "Kessler & Voss Partners",
    location: "Boston, MA",
    status: "Active",
    assetClasses: ["Hedge Fund", "Fixed Income"],
    aum: "$4.3B",
    orgId: "org-kessler-voss",
    surveyId: "survey-2026-dei-lenox",
    lpiScore: 1.40,
    lpiPercentile: 58,
    evennessPercentile: 52,
    transparencyPct: 64.0,
    policyGrade: "C",
    durabilityGrade: "C+",
    nav: 55.8,
    performance: "under",
    ratingRequested: true,
  },
  {
    id: "sc-meridian",
    name: "Meridian Credit Partners",
    location: "Charlotte, NC",
    status: "Active",
    assetClasses: ["Fixed Income"],
    aum: "$3.2B",
    orgId: "org-meridian",
    surveyId: "survey-2026-dei-lenox",
    lpiScore: 1.95,
    lpiPercentile: 68,
    evennessPercentile: 68,
    transparencyPct: 89.0,
    policyGrade: "C+",
    durabilityGrade: "B",
    nav: 18.6,
    performance: "under",
    ratingRequested: true,
  },
  {
    id: "sc-norfield",
    name: "Norfield Asset Management",
    location: "Denver, CO",
    status: "Active",
    assetClasses: ["Real Assets", "Real Estate"],
    aum: "$5.5B",
    orgId: "org-norfield",
    surveyId: "survey-2026-dei-lenox",
    lpiScore: 1.65,
    lpiPercentile: 60,
    evennessPercentile: 63,
    transparencyPct: 83.0,
    policyGrade: "C+",
    durabilityGrade: "B-",
    nav: 120.4,
    performance: "at",
  },
  {
    id: "sc-blue-sable",
    name: "Blue Sable Capital",
    location: "Seattle, WA",
    status: "New",
    assetClasses: ["Long Only"],
    aum: "$1.8B",
    orgId: "org-blue-sable",
    surveyId: "survey-2026-dei-lenox",
    lpiScore: null,
    lpiPercentile: null,
    evennessPercentile: 47,
    transparencyPct: 71.4,
    policyGrade: null,
    durabilityGrade: null,
    nav: null,
    performance: "unrated",
  },
];

// ── Investment performance by asset class (rolled up from SCORECARD_MANAGERS;
// a multi-strategy manager like Kessler & Voss or Norfield contributes its
// NAV to each asset class it's tagged with) ─────────────────────────────────
export interface AssetClassPerf {
  assetClass: string;
  managerCount: number;
  above: number; // $M
  at: number;
  under: number;
  unrated: number;
  total: number | null; // null renders as "—"
}

export const INVESTMENT_PERFORMANCE_BY_ASSET_CLASS: AssetClassPerf[] = [
  { assetClass: "Hedge Fund",     managerCount: 2, above: 42.5, at: 0,    under: 55.8, unrated: 0,  total: 98.3 },
  { assetClass: "Private Equity", managerCount: 1, above: 85.0, at: 0,    under: 0,    unrated: 0,  total: 85.0 },
  { assetClass: "Real Estate",    managerCount: 2, above: 0,    at: 150.6, under: 0,   unrated: 0,  total: 150.6 },
  { assetClass: "Fixed Income",   managerCount: 2, above: 0,    at: 0,    under: 74.4, unrated: 0,  total: 74.4 },
  { assetClass: "Real Assets",    managerCount: 1, above: 0,    at: 120.4, under: 0,   unrated: 0,  total: 120.4 },
  { assetClass: "Long Only",      managerCount: 1, above: 0,    at: 0,    under: 0,    unrated: 1,  total: null },
];

export const PORTFOLIO_TOTAL_NAV = 352.5; // $M — sum of rated managers' NAV only

// ── AI Insights bullets ──────────────────────────────────────────────────
export interface InsightBullet {
  icon: "up" | "down" | "pie";
  lead: string;
  text: string;
}

export const AI_INSIGHT_BULLETS: InsightBullet[] = [
  {
    icon: "up",
    lead: "Culture:",
    text: "6 of 7 managers in this selection sit above the RT Universe median on both LPI and Evenness.",
  },
  {
    icon: "up",
    lead: "Investment performance:",
    text: "79% of $352.5M NAV is with managers at or above expectations.",
  },
  {
    icon: "down",
    lead: "Watch: Blue Sable Capital —",
    text: "unrated, 71.4% transparency, Evenness at the 47th percentile — the weakest combined signal here.",
  },
  {
    icon: "pie",
    lead: "Concentration:",
    text: "Real Estate is the largest class — 2 managers, 43% of NAV.",
  },
];

// ── Outcomes / Infrastructure summary tiles ─────────────────────────────────
export interface SummaryTile {
  label: string;
  value: string;
  unit: string;
  barPct: number; // 0-100
  color: string; // hex
  trend: "up" | "down";
  footnote: string;
  infoTooltip?: string;
}

export const OUTCOME_TILES: SummaryTile[] = [
  {
    label: "AVG LPI · SELECTION",
    value: "2.14",
    unit: "72nd avg pct",
    barPct: 72,
    color: "#3b5bfd",
    trend: "up",
    footnote: "+6 pts since Jan · Halcyon add, Copperline exit",
  },
  {
    label: "AVG EVENNESS",
    value: "69th",
    unit: "avg percentile",
    barPct: 69,
    color: "#8b5cf6",
    trend: "up",
    footnote: "+4 pts since Jan · Aurelia add",
  },
];

export const INFRASTRUCTURE_TILES: SummaryTile[] = [
  {
    label: "AVG TRANSPARENCY",
    value: "83.7%",
    unit: "universe 81.7%",
    barPct: 83.7,
    color: "#7c8f2e",
    trend: "down",
    footnote: "−1.8 pts since Jan · Kessler & Voss drag",
  },
  {
    label: "AVG POLICY GRADE",
    value: "B-",
    unit: "2.6 / 4.0 GPA",
    barPct: 65,
    color: "#16a34a",
    trend: "up",
    footnote: "+0.3 since Jan · Halcyon AI Ethics upload",
    infoTooltip: "Blended grade across all workplace policy categories submitted by each manager.",
  },
];

// ── Culture-Durable Selection ────────────────────────────────────────────
export const CULTURE_DURABLE = {
  grade: "A",
  score: 9.1,
  scoreMax: 10,
  barPct: 79, // green portion
  description: "79% of NAV pairs durable culture (≥ 60/100) with at-or-above performance",
  trend: "up" as const,
  footnote: "+0.6 since Jan · adds outweigh Kessler downgrade",
};

// ── Your Engagement ──────────────────────────────────────────────────────
export interface EngagementCategory {
  label: string;
  color: string;
  count: number;
  avg: number;
  benchmarkPct: number; // tick mark position, 0-100
}

export const ENGAGEMENT = {
  totalSent: 76,
  rank: 3,
  ofAllocators: 27,
  categories: [
    { label: "Congrats",  color: "#16a34a", count: 46, avg: 21, benchmarkPct: 52 },
    { label: "Encourage", color: "#8b5cf6", count: 18, avg: 11, benchmarkPct: 34 },
    { label: "Nudges",    color: "#c2621a", count: 12, avg: 6,  benchmarkPct: 22 },
  ] as EngagementCategory[],
  benchmarkCaption: "Tick = avg of the 27 allocator orgs · all-time, whole platform",
  engagedPct: 88,
  unengagedPct: 74,
  comparisonCaption: "RT platform-wide: avg transparency of regularly engaged vs unengaged managers.",
};

export const RATING_REQUEST_BANNER = {
  count: 2,
  lead: "2 managers have requested a performance rating.",
  text: "Rows marked “Rating requested” below — rate them inline with the arrows. Your rating is private; managers only ever see the blended average.",
};
