"use client";

import { useState } from "react";
import { TrendingUp, Info } from "lucide-react";
import BenchmarkDistributionChart from "./BenchmarkDistributionChart";
import type { AumBenchmarks, AumBracket } from "@/types/survey";

const BRACKETS: AumBracket[] = ["<$1B", "$1B–$5B", "$5B–$25B", "$25B–$100B", "$100B+"];

type PoolView = "universe" | "portfolio";

interface Props {
  aum: string;
  benchmarks: AumBenchmarks;
}

export default function AumBenchmarkWidget({ aum, benchmarks }: Props) {
  const [activeBracket, setActiveBracket] = useState<AumBracket>(benchmarks.managerBracket);
  const [activePool, setActivePool] = useState<PoolView>("universe");

  const slice = benchmarks.brackets[activeBracket];
  const pool = slice?.[activePool];

  const pctColor = pool && !pool.insufficientData
    ? pool.managerPercentile >= 70 ? "#059669"
    : pool.managerPercentile >= 40 ? "#b45309"
    : "#dc2626"
    : "#94a3b8";

  return (
    <div>
      {/* Header: AUM context + pool toggle */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <TrendingUp size={11} className="text-slate-400 shrink-0" />
          <span className="text-[11.5px] text-slate-500 truncate">
            AUM: {aum} · {benchmarks.managerBracket} bracket
          </span>
        </div>
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

      {/* Bracket tab row */}
      <div className="flex items-center gap-1 flex-wrap mb-4">
        {BRACKETS.map((bracket) => {
          if (!benchmarks.brackets[bracket]) return null;
          const isHome = bracket === benchmarks.managerBracket;
          const isActive = activeBracket === bracket;
          return (
            <button
              key={bracket}
              onClick={() => setActiveBracket(bracket)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all border ${
                isActive
                  ? "bg-[#0f1923] text-white border-[#0f1923]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isHome && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b8a9] shrink-0" />
              )}
              {bracket}
            </button>
          );
        })}
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
              <span className="text-[11.5px] text-slate-400">vs. {activeBracket} managers</span>
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
