"use client";

import { useState } from "react";
import { Info, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { InvitedOrg, BenchmarkPool } from "@/types/survey";
import { ordinal, pctColor } from "@/components/report/benchmarkFormat";
import PeerFilterPanel from "@/components/report/PeerFilterPanel";
import {
  EMPTY_FILTER_SELECTIONS, hasActiveFilters, activeFilterCount, filterSelectionLabel,
  buildMockFilteredPool, type LpiFilterSelections,
} from "@/lib/lpi-filter-mock";

// ─── Percentile gauge ──────────────────────────────────────────────────────────

function PercentileGauge({ pool }: { pool: BenchmarkPool }) {
  const { min, max, q1, median, q3, managerValue } = pool;
  const range = max - min || 1;
  const toPct = (v: number) => Math.min(100, Math.max(0, ((v - min) / range) * 100));
  const q1Pct = toPct(q1), medianPct = toPct(median), q3Pct = toPct(q3), scorePct = toPct(managerValue);

  return (
    <div>
      {/* Score label above the marker */}
      <div className="relative h-5">
        <span
          className="absolute -translate-x-1/2 text-[13px] font-bold text-orange-500 tabular-nums"
          style={{ left: `${scorePct}%` }}
        >
          {managerValue.toFixed(2)}
        </span>
      </div>

      {/* Track */}
      <div className="relative" style={{ height: "16px" }}>
        <div className="absolute inset-y-0 left-0 right-0 my-auto h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-blue-600 rounded-full" style={{ width: `${q3Pct}%` }} />
        </div>
        {/* Median tick */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[2px] h-4 bg-slate-900"
          style={{ left: `${medianPct}%` }}
        />
        {/* Manager marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-md z-10"
          style={{ left: `${scorePct}%` }}
        />
      </div>

      {/* Q1 / Median / Q3 labels */}
      <div className="relative mt-1.5" style={{ height: "14px" }}>
        <span className="absolute -translate-x-1/2 text-[9.5px] text-slate-400 tabular-nums" style={{ left: `${q1Pct}%` }}>
          Q1 {q1.toFixed(2)}
        </span>
        <span className="absolute -translate-x-1/2 text-[9.5px] font-semibold text-slate-600 tabular-nums" style={{ left: `${medianPct}%` }}>
          Median {median.toFixed(2)}
        </span>
        <span className="absolute -translate-x-1/2 text-[9.5px] text-slate-400 tabular-nums" style={{ left: `${q3Pct}%` }}>
          Q3 {q3.toFixed(2)}
        </span>
      </div>

      {/* Range endpoints */}
      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 uppercase tracking-wider">
        <span>{min.toFixed(2)} · Low</span>
        <span className="font-semibold text-slate-500 normal-case tracking-normal">Relative LPI impact</span>
        <span>{max.toFixed(2)} · High</span>
      </div>
    </div>
  );
}

// ─── Main card ──────────────────────────────────────────────────────────────────

// Everything in this component reacts to the RT Universe / My Portfolio toggle
// (plus the stacked Geography / AUM Size / Asset Class / Workforce Size filter
// panel). Sections that always benchmark vs RT Universe regardless of the
// toggle — LpiSubComponentScores, EvennessScores — live in their own
// components instead.
export default function PeerBenchmarkComparison({
  org,
  benchmarkPools,
}: {
  org: InvitedOrg;
  benchmarkPools: { key: string; data: BenchmarkPool }[];
}) {
  const [poolKey, setPoolKey] = useState<"universe" | "portfolio">("universe");
  const [customFilters, setCustomFilters] = useState<LpiFilterSelections>(EMPTY_FILTER_SELECTIONS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const universePool  = benchmarkPools.find((p) => p.key === "universe")!.data;
  const portfolioPool = benchmarkPools.find((p) => p.key === "portfolio")!.data;

  const filtersActive = hasActiveFilters(customFilters);
  const filterCount = activeFilterCount(customFilters);

  const activePool: BenchmarkPool = filtersActive
    ? buildMockFilteredPool(org.lpiScore!, customFilters)
    : (poolKey === "universe" ? universePool : portfolioPool);

  const poolLabel = filtersActive
    ? filterSelectionLabel(customFilters)
    : poolKey === "universe" ? "RoundTables Universe (all organizations)" : "My Portfolio";

  function applyFilters(next: LpiFilterSelections) {
    setCustomFilters(next);
    setFiltersOpen(false);
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="max-w-2xl">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[16px] font-bold text-slate-800">Benchmarks</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white tracking-wide">
              ◆ RT-006
            </span>
            <div className="relative group inline-flex items-center">
              <Info size={14} className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
              <div className="absolute top-full left-0 mt-3 w-72 bg-[#0f1923] rounded-xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                <p className="text-[12.5px] text-slate-200 leading-relaxed">
                  Compares {org.name}&apos;s LPI score against a selected peer pool. Choose{" "}
                  <strong className="text-amber-400">RT Universe</strong> or{" "}
                  <strong className="text-amber-400">My Portfolio</strong> as the base, then use Filters to
                  narrow by Geography, AUM Size, Asset Class, or Workforce Size.
                </p>
              </div>
            </div>
          </div>
          <p className="text-[12.5px] text-slate-500 leading-relaxed mt-1">
            Where the LPI score of <strong className="text-slate-700">{org.lpiScore!.toFixed(2)}</strong>{" "}
            falls in the selected peer pool. Pick RT Universe or My Portfolio, then apply filters.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Universe / Portfolio toggle */}
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            {(["universe", "portfolio"] as const).map((k) => (
              <button
                key={k}
                onClick={() => { setPoolKey(k); setCustomFilters(EMPTY_FILTER_SELECTIONS); }}
                className={`px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  !filtersActive && poolKey === k ? "bg-[#0f1923] text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {k === "universe" ? "RT Universe" : "My Portfolio"}
              </button>
            ))}
          </div>

          {/* Filters */}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors ${
              filtersActive ? "border-[#00b8a9] text-[#00897b] bg-[#00b8a9]/5" : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {filtersActive && (
              <span className="w-4 h-4 rounded-full bg-[#00b8a9] text-white text-[9.5px] font-bold flex items-center justify-center">
                {filterCount}
              </span>
            )}
            <ChevronDown size={11} className={`text-slate-400 transition-transform duration-150 ${filtersOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-4">
          <PeerFilterPanel initial={customFilters} onApply={applyFilters} />
        </div>
      )}

      {/* Big percentile stat + gauge */}
      <div className="mt-5">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[32px] font-black leading-none tabular-nums" style={{ color: pctColor(activePool.managerPercentile) }}>
              {ordinal(activePool.managerPercentile)}
            </span>
            <span className="text-[13px] font-semibold text-slate-500">percentile</span>
            <span className="text-[12.5px] text-slate-400">vs. {poolLabel}</span>
          </div>
          <span className="text-[12px] text-slate-400">n = {activePool.n.toLocaleString()}</span>
        </div>

        <div className="mt-4">
          <PercentileGauge pool={activePool} />
        </div>

        <p className="text-[12px] text-slate-500 leading-relaxed mt-3">
          {ordinal(activePool.managerPercentile)} percentile — scores higher than{" "}
          {Math.max(0, activePool.managerPercentile - 1)}% of comparable organizations in the pool.{" "}
          n = {activePool.n.toLocaleString()} organizations with comparable data.
        </p>
      </div>
    </div>
  );
}
