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
