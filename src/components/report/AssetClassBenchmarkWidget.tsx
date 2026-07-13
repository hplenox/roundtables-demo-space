"use client";

import { useState, useMemo } from "react";
import { Layers } from "lucide-react";
import BenchmarkDistributionChart from "./BenchmarkDistributionChart";
import type { BenchmarkPool } from "@/types/survey";

// ── Hard-coded peer scores per group (from Roundtables benchmark pool) ─────────
const GROUP_SCORES: Record<string, number[]> = {
  "Private Equity": [8.2, 7.8, 7.8, 7.5, 7.3, 7.1, 7.0, 6.7, 6.6, 6.5, 6.4, 6.4, 6.3, 6.2, 6.1, 6.0, 5.9, 5.9, 5.6],
  "Hedge Funds":    [6.2, 6.0, 5.8, 5.7, 5.4, 5.1],
  "Long-Only":      [7.4, 7.2, 6.9, 6.5],
  "Credit":         [6.9, 6.8, 6.5, 6.1, 5.9, 5.7, 5.4],
  "Real Estate":    [6.8, 6.1, 5.9],
  "Real Assets":    [7.0, 6.7, 6.3],
};

const GROUPS = [
  { key: "Private Equity", label: "Private Equity", note: "Incl. Venture Capital" },
  { key: "Hedge Funds",    label: "Hedge Funds",    note: null },
  { key: "Long-Only",      label: "Long-Only",      note: null },
  { key: "Credit",         label: "Credit",         note: null },
  { key: "Real Estate",    label: "Real Estate",    note: null },
  { key: "Real Assets",    label: "Real Assets",    note: null },
] as const;

type GroupKey = typeof GROUPS[number]["key"];

// Map org's raw assetClass string → one of our 5 group keys
function resolveGroup(assetClass: string): GroupKey {
  if (assetClass === "Venture Capital")  return "Private Equity";
  if (assetClass === "Hedge Fund")       return "Hedge Funds";
  if ((GROUPS as readonly { key: string }[]).some(g => g.key === assetClass))
    return assetClass as GroupKey;
  return "Private Equity";
}

function computePercentile(sorted: number[], value: number): number {
  const below = sorted.filter(s => s < value).length;
  return Math.round((below / sorted.length) * 100);
}

function pctValue(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function buildPool(groupKey: GroupKey, managerScore: number): BenchmarkPool {
  const scores = [...GROUP_SCORES[groupKey]].sort((a, b) => a - b);
  return {
    label: groupKey,
    p10: pctValue(scores, 10),
    q1:  pctValue(scores, 25),
    median: pctValue(scores, 50),
    q3:  pctValue(scores, 75),
    p90: pctValue(scores, 90),
    min: scores[0],
    max: scores[scores.length - 1],
    managerValue: managerScore,
    managerPercentile: computePercentile(scores, managerScore),
    n: scores.length,
  };
}

interface Props {
  orgLpiScore: number;
  orgAssetClass: string;
  orgName: string;
}

export default function AssetClassBenchmarkWidget({ orgLpiScore, orgAssetClass, orgName }: Props) {
  const defaultGroup = resolveGroup(orgAssetClass);
  const [activeGroup, setActiveGroup] = useState<GroupKey>(defaultGroup);

  const pool = useMemo(
    () => buildPool(activeGroup, orgLpiScore),
    [activeGroup, orgLpiScore]
  );

  const pctColor =
    pool.managerPercentile >= 70 ? "#059669" :
    pool.managerPercentile >= 40 ? "#b45309" :
    "#dc2626";

  const isOwnClass = resolveGroup(orgAssetClass) === activeGroup;

  return (
    <div>
      {/* Group selector pills */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        {GROUPS.map((g) => {
          const isActive = activeGroup === g.key;
          const isHome   = resolveGroup(orgAssetClass) === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all border ${
                isActive
                  ? "bg-[#0f1923] text-white border-[#0f1923]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isHome && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b8a9] shrink-0" />
              )}
              {g.label}
              {g.note && isActive && (
                <span className="text-[9.5px] text-white/60 font-normal">{g.note}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Context line */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
          <Layers size={11} className="text-slate-400" />
          <span>
            {isOwnClass
              ? <><strong>{orgName}</strong>&apos;s peer group &mdash; {activeGroup}</>
              : <>Comparing to <strong>{activeGroup}</strong> managers</>
            }
          </span>
        </div>
        <span className="text-[11px] text-slate-400">n = {pool.n.toLocaleString()} managers</span>
      </div>

      {/* Percentile headline */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[28px] font-black tabular-nums leading-none" style={{ color: pctColor }}>
            {pool.managerPercentile}
          </span>
          <span className="text-[13px] font-bold" style={{ color: pctColor }}>th percentile</span>
          <span className="text-[11.5px] text-slate-400">
            vs. {activeGroup} benchmark
            {!isOwnClass && (
              <span className="ml-1 text-amber-600 text-[10.5px] font-medium">(cross-class)</span>
            )}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 shrink-0">
          Score: {orgLpiScore.toFixed(1)}
        </span>
      </div>

      {/* Distribution chart */}
      <div className="px-1 mb-3">
        <BenchmarkDistributionChart pool={pool} />
      </div>

      {/* Q1 / Median / Q3 */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/60">
        {[
          { label: "Q1",     value: pool.q1.toFixed(2) },
          { label: "Median", value: pool.median.toFixed(2) },
          { label: "Q3",     value: pool.q3.toFixed(2) },
        ].map(({ label, value }) => (
          <div key={label} className="px-4 py-2 text-center">
            <p className="text-[12px] font-bold text-slate-700 tabular-nums">{value}</p>
            <p className="text-[9.5px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
