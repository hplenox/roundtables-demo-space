"use client";

import { useState } from "react";
import { MapPin, Info } from "lucide-react";
import BenchmarkDistributionChart from "./BenchmarkDistributionChart";
import type { GeographyBenchmarks, OrgGeography, USRegion } from "@/types/survey";

const REGIONS: USRegion[] = ["Southeast", "Northeast", "South", "Midwest", "Northwest", "Southwest"];

type GeoView = USRegion | "usBased" | "country" | "city";
type PoolView = "universe" | "portfolio";

interface Props {
  geography: OrgGeography;
  benchmarks: GeographyBenchmarks;
  orgName: string;
}

function getDefaultView(geography: OrgGeography, benchmarks: GeographyBenchmarks): GeoView {
  if (geography.region && benchmarks.regions?.[geography.region]) return geography.region;
  if (benchmarks.usBased) return "usBased";
  return "country";
}

export default function GeographyBenchmarkWidget({ geography, benchmarks, orgName }: Props) {
  const [activeView, setActiveView] = useState<GeoView>(() => getDefaultView(geography, benchmarks));
  const [activePool, setActivePool] = useState<PoolView>("universe");

  const slice =
    REGIONS.includes(activeView as USRegion)
      ? benchmarks.regions?.[activeView as USRegion]
      : activeView === "usBased" ? benchmarks.usBased
      : activeView === "country"  ? benchmarks.country
      : benchmarks.city;

  const pool = slice?.[activePool];

  const viewLabel =
    REGIONS.includes(activeView as USRegion) ? `${activeView} Region` :
    activeView === "usBased" ? (geography.isUSBased ? "U.S.-Based managers" : "non-U.S. managers") :
    activeView === "country" ? geography.country :
    `${geography.city ?? ""}${geography.state ? `, ${geography.state}` : ""}`;

  const pctColor = pool && !pool.insufficientData
    ? pool.managerPercentile >= 70 ? "#059669"
    : pool.managerPercentile >= 40 ? "#b45309"
    : "#dc2626"
    : "#94a3b8";

  return (
    <div>
      {/* Header: location context + pool toggle */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={11} className="text-slate-400 shrink-0" />
          <span className="text-[11.5px] text-slate-500 truncate">
            {[geography.city, geography.state, geography.country].filter(Boolean).join(", ")}
            {geography.region ? ` · ${geography.region} Region` : ""}
          </span>
        </div>
        {/* Universe / Portfolio segmented control */}
        <div className="flex shrink-0 rounded-lg border border-slate-200 overflow-hidden">
          {(["universe", "portfolio"] as PoolView[]).map((p) => (
            <button
              key={p}
              onClick={() => setActivePool(p)}
              className={`px-3 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                activePool === p
                  ? "bg-[#0f1923] text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {p === "universe" ? "Universe" : "Portfolio"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab row */}
      <div className="flex items-center gap-1 flex-wrap mb-4">
        {REGIONS.map((region) => {
          if (!benchmarks.regions?.[region]) return null;
          const isHome = region === geography.region;
          const isActive = activeView === region;
          return (
            <button
              key={region}
              onClick={() => setActiveView(region)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all border ${
                isActive
                  ? "bg-[#0f1923] text-white border-[#0f1923]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isHome && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4361ee] shrink-0" />
              )}
              {region}
            </button>
          );
        })}

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        {benchmarks.usBased && (
          <button
            onClick={() => setActiveView("usBased")}
            className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all border ${
              activeView === "usBased"
                ? "bg-[#0f1923] text-white border-[#0f1923]"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            U.S.-Based
          </button>
        )}
        {benchmarks.country && (
          <button
            onClick={() => setActiveView("country")}
            className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all border ${
              activeView === "country"
                ? "bg-[#0f1923] text-white border-[#0f1923]"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {geography.country}
          </button>
        )}
        {benchmarks.city && geography.city && (
          <button
            onClick={() => setActiveView("city")}
            className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all border ${
              activeView === "city"
                ? "bg-[#0f1923] text-white border-[#0f1923]"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {geography.city}{geography.state ? `, ${geography.state}` : ""}
          </button>
        )}
      </div>

      {/* Chart area */}
      {pool?.insufficientData ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 px-6 py-8 flex flex-col items-center text-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
            <Info size={14} className="text-amber-500" />
          </div>
          <p className="text-[12px] font-semibold text-slate-700">Insufficient Data</p>
          <p className="text-[11.5px] text-slate-500 leading-relaxed max-w-[260px]">
            Unfortunately, we do not have enough managers within this benchmark to display anything
            meaningful at the moment.
          </p>
          {pool.n > 0 && (
            <p className="text-[10px] text-slate-400 font-medium">n = {pool.n} organization{pool.n !== 1 ? "s" : ""}</p>
          )}
        </div>
      ) : pool ? (
        <div>
          {/* Percentile headline */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[28px] font-black tabular-nums leading-none" style={{ color: pctColor }}>
                {pool.managerPercentile}
              </span>
              <span className="text-[13px] font-bold" style={{ color: pctColor }}>th percentile</span>
              <span className="text-[11.5px] text-slate-400">vs. {viewLabel}</span>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">n = {pool.n.toLocaleString()}</span>
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
      ) : null}
    </div>
  );
}
