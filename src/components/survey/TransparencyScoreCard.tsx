"use client";

import { Info, ShieldCheck } from "lucide-react";
import type { Survey } from "@/types/survey";
import {
  computeTransparencyScore, transparencyBand, allPlatformTransparencyScores, transparencyPercentile,
} from "@/lib/transparency-score";
import RadialScoreGauge from "@/components/survey/RadialScoreGauge";
import TransparencyBenchmarkStrip from "@/components/survey/TransparencyBenchmarkStrip";

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

function BreakdownMeter({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "#00897b" : value >= 40 ? "#b45309" : "#dc2626";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11.5px] text-slate-500">{label}</p>
        <p className="text-[11.5px] font-bold tabular-nums" style={{ color }}>{value}</p>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function TransparencyScoreCard({ survey }: { survey: Survey }) {
  const breakdown = computeTransparencyScore(survey);
  const band = transparencyBand(breakdown.score);
  const allScores = allPlatformTransparencyScores();
  const percentile = transparencyPercentile(breakdown.score, allScores);
  const better = allScores.filter((p) => p.score < breakdown.score).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-1.5 mb-4">
        <ShieldCheck size={14} className="text-[#00b8a9]" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Transparency Score</p>
        <div className="relative group inline-flex items-center">
          <Info size={12} className="text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
          <div className="absolute top-full left-0 mt-3 w-72 bg-[#0f1923] rounded-xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
            <p className="text-[12.5px] text-slate-200 leading-relaxed">
              Composite 0–100 score for how this survey&apos;s host measures up on disclosure to
              participants, response rate, and follow-through — benchmarked against every survey hosted
              on the platform.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Radial gauge + status */}
        <div className="flex items-center gap-5 shrink-0">
          <RadialScoreGauge score={breakdown.score} color={band.color} />
          <div>
            <p className="text-[14px] font-bold" style={{ color: band.color }}>{band.label}</p>
            <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed max-w-[220px]">
              More transparent than <strong className="text-slate-700">{better} of {allScores.length}</strong>{" "}
              surveys hosted on the platform — <strong className="text-slate-700">{ordinal(percentile)} percentile</strong>.
            </p>
          </div>
        </div>

        {/* Breakdown meters */}
        <div className="flex-1 min-w-[220px] space-y-3 lg:border-l lg:border-slate-100 lg:pl-6">
          <BreakdownMeter label="Disclosure level" value={breakdown.disclosureScore} />
          <BreakdownMeter label="Response rate" value={breakdown.responseRateScore} />
          <BreakdownMeter label="Completion follow-through" value={breakdown.followThroughScore} />
        </div>
      </div>

      <div className="border-t border-slate-100 mt-5 pt-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          vs. all surveys on the platform
        </p>
        <TransparencyBenchmarkStrip
          allScores={allScores}
          currentSurveyId={survey.id}
          currentHostOrg={survey.hostOrg}
          currentScore={breakdown.score}
          color={band.color}
        />
      </div>
    </div>
  );
}
