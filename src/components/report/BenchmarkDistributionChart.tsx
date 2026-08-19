"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { BenchmarkPool } from "@/types/survey";

interface BenchmarkChartProps {
  pool: BenchmarkPool;
  animate?: boolean;
}

export default function BenchmarkDistributionChart({ pool, animate = true }: BenchmarkChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; text: string }>({
    visible: false, x: 0, y: 0, text: "",
  });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = containerRef.current.clientWidth || 440;
    const H = 110;
    const padL = 16;
    const padR = 16;
    const barY = 42;
    const barH = 24;
    const barW = W - padL - padR;

    const xScale = d3.scaleLinear().domain([0, 10]).range([padL, padL + barW]);

    const defs = svg.append("defs");

    // Background track
    svg.append("rect")
      .attr("x", padL).attr("y", barY)
      .attr("width", barW).attr("height", barH)
      .attr("rx", 3)
      .attr("fill", "#e2e8f0");

    // P10-P90 wide band (light blue-slate)
    const p10x = xScale(pool.p10);
    const p90x = xScale(pool.p90);
    svg.append("rect")
      .attr("x", p10x).attr("y", barY)
      .attr("width", 0).attr("height", barH)
      .attr("fill", "#bfdbfe")
      .transition().duration(animate ? 700 : 0).ease(d3.easeCubicOut)
      .attr("width", p90x - p10x);

    // Q1-Q3 IQR band (medium blue)
    const q1x = xScale(pool.q1);
    const q3x = xScale(pool.q3);
    svg.append("rect")
      .attr("x", q1x).attr("y", barY)
      .attr("width", 0).attr("height", barH)
      .attr("fill", "#3b82f6")
      .transition().duration(animate ? 700 : 0).delay(animate ? 100 : 0).ease(d3.easeCubicOut)
      .attr("width", q3x - q1x);

    // Median line
    const medX = xScale(pool.median);
    svg.append("line")
      .attr("x1", medX).attr("x2", medX)
      .attr("y1", barY).attr("y2", barY + barH)
      .attr("stroke", "#1d4ed8")
      .attr("stroke-width", 2.5)
      .attr("opacity", 0)
      .transition().duration(200).delay(animate ? 600 : 0)
      .attr("opacity", 1);

    // IQR bracket above bar
    const bracketY = barY - 8;
    svg.append("line")
      .attr("x1", q1x).attr("x2", q3x)
      .attr("y1", bracketY).attr("y2", bracketY)
      .attr("stroke", "#64748b").attr("stroke-width", 1);
    [q1x, q3x].forEach(x => {
      svg.append("line")
        .attr("x1", x).attr("x2", x)
        .attr("y1", bracketY).attr("y2", bracketY + 5)
        .attr("stroke", "#64748b").attr("stroke-width", 1);
    });
    svg.append("text")
      .attr("x", (q1x + q3x) / 2).attr("y", bracketY - 3)
      .attr("text-anchor", "middle")
      .attr("font-size", "9px").attr("fill", "#64748b")
      .attr("font-family", "inherit");

    // Q1, Median, Q3 value labels above bar
    [
      { val: pool.q1, x: q1x, anchor: "middle" },
      { val: pool.median, x: medX, anchor: "middle" },
      { val: pool.q3, x: q3x, anchor: "middle" },
    ].forEach(({ val, x, anchor }) => {
      const isMedian = val === pool.median;
      svg.append("text")
        .attr("x", x).attr("y", barY - 14)
        .attr("text-anchor", anchor)
        .attr("font-size", isMedian ? "9.5px" : "9px")
        .attr("font-weight", isMedian ? "600" : "400")
        .attr("fill", isMedian ? "#1e3a8a" : "#475569")
        .attr("font-family", "inherit")
        .text(isMedian ? `Median = ${val.toFixed(2)}` : val.toFixed(2));
    });

    // Low / High axis labels
    svg.append("text")
      .attr("x", padL).attr("y", barY + barH + 14)
      .attr("font-size", "9px").attr("fill", "#94a3b8")
      .attr("font-family", "inherit")
      .text("Low");
    svg.append("text")
      .attr("x", padL + barW).attr("y", barY + barH + 14)
      .attr("text-anchor", "end")
      .attr("font-size", "9px").attr("fill", "#94a3b8")
      .attr("font-family", "inherit")
      .text("High");

    // Axis arrows
    svg.append("line")
      .attr("x1", padL + 22).attr("x2", padL + barW - 22)
      .attr("y1", barY + barH + 10).attr("y2", barY + barH + 10)
      .attr("stroke", "#cbd5e1").attr("stroke-width", 0.75)
      .attr("marker-end", "url(#arr-r)")
      .attr("marker-start", "url(#arr-l)");

    const mkDef = defs.append("marker")
      .attr("id", "arr-r").attr("viewBox", "0 0 8 8")
      .attr("refX", 7).attr("refY", 4)
      .attr("markerWidth", 5).attr("markerHeight", 5)
      .attr("orient", "auto");
    mkDef.append("path").attr("d", "M1 1L7 4L1 7").attr("fill", "none").attr("stroke", "#cbd5e1").attr("stroke-width", 1.5);

    const mkDefL = defs.append("marker")
      .attr("id", "arr-l").attr("viewBox", "0 0 8 8")
      .attr("refX", 1).attr("refY", 4)
      .attr("markerWidth", 5).attr("markerHeight", 5)
      .attr("orient", "auto-start-reverse");
    mkDefL.append("path").attr("d", "M7 1L1 4L7 7").attr("fill", "none").attr("stroke", "#cbd5e1").attr("stroke-width", 1.5);

    // "Relative DEI Impact" label centered
    svg.append("text")
      .attr("x", padL + barW / 2).attr("y", barY + barH + 24)
      .attr("text-anchor", "middle")
      .attr("font-size", "8.5px").attr("fill", "#94a3b8")
      .attr("font-family", "inherit")
      .text("Relative DEI Impact");

    // Manager marker (orange square pin)
    const mX = xScale(pool.managerValue);
    const markerGroup = svg.append("g")
      .attr("cursor", "pointer")
      .on("mouseenter", (event) => {
        const rect = containerRef.current!.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: mX,
          y: barY - 5,
          text: `${pool.managerPercentile}th percentile · Score ${pool.managerValue.toFixed(1)}`,
        });
      })
      .on("mouseleave", () => setTooltip(t => ({ ...t, visible: false })));

    markerGroup.append("rect")
      .attr("x", mX - 9).attr("y", barY + 2)
      .attr("width", 18).attr("height", 18)
      .attr("rx", 2)
      .attr("fill", "#f97316")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0)
      .transition().delay(animate ? 800 : 0).duration(300)
      .attr("opacity", 1);

    markerGroup.append("text")
      .attr("x", mX).attr("y", barY + 13)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "8px")
      .attr("font-weight", "700")
      .attr("fill", "white")
      .attr("font-family", "inherit")
      .attr("opacity", 0)
      .text(`${pool.managerPercentile}%`)
      .transition().delay(animate ? 950 : 0).duration(200)
      .attr("opacity", 1);

    // Percentile label below marker
    svg.append("text")
      .attr("x", mX).attr("y", barY + barH + 6)
      .attr("text-anchor", "middle")
      .attr("font-size", "8.5px")
      .attr("font-weight", "600")
      .attr("fill", "#ea580c")
      .attr("font-family", "inherit")
      .attr("opacity", 0)
      .text(`${pool.managerPercentile}%ile at ${pool.managerValue.toFixed(2)}`)
      .transition().delay(animate ? 950 : 0).duration(200)
      .attr("opacity", 1);

  }, [pool, animate]);

  const pctColor = pool.managerPercentile >= 70 ? "#3147af" : pool.managerPercentile >= 40 ? "#b45309" : "#dc2626";

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        width="100%"
        height={110}
        style={{ display: "block", overflow: "visible" }}
      />
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute pointer-events-none z-10 px-2.5 py-1.5 rounded-lg bg-[#0f1923] text-white text-[11px] font-medium shadow-xl whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y - 32, transform: "translateX(-50%)" }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
