import type { BenchmarkPool } from "@/types/survey";

// Illustrative, demo-only peer benchmark filtering. There is no real backing
// data for every Geography x AUM x Asset Class x Workforce Size combination,
// so each combination's peer pool is generated deterministically (seeded by
// the exact selection) so engineering can see how the full filter surface
// is meant to behave — same inputs always produce the same pool.

export const GEOGRAPHY_OPTIONS = ["Global", "U.S.", "Non-U.S."] as const;
export const AUM_SIZE_OPTIONS = ["<$1B", "$1B–$5B", "$5B–$25B", "$25B–$100B", "$100B+"] as const;
export const ASSET_CLASS_OPTIONS = ["Hedge Fund", "Long Only", "Private Equity", "Real Assets", "Credit", "Real Estate"] as const;
export const WORKFORCE_SIZE_OPTIONS = [
  "1–10 employees", "11–50", "51–150", "151–500", "501–2,500", "2,501–10,000", "10,001–100,000", "100,000+",
] as const;

export type GeographyFilter = typeof GEOGRAPHY_OPTIONS[number];
export type AumSizeFilter = typeof AUM_SIZE_OPTIONS[number];
export type AssetClassFilter = typeof ASSET_CLASS_OPTIONS[number];
export type WorkforceSizeFilter = typeof WORKFORCE_SIZE_OPTIONS[number];

export interface LpiFilterSelections {
  geography: GeographyFilter[];
  aumSize: AumSizeFilter[];
  assetClass: AssetClassFilter[];
  workforceSize: WorkforceSizeFilter[];
}

export const EMPTY_FILTER_SELECTIONS: LpiFilterSelections = {
  geography: [], aumSize: [], assetClass: [], workforceSize: [],
};

export function hasActiveFilters(sel: LpiFilterSelections): boolean {
  return sel.geography.length > 0 || sel.aumSize.length > 0 || sel.assetClass.length > 0 || sel.workforceSize.length > 0;
}

export function activeFilterCount(sel: LpiFilterSelections): number {
  return sel.geography.length + sel.aumSize.length + sel.assetClass.length + sel.workforceSize.length;
}

export function filterSelectionLabel(sel: LpiFilterSelections): string {
  const parts = [
    sel.geography.length ? sel.geography.join("/") : null,
    sel.assetClass.length ? sel.assetClass.join("/") : null,
    sel.aumSize.length ? sel.aumSize.join("/") : null,
    sel.workforceSize.length ? sel.workforceSize.join("/") : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Custom filter";
}

// Illustrative mean nudges per filter value — demo data only, not derived
// from any real peer distribution.
const GEOGRAPHY_NUDGE: Record<GeographyFilter, number> = { "Global": 0, "U.S.": 0.25, "Non-U.S.": -0.2 };
const AUM_NUDGE: Record<AumSizeFilter, number> = {
  "<$1B": -0.6, "$1B–$5B": -0.2, "$5B–$25B": 0.1, "$25B–$100B": 0.35, "$100B+": 0.55,
};
const ASSET_CLASS_NUDGE: Record<AssetClassFilter, number> = {
  "Hedge Fund": -0.3, "Long Only": 0.2, "Private Equity": 0.3, "Real Assets": 0.05, "Credit": -0.05, "Real Estate": -0.15,
};
const WORKFORCE_NUDGE: Record<WorkforceSizeFilter, number> = {
  "1–10 employees": -0.5, "11–50": -0.3, "51–150": -0.1, "151–500": 0.05,
  "501–2,500": 0.2, "2,501–10,000": 0.35, "10,001–100,000": 0.45, "100,000+": 0.5,
};

const BASE_N = 842;

function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function next() {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function avgNudge(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;
}

function percentileOf(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** Builds a deterministic, illustrative peer pool for any combination of the four filter categories. */
export function buildMockFilteredPool(managerScore: number, sel: LpiFilterSelections): BenchmarkPool {
  const activeCategoryCount =
    (sel.geography.length ? 1 : 0) +
    (sel.aumSize.length ? 1 : 0) +
    (sel.assetClass.length ? 1 : 0) +
    (sel.workforceSize.length ? 1 : 0);

  const nudge =
    avgNudge(sel.geography.map((v) => GEOGRAPHY_NUDGE[v])) +
    avgNudge(sel.aumSize.map((v) => AUM_NUDGE[v])) +
    avgNudge(sel.assetClass.map((v) => ASSET_CLASS_NUDGE[v])) +
    avgNudge(sel.workforceSize.map((v) => WORKFORCE_NUDGE[v]));

  // Each stacked category narrows the pool further — illustrative shrink only.
  const selectivity = Math.pow(0.42, activeCategoryCount);
  const n = Math.max(6, Math.round(BASE_N * selectivity));

  const rand = seededRandom(filterSelectionLabel(sel));
  const scores: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = rand() || 1e-9;
    const u2 = rand();
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    scores.push(Math.round(Math.min(10, Math.max(0, 6.4 + nudge + gaussian * 1.1)) * 100) / 100);
  }
  scores.sort((a, b) => a - b);

  const below = scores.filter((s) => s < managerScore).length;

  return {
    label: filterSelectionLabel(sel),
    p10: percentileOf(scores, 10),
    q1: percentileOf(scores, 25),
    median: percentileOf(scores, 50),
    q3: percentileOf(scores, 75),
    p90: percentileOf(scores, 90),
    min: scores[0],
    max: scores[scores.length - 1],
    managerValue: managerScore,
    managerPercentile: Math.round((below / scores.length) * 100),
    n: scores.length,
  };
}
