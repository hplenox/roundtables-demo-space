"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { RacialDemographics } from "@/types/survey";

interface Props {
  data: RacialDemographics;
}

const RACES = [
  { key: "indigenous_na",   short: "Indigenous\nN. America",    label: "Indigenous - North America" },
  { key: "asian",           short: "Asian /\nEast Asian",        label: "Asian / Central Asian / East Asian / Southeast Asian / South Asian" },
  { key: "black",           short: "Black /\nAfrican Am.",       label: "Black / African American / Afro-Caribbean / Afro-Latino/a/e/x / Sub-Saharan African" },
  { key: "latino",          short: "Latino/\na/e/x",             label: "Latino/a/e/x" },
  { key: "mena",            short: "N. African /\nMiddle East",  label: "North African / Southwest Asian / Middle Eastern" },
  { key: "indigenous_out",  short: "Indigenous\nOutside NA",     label: "Indigenous - Outside North America" },
  { key: "white",           short: "White /\nEuropean",          label: "White / European" },
  { key: "other",           short: "Other",                      label: "Other" },
  { key: "multiracial",     short: "Two or More /\nMulti",       label: "Two or More Racial / Ethnic Identities / Multi-Racial" },
] as const;

type RaceKey = typeof RACES[number]["key"];

const RACE_COLORS: Record<RaceKey, string> = {
  indigenous_na:  "#1d4ed8",
  asian:          "#ea580c",
  black:          "#6b7280",
  latino:         "#ca8a04",
  mena:           "#7c3aed",
  indigenous_out: "#16a34a",
  white:          "#0369a1",
  other:          "#b91c1c",
  multiracial:    "#374151",
};

const ROLE_COLORS = {
  ownership:  "#00897b",
  leadership: "#3b82f6",
  workforce:  "#f59e0b",
};

const ROLES = [
  { key: "ownership"  as keyof RacialDemographics, label: "Owners"    },
  { key: "leadership" as keyof RacialDemographics, label: "Leaders"   },
  { key: "workforce"  as keyof RacialDemographics, label: "Workforce" },
];

function getValue(data: RacialDemographics, role: keyof RacialDemographics, key: RaceKey): number {
  return (data[role] as any)[key] ?? 0;
}

// ── Chart 1: Grouped bar chart (race × role) ──────────────────────────────
function GroupedBarChart({ data }: { data: RacialDemographics }) {
  const ref     = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !wrapRef.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const W       = wrapRef.current.clientWidth || 800;
    const H       = 260;
    const marginL = 28;
    const marginR = 12;
    const marginT = 12;
    const marginB = 72;
    const innerW  = W - marginL - marginR;
    const innerH  = H - marginT - marginB;

    const g = svg.append("g").attr("transform", `translate(${marginL},${marginT})`);

    // Scales
    const x0 = d3.scaleBand()
      .domain(RACES.map(r => r.key))
      .range([0, innerW])
      .paddingInner(0.3)
      .paddingOuter(0.1);

    const x1 = d3.scaleBand()
      .domain(ROLES.map(r => r.key))
      .range([0, x0.bandwidth()])
      .padding(0.08);

    const maxVal = d3.max(RACES.flatMap(race =>
      ROLES.map(role => getValue(data, role.key, race.key))
    )) ?? 1;

    const y = d3.scaleLinear()
      .domain([0, maxVal + 1])
      .range([innerH, 0])
      .nice();

    // Grid
    g.append("g")
      .call(d3.axisLeft(y).ticks(Math.min(maxVal + 1, 6)).tickSize(-innerW).tickFormat("" as any))
      .call(gEl => gEl.select(".domain").remove())
      .call(gEl => gEl.selectAll(".tick line")
        .attr("stroke", "#f1f5f9").attr("stroke-width", 1))
      .call(gEl => gEl.selectAll(".tick text").remove());

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(Math.min(maxVal + 1, 6)).tickFormat(d3.format("d")))
      .call(gEl => gEl.select(".domain").remove())
      .call(gEl => gEl.selectAll(".tick line").remove())
      .call(gEl => gEl.selectAll("text")
        .attr("font-size", "9px").attr("fill", "#94a3b8").attr("font-family", "inherit"));

    // Bars
    RACES.forEach(race => {
      const raceG = g.append("g")
        .attr("transform", `translate(${x0(race.key)},0)`);

      ROLES.forEach(role => {
        const val = getValue(data, role.key, race.key);
        const bx  = x1(role.key)!;
        const bw  = x1.bandwidth();
        const bh  = innerH - y(val);
        const by  = y(val);
        const color = ROLE_COLORS[role.key as keyof typeof ROLE_COLORS];

        raceG.append("rect")
          .attr("x", bx).attr("y", innerH)
          .attr("width", bw).attr("height", 0)
          .attr("rx", 2)
          .attr("fill", color)
          .transition().duration(650)
          .delay(RACES.indexOf(race) * 40)
          .ease(d3.easeCubicOut)
          .attr("y", by)
          .attr("height", Math.max(0, bh));
      });
    });

    // X axis — multi-line labels
    RACES.forEach(race => {
      const cx = (x0(race.key) ?? 0) + x0.bandwidth() / 2;
      const lines = race.short.split("\n");
      lines.forEach((line, i) => {
        g.append("text")
          .attr("x", cx)
          .attr("y", innerH + 14 + i * 13)
          .attr("text-anchor", "middle")
          .attr("font-size", "9.5px")
          .attr("fill", "#94a3b8")
          .attr("font-family", "inherit")
          .text(line);
      });
    });

    // Tooltip overlay
    const tooltip = d3.select(wrapRef.current)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "#0f1923")
      .style("color", "white")
      .style("border-radius", "10px")
      .style("padding", "8px 12px")
      .style("font-size", "11px")
      .style("font-family", "inherit")
      .style("box-shadow", "0 4px 24px rgba(0,0,0,0.18)")
      .style("opacity", "0")
      .style("transition", "opacity 0.1s")
      .style("max-width", "220px")
      .style("z-index", "20");

    RACES.forEach(race => {
      const raceG = g.select(`g:nth-child(${RACES.indexOf(race) + 3})`);
      ROLES.forEach((role, ri) => {
        const val  = getValue(data, role.key, race.key);
        const bx   = (x0(race.key) ?? 0) + (x1(role.key) ?? 0);
        const by   = y(val);
        const bw   = x1.bandwidth();
        const bh   = innerH - by;

        g.append("rect")
          .attr("x", bx).attr("y", by)
          .attr("width", bw).attr("height", Math.max(0, bh))
          .attr("fill", "transparent")
          .attr("cursor", "default")
          .on("mousemove", (event) => {
            const [mx, my] = d3.pointer(event, wrapRef.current);
            tooltip
              .style("opacity", "1")
              .style("left", `${mx + 12}px`)
              .style("top",  `${my - 10}px`)
              .html(`
                <div style="color:#00b8a9;font-weight:700;margin-bottom:4px;line-height:1.3">${race.label}</div>
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="width:8px;height:8px;border-radius:2px;background:${ROLE_COLORS[role.key as keyof typeof ROLE_COLORS]};display:inline-block;flex-shrink:0"></span>
                  <span style="color:#94a3b8">${role.label}:</span>
                  <span style="font-weight:700">${val}</span>
                </div>
              `);
          })
          .on("mouseleave", () => tooltip.style("opacity", "0"));
      });
    });

  }, [data]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <svg ref={ref} width="100%" height={260} style={{ display: "block", overflow: "visible" }} />
    </div>
  );
}

// ── Chart 2: Stacked bar chart (role × race) ──────────────────────────────
function StackedBarChart({ data }: { data: RacialDemographics }) {
  const ref     = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !wrapRef.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const W       = wrapRef.current.clientWidth || 800;
    const H       = 220;
    const marginL = 28;
    const marginR = 12;
    const marginT = 12;
    const marginB = 32;
    const innerW  = W - marginL - marginR;
    const innerH  = H - marginT - marginB;

    const g = svg.append("g").attr("transform", `translate(${marginL},${marginT})`);

    // Build stacked data
    const stackedInput = ROLES.map(role => {
      const entry: Record<string, number | string> = { role: role.label };
      RACES.forEach(race => { entry[race.key] = getValue(data, role.key, race.key); });
      return entry;
    });

    const stack = d3.stack<Record<string, any>>()
      .keys(RACES.map(r => r.key))
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(stackedInput);

    const maxTotal = d3.max(stackedInput, d =>
      RACES.reduce((s, r) => s + (d[r.key] as number), 0)
    ) ?? 1;

    const x = d3.scaleBand()
      .domain(ROLES.map(r => r.label))
      .range([0, innerW])
      .padding(0.55);

    const y = d3.scaleLinear()
      .domain([0, maxTotal + 1])
      .range([innerH, 0])
      .nice();

    // Grid
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat("" as any))
      .call(gEl => gEl.select(".domain").remove())
      .call(gEl => gEl.selectAll(".tick line").attr("stroke", "#f1f5f9"))
      .call(gEl => gEl.selectAll(".tick text").remove());

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("d")))
      .call(gEl => gEl.select(".domain").remove())
      .call(gEl => gEl.selectAll(".tick line").remove())
      .call(gEl => gEl.selectAll("text")
        .attr("font-size", "9px").attr("fill", "#94a3b8").attr("font-family", "inherit"));

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(gEl => gEl.select(".domain").remove())
      .call(gEl => gEl.selectAll("text")
        .attr("font-size", "11px").attr("font-weight", "600")
        .attr("fill", "#64748b").attr("font-family", "inherit")
        .attr("dy", "1.2em"));

    // Stacked bars
    series.forEach((layer, li) => {
      const race = RACES[li];
      const color = RACE_COLORS[race.key];

      layer.forEach((d, di) => {
        const isTop = li === series.length - 1 ||
          series.slice(li + 1).every(sl => sl[di][1] - sl[di][0] === 0);

        g.append("rect")
          .attr("x", x(ROLES[di].label)!)
          .attr("width", x.bandwidth())
          .attr("y", innerH)
          .attr("height", 0)
          .attr("fill", color)
          .attr("rx", isTop ? 3 : 0)
          .transition().duration(650)
          .delay(di * 80 + li * 20)
          .ease(d3.easeCubicOut)
          .attr("y", y(d[1]))
          .attr("height", Math.max(0, y(d[0]) - y(d[1])));
      });
    });

    // Tooltip
    const tooltip = d3.select(wrapRef.current)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "#0f1923")
      .style("color", "white")
      .style("border-radius", "10px")
      .style("padding", "8px 12px")
      .style("font-size", "11px")
      .style("font-family", "inherit")
      .style("box-shadow", "0 4px 24px rgba(0,0,0,0.18)")
      .style("opacity", "0")
      .style("transition", "opacity 0.1s")
      .style("z-index", "20")
      .style("min-width", "180px");

    ROLES.forEach((role, ri) => {
      const bx = x(role.label)!;
      const bw = x.bandwidth();
      const total = RACES.reduce((s, r) => s + getValue(data, role.key, r.key), 0);

      g.append("rect")
        .attr("x", bx).attr("y", 0)
        .attr("width", bw).attr("height", innerH)
        .attr("fill", "transparent")
        .attr("cursor", "default")
        .on("mousemove", (event) => {
          const [mx, my] = d3.pointer(event, wrapRef.current);
          const rows = RACES
            .filter(r => getValue(data, role.key, r.key) > 0)
            .map(r => `
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                <span style="width:8px;height:8px;border-radius:2px;background:${RACE_COLORS[r.key]};display:inline-block;flex-shrink:0"></span>
                <span style="color:#94a3b8;font-size:10px;flex:1">${r.label.length > 28 ? r.label.slice(0, 28) + "…" : r.label}</span>
                <span style="font-weight:700">${getValue(data, role.key, r.key)}</span>
              </div>
            `).join("");
          tooltip
            .style("opacity", "1")
            .style("left", `${mx + 12}px`)
            .style("top",  `${my - 10}px`)
            .html(`
              <div style="color:#00b8a9;font-weight:700;margin-bottom:6px">${role.label} (n=${total})</div>
              ${rows}
            `);
        })
        .on("mouseleave", () => tooltip.style("opacity", "0"));
    });

  }, [data]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <svg ref={ref} width="100%" height={220} style={{ display: "block", overflow: "visible" }} />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function RacialDemographicsSection({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">
          Racial Diversity Demographics
        </span>
        <div className="flex items-center gap-4">
          {ROLES.map(role => (
            <div key={role.key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ROLE_COLORS[role.key as keyof typeof ROLE_COLORS] }} />
              <span className="text-[10.5px] text-slate-500">{role.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-8">

        {/* Chart 1 */}
        <div>
          <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            By Racial / Ethnic Category
          </p>
          <GroupedBarChart data={data} />
        </div>

        <div className="border-t border-slate-100" />

        {/* Chart 2 */}
        <div>
          <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Racial Composition by Role
          </p>

          {/* Race legend */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-4">
            {RACES.map(race => (
              <div key={race.key} className="flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0 mt-0.5" style={{ backgroundColor: RACE_COLORS[race.key] }} />
                <span className="text-[10.5px] text-slate-500 leading-tight">{race.label}</span>
              </div>
            ))}
          </div>

          <StackedBarChart data={data} />
        </div>
      </div>
    </div>
  );
}
