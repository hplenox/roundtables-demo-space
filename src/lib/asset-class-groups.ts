import type { BenchmarkPool } from "@/types/survey";

// Fixed set of Roundtables benchmark categories that every custom asset
// class label (survey-specific, host-defined) ultimately rolls up into.
export const BENCHMARK_GROUPS = [
  { key: "hedge-funds",    label: "Hedge Funds",    note: null as string | null },
  { key: "long-only",      label: "Long-Only",      note: null as string | null },
  { key: "private-equity", label: "Private Equity", note: "Incl. Venture Capital" },
  { key: "credit",         label: "Credit",         note: null as string | null },
  { key: "real-estate",    label: "Real Estate",    note: null as string | null },
  { key: "real-assets",    label: "Real Assets",    note: null as string | null },
] as const;

export type BenchmarkGroupKey = typeof BENCHMARK_GROUPS[number]["key"];

export function benchmarkGroupLabel(key: string): string {
  return BENCHMARK_GROUPS.find((g) => g.key === key)?.label ?? key;
}

// Hard-coded peer LPI scores per benchmark group (Roundtables benchmark pool).
export const GROUP_SCORES: Record<BenchmarkGroupKey, number[]> = {
  "private-equity": [8.2, 7.8, 7.8, 7.5, 7.3, 7.1, 7.0, 6.7, 6.6, 6.5, 6.4, 6.4, 6.3, 6.2, 6.1, 6.0, 5.9, 5.9, 5.6],
  "hedge-funds":    [6.2, 6.0, 5.8, 5.7, 5.4, 5.1],
  "long-only":      [7.4, 7.2, 6.9, 6.5],
  "credit":         [6.9, 6.8, 6.5, 6.1, 5.9, 5.7, 5.4],
  "real-estate":    [6.8, 6.1, 5.9],
  "real-assets":    [7.0, 6.7, 6.3],
};

function computePercentile(sorted: number[], value: number): number {
  const below = sorted.filter((s) => s < value).length;
  return Math.round((below / sorted.length) * 100);
}

function pctValue(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function buildBenchmarkPool(groupKey: BenchmarkGroupKey, managerScore: number): BenchmarkPool {
  const scores = [...GROUP_SCORES[groupKey]].sort((a, b) => a - b);
  return {
    label: `Asset Class (${benchmarkGroupLabel(groupKey)})`,
    p10: pctValue(scores, 10),
    q1: pctValue(scores, 25),
    median: pctValue(scores, 50),
    q3: pctValue(scores, 75),
    p90: pctValue(scores, 90),
    min: scores[0],
    max: scores[scores.length - 1],
    managerValue: managerScore,
    managerPercentile: computePercentile(scores, managerScore),
    n: scores.length,
  };
}
