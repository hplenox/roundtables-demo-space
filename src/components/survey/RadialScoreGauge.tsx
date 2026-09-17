"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface RadialScoreGaugeProps {
  score: number; // 0-100
  color: string;
  size?: number;
}

export default function RadialScoreGauge({ score, color, size = 176 }: RadialScoreGaugeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = size / 2;
    const strokeW = size * 0.1;
    const arcOuter = radius - 2;
    const arcInner = arcOuter - strokeW;

    const g = svg.append("g").attr("transform", `translate(${radius}, ${radius})`);

    const arcGen = d3.arc<{ endAngle: number }>()
      .innerRadius(arcInner)
      .outerRadius(arcOuter)
      .cornerRadius(strokeW / 2)
      .startAngle(0);

    // Track
    g.append("path")
      .attr("d", arcGen({ endAngle: 2 * Math.PI }))
      .attr("fill", "#eef2f6");

    // Animated score arc
    const fraction = Math.min(1, Math.max(0, score / 100));
    const targetAngle = fraction * 2 * Math.PI;

    const arcPath = g.append("path").attr("fill", color);

    const interpolator = d3.interpolate(0, targetAngle);
    arcPath.transition()
      .duration(1100)
      .ease(d3.easeCubicOut)
      .attrTween("d", () => (t: number) => arcGen({ endAngle: interpolator(t) }) ?? "");
  }, [score, color, size]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg ref={svgRef} width={size} height={size} style={{ display: "block", overflow: "visible" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[38px] font-black leading-none tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-[11px] text-slate-400 font-semibold mt-0.5">/ 100</span>
      </div>
    </div>
  );
}
