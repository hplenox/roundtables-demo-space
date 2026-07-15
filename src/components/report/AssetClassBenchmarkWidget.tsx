"use client";

import { useState, useMemo } from "react";
import { Layers } from "lucide-react";
import BenchmarkDistributionChart from "./BenchmarkDistributionChart";
import { BENCHMARK_GROUPS, buildBenchmarkPool, type BenchmarkGroupKey } from "@/lib/asset-class-groups";

const GROUPS = BENCHMARK_GROUPS;

// Legacy fallback: map org's raw assetClass string → a benchmark group key.
// Only used when the org has no host-defined custom asset class mapping.
function resolveGroup(assetClass: string): BenchmarkGroupKey {
  if (assetClass === "Venture Capital") return "private-equity";
  if (assetClass === "Hedge Fund")      return "hedge-funds";
  const direct = BENCHMARK_GROUPS.find((g) => g.label === assetClass);
  if (direct) return direct.key;
  return "private-equity";
}

interface Props {
  orgLpiScore: number;
  orgAssetClass: string;
  orgName: string;
  /** Authoritative benchmark group(s) from the org's custom asset class mapping, if set. Can be more than one. */
  mappedGroups?: BenchmarkGroupKey[];
}

export default function AssetClassBenchmarkWidget({ orgLpiScore, orgAssetClass, orgName, mappedGroups }: Props) {
  const homeGroups = mappedGroups && mappedGroups.length > 0 ? mappedGroups : [resolveGroup(orgAssetClass)];
  const [activeGroup, setActiveGroup] = useState<BenchmarkGroupKey>(homeGroups[0]);

  const pool = useMemo(
    () => buildBenchmarkPool(activeGroup, orgLpiScore),
    [activeGroup, orgLpiScore]
  );

  const pctColor =
    pool.managerPercentile >= 70 ? "#059669" :
    pool.managerPercentile >= 40 ? "#b45309" :
    "#dc2626";

  const isOwnClass = homeGroups.includes(activeGroup);
  const activeLabel = GROUPS.find((g) => g.key === activeGroup)?.label ?? activeGroup;

  return (
    <div>
      {/* Group selector pills */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        {GROUPS.map((g) => {
          const isActive = activeGroup === g.key;
          const isHome   = homeGroups.includes(g.key);
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
      {homeGroups.length > 1 && (
        <p className="text-[10.5px] text-slate-400 -mt-3.5 mb-4">
          This asset class is mapped to {homeGroups.length} categories &mdash; the teal dot marks each one.
        </p>
      )}

      {/* Context line */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
          <Layers size={11} className="text-slate-400" />
          <span>
            {isOwnClass
              ? <><strong>{orgName}</strong>&apos;s peer group &mdash; {activeLabel}</>
              : <>Comparing to <strong>{activeLabel}</strong> managers</>
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
            vs. {activeLabel} benchmark
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
