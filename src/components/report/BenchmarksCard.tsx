"use client";

import { useState } from "react";
import {
  Info, Eye, SlidersHorizontal, Check, HeartHandshake, PartyPopper,
} from "lucide-react";
import type { InvitedOrg, BenchmarkPool, LpiSubMetric } from "@/types/survey";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const r = n % 100;
  if (r >= 11 && r <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function pctColor(p: number | null): string {
  if (p === null) return "#94a3b8";
  return p >= 70 ? "#059669" : p >= 40 ? "#b45309" : "#dc2626";
}

const EMPTY_METRIC: LpiSubMetric = { label: "", rawScore: 0, maxScore: 0, percentile: null };

/** Sums raw/max across sub-metrics and derives a max-weighted average percentile. */
function combine(...metrics: LpiSubMetric[]) {
  const rawScore = metrics.reduce((s, m) => s + m.rawScore, 0);
  const maxScore = metrics.reduce((s, m) => s + m.maxScore, 0);
  const scored = metrics.filter((m) => m.percentile !== null);
  const wMax = scored.reduce((s, m) => s + m.maxScore, 0);
  const percentile = scored.length === 0
    ? null
    : Math.round(scored.reduce((s, m) => s + m.percentile! * m.maxScore, 0) / (wMax || 1));
  return { rawScore, maxScore, percentile };
}

// A small deterministic placeholder count for the Encourage/Congratulate badge —
// this is a UI affordance only (no backend), seeded so it stays stable per tile/render.
function seedCount(seed: number, percentile: number | null): number {
  if (percentile === null) return 0;
  return ((Math.round(percentile) * (seed * 7 + 3)) % 17) + 2;
}

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

// ─── Score tile (LPI sub-component / Evenness) ─────────────────────────────────

function ScoreTile({
  label, rawScore, percentile, seed,
}: {
  label: string; rawScore: number; percentile: number | null; seed: number;
}) {
  const [count, setCount] = useState(() => seedCount(seed, percentile));
  const isTop = (percentile ?? 0) >= 75;
  const color = pctColor(percentile);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 pt-3.5 pb-3 flex flex-col">
      <p className="text-[10.5px] font-semibold text-slate-500 mb-1 leading-tight">{label}</p>
      <p className="text-[20px] font-bold text-slate-900 leading-none tabular-nums mb-1">
        {rawScore.toFixed(2)}
      </p>
      <p className="text-[11.5px] font-bold mb-2 tabular-nums" style={{ color }}>
        {percentile === null ? "—" : ordinal(percentile)}
      </p>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
        {percentile !== null && (
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentile}%`, backgroundColor: color }} />
        )}
      </div>
      <button
        disabled={percentile === null}
        onClick={() => setCount((c) => c + 1)}
        className={`mt-auto flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1 rounded-lg transition-colors ${
          percentile === null
            ? "text-slate-300 cursor-default"
            : isTop
              ? "text-emerald-600 hover:bg-emerald-50"
              : "text-violet-600 hover:bg-violet-50"
        }`}
      >
        {percentile !== null && (isTop ? <PartyPopper size={12} /> : <HeartHandshake size={12} />)}
        {percentile === null ? "No data" : `${isTop ? "Congratulate" : "Encourage"} (${count})`}
      </button>
    </div>
  );
}

// Illustrative placeholder data — Evenness is a demo-only, non-per-org metric
// throughout this dashboard (see EvennessSection), so these tiles mirror that.
const EVENNESS_TILES: Array<{ label: string; score: number; percentile: number }> = [
  { label: "Evenness Prime",    score: 1.85, percentile: 78 },
  { label: "Prime · Gender",    score: 0.67, percentile: 52 },
  { label: "Prime · Racial",    score: 1.18, percentile: 92 },
  { label: "Evenness Own.",     score: 1.07, percentile: 81 },
  { label: "Evenness · Gender", score: 0.58, percentile: 68 },
  { label: "Evenness · Racial", score: 0.96, percentile: 90 },
];

// ─── Main card ──────────────────────────────────────────────────────────────────

type FilterKey = "assetClass" | "geography" | "aum";

export default function BenchmarksCard({
  org,
  benchmarkPools,
}: {
  org: InvitedOrg;
  benchmarkPools: { key: string; data: BenchmarkPool }[];
}) {
  const [poolKey, setPoolKey] = useState<"universe" | "portfolio">("universe");
  const [filterKey, setFilterKey] = useState<FilterKey | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const universePool  = benchmarkPools.find((p) => p.key === "universe")!.data;
  const portfolioPool = benchmarkPools.find((p) => p.key === "portfolio")!.data;
  const assetClassPool = benchmarkPools.find((p) => p.key === "assetClass")!.data;

  const geoSlice = org.geographyBenchmarks
    ? [org.geographyBenchmarks.city, org.geographyBenchmarks.country, org.geographyBenchmarks.usBased, ...Object.values(org.geographyBenchmarks.regions ?? {})]
        .find((s) => s && !s.universe.insufficientData && !s.universe.comingSoon)
    : undefined;
  const geoPool = geoSlice?.universe;

  const aumSlice = org.aumBenchmarks?.brackets?.[org.aumBenchmarks.managerBracket];
  const aumPool = aumSlice && !aumSlice.universe.insufficientData ? aumSlice.universe : undefined;

  const filterOptions: Array<{ key: FilterKey; label: string; pool?: BenchmarkPool }> = [
    { key: "assetClass", label: "Asset Class", pool: !assetClassPool.comingSoon ? assetClassPool : undefined },
    { key: "geography",  label: "Geography",   pool: geoPool },
    { key: "aum",        label: "AUM Bracket",  pool: aumPool },
  ];

  const activeFilter = filterKey ? filterOptions.find((f) => f.key === filterKey) : undefined;
  const activePool: BenchmarkPool = activeFilter?.pool
    ?? (poolKey === "universe" ? universePool : portfolioPool);

  const poolLabel = activeFilter?.pool
    ? `${activeFilter.label}: ${activeFilter.pool.label}`
    : poolKey === "universe" ? "RoundTables Universe (all organizations)" : "My Portfolio";

  // ── LPI sub-component tiles, computed from real org data ──────────────────
  const sub = org.lpiSubComponents;
  const gender = sub?.dimensions.find((d) => d.dimension === "Gender");
  const racial = sub?.dimensions.find((d) => d.dimension === "Racial");

  const primeAll    = sub ? combine(sub.overall.leadership, sub.overall.workforce) : combine(EMPTY_METRIC, EMPTY_METRIC);
  const primeGender = gender ? combine(gender.leadership, gender.workforce) : combine(EMPTY_METRIC, EMPTY_METRIC);
  const primeRacial = racial ? combine(racial.leadership, racial.workforce) : combine(EMPTY_METRIC, EMPTY_METRIC);
  const ownershipAll = sub?.overall.ownership ?? EMPTY_METRIC;
  const genderFull  = gender ? combine(gender.ownership, gender.leadership, gender.workforce) : combine(EMPTY_METRIC, EMPTY_METRIC, EMPTY_METRIC);
  const racialFull  = racial ? combine(racial.ownership, racial.leadership, racial.workforce) : combine(EMPTY_METRIC, EMPTY_METRIC, EMPTY_METRIC);

  return (
    <div className="space-y-5">

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
                  <strong className="text-amber-400">My Portfolio</strong> as the base, then stack an
                  Asset Class, Geography, or AUM filter to narrow the comparison further.
                </p>
              </div>
            </div>
          </div>
          <p className="text-[12.5px] text-slate-500 leading-relaxed mt-1">
            Where the LPI score of <strong className="text-slate-700">{org.lpiScore!.toFixed(2)}</strong>{" "}
            falls in the selected peer pool. Pick RT Universe or My Portfolio, then stack filters and apply.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Universe / Portfolio toggle */}
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            {(["universe", "portfolio"] as const).map((k) => (
              <button
                key={k}
                onClick={() => { setPoolKey(k); setFilterKey(null); }}
                className={`px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  !filterKey && poolKey === k ? "bg-[#0f1923] text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {k === "universe" ? "RT Universe" : "My Portfolio"}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="relative">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors ${
                filterKey ? "border-[#00b8a9] text-[#00897b] bg-[#00b8a9]/5" : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={13} />
              Filters
              {filterKey && <span className="w-1.5 h-1.5 rounded-full bg-[#00b8a9]" />}
            </button>

            {filtersOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFiltersOpen(false)} />
                <div className="absolute right-0 top-9 z-50 w-64 bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stack a filter</p>
                  </div>
                  <div className="py-1">
                    {filterOptions.map((f) => (
                      <button
                        key={f.key}
                        disabled={!f.pool}
                        onClick={() => { setFilterKey(f.key); setFiltersOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[12.5px] transition-colors ${
                          !f.pool ? "text-slate-300 cursor-not-allowed" :
                          filterKey === f.key ? "bg-[#00b8a9]/8 text-[#00897b] font-semibold" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{f.label}</span>
                        {filterKey === f.key ? <Check size={13} /> : !f.pool && <span className="text-[9.5px]">Not mapped</span>}
                      </button>
                    ))}
                  </div>
                  {filterKey && (
                    <button
                      onClick={() => { setFilterKey(null); setFiltersOpen(false); }}
                      className="w-full text-center px-4 py-2 text-[11.5px] font-semibold text-slate-400 hover:text-slate-600 border-t border-slate-100"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Allocator view line */}
      <div className="flex items-center gap-2 -mt-2.5">
        <Eye size={13} className="text-violet-500 shrink-0" />
        <p className="text-[12px] text-violet-600">
          <strong>Allocator view</strong> — recognize top-quartile strengths or encourage weaker areas
          straight from the score tiles below.
        </p>
      </div>

      {/* Big percentile stat + gauge */}
      <div>
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

      <div className="border-t border-slate-100" />

      {/* LPI sub-component scores */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[13.5px] font-bold text-slate-800">LPI sub-component scores</h3>
            <span className="text-[11px] text-slate-400">· vs RT Universe</span>
            <div className="relative group inline-flex items-center">
              <Info size={13} className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
              <div className="absolute top-full left-0 mt-3 w-72 bg-[#0f1923] rounded-xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                <p className="text-[12.5px] text-slate-200 leading-relaxed">
                  <strong className="text-amber-400">Prime</strong> combines the Leadership + Workforce
                  sub-scores. <strong className="text-amber-400">LPI Gender / Racial</strong> combine all
                  three tiers (Ownership + Leadership + Workforce) for that dimension.
                </p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Prime = workforce + leadership · LPI Gender / Racial = full composite by dimension
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <ScoreTile label="LPI Prime"      rawScore={primeAll.rawScore}     percentile={primeAll.percentile}     seed={1} />
          <ScoreTile label="Prime · Gender" rawScore={primeGender.rawScore}  percentile={primeGender.percentile}  seed={2} />
          <ScoreTile label="Prime · Racial" rawScore={primeRacial.rawScore}  percentile={primeRacial.percentile}  seed={3} />
          <ScoreTile label="LPI Ownership"  rawScore={ownershipAll.rawScore} percentile={ownershipAll.percentile} seed={4} />
          <ScoreTile label="LPI · Gender"   rawScore={genderFull.rawScore}   percentile={genderFull.percentile}   seed={5} />
          <ScoreTile label="LPI · Racial"   rawScore={racialFull.rawScore}   percentile={racialFull.percentile}   seed={6} />
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
          The combined LPI percentile is not the average of sub-score percentiles — each is ranked against
          its own distribution. Sub-scores are diagnostic; the combined LPI is the summary peer-benchmarking metric.
        </p>
      </div>

      <div className="border-t border-slate-100" />

      {/* Evenness scores */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[13.5px] font-bold text-slate-800">Evenness scores</h3>
            <span className="text-[11px] text-slate-400">· vs RT Universe</span>
          </div>
          <p className="text-[11px] text-slate-400">Anti-concentration: balance across groups, not just presence</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {EVENNESS_TILES.map((t, i) => (
            <ScoreTile key={t.label} label={t.label} rawScore={t.score} percentile={t.percentile} seed={10 + i} />
          ))}
        </div>
      </div>

    </div>
  );
}
