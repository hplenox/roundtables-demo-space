"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface LpiGaugeProps {
  score: number; // 0-10
  version?: string;
}

export default function LpiGaugeBar({ score, version = "v3.1" }: LpiGaugeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = svgRef.current.clientWidth || 800;
    const H = 72;
    const paddingX = 24;
    const barY = 28;
    const barH = 20;
    const barW = W - paddingX * 2;

    // Gradient stops: 0=red, 5=amber, 7=yellow-green, 10=teal
    const defs = svg.append("defs");
    const grad = defs.append("linearGradient")
      .attr("id", "lpi-grad")
      .attr("x1", "0%").attr("x2", "100%");
    const stops = [
      { offset: "0%",   color: "#ef4444" },
      { offset: "35%",  color: "#f97316" },
      { offset: "55%",  color: "#eab308" },
      { offset: "72%",  color: "#84cc16" },
      { offset: "100%", color: "#00b8a9" },
    ];
    stops.forEach(s => grad.append("stop").attr("offset", s.offset).attr("stop-color", s.color));

    // Track background
    svg.append("rect")
      .attr("x", paddingX).attr("y", barY)
      .attr("width", barW).attr("height", barH)
      .attr("rx", barH / 2)
      .attr("fill", "#f1f5f9");

    // Filled portion
    const fillW = (score / 10) * barW;
    const clipId = "lpi-clip";
    defs.append("clipPath").attr("id", clipId)
      .append("rect")
      .attr("x", paddingX).attr("y", barY)
      .attr("width", 0).attr("height", barH)
      .attr("rx", barH / 2)
      .transition().duration(900).ease(d3.easeCubicOut)
      .attr("width", fillW);

    svg.append("rect")
      .attr("x", paddingX).attr("y", barY)
      .attr("width", barW).attr("height", barH)
      .attr("rx", barH / 2)
      .attr("fill", "url(#lpi-grad)")
      .attr("clip-path", `url(#${clipId})`);

    // Zone tick marks at 0,2,4,6,8,10
    [0, 2, 4, 6, 8, 10].forEach(v => {
      const x = paddingX + (v / 10) * barW;
      svg.append("line")
        .attr("x1", x).attr("x2", x)
        .attr("y1", barY + barH + 3).attr("y2", barY + barH + 7)
        .attr("stroke", "#cbd5e1").attr("stroke-width", 1);
      svg.append("text")
        .attr("x", x).attr("y", barY + barH + 17)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#94a3b8")
        .attr("font-family", "inherit")
        .text(v);
    });

    // Score marker pin
    const markerX = paddingX + (score / 10) * barW;
    svg.append("circle")
      .attr("cx", markerX).attr("cy", barY + barH / 2)
      .attr("r", 0)
      .attr("fill", "white")
      .attr("stroke", "#0f1923")
      .attr("stroke-width", 2.5)
      .transition().delay(700).duration(300)
      .attr("r", 10);

    svg.append("text")
      .attr("x", markerX).attr("y", barY + barH / 2 + 1)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "8.5px")
      .attr("font-weight", "700")
      .attr("fill", "#0f1923")
      .attr("font-family", "inherit")
      .attr("opacity", 0)
      .text(score.toFixed(1))
      .transition().delay(900).duration(200)
      .attr("opacity", 1);

  }, [score]);

  // Color for score badge
  const scoreColor = score >= 8 ? "#00897b" : score >= 6.5 ? "#b45309" : "#dc2626";
  const scoreLabel = score >= 8 ? "Strong" : score >= 6.5 ? "Developing" : "Emerging";

  return (
    <div className="w-full">
      {/* Score label row */}
      <div className="flex items-end justify-between mb-3 px-6 pt-5">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            LPI Score · {version}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-[42px] font-bold leading-none tabular-nums" style={{ color: scoreColor }}>
              {score.toFixed(1)}
            </span>
            <span className="text-[15px] text-slate-400 font-medium">/10</span>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
              style={{ color: scoreColor, borderColor: scoreColor + "40", backgroundColor: scoreColor + "10" }}
            >
              {scoreLabel}
            </span>
          </div>
        </div>
        <div className="text-right pr-1 pb-1">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Scale</p>
          <div className="flex items-center gap-1.5">
            {[
              { label: "Emerging", color: "#ef4444" },
              { label: "Developing", color: "#eab308" },
              { label: "Strong", color: "#00b8a9" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* D3 bar */}
      <div className="px-3 pb-4">
        <svg
          ref={svgRef}
          width="100%"
          height={72}
          style={{ display: "block", overflow: "visible" }}
        />
      </div>
    </div>
  );
}
