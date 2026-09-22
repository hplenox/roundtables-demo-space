import type { InvitedOrg, LpiSubComponents, BenchmarkPool } from "@/types/survey";

// Demo survey-report backing data for portfolio managers that don't already
// have an InvitedOrg record in mock-data.ts. Every manager surfaced on the
// Portfolio (Lists) page — in the "All managers" Scorecard and in any custom
// list — should be clickable through to a 2-pager report, even when that
// report is a lightweight demo stub. Merged into MOCK_ORGS in mock-data.ts.

const HOST_SURVEY_ID = "survey-2026-dei-lenox";

function pool(label: string, managerValue: number, managerPercentile: number, n: number): BenchmarkPool {
  const median = managerValue - (managerPercentile - 50) / 100 * managerValue * 0.6;
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
      ownership:  { label: "Ownership Score",  rawScore: +(percentile / 100 * 5).toFixed(2), maxScore: 6.00, percentile },
      leadership: { label: "Leadership Score", rawScore: +(evennessPercentile / 100 * 1.6).toFixed(2), maxScore: 2.00, percentile: evennessPercentile },
      workforce:  { label: "Workforce Score",  rawScore: +(evennessPercentile / 100 * 1.8).toFixed(2), maxScore: 2.00, percentile: evennessPercentile },
    },
    dimensions: [
      {
        dimension: "Gender",
        color: "#6366f1",
        ownership:  { label: "Gender Ownership Score",  rawScore: +(percentile / 100 * 2.6).toFixed(2), maxScore: 3.00, percentile },
        leadership: { label: "Gender Leadership Score", rawScore: +(evennessPercentile / 100 * 0.8).toFixed(2), maxScore: 1.00, percentile: evennessPercentile },
        workforce:  { label: "Gender Workforce Score",  rawScore: +(evennessPercentile / 100 * 0.9).toFixed(2), maxScore: 1.00, percentile: evennessPercentile },
      },
      {
        dimension: "Racial",
        color: "#f59e0b",
        ownership:  { label: "Racial Ownership Score",  rawScore: +(percentile / 100 * 2.2).toFixed(2), maxScore: 3.00, percentile: Math.max(0, percentile - 12) },
        leadership: { label: "Racial Leadership Score", rawScore: +(evennessPercentile / 100 * 0.6).toFixed(2), maxScore: 1.00, percentile: Math.max(0, evennessPercentile - 10) },
        workforce:  { label: "Racial Workforce Score",  rawScore: +(evennessPercentile / 100 * 0.7).toFixed(2), maxScore: 1.00, percentile: Math.max(0, evennessPercentile - 10) },
      },
    ],
    peerGroups: [
      { label: "$AUM",      sublabel: "Peer AUM bracket", percentile: Math.min(99, percentile + 4) },
      { label: "HQ Region", sublabel: "US-based",         percentile: Math.max(1, percentile - 6) },
    ],
  };
}

interface RatedOrgOpts {
  id: string;
  name: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  assetClass: string;
  customAssetClass?: string;
  strategyFocus: string[];
  aum: string;
  aumRaw: number;
  founded: string;
  location: string;
  lpiScore: number;
  percentile: number;
  evennessPercentile: number;
}

function ratedOrg(o: RatedOrgOpts): InvitedOrg {
  return {
    id: o.id,
    surveyId: HOST_SURVEY_ID,
    name: o.name,
    type: "GP",
    contactName: o.contactName,
    contactTitle: o.contactTitle,
    contactEmail: o.contactEmail,
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 14, 2026",
    lastActivity: "Mar 14, 2026",
    status: "submitted",
    progress: 100,
    assetClass: o.assetClass,
    customAssetClass: o.customAssetClass ?? null,
    strategyFocus: o.strategyFocus,
    aum: o.aum,
    aumRaw: o.aumRaw,
    founded: o.founded,
    headquarters: o.location,
    location: o.location,
    lpiScore: o.lpiScore,
    lpiVersion: "v3.1",
    lpiSubComponents: subComponents(o.percentile, o.evennessPercentile),
    benchmarks: {
      universe:   pool("Roundtables Universe", o.lpiScore, o.percentile, 312),
      portfolio:  pool("My Portfolio", o.lpiScore, Math.min(99, o.percentile + 6), 7),
      assetClass: pool(`Asset Class (${o.assetClass})`, o.lpiScore, Math.max(1, o.percentile - 5), 64),
    },
    genderDemographics: null,
    racialDemographics: null,
  };
}

interface StubOrgOpts {
  id: string;
  name: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  assetClass: string;
  strategyFocus: string[];
  aum: string;
  aumRaw: number;
  founded: string;
  location: string;
  status?: "in_progress" | "not_started";
}

// A manager invited to the survey but who hasn't (yet) submitted a response —
// the report route resolves cleanly to the platform's own "Dashboard Not
// Available" state rather than a dead link.
function stubOrg(o: StubOrgOpts): InvitedOrg {
  return {
    id: o.id,
    surveyId: HOST_SURVEY_ID,
    name: o.name,
    type: "GP",
    contactName: o.contactName,
    contactTitle: o.contactTitle,
    contactEmail: o.contactEmail,
    invitedDate: "Feb 8, 2026",
    submissionDate: null,
    lastActivity: o.status === "in_progress" ? "Mar 2, 2026" : null,
    status: o.status ?? "not_started",
    progress: o.status === "in_progress" ? 40 : 0,
    assetClass: o.assetClass,
    customAssetClass: null,
    strategyFocus: o.strategyFocus,
    aum: o.aum,
    aumRaw: o.aumRaw,
    founded: o.founded,
    headquarters: o.location,
    location: o.location,
    lpiScore: null,
    lpiVersion: "v3.1",
    lpiSubComponents: null,
    benchmarks: null,
    genderDemographics: null,
    racialDemographics: null,
  };
}

// ── Rated: the 6 scored managers behind the "AI Insights · All managers" scorecard ──
export const PORTFOLIO_INSIGHTS_ORGS: InvitedOrg[] = [
  ratedOrg({
    id: "org-advent", name: "Advent Capital Management, LLC",
    contactName: "Priya Shah", contactTitle: "Head of DEI", contactEmail: "p.shah@adventcap.com",
    assetClass: "Hedge Fund", strategyFocus: ["Multi-Strategy", "Event-Driven"],
    aum: "$8.7B", aumRaw: 8.7, founded: "2004", location: "New York, NY",
    lpiScore: 2.60, percentile: 80, evennessPercentile: 78,
  }),
  ratedOrg({
    id: "org-halcyon", name: "Halcyon Growth Equity",
    contactName: "Oliver Bennett", contactTitle: "Chief People Officer", contactEmail: "o.bennett@halcyongrowth.com",
    assetClass: "Private Equity", strategyFocus: ["Growth Equity", "Buyout"],
    aum: "$12.4B", aumRaw: 12.4, founded: "2011", location: "Chicago, IL",
    lpiScore: 3.12, percentile: 85, evennessPercentile: 82,
  }),
  ratedOrg({
    id: "org-aurelia", name: "Aurelia Real Assets",
    contactName: "Natalie Cruz", contactTitle: "Director, Talent & Culture", contactEmail: "n.cruz@aureliara.com",
    assetClass: "Real Estate", strategyFocus: ["Core-Plus Real Estate"],
    aum: "$6.1B", aumRaw: 6.1, founded: "2009", location: "Miami, FL",
    lpiScore: 2.05, percentile: 77, evennessPercentile: 74,
  }),
  ratedOrg({
    id: "org-kessler-voss", name: "Kessler & Voss Partners",
    contactName: "Grant Kessler", contactTitle: "Managing Partner", contactEmail: "g.kessler@kesslervoss.com",
    assetClass: "Hedge Fund", customAssetClass: "Diversified Macro", strategyFocus: ["Hedge Fund", "Fixed Income"],
    aum: "$4.3B", aumRaw: 4.3, founded: "1998", location: "Boston, MA",
    lpiScore: 1.40, percentile: 58, evennessPercentile: 52,
  }),
  ratedOrg({
    id: "org-meridian", name: "Meridian Credit Partners",
    contactName: "Sofia Nakamura", contactTitle: "Chief of Staff", contactEmail: "s.nakamura@meridiancp.com",
    assetClass: "Fixed Income", customAssetClass: "Direct Lending", strategyFocus: ["Direct Lending", "Fixed Income"],
    aum: "$3.2B", aumRaw: 3.2, founded: "2013", location: "Charlotte, NC",
    lpiScore: 1.95, percentile: 68, evennessPercentile: 68,
  }),
  ratedOrg({
    id: "org-norfield", name: "Norfield Asset Management",
    contactName: "Derek Holt", contactTitle: "Head of Investor Relations", contactEmail: "d.holt@norfieldam.com",
    assetClass: "Real Assets", customAssetClass: "Core-Plus Real Estate", strategyFocus: ["Real Assets", "Real Estate"],
    aum: "$5.5B", aumRaw: 5.5, founded: "2006", location: "Denver, CO",
    lpiScore: 1.65, percentile: 60, evennessPercentile: 63,
  }),
];

// ── Stubs: managers invited but not yet reporting (Blue Sable is genuinely
// unrated; the rest back the five MOCK_PORTFOLIO_MANAGERS entries that have
// always shown lpiScore: null on their portfolio card) ─────────────────────
export const PORTFOLIO_STUB_ORGS: InvitedOrg[] = [
  stubOrg({
    id: "org-blue-sable", name: "Blue Sable Capital",
    contactName: "Marcus Lindt", contactTitle: "Operations Lead", contactEmail: "m.lindt@bluesablecap.com",
    assetClass: "Long Only", strategyFocus: ["Long Only Equities"],
    aum: "$1.8B", aumRaw: 1.8, founded: "2022", location: "Seattle, WA",
    status: "in_progress",
  }),
  stubOrg({
    id: "org-sequoia", name: "Sequoia Capital",
    contactName: "Priya Nair", contactTitle: "Venture Partner", contactEmail: "p.nair@sequoiacap.com",
    assetClass: "Venture Capital", strategyFocus: ["Seed", "Early Stage", "Growth"],
    aum: "$85B", aumRaw: 85, founded: "1972", location: "Menlo Park, CA",
    status: "not_started",
  }),
  stubOrg({
    id: "org-a16z", name: "Andreessen Horowitz",
    contactName: "Marcus Webb", contactTitle: "General Partner", contactEmail: "m.webb@a16z.com",
    assetClass: "Venture Capital", strategyFocus: ["Early Stage", "Bio", "Crypto"],
    aum: "$42B", aumRaw: 42, founded: "2009", location: "Menlo Park, CA",
    status: "in_progress",
  }),
  stubOrg({
    id: "org-brookfield", name: "Brookfield Asset Management",
    contactName: "Sandra Okafor", contactTitle: "Managing Partner, Infrastructure", contactEmail: "s.okafor@brookfield.com",
    assetClass: "Real Assets", strategyFocus: ["Infrastructure", "Renewable Energy", "Real Estate"],
    aum: "$900B", aumRaw: 900, founded: "1899", location: "Toronto, Canada",
    status: "not_started",
  }),
  stubOrg({
    id: "org-ares", name: "Ares Management",
    contactName: "David Fernandez", contactTitle: "Partner, Investor Relations", contactEmail: "d.fernandez@aresmgmt.com",
    assetClass: "Private Credit", strategyFocus: ["Senior Debt", "Mezzanine", "Private Equity"],
    aum: "$428B", aumRaw: 428, founded: "1997", location: "Los Angeles, CA",
    status: "in_progress",
  }),
  stubOrg({
    id: "org-general-atlantic", name: "General Atlantic",
    contactName: "Tanya Rivers", contactTitle: "Managing Director", contactEmail: "t.rivers@generalatlantic.com",
    assetClass: "Venture Capital", strategyFocus: ["Growth Equity", "Technology", "Healthcare"],
    aum: "$84B", aumRaw: 84, founded: "1980", location: "New York, NY",
    status: "not_started",
  }),
];

export const PORTFOLIO_DEMO_ORGS: InvitedOrg[] = [...PORTFOLIO_INSIGHTS_ORGS, ...PORTFOLIO_STUB_ORGS];
