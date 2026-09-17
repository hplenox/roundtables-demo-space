"use client";

import { Info } from "lucide-react";
import type { InvitedOrg, LpiSubMetric } from "@/types/survey";
import ScoreTile from "@/components/report/ScoreTile";

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

// This section always benchmarks vs the RT Universe — it does not shift with
// the Portfolio/RT Universe toggle in PeerBenchmarkComparison.
export default function LpiSubComponentScores({ org }: { org: InvitedOrg }) {
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
        <ScoreTile label="LPI Prime"      rawScore={primeAll.rawScore}     percentile={primeAll.percentile} />
        <ScoreTile label="Prime · Gender" rawScore={primeGender.rawScore}  percentile={primeGender.percentile} />
        <ScoreTile label="Prime · Racial" rawScore={primeRacial.rawScore}  percentile={primeRacial.percentile} />
        <ScoreTile label="LPI Ownership"  rawScore={ownershipAll.rawScore} percentile={ownershipAll.percentile} />
        <ScoreTile label="LPI · Gender"   rawScore={genderFull.rawScore}   percentile={genderFull.percentile} />
        <ScoreTile label="LPI · Racial"   rawScore={racialFull.rawScore}   percentile={racialFull.percentile} />
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
        The combined LPI percentile is not the average of sub-score percentiles — each is ranked against
        its own distribution. Sub-scores are diagnostic; the combined LPI is the summary peer-benchmarking metric.
      </p>
    </div>
  );
}
