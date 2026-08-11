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
  insufficientData?: boolean;
}

export interface LpiBenchmarks {
  universe: BenchmarkPool;
  portfolio: BenchmarkPool;
  assetClass: BenchmarkPool;
}

export type USRegion = "South" | "Northeast" | "Southeast" | "Midwest" | "Northwest" | "Southwest";
export type AumBracket = "<$1B" | "$1B–$5B" | "$5B–$25B" | "$25B–$100B" | "$100B+";

export interface OrgGeography {
  city?: string;
  state?: string;
  country: string;
  region?: USRegion;
  isUSBased: boolean;
}

export interface GeographyBenchmarkSlice {
  universe: BenchmarkPool;
  portfolio: BenchmarkPool;
}

export interface GeographyBenchmarks {
  regions?: Partial<Record<USRegion, GeographyBenchmarkSlice>>;
  usBased?: GeographyBenchmarkSlice;
  country?: GeographyBenchmarkSlice;
  city?: GeographyBenchmarkSlice;
}

export interface AumBenchmarkSlice {
  universe: BenchmarkPool;
  portfolio: BenchmarkPool;
}

export interface AumBenchmarks {
  managerBracket: AumBracket;
  brackets: Partial<Record<AumBracket, AumBenchmarkSlice>>;
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

export interface CustomAssetClass {
  id: string;
  surveyId: string;
  /** Host-defined label, e.g. "Growth Buyout" */
  name: string;
  /** Keys into BENCHMARK_GROUPS (src/lib/asset-class-groups.ts). May be empty if not yet mapped. */
  benchmarkGroups: string[];
  createdAt: string;
}

export interface Contact {
  id: string;
  surveyId: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  /** Employer/company text exactly as it appeared in the host's raw contact list — often messy or inconsistent. */
  rawOrgLabel: string;
  /** The InvitedOrg this contact has been matched to. Null = not yet matched to a platform organization. A contact can link to at most one org, mirroring the 1-account-to-1-org login model. */
  orgId: string | null;
  /** Whether this person has already created a platform login. */
  hasAccount: boolean;
  lastLogin: string | null;
  /** Whether this contact has personally submitted a survey on behalf of their matched org before (a prior cycle, not necessarily this one). */
  hasSubmittedBefore: boolean;
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
  /** Name of the survey's custom asset class this org has been mapped to, if any */
  customAssetClass?: string | null;
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
  genderDemographics: GenderDemographics | null;
  racialDemographics: RacialDemographics | null;
  geography?: OrgGeography | null;
  geographyBenchmarks?: GeographyBenchmarks | null;
  aumBenchmarks?: AumBenchmarks | null;
}

export interface GenderDemographics {
  ownership:  { men: number; women: number };
  leadership: { men: number; women: number };
  workforce:  { men: number; women: number };
}

export interface RacialBreakdown {
  indigenous_na: number;
  asian:         number;
  black:         number;
  latino:        number;
  mena:          number;
  indigenous_out: number;
  white:         number;
  other:         number;
  multiracial:   number;
}

export interface RacialDemographics {
  ownership:  RacialBreakdown;
  leadership: RacialBreakdown;
  workforce:  RacialBreakdown;
}
