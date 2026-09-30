// ─── Admin > Organizations · 2-Pager viewer ────────────────────────────────
//
// The administrator side of the platform (not the survey host side) needs to
// pull up any registered organization's manager 2-pager without first knowing
// which survey the org responded to. Survey-side reports live under
// /surveys/[surveyId]/organizations/[orgId]/report — reaching one means
// picking the right cycle first, which an administrator auditing the
// organization registry doesn't have and shouldn't need.
//
// This module resolves, for each ORG_REGISTRY organization, the *latest*
// survey submission on record and builds the report-shaped record the
// 2-pager renders from. Organizations that have never submitted resolve to
// `source: null`, and the viewer shows an explicit empty state rather than a
// dead link.

import type {
  InvitedOrg,
  LpiSubComponents,
  BenchmarkPool,
  GenderDemographics,
  RacialDemographics,
  RacialBreakdown,
} from "@/types/survey";
import { ORG_REGISTRY, type OrgRegistryRow } from "./mock-organizations";
import { getSurveyHistoryForOrg } from "./mock-org-survey-history";
import { formatShortDate } from "./format-date";

/** Where the rendered 2-pager's numbers came from. */
export interface TwoPagerSource {
  surveyName: string;
  hostOrg: string;
  year: number;
  /** ISO date of the submission this 2-pager is built from. */
  submittedDate: string;
  /** Person who filed it. */
  filedBy: string;
  /** How many submissions this org has on record, across all cycles. */
  cyclesOnRecord: number;
}

export interface AdminTwoPagerEntry {
  orgId: string;
  displayId: number;
  name: string;
  orgCode: string | null;
  lpiScore: number | null;
  status: OrgRegistryRow["status"];
  /** null when the organization has never submitted a survey. */
  source: TwoPagerSource | null;
  /** Report-shaped record built from `source`. null whenever `source` is null. */
  org: InvitedOrg | null;
}

// ─── Benchmark / sub-component synthesis ──────────────────────────────────
// Same shape the survey-side report expects, derived from the org's registry
// LPI score and its universe percentile so the admin viewer and the
// Organizations table never disagree about a score.

function pool(label: string, managerValue: number, managerPercentile: number, n: number): BenchmarkPool {
  const median = managerValue - ((managerPercentile - 50) / 100) * managerValue * 0.6;
  return {
    label,
    p10: Math.max(0, +(median * 0.55).toFixed(2)),
    q1: +(median * 0.78).toFixed(2),
    median: +median.toFixed(2),
    q3: +(median * 1.22).toFixed(2),
    p90: +(median * 1.55).toFixed(2),
    min: 0,
    max: +(managerValue * 1.35).toFixed(2),
    managerValue,
    managerPercentile,
    n,
  };
}

function subComponents(percentile: number, evennessPercentile: number): LpiSubComponents {
  return {
    overall: {
      ownership:  { label: "Ownership Score",  rawScore: +((percentile / 100) * 5).toFixed(2),           maxScore: 6.0, percentile },
      leadership: { label: "Leadership Score", rawScore: +((evennessPercentile / 100) * 1.6).toFixed(2), maxScore: 2.0, percentile: evennessPercentile },
      workforce:  { label: "Workforce Score",  rawScore: +((evennessPercentile / 100) * 1.8).toFixed(2), maxScore: 2.0, percentile: evennessPercentile },
    },
    dimensions: [
      {
        dimension: "Gender",
        color: "#6366f1",
        ownership:  { label: "Gender Ownership Score",  rawScore: +((percentile / 100) * 2.6).toFixed(2),         maxScore: 3.0, percentile },
        leadership: { label: "Gender Leadership Score", rawScore: +((evennessPercentile / 100) * 0.8).toFixed(2), maxScore: 1.0, percentile: evennessPercentile },
        workforce:  { label: "Gender Workforce Score",  rawScore: +((evennessPercentile / 100) * 0.9).toFixed(2), maxScore: 1.0, percentile: evennessPercentile },
      },
      {
        dimension: "Racial",
        color: "#f59e0b",
        ownership:  { label: "Racial Ownership Score",  rawScore: +((percentile / 100) * 2.2).toFixed(2),         maxScore: 3.0, percentile: Math.max(1, percentile - 12) },
        leadership: { label: "Racial Leadership Score", rawScore: +((evennessPercentile / 100) * 0.6).toFixed(2), maxScore: 1.0, percentile: Math.max(1, evennessPercentile - 10) },
        workforce:  { label: "Racial Workforce Score",  rawScore: +((evennessPercentile / 100) * 0.7).toFixed(2), maxScore: 1.0, percentile: Math.max(1, evennessPercentile - 10) },
      },
    ],
    peerGroups: [
      { label: "$AUM",      sublabel: "Peer AUM bracket", percentile: Math.min(99, percentile + 4) },
      { label: "HQ Region", sublabel: "HQ region peers",  percentile: Math.max(1, percentile - 6) },
    ],
  };
}

// ─── Demographics synthesis ───────────────────────────────────────────────
// A layer is described by its headcount, the share of women, and the shares
// of each non-White racial group. White/European takes the remainder, so the
// counts always sum back to the headcount exactly.

type RaceShares = Partial<Omit<RacialBreakdown, "white">>;

interface LayerSpec {
  total: number;
  womenPct: number;
  races: RaceShares;
}

interface DemographicsSpec {
  ownership: LayerSpec;
  leadership: LayerSpec;
  workforce: LayerSpec;
}

function genderLayer(spec: LayerSpec): { men: number; women: number } {
  const women = Math.round((spec.womenPct / 100) * spec.total);
  return { men: spec.total - women, women };
}

const EMPTY_RACIAL_BREAKDOWN: RacialBreakdown = {
  indigenous_na: 0, asian: 0, black: 0, latino: 0, mena: 0,
  indigenous_out: 0, white: 0, other: 0, multiracial: 0,
};

function racialLayer(spec: LayerSpec): RacialBreakdown {
  const out: RacialBreakdown = { ...EMPTY_RACIAL_BREAKDOWN };
  let assigned = 0;
  for (const [key, share] of Object.entries(spec.races) as [keyof RacialBreakdown, number][]) {
    const n = Math.round((share / 100) * spec.total);
    out[key] = n;
    assigned += n;
  }
  // White/European absorbs the remainder, which also keeps the rounding honest.
  out.white = Math.max(0, spec.total - assigned);
  return out;
}

function buildDemographics(spec: DemographicsSpec): {
  gender: GenderDemographics;
  racial: RacialDemographics;
} {
  return {
    gender: {
      ownership:  genderLayer(spec.ownership),
      leadership: genderLayer(spec.leadership),
      workforce:  genderLayer(spec.workforce),
    },
    racial: {
      ownership:  racialLayer(spec.ownership),
      leadership: racialLayer(spec.leadership),
      workforce:  racialLayer(spec.workforce),
    },
  };
}

// ─── Per-organization submission profiles ─────────────────────────────────
// Only organizations that have actually submitted appear here. Everything
// else in ORG_REGISTRY resolves to "no submission on record".

interface SubmissionProfile {
  orgId: string;
  /** Percentile of the org's registry LPI score within the RT universe. */
  percentile: number;
  evennessPercentile: number;
  assetClass: string;
  customAssetClass?: string;
  strategyFocus: string[];
  aum: string;
  aumRaw: number;
  founded: string;
  location: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  /** Survey attribution used when the org has no entry in ORG_SURVEY_HISTORY. */
  fallbackSurvey: { surveyName: string; hostOrg: string; year: number; submittedDate: string };
  demographics: DemographicsSpec;
}

const SUBMISSION_PROFILES: SubmissionProfile[] = [
  {
    orgId: "porg-kkr",
    percentile: 92, evennessPercentile: 88,
    assetClass: "Private Equity", customAssetClass: "Large-Cap Buyout",
    strategyFocus: ["Buyout", "Infrastructure", "Credit"],
    aum: "$553B", aumRaw: 553, founded: "1976", location: "New York, NY",
    contactName: "David Chen", contactTitle: "Investor Relations Associate", contactEmail: "david.chen@kkr.com",
    fallbackSurvey: { surveyName: "2026 MACP Manager Diversity Survey", hostOrg: "MACP", year: 2026, submittedDate: "2026-08-25" },
    demographics: {
      ownership:  { total: 14,   womenPct: 36, races: { asian: 21, black: 14, latino: 7 } },
      leadership: { total: 62,   womenPct: 39, races: { asian: 19, black: 10, latino: 8, multiracial: 3 } },
      workforce:  { total: 4780, womenPct: 46, races: { asian: 22, black: 9, latino: 11, mena: 2, multiracial: 4, other: 1 } },
    },
  },
  {
    orgId: "porg-carlyle",
    percentile: 87, evennessPercentile: 84,
    assetClass: "Private Equity", customAssetClass: "Large-Cap Buyout",
    strategyFocus: ["Buyout", "Real Assets", "Global Credit"],
    aum: "$426B", aumRaw: 426, founded: "1987", location: "Washington, DC",
    contactName: "Amanda Torres", contactTitle: "VP, Diversity & Inclusion", contactEmail: "a.torres@carlyle.com",
    fallbackSurvey: { surveyName: "Diversity, Equity, & Inclusion", hostOrg: "Lenox Park Solutions, Inc.", year: 2026, submittedDate: "2026-08-20" },
    demographics: {
      ownership:  { total: 11,   womenPct: 27, races: { asian: 18, black: 18 } },
      leadership: { total: 48,   womenPct: 35, races: { asian: 15, black: 12, latino: 6 } },
      workforce:  { total: 2300, womenPct: 45, races: { asian: 20, black: 11, latino: 9, mena: 2, multiracial: 3 } },
    },
  },
  {
    orgId: "porg-apollo",
    percentile: 79, evennessPercentile: 72,
    assetClass: "Private Credit", customAssetClass: "Direct Lending",
    strategyFocus: ["Direct Lending", "Yield", "Hybrid"],
    aum: "$671B", aumRaw: 671, founded: "1990", location: "New York, NY",
    contactName: "Robert Kim", contactTitle: "Managing Director, DEI", contactEmail: "r.kim@apollo.com",
    fallbackSurvey: { surveyName: "Diversity, Equity, & Inclusion", hostOrg: "Lenox Park Solutions, Inc.", year: 2026, submittedDate: "2026-08-22" },
    demographics: {
      ownership:  { total: 9,    womenPct: 22, races: { asian: 22, latino: 11 } },
      leadership: { total: 41,   womenPct: 29, races: { asian: 17, black: 7, latino: 7 } },
      workforce:  { total: 4600, womenPct: 43, races: { asian: 24, black: 8, latino: 10, mena: 2, multiracial: 3 } },
    },
  },
  {
    orgId: "porg-blackrock",
    percentile: 66, evennessPercentile: 70,
    assetClass: "Long Only", customAssetClass: "Public Equities Long-Only",
    strategyFocus: ["Index", "Active Equity", "Fixed Income"],
    aum: "$10.5T", aumRaw: 10500, founded: "1988", location: "New York, NY",
    contactName: "Elena Marsh", contactTitle: "Global Head of Talent Data", contactEmail: "e.marsh@blackrock.com",
    fallbackSurvey: { surveyName: "Emerging Manager DEI Survey", hostOrg: "CalPERS", year: 2026, submittedDate: "2026-08-24" },
    demographics: {
      ownership:  { total: 17,    womenPct: 29, races: { asian: 18, black: 6, latino: 6 } },
      leadership: { total: 120,   womenPct: 33, races: { asian: 20, black: 6, latino: 7, multiracial: 2 } },
      workforce:  { total: 19800, womenPct: 44, races: { asian: 27, black: 7, latino: 9, mena: 2, multiracial: 3, other: 1 } },
    },
  },
  {
    orgId: "porg-bain",
    percentile: 61, evennessPercentile: 58,
    assetClass: "Private Equity", customAssetClass: "Middle-Market Buyout",
    strategyFocus: ["Buyout", "Venture", "Credit"],
    aum: "$175B", aumRaw: 175, founded: "1984", location: "Boston, MA",
    contactName: "Sarah Mitchell", contactTitle: "Head of Talent", contactEmail: "s.mitchell@baincapital.com",
    fallbackSurvey: { surveyName: "Diversity, Equity, & Inclusion", hostOrg: "Lenox Park Solutions, Inc.", year: 2026, submittedDate: "2026-08-13" },
    demographics: {
      ownership:  { total: 12,   womenPct: 17, races: { asian: 17, black: 8 } },
      leadership: { total: 44,   womenPct: 27, races: { asian: 14, black: 5, latino: 5 } },
      workforce:  { total: 1750, womenPct: 42, races: { asian: 19, black: 7, latino: 8, multiracial: 3 } },
    },
  },
  {
    orgId: "porg-ssga",
    percentile: 57, evennessPercentile: 61,
    assetClass: "Long Only", customAssetClass: "Public Equities Long-Only",
    strategyFocus: ["Index", "ETF", "Fixed Income"],
    aum: "$4.1T", aumRaw: 4100, founded: "1978", location: "Boston, MA",
    contactName: "Grace Lim", contactTitle: "Head of Inclusion Reporting", contactEmail: "g.lim@ssga.com",
    fallbackSurvey: { surveyName: "Emerging Manager DEI Survey", hostOrg: "CalPERS", year: 2026, submittedDate: "2026-08-24" },
    demographics: {
      ownership:  { total: 15,   womenPct: 27, races: { asian: 13, black: 7 } },
      leadership: { total: 76,   womenPct: 32, races: { asian: 16, black: 5, latino: 5 } },
      workforce:  { total: 2600, womenPct: 43, races: { asian: 21, black: 6, latino: 8, mena: 1, multiracial: 3 } },
    },
  },
  {
    orgId: "porg-vista",
    percentile: 48, evennessPercentile: 52,
    assetClass: "Private Equity", customAssetClass: "Growth Equity",
    strategyFocus: ["Enterprise Software", "Growth Equity"],
    aum: "$100B", aumRaw: 100, founded: "2000", location: "Austin, TX",
    contactName: "Lisa Anderson", contactTitle: "Chief People Officer", contactEmail: "l.anderson@vistaequitypartners.com",
    fallbackSurvey: { surveyName: "Diversity, Equity, & Inclusion", hostOrg: "Lenox Park Solutions, Inc.", year: 2026, submittedDate: "2026-08-24" },
    demographics: {
      ownership:  { total: 8,   womenPct: 13, races: { black: 25 } },
      leadership: { total: 33,  womenPct: 24, races: { asian: 12, black: 12, latino: 6 } },
      workforce:  { total: 620, womenPct: 40, races: { asian: 17, black: 10, latino: 9, multiracial: 2 } },
    },
  },
  {
    orgId: "porg-rbc-gam",
    percentile: 34, evennessPercentile: 41,
    assetClass: "Long Only", customAssetClass: "Public Equities Long-Only",
    strategyFocus: ["Global Equity", "Fixed Income", "Multi-Asset"],
    aum: "$470B", aumRaw: 470, founded: "1985", location: "Toronto, Canada",
    contactName: "Priya Nair", contactTitle: "Director, Client Reporting", contactEmail: "priya.nair@rbcgam.com",
    fallbackSurvey: { surveyName: "Emerging Manager DEI Survey", hostOrg: "CalPERS", year: 2025, submittedDate: "2025-09-20" },
    demographics: {
      ownership:  { total: 10,   womenPct: 20, races: { asian: 10 } },
      leadership: { total: 38,   womenPct: 26, races: { asian: 13, black: 3, latino: 3 } },
      workforce:  { total: 1400, womenPct: 41, races: { asian: 18, black: 4, latino: 5, multiracial: 2 } },
    },
  },
];

// ─── Entry construction ───────────────────────────────────────────────────

function buildSource(profile: SubmissionProfile): TwoPagerSource {
  const submitted = getSurveyHistoryForOrg(profile.orgId).filter((h) => h.status === "submitted");
  const latest = submitted[0];

  if (latest) {
    return {
      surveyName: latest.surveyName,
      hostOrg: latest.hostOrg,
      year: latest.year,
      submittedDate: latest.submittedDate,
      filedBy: profile.contactName,
      cyclesOnRecord: submitted.length,
    };
  }

  return { ...profile.fallbackSurvey, filedBy: profile.contactName, cyclesOnRecord: 1 };
}

function buildOrg(row: OrgRegistryRow, profile: SubmissionProfile, source: TwoPagerSource): InvitedOrg {
  const lpiScore = row.lpiScore ?? 0;
  const demo = buildDemographics(profile.demographics);
  const submitted = formatShortDate(source.submittedDate);

  return {
    // Namespaced so an admin-side record can never be mistaken for one of the
    // survey-side InvitedOrgs in MOCK_ORGS.
    id: `admin-2p-${row.orgId}`,
    surveyId: "admin-latest-submission",
    name: row.name,
    type: "GP",
    contactName: profile.contactName,
    contactTitle: profile.contactTitle,
    contactEmail: profile.contactEmail,
    invitedDate: submitted,
    submissionDate: submitted,
    lastActivity: submitted,
    status: "submitted",
    progress: 100,
    assetClass: profile.assetClass,
    customAssetClass: profile.customAssetClass ?? null,
    strategyFocus: profile.strategyFocus,
    aum: profile.aum,
    aumRaw: profile.aumRaw,
    founded: profile.founded,
    headquarters: profile.location,
    location: profile.location,
    lpiScore,
    lpiVersion: "v3.1",
    lpiSubComponents: subComponents(profile.percentile, profile.evennessPercentile),
    benchmarks: {
      universe:   pool("Roundtables Universe", lpiScore, profile.percentile, 312),
      portfolio:  pool("My Portfolio", lpiScore, Math.min(99, profile.percentile + 6), 16),
      assetClass: pool(`Asset Class (${profile.assetClass})`, lpiScore, Math.max(1, profile.percentile - 5), 64),
    },
    genderDemographics: demo.gender,
    racialDemographics: demo.racial,
  };
}

/** Every registered organization, in Organizations-table order, with its 2-pager resolved. */
export const ADMIN_TWO_PAGERS: AdminTwoPagerEntry[] = ORG_REGISTRY.map((row) => {
  const profile = SUBMISSION_PROFILES.find((p) => p.orgId === row.orgId);
  const base = {
    orgId: row.orgId,
    displayId: row.displayId,
    name: row.name,
    orgCode: row.orgCode,
    lpiScore: row.lpiScore,
    status: row.status,
  };

  // No profile, or a registry row with no scored submission, means there is
  // nothing to render a 2-pager from.
  if (!profile || row.lpiScore === null) return { ...base, source: null, org: null };

  const source = buildSource(profile);
  return { ...base, source, org: buildOrg(row, profile, source) };
});

/** Only the organizations that actually have a 2-pager — what the viewer pages through. */
export const ADMIN_TWO_PAGERS_AVAILABLE: AdminTwoPagerEntry[] = ADMIN_TWO_PAGERS.filter(
  (e) => e.org !== null
);

/**
 * Display name for the submission a 2-pager was built from. Some survey names
 * already carry their year ("2026 MACP Manager Diversity Survey") and some
 * don't ("Emerging Manager DEI Survey"), so the year is only prefixed when it
 * isn't already there.
 */
export function surveyLabel(source: TwoPagerSource): string {
  const year = String(source.year);
  return source.surveyName.startsWith(year) ? source.surveyName : `${year} ${source.surveyName}`;
}

export function getAdminTwoPager(orgId: string): AdminTwoPagerEntry | undefined {
  return ADMIN_TWO_PAGERS.find((e) => e.orgId === orgId);
}

export function hasTwoPager(orgId: string): boolean {
  return getAdminTwoPager(orgId)?.org != null;
}

export interface TwoPagerNeighbors {
  /** 1-based position within ADMIN_TWO_PAGERS_AVAILABLE; 0 when the org isn't in it. */
  position: number;
  total: number;
  prev: AdminTwoPagerEntry | null;
  next: AdminTwoPagerEntry | null;
}

/**
 * Previous / next organization in the viewer's rotation. Wraps around at both
 * ends so an admin can keep tapping through the whole list without hitting a
 * dead stop.
 */
export function getTwoPagerNeighbors(orgId: string): TwoPagerNeighbors {
  const list = ADMIN_TWO_PAGERS_AVAILABLE;
  const i = list.findIndex((e) => e.orgId === orgId);
  if (i === -1) return { position: 0, total: list.length, prev: null, next: null };
  return {
    position: i + 1,
    total: list.length,
    prev: list[(i - 1 + list.length) % list.length] ?? null,
    next: list[(i + 1) % list.length] ?? null,
  };
}
