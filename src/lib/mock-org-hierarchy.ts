export interface OrgUnit {
  id: string;
  name: string;
  /** Headcount for this unit alone (not a rollup of its children). */
  staffCount: number;
  head?: string;
  children?: OrgUnit[];
}

// Demo hierarchy for Blackstone Group ("My Organization"). Business-unit
// names loosely follow Blackstone's public segment structure; headcounts
// and leader names are invented for demo purposes.
export const BLACKSTONE_ORG_HIERARCHY: OrgUnit = {
  id: "org-blackstone",
  name: "Blackstone Group",
  // The parent entity has no headcount of its own outside its business
  // units — total staff is purely a rollup of the children below.
  staffCount: 0,
  head: "Michael Davis",
  children: [
    {
      id: "bx-real-estate",
      name: "Blackstone Real Estate",
      staffCount: 850,
      head: "Elena Rourke",
      children: [
        { id: "bx-re-debt", name: "Real Estate Debt Strategies", staffCount: 210, head: "Marcus Ihle" },
        { id: "bx-re-core", name: "Real Estate Core+", staffCount: 180, head: "Priya Anand" },
      ],
    },
    {
      id: "bx-credit-insurance",
      name: "Blackstone Credit & Insurance (BXCI)",
      staffCount: 650,
      head: "Dana Whitfield",
      children: [
        { id: "bx-direct-lending", name: "Direct Lending", staffCount: 190, head: "Owen Castellan" },
        { id: "bx-insurance-solutions", name: "Insurance Solutions", staffCount: 140, head: "Renee Kowalski" },
      ],
    },
    {
      id: "bx-pe",
      name: "Blackstone Private Equity",
      staffCount: 720,
      head: "Adrian Voss",
      children: [
        { id: "bx-tac-opps", name: "Tactical Opportunities", staffCount: 160, head: "Julia Marchetti" },
        { id: "bx-growth", name: "Blackstone Growth", staffCount: 120, head: "Theo Sandoval" },
        { id: "bx-life-sciences", name: "Blackstone Life Sciences", staffCount: 95, head: "Naomi Fisch" },
      ],
    },
    {
      id: "bx-infrastructure",
      name: "Blackstone Infrastructure Partners",
      staffCount: 310,
      head: "Grace Umeh",
    },
    {
      id: "bx-bxma",
      name: "Multi-Asset Investing (BXMA)",
      staffCount: 240,
      head: "Felix Nakamura",
    },
    {
      id: "bx-secondaries",
      name: "Strategic Partners (Secondaries)",
      staffCount: 180,
      head: "Isabelle Ortega",
    },
    {
      id: "bx-corporate",
      name: "Corporate & Shared Services",
      staffCount: 550,
      head: "Priscilla Adeyemi",
    },
  ],
};

/** Sum of staffCount across a node and all of its descendants. */
export function totalStaff(unit: OrgUnit): number {
  return unit.staffCount + (unit.children ?? []).reduce((sum, c) => sum + totalStaff(c), 0);
}
