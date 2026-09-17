"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { PlatformSurveyScore } from "@/lib/transparency-score";

interface TransparencyBenchmarkStripProps {
  allScores: PlatformSurveyScore[];
  currentSurveyId: string;
  currentHostOrg: string;
  currentScore: number;
  color: string;
}

export default function TransparencyBenchmarkStrip({
  allScores, currentSurveyId, currentHostOrg, currentScore, color,
}: TransparencyBenchmarkStripProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; text: string }>({
    visible: false, x: 0, y: 0, text: "",
  });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = containerRef.current.clientWidth || 500;
    const padL = 20;
    const padR = 20;
    const trackY = 36;

    const xScale = d3.scaleLinear().domain([0, 100]).range([padL, W - padR]);
    const sorted = [...allScores.map((p) => p.score)].sort((a, b) => a - b);
    const quantile = (q: number) => d3.quantileSorted(sorted, q) ?? 0;
    const q1 = quantile(0.25);
    const med = quantile(0.5);
    const q3 = quantile(0.75);

    // Background track
    svg.append("line")
      .attr("x1", padL).attr("x2", W - padR)
      .attr("y1", trackY).attr("y2", trackY)
      .attr("stroke", "#e2e8f0").attr("stroke-width", 3).attr("stroke-linecap", "round");

    // Quartile guide lines
    [
      { v: q1, label: `Q1 ${q1}` },
      { v: med, label: `Median ${med}` },
      { v: q3, label: `Q3 ${q3}` },
    ].forEach(({ v, label }) => {
      const x = xScale(v);
      svg.append("line")
        .attr("x1", x).attr("x2", x)
        .attr("y1", trackY - 10).attr("y2", trackY + 10)
        .attr("stroke", "#94a3b8").attr("stroke-width", 1).attr("stroke-dasharray", "2,2");
      svg.append("text")
        .attr("x", x).attr("y", trackY + 22)
        .attr("text-anchor", "middle")
        .attr("font-size", "8.5px").attr("fill", "#94a3b8")
        .attr("font-family", "inherit")
        .text(label);
    });

    // Axis endpoints
    svg.append("text")
      .attr("x", padL).attr("y", trackY - 16)
      .attr("font-size", "8.5px").attr("fill", "#cbd5e1")
      .attr("font-family", "inherit")
      .text("0");
    svg.append("text")
      .attr("x", W - padR).attr("y", trackY - 16)
      .attr("text-anchor", "end")
      .attr("font-size", "8.5px").attr("fill", "#cbd5e1")
      .attr("font-family", "inherit")
      .text("100");

    // Peer dots
    const peers = allScores.filter((p) => p.surveyId !== currentSurveyId);
    svg.selectAll(".peer-dot")
      .data(peers)
      .enter()
      .append("circle")
      .attr("class", "peer-dot")
      .attr("cx", (d) => xScale(d.score))
      .attr("cy", trackY)
      .attr("r", 0)
      .attr("fill", "#00b8a9")
      .attr("fill-opacity", 0.35)
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("cursor", "pointer")
      .on("mouseenter", function (_event, d) {
        const cx = xScale(d.score);
        setTooltip({ visible: true, x: cx, y: trackY, text: `${d.hostOrg} · ${d.score}` });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, visible: false })))
      .transition().duration(600).ease(d3.easeCubicOut)
      .attr("r", 5);

    // Current-survey marker
    const curX = xScale(currentScore);
    const markerGroup = svg.append("g")
      .attr("cursor", "pointer")
      .on("mouseenter", () => setTooltip({ visible: true, x: curX, y: trackY, text: `${currentHostOrg} · ${currentScore} (this survey)` }))
      .on("mouseleave", () => setTooltip((t) => ({ ...t, visible: false })));

    markerGroup.append("circle")
      .attr("cx", curX).attr("cy", trackY)
      .attr("r", 0)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 2.5)
      .transition().delay(500).duration(350).ease(d3.easeCubicOut)
      .attr("r", 8);

    // Persistent callout label above the current marker
    svg.append("text")
      .attr("x", curX).attr("y", trackY - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px").attr("font-weight", "700")
      .attr("fill", color)
      .attr("font-family", "inherit")
      .attr("opacity", 0)
      .text(`This survey · ${currentScore}`)
      .transition().delay(700).duration(250)
      .attr("opacity", 1);

  }, [allScores, currentSurveyId, currentHostOrg, currentScore, color]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} width="100%" height={76} style={{ display: "block", overflow: "visible" }} />
      {tooltip.visible && (
        <div
          className="absolute pointer-events-none z-10 px-2.5 py-1.5 rounded-lg bg-[#0f1923] text-white text-[11px] font-medium shadow-xl whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y - 34, transform: "translateX(-50%)" }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
