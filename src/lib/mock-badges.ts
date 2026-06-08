export type BadgeCategory = "Gender Diversity" | "Racial Diversity" | "Improvement" | "Excellence";
export type BadgeShape = "hexagon" | "shield" | "circle";
export type BadgeIcon =
  | "gender"
  | "trend_up"
  | "people_group"
  | "triple_circles"
  | "chart_arrow"
  | "wave_arrow"
  | "crown"
  | "grid_4";

export interface BadgeType {
  id: string;
  name: string;
  category: BadgeCategory;
  shape: BadgeShape;
  description: string;
  icon: BadgeIcon;
  year: number;
  primaryColor: string;
  bgColor: string;
  borderColor: string;
  categoryBg: string;
  categoryText: string;
  categoryBorder: string;
}

export interface OrgBadge {
  orgId: string;
  orgName: string;
  badgeId: string;
  awardedDate: string;
  surveyId: string;
}

export interface BadgeFormulaStep {
  label: string;
  formula: string;
}

export interface BadgeCalculationSpec {
  eligiblePool: string;
  awardCount: string;
  multiYearRequired: boolean;
  minYearsRequired?: number;
  formulaSteps: BadgeFormulaStep[];
  dataRequired: string[];
  thresholds: { label: string; value: string }[];
  tieBreaker?: string;
}

export const BADGE_CALCULATIONS: Record<string, BadgeCalculationSpec> = {
  "gender-equity-vanguard": {
    eligiblePool: "Private Equity firms with submitted data in the survey year",
    awardCount: "1 org per survey year — highest composite score",
    multiYearRequired: false,
    formulaSteps: [
      {
        label: "Gender LPI Composite (primary)",
        formula: "(G_own.raw + G_lead.raw + G_work.raw) ÷ (G_own.max + G_lead.max + G_work.max) × 10",
      },
      {
        label: "Weighted Gender Score (verification)",
        formula: "GCS = 0.40 × women%_ownership + 0.35 × women%_leadership + 0.25 × women%_workforce",
      },
      {
        label: "Award Criterion",
        formula: "max(Gender LPI Composite) across all eligible PE firms",
      },
    ],
    dataRequired: [
      "Gender demographics — all 3 tiers (ownership, leadership, workforce)",
      "LPI sub-components — gender dimension (rawScore, maxScore)",
    ],
    thresholds: [
      { label: "Min cohort", value: "≥ 5 PE firms with submitted data" },
      { label: "Data completeness", value: "All 3 tiers must be reported" },
    ],
    tieBreaker: "Higher women % at ownership tier",
  },

  "pe-gender-trailblazer": {
    eligiblePool: "Private Equity firms with ≥ 2 consecutive years of gender LPI data",
    awardCount: "1 org per survey year — largest positive YoY delta",
    multiYearRequired: true,
    minYearsRequired: 2,
    formulaSteps: [
      {
        label: "Gender LPI Composite (each year)",
        formula: "(G_own.raw + G_lead.raw + G_work.raw) ÷ (G_own.max + G_lead.max + G_work.max) × 10",
      },
      {
        label: "YoY Gender Delta",
        formula: "ΔGCS = Gender_LPI_current − Gender_LPI_prior_year",
      },
      {
        label: "Award Criterion",
        formula: "max(ΔGCS) among PE firms where ΔGCS ≥ 0.3",
      },
    ],
    dataRequired: [
      "Gender LPI sub-components — current year",
      "Gender LPI sub-components — prior year",
      "Participation in both current and prior survey cohort",
    ],
    thresholds: [
      { label: "Min delta", value: "ΔGCS ≥ 0.3 pts (filters rounding noise)" },
      { label: "Consecutive years", value: "Must appear in both current and prior cohort" },
    ],
    tieBreaker: "Higher absolute Gender LPI Composite in current year",
  },

  "racial-equity-leader": {
    eligiblePool: "LP-type organizations (public companies, institutional investors)",
    awardCount: "1 org per survey year — highest composite score",
    multiYearRequired: false,
    formulaSteps: [
      {
        label: "Simpson's Diversity Index (per tier)",
        formula: "D_T = 1 − Σ(nᵢ×(nᵢ−1)) ÷ (N_T×(N_T−1))   [0 → 1, higher = more diverse]",
      },
      {
        label: "Racial LPI Composite (via LPI sub-components)",
        formula: "(R_own.raw + R_lead.raw + R_work.raw) ÷ (R_own.max + R_lead.max + R_work.max) × 10",
      },
      {
        label: "Weighted Composite RDI (verification)",
        formula: "RDI = 0.40 × D_ownership + 0.35 × D_leadership + 0.25 × D_workforce",
      },
      {
        label: "Award Criterion",
        formula: "max(Racial LPI Composite) among LP-type orgs",
      },
    ],
    dataRequired: [
      "Racial demographics — all 3 tiers (9-category breakdown)",
      "LPI sub-components — racial dimension (rawScore, maxScore)",
    ],
    thresholds: [
      { label: "Org type", value: "LP-type organizations only" },
      { label: "Min representation", value: "≥ 3 racial categories at each tier" },
    ],
    tieBreaker: "Higher racial diversity at ownership tier (D_ownership)",
  },

  "inclusion-pioneer": {
    eligiblePool: "Emerging managers — GP-type orgs with AUM ≤ $2B",
    awardCount: "1 org per survey year — highest composite score among emerging managers",
    multiYearRequired: false,
    formulaSteps: [
      {
        label: "Emerging Manager Filter",
        formula: "Eligible if: org_type = 'GP'  AND  aumRaw ≤ 2  (billions)",
      },
      {
        label: "Racial LPI Composite",
        formula: "(R_own.raw + R_lead.raw + R_work.raw) ÷ (R_own.max + R_lead.max + R_work.max) × 10",
      },
      {
        label: "Award Criterion",
        formula: "max(Racial LPI Composite) among eligible emerging managers",
      },
    ],
    dataRequired: [
      "Racial demographics — all 3 tiers",
      "LPI sub-components — racial dimension",
      "AUM value (to confirm emerging manager status)",
    ],
    thresholds: [
      { label: "AUM cap", value: "≤ $2B (configurable by survey admin)" },
      { label: "Org type", value: "GP-type organizations only" },
    ],
    tieBreaker: "Higher racial diversity at ownership tier",
  },

  "gender-momentum-award": {
    eligiblePool: "All cohort orgs (any asset class) with ≥ 2 consecutive years of gender data",
    awardCount: "1 org per survey year — highest normalized improvement rate",
    multiYearRequired: true,
    minYearsRequired: 2,
    formulaSteps: [
      {
        label: "Gender LPI Composite (each year)",
        formula: "(G_own.raw + G_lead.raw + G_work.raw) ÷ (G_own.max + G_lead.max + G_work.max) × 10",
      },
      {
        label: "Normalized Improvement Rate (NIR)",
        formula: "NIR = (Gender_LPI_current − Gender_LPI_prior) ÷ Gender_LPI_prior × 100",
      },
      {
        label: "Award Criterion",
        formula: "max(NIR) across all cohort orgs where ΔGCS ≥ 0.5 AND NIR ≥ 5%",
      },
    ],
    dataRequired: [
      "Gender LPI sub-components — current year",
      "Gender LPI sub-components — prior year",
      "Minimum 2 consecutive years of survey participation",
    ],
    thresholds: [
      { label: "Absolute floor", value: "ΔGCS ≥ 0.5 pts (prevents awarding trivial gains)" },
      { label: "Relative floor", value: "NIR ≥ 5% relative improvement required" },
      { label: "Why normalized?", value: "2.0→3.5 (+75%) outranks 7.0→7.5 (+7%)" },
    ],
    tieBreaker: "Higher absolute ΔGCS",
  },

  "rising-tide-award": {
    eligiblePool: "All cohort orgs with ≥ 2 consecutive years of overall LPI data",
    awardCount: "1 org per survey year — largest absolute YoY LPI improvement",
    multiYearRequired: true,
    minYearsRequired: 2,
    formulaSteps: [
      {
        label: "Prior Year Lookup",
        formula: "prior = historicalScores[max(year) where year < current_survey_year].lpiScore",
      },
      {
        label: "Overall LPI Delta",
        formula: "ΔLPI = lpiScore_current − lpiScore_prior",
      },
      {
        label: "Award Criterion",
        formula: "max(ΔLPI) across all cohort orgs where ΔLPI ≥ 0.5",
      },
    ],
    dataRequired: [
      "Overall LPI score — current year",
      "Overall LPI score — immediately prior survey year (historicalScores[])",
      "Participation in both current and prior cohort",
    ],
    thresholds: [
      { label: "Min improvement", value: "ΔLPI ≥ 0.5 pts absolute (filters noise)" },
      { label: "Consecutive years", value: "Both years must be in the same survey series" },
    ],
    tieBreaker: "Higher lpiScore in current year",
  },

  "lpi-platinum": {
    eligiblePool: "All orgs within their own asset class (per-asset-class award)",
    awardCount: "All orgs at or above p90 threshold within their asset class",
    multiYearRequired: false,
    formulaSteps: [
      {
        label: "Asset Class Score Pool",
        formula: "pool = { lpiScore : assetClass = org.assetClass, excludedFromBenchmark = false }",
      },
      {
        label: "P90 Threshold",
        formula: "threshold = pctile(pool.sort(asc), 90)   [interpolated]",
      },
      {
        label: "Award Criterion",
        formula: "Award if: org.lpiScore ≥ threshold",
      },
    ],
    dataRequired: [
      "Overall LPI score — current year",
      "Asset class classification",
      "Full LPI sub-components (gender + racial dimensions both submitted)",
    ],
    thresholds: [
      { label: "Min pool size", value: "≥ 5 orgs per asset class (else universe p90 used)" },
      { label: "Decile", value: "Top 10% of asset class peers qualify" },
    ],
  },

  "human-capital-excellence": {
    eligiblePool: "All orgs with complete LPI sub-component data (gender + racial, all 3 tiers)",
    awardCount: "All orgs in top quartile on every one of the 4 HCM pillars simultaneously",
    multiYearRequired: false,
    formulaSteps: [
      {
        label: "Pillar 1 — Gender Representation",
        formula: "P1 = (G_own.raw + G_lead.raw + G_work.raw) ÷ G_total_max × 10",
      },
      {
        label: "Pillar 2 — Racial Representation",
        formula: "P2 = (R_own.raw + R_lead.raw + R_work.raw) ÷ R_total_max × 10",
      },
      {
        label: "Pillar 3 — Leadership Parity",
        formula: "P3 = avg(gender_leadership.percentile, racial_leadership.percentile)",
      },
      {
        label: "Pillar 4 — Improvement Trajectory",
        formula: "P4 = (lpiScore_current ≥ lpiScore_prior)   [first-year orgs exempt = true]",
      },
      {
        label: "P75 threshold per pillar",
        formula: "pᵢ = pctile(all_org_scores_for_pillar_i.sort(asc), 75)",
      },
      {
        label: "Award Criterion",
        formula: "P1 ≥ p₁  AND  P2 ≥ p₂  AND  P3 ≥ p₃  AND  P4 = true",
      },
    ],
    dataRequired: [
      "LPI sub-components — gender dimension (all 3 tiers)",
      "LPI sub-components — racial dimension (all 3 tiers)",
      "Leadership percentile for both dimensions",
      "Prior year LPI score (for Pillar 4 trajectory)",
    ],
    thresholds: [
      { label: "Pillars 1–3", value: "Top quartile (≥ p75) vs. full survey cohort" },
      { label: "Pillar 4", value: "Positive YoY trend (first-year participants exempt)" },
      { label: "All-or-nothing", value: "ALL 4 pillars must be satisfied simultaneously" },
    ],
    tieBreaker: "N/A — all qualifying orgs receive badge; multi-year streaks noted separately",
  },
};

export const BADGE_TYPES: BadgeType[] = [
  {
    id: "gender-equity-vanguard",
    name: "Gender equity vanguard",
    category: "Gender Diversity",
    shape: "hexagon",
    description: "Most gender-diverse private equity firm in the LPI cohort",
    icon: "gender",
    year: 2025,
    primaryColor: "#818cf8",
    bgColor: "#1e1b4b",
    borderColor: "#4f46e5",
    categoryBg: "rgba(99,102,241,0.2)",
    categoryText: "#a5b4fc",
    categoryBorder: "rgba(99,102,241,0.4)",
  },
  {
    id: "pe-gender-trailblazer",
    name: "PE gender trailblazer",
    category: "Gender Diversity",
    shape: "hexagon",
    description: "Greatest year-over-year gender LPI improvement in private equity",
    icon: "trend_up",
    year: 2025,
    primaryColor: "#818cf8",
    bgColor: "#1e1b4b",
    borderColor: "#4f46e5",
    categoryBg: "rgba(99,102,241,0.2)",
    categoryText: "#a5b4fc",
    categoryBorder: "rgba(99,102,241,0.4)",
  },
  {
    id: "racial-equity-leader",
    name: "Racial equity leader",
    category: "Racial Diversity",
    shape: "hexagon",
    description: "Most racially diverse public company in the LPI cohort",
    icon: "people_group",
    year: 2025,
    primaryColor: "#34d399",
    bgColor: "#064e3b",
    borderColor: "#059669",
    categoryBg: "rgba(16,185,129,0.2)",
    categoryText: "#6ee7b7",
    categoryBorder: "rgba(16,185,129,0.4)",
  },
  {
    id: "inclusion-pioneer",
    name: "Inclusion pioneer",
    category: "Racial Diversity",
    shape: "hexagon",
    description: "Most racially diverse emerging manager in the LPI cohort",
    icon: "triple_circles",
    year: 2025,
    primaryColor: "#34d399",
    bgColor: "#064e3b",
    borderColor: "#059669",
    categoryBg: "rgba(16,185,129,0.2)",
    categoryText: "#6ee7b7",
    categoryBorder: "rgba(16,185,129,0.4)",
  },
  {
    id: "gender-momentum-award",
    name: "Gender momentum award",
    category: "Improvement",
    shape: "shield",
    description: "Fastest improving gender LPI score across all asset classes",
    icon: "chart_arrow",
    year: 2025,
    primaryColor: "#fb923c",
    bgColor: "#431407",
    borderColor: "#ea580c",
    categoryBg: "rgba(249,115,22,0.2)",
    categoryText: "#fdba74",
    categoryBorder: "rgba(249,115,22,0.4)",
  },
  {
    id: "rising-tide-award",
    name: "Rising tide award",
    category: "Improvement",
    shape: "shield",
    description: "Greatest overall year-over-year LPI score improvement in the cohort",
    icon: "wave_arrow",
    year: 2025,
    primaryColor: "#fb923c",
    bgColor: "#431407",
    borderColor: "#ea580c",
    categoryBg: "rgba(249,115,22,0.2)",
    categoryText: "#fdba74",
    categoryBorder: "rgba(249,115,22,0.4)",
  },
  {
    id: "lpi-platinum",
    name: "LPI platinum",
    category: "Excellence",
    shape: "circle",
    description: "Top decile LPI performer across all firms in the asset class",
    icon: "crown",
    year: 2025,
    primaryColor: "#fbbf24",
    bgColor: "#451a03",
    borderColor: "#d97706",
    categoryBg: "rgba(217,119,6,0.2)",
    categoryText: "#fcd34d",
    categoryBorder: "rgba(217,119,6,0.4)",
  },
  {
    id: "human-capital-excellence",
    name: "Human capital excellence",
    category: "Excellence",
    shape: "circle",
    description: "Top quartile performance across all four HCM pillars",
    icon: "grid_4",
    year: 2025,
    primaryColor: "#fbbf24",
    bgColor: "#451a03",
    borderColor: "#d97706",
    categoryBg: "rgba(217,119,6,0.2)",
    categoryText: "#fcd34d",
    categoryBorder: "rgba(217,119,6,0.4)",
  },
];

export const ORG_BADGES: OrgBadge[] = [
  {
    orgId: "org-blackstone",
    orgName: "Blackstone Group",
    badgeId: "gender-equity-vanguard",
    awardedDate: "Feb 2025",
    surveyId: "survey-2025-dei-lenox",
  },
  {
    orgId: "org-blackstone",
    orgName: "Blackstone Group",
    badgeId: "gender-momentum-award",
    awardedDate: "Feb 2025",
    surveyId: "survey-2025-dei-lenox",
  },
  {
    orgId: "org-blackstone",
    orgName: "Blackstone Group",
    badgeId: "lpi-platinum",
    awardedDate: "Feb 2025",
    surveyId: "survey-2025-dei-lenox",
  },
  {
    orgId: "org-kkr",
    orgName: "KKR & Co.",
    badgeId: "pe-gender-trailblazer",
    awardedDate: "Feb 2025",
    surveyId: "survey-2025-dei-kkr",
  },
  {
    orgId: "org-kkr",
    orgName: "KKR & Co.",
    badgeId: "racial-equity-leader",
    awardedDate: "Feb 2025",
    surveyId: "survey-2025-dei-kkr",
  },
  {
    orgId: "org-kkr",
    orgName: "KKR & Co.",
    badgeId: "rising-tide-award",
    awardedDate: "Feb 2025",
    surveyId: "survey-2025-dei-kkr",
  },
  {
    orgId: "org-kkr",
    orgName: "KKR & Co.",
    badgeId: "human-capital-excellence",
    awardedDate: "Feb 2025",
    surveyId: "survey-2025-dei-kkr",
  },
  {
    orgId: "org-bain",
    orgName: "Bain Capital",
    badgeId: "inclusion-pioneer",
    awardedDate: "Feb 2025",
    surveyId: "survey-2025-dei-lenox",
  },
];

export function getBadgesForOrg(orgId: string): Array<BadgeType & { awardedDate: string }> {
  return ORG_BADGES.filter((ob) => ob.orgId === orgId).map((ob) => {
    const type = BADGE_TYPES.find((bt) => bt.id === ob.badgeId)!;
    return { ...type, awardedDate: ob.awardedDate };
  });
}

export function getOrgsForBadge(badgeId: string): OrgBadge[] {
  return ORG_BADGES.filter((ob) => ob.badgeId === badgeId);
}

export function getAllBadgeAwardees(): Array<OrgBadge & { badge: BadgeType }> {
  return ORG_BADGES.map((ob) => ({
    ...ob,
    badge: BADGE_TYPES.find((bt) => bt.id === ob.badgeId)!,
  }));
}
