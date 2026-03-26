"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { LpiSubComponents, LpiDimension } from "@/types/survey";

// ─── Single solid bar (overall) ───────────────────────────────────────────────
function SolidBar({
  rawScore, maxScore, color, animate,
}: {
  rawScore: number; maxScore: number; color: string; animate: boolean;
}) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const noData  = rawScore === 0 && maxScore > 0;

  useEffect(() => {
    if (!svgRef.current || !wrapRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W  = wrapRef.current.clientWidth || 400;
    const H  = 22;
    const bH = 10;
    const y0 = (H - bH) / 2;
    const rx = bH / 2;

    svg.append("rect")
      .attr("x", 0).attr("y", y0)
      .attr("width", W).attr("height", bH)
      .attr("rx", rx).attr("fill", "#f1f5f9");

    if (noData) {
      svg.append("text")
        .attr("x", 6).attr("y", H / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "9px").attr("fill", "#cbd5e1")
        .attr("font-family", "inherit")
        .text("No data reported");
      return;
    }

    const fillW = Math.max(bH, (rawScore / maxScore) * W);
    const clipId = `solid-${Math.random().toString(36).slice(2)}`;
    const defs = svg.append("defs");

    defs.append("clipPath").attr("id", clipId)
      .append("rect")
      .attr("x", 0).attr("y", y0)
      .attr("width", 0).attr("height", bH).attr("rx", rx)
      .transition().duration(animate ? 750 : 0).ease(d3.easeCubicOut)
      .attr("width", fillW);

    svg.append("rect")
      .attr("x", 0).attr("y", y0)
      .attr("width", W).attr("height", bH)
      .attr("rx", rx).attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

  }, [rawScore, maxScore, color, animate, noData]);

  return (
    <div ref={wrapRef} className="flex-1">
      <svg ref={svgRef} width="100%" height={22} style={{ display: "block", overflow: "visible" }} />
    </div>
  );
}

// ─── Dimension detail card ────────────────────────────────────────────────────
function DimensionCard({ dim }: { dim: LpiDimension }) {
  const rows = [
    { label: "Ownership",  m: dim.ownership  },
    { label: "Leadership", m: dim.leadership },
    { label: "Workforce",  m: dim.workforce  },
  ];
  const totalScore = dim.ownership.rawScore + dim.leadership.rawScore + dim.workforce.rawScore;
  const totalMax   = dim.ownership.maxScore  + dim.leadership.maxScore  + dim.workforce.maxScore;

  return (
    <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden" style={{ borderTopWidth: 3, borderTopColor: dim.color }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dim.color }} />
          <p className="text-[13px] font-bold text-slate-800">{dim.dimension} Impact</p>
        </div>
      </div>

      {/* Sub-metric rows */}
      <div className="divide-y divide-slate-50">
        {rows.map(({ label, m }) => {
          const pct    = m.maxScore > 0 ? (m.rawScore / m.maxScore) * 100 : 0;
          const noData = m.rawScore === 0 && m.percentile === null;
          return (
            <div key={label} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-semibold text-slate-600">{label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    {m.rawScore.toFixed(2)}/{m.maxScore.toFixed(2)}
                  </span>
                  <span
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color: noData ? "#cbd5e1" : dim.color }}
                  >
                    {noData ? "—" : `${m.percentile}%tile`}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                {!noData && (
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: dim.color, opacity: pct === 0 ? 0.2 : 1 }}
                  />
                )}
              </div>
              {noData && <p className="text-[9.5px] text-slate-300 mt-0.5">No data reported</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main section export ──────────────────────────────────────────────────────
export default function LpiSubComponentsSection({
  data,
  orgName,
}: {
  data: LpiSubComponents;
  orgName?: string;
}) {
  const gender = data.dimensions.find(d => d.dimension === "Gender")!;
  const racial = data.dimensions.find(d => d.dimension === "Racial")!;

  const categories = [
    { label: "Ownership",  overall: data.overall.ownership  },
    { label: "Leadership", overall: data.overall.leadership },
    { label: "Workforce",  overall: data.overall.workforce  },
  ];

  return (
    <div className="space-y-4">

      {/* 1 ── OVERALL TABLE ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">
            LPI Score Sub-Components · Overall
          </span>
        </div>

        <div className="px-6">
          {/* Column headers */}
          <div className="grid grid-cols-[150px_1fr_60px] gap-4 items-center py-2 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Low</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">← Relative DEI Impact →</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">High</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Max</p>
          </div>

          {categories.map(({ label, overall }, i) => (
            <div
              key={label}
              className={`grid grid-cols-[150px_1fr_60px] gap-4 items-center py-3.5 ${i < categories.length - 1 ? "border-b border-slate-50" : ""}`}
            >
              <div>
                <p className="text-[12.5px] font-semibold text-slate-700">{label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] text-slate-400 tabular-nums">
                    {overall.rawScore.toFixed(2)} / {overall.maxScore.toFixed(2)}
                  </p>
                  <span className="text-[11px] font-bold tabular-nums text-indigo-500">
                    {overall.rawScore === 0 ? "—" : `${overall.percentile}%`}
                  </span>
                </div>
              </div>
              <SolidBar
                rawScore={overall.rawScore}
                maxScore={overall.maxScore}
                color="#6366f1"
                animate={true}
              />
              <div className="text-right">
                <span className="text-[11px] text-slate-400 tabular-nums">/{overall.maxScore.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2 ── DIMENSION CARDS (Gender + Racial side by side) ────────────── */}
      <div className="flex gap-4">
        <DimensionCard dim={gender} />
        <DimensionCard dim={racial} />
      </div>

      {/* 3 ── PEER GROUP COMPARISONS ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">
            Impact Relative to Peer Groups
          </span>
        </div>
        <div className="px-6 pt-2 pb-1">
          <div className="grid grid-cols-[190px_1fr_60px] gap-4 items-center py-2 border-b border-slate-100 mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peer Group</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">← Relative Performance →</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">%ile</p>
          </div>
          {data.peerGroups.map((pg) => {
            const pct      = pg.percentile ?? 0;
            const barColor = pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
            return (
              <div key={pg.label} className="grid grid-cols-[190px_1fr_60px] gap-4 items-center py-3 border-b border-slate-50 last:border-0">
                <p className="text-[12px] font-semibold text-slate-700">{pg.label}</p>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  {pg.percentile !== null && (
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  )}
                </div>
                <p className="text-[12px] font-bold tabular-nums text-right" style={{ color: pg.percentile !== null ? barColor : "#cbd5e1" }}>
                  {pg.percentile !== null ? `${pg.percentile}%` : "—"}
                </p>
              </div>
            );
          })}
        </div>
        <p className="px-6 py-3 text-[11px] text-slate-400 border-t border-slate-50 leading-relaxed">
          Peer group bars compare this manager's LPI score within a narrower cohort filtered by AUM range
          or HQ geography. Smaller sample sizes may increase ranking volatility.
        </p>
      </div>

    </div>
  );
}
