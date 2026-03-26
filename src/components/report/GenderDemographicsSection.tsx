"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface GenderSplit {
  men: number;
  women: number;
}

interface GenderDemographicsProps {
  ownership: GenderSplit;
  leadership: GenderSplit;
  workforce: GenderSplit;
}

const MEN_COLOR   = "#00897b";  // teal-ish green — matches app palette
const WOMEN_COLOR = "#0f1923";  // dark navy

function PieChart({
  men,
  women,
  title,
}: {
  men: number;
  women: number;
  title: string;
}) {
  const svgRef     = useRef<SVGSVGElement>(null);
  const total      = men + women;
  const menPct     = total > 0 ? Math.round((men / total) * 100) : 0;
  const womenPct   = total > 0 ? Math.round((women / total) * 100) : 0;
  const noWomen    = women === 0;

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size   = 160;
    const radius = size / 2;
    const inner  = 0; // solid pie, no donut

    svg.attr("viewBox", `0 0 ${size} ${size}`);

    const g = svg.append("g").attr("transform", `translate(${radius},${radius})`);

    const pieData = noWomen
      ? [{ value: men, color: MEN_COLOR, label: `${men}`, pct: "100%" }]
      : [
          { value: men,   color: MEN_COLOR,   label: `${men}`,   pct: `${menPct}%`   },
          { value: women, color: WOMEN_COLOR,  label: `${women}`, pct: `${womenPct}%` },
        ];

    const pie = d3.pie<typeof pieData[0]>()
      .value(d => d.value)
      .sort(null)
      .padAngle(noWomen ? 0 : 0.025);

    const arc = d3.arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(inner)
      .outerRadius(radius - 4)
      .cornerRadius(3);

    const labelArc = d3.arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(radius * 0.52)
      .outerRadius(radius * 0.52);

    const arcs = g.selectAll(".arc")
      .data(pie(pieData))
      .enter()
      .append("g")
      .attr("class", "arc");

    // Slices with animation
    arcs.append("path")
      .attr("fill", d => d.data.color)
      .attr("d", arc as any)
      .attr("opacity", 0)
      .transition()
      .duration(700)
      .delay((_, i) => i * 80)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1)
      .attrTween("d", function(d) {
        const interp = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
        return (t: number) => arc(interp(t) as any) as string;
      });

    // Labels inside slices
    arcs.each(function(d) {
      const pct  = d.data.pct;
      const count = d.data.label;
      const [x, y] = labelArc.centroid(d as any);
      const slicePct = (d.endAngle - d.startAngle) / (2 * Math.PI);
      if (slicePct < 0.08) return; // skip label if slice too thin

      d3.select(this).append("text")
        .attr("x", x).attr("y", y - 7)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "800")
        .attr("fill", "white")
        .attr("font-family", "inherit")
        .attr("opacity", 0)
        .text(count)
        .transition().delay(600).duration(200)
        .attr("opacity", 1);

      d3.select(this).append("text")
        .attr("x", x).attr("y", y + 9)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("fill", "white")
        .attr("font-family", "inherit")
        .attr("opacity", 0)
        .text(pct)
        .transition().delay(650).duration(200)
        .attr("opacity", 1);
    });

  }, [men, women, noWomen, menPct, womenPct]);

  const total_ = men + women;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Chart */}
      <svg
        ref={svgRef}
        width="160"
        height="160"
        style={{ display: "block", overflow: "visible" }}
      />

      {/* Title */}
      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
        {title}
      </p>

      {/* Legend */}
      <div className="space-y-1.5 w-full">
        {[
          { color: MEN_COLOR,   label: `${title} — Men`,   count: men,   pct: menPct   },
          { color: WOMEN_COLOR, label: `${title} — Women`, count: women, pct: womenPct },
        ].map(({ color, label, count, pct }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10.5px] text-slate-500 flex-1 leading-tight">{label}</span>
            <span className="text-[10.5px] font-semibold text-slate-700 tabular-nums">
              {count} <span className="text-slate-400 font-normal">({pct}%)</span>
            </span>
          </div>
        ))}
        <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Total</span>
          <span className="text-[11px] font-bold text-slate-700 tabular-nums">{total_}</span>
        </div>
      </div>
    </div>
  );
}

export default function GenderDemographicsSection({
  ownership,
  leadership,
  workforce,
}: GenderDemographicsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">
          Gender Diversity Demographics
        </span>
        <div className="flex items-center gap-4">
          {[
            { color: MEN_COLOR,   label: "Men"   },
            { color: WOMEN_COLOR, label: "Women" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-[10.5px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Three pie charts */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 px-2 py-6">
        <div className="px-6">
          <PieChart men={ownership.men}  women={ownership.women}  title="Ownership"  />
        </div>
        <div className="px-6">
          <PieChart men={leadership.men} women={leadership.women} title="Leadership" />
        </div>
        <div className="px-6">
          <PieChart men={workforce.men}  women={workforce.women}  title="Workforce"  />
        </div>
      </div>
    </div>
  );
}
