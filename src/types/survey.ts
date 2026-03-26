export type SurveyStatus = "active" | "upcoming" | "closed";

export interface Survey {
  id: string;
  name: string;
  year: number;
  hostOrg: string;
  hostContact: string;
  startDate: string;
  targetCloseDate: string;
  status: SurveyStatus;
  assetClasses: string[];
  privacyLevel: "No information" | "Aggregate only" | "Full disclosure";
  totalInvited: number;
  submitted: number;
  inProgress: number;
  notStarted: number;
  lastSubmission: string | null;
  daysRemaining: number | null;
  weeklyReportUrl: string;
}

export interface BenchmarkPool {
  label: string;
  p10: number;
  q1: number;
  median: number;
  q3: number;
  p90: number;
  min: number;
  max: number;
  managerValue: number;
  managerPercentile: number;
  n: number;
  comingSoon?: boolean;
}

export interface LpiBenchmarks {
  universe: BenchmarkPool;
  portfolio: BenchmarkPool;
  assetClass: BenchmarkPool;
}

/**
 * A single scored sub-metric (e.g. "Gender Ownership Score").
 * rawScore / maxScore gives the fill ratio.
 * percentile is the universe percentile (null = no data, shown as "-").
 */
export interface LpiSubMetric {
  label: string;
  rawScore: number;
  maxScore: number;
  percentile: number | null;
}

/**
 * One dimension group: Gender or Racial.
 * ownership + leadership + workforce max scores always sum to half the Overall maxes.
 */
export interface LpiDimension {
  dimension: "Gender" | "Racial";
  color: string;          // tailwind-compatible hex for charts
  ownership: LpiSubMetric;
  leadership: LpiSubMetric;
  workforce: LpiSubMetric;
}

/**
 * The rolled-up Overall row (sum of Gender + Racial for each category).
 */
export interface LpiOverall {
  ownership: LpiSubMetric;
  leadership: LpiSubMetric;
  workforce: LpiSubMetric;
}

/**
 * Peer-group percentile comparators (AUM bucket, HQ Region, etc.)
 */
export interface LpiPeerGroup {
  label: string;
  sublabel?: string;
  percentile: number | null;
}

/**
 * Full sub-components block — exactly what the reference image shows.
 */
export interface LpiSubComponents {
  overall: LpiOverall;
  dimensions: LpiDimension[];   // [Gender, Racial]
  peerGroups: LpiPeerGroup[];
}

export interface InvitedOrg {
  id: string;
  surveyId: string;
  name: string;
  type: "GP" | "LP";
  contactName: string;
  contactEmail: string;
  contactTitle: string;
  invitedDate: string;
  submissionDate: string | null;
  lastActivity: string | null;
  status: "submitted" | "in_progress" | "not_started";
  progress: number;
  assetClass: string;
  strategyFocus: string[];
  aum: string;
  aumRaw: number;
  founded: string;
  headquarters: string;
  location: string;
  lpiScore: number | null;
  lpiVersion: string;
  lpiSubComponents: LpiSubComponents | null;
  benchmarks: LpiBenchmarks | null;
}
