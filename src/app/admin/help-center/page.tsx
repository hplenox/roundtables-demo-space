"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import {
  Bot,
  Users,
  MessageSquare,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Activity,
  BarChart2,
  Layers,
  Zap,
  Sparkles,
} from "lucide-react";

// ── Hard-coded data from Zendesk ──────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: "Jul '25", conversations: 15, autoRes: 4,  escalations: 0,  dropOffs: 11 },
  { month: "Aug '25", conversations: 33, autoRes: 5,  escalations: 0,  dropOffs: 28 },
  { month: "Sep '25", conversations:  7, autoRes: 3,  escalations: 0,  dropOffs:  4 },
  { month: "Oct '25", conversations: 38, autoRes: 9,  escalations: 2,  dropOffs: 27 },
  { month: "Nov '25", conversations: 49, autoRes: 10, escalations: 0,  dropOffs: 39 },
  { month: "Dec '25", conversations: 95, autoRes: 11, escalations: 20, dropOffs: 64 },
  { month: "Jan '26", conversations:  8, autoRes: 2,  escalations: 0,  dropOffs:  6 },
  { month: "Feb '26", conversations:  3, autoRes: 1,  escalations: 0,  dropOffs:  2 },
  { month: "Mar '26", conversations: 50, autoRes: 14, escalations: 3,  dropOffs: 33 },
  { month: "Apr '26", conversations: 98, autoRes: 15, escalations: 1,  dropOffs: 82 },
  { month: "May '26", conversations: 40, autoRes: 13, escalations: 0,  dropOffs: 27 },
  { month: "Jun '26", conversations: 34, autoRes:  8, escalations: 0,  dropOffs: 26 },
];

type MonthRow = typeof MONTHLY_DATA[0];

const PERIOD_KPIS: Record<string, { conversations: number; autoRes: number; escalations: number; dropOffs: number }> = {
  "7d":  { conversations:   7, autoRes:  2, escalations: 0, dropOffs:   5 },
  "30d": { conversations:  27, autoRes:  5, escalations: 0, dropOffs:  22 },
  "90d": { conversations: 122, autoRes: 36, escalations: 0, dropOffs:  86 },
  "6m":  { conversations: 246, autoRes: 52, escalations: 3, dropOffs: 191 },
};

const AI_RESPONSES = [
  { label: "Generated a reply", value: 52, color: "#3b82f6" },
  { label: "Showed an answer",  value: 30, color: "#00b8a9" },
  { label: "Couldn't answer",   value: 18, color: "#be185d" },
];

const TOP_ANSWERS = [
  { name: "Access & Permissions Issue",        engaged: 4 },
  { name: "Extend Survey Deadline",            engaged: 4 },
  { name: "Get an invitation",                 engaged: 2 },
  { name: "Get in touch with someone",         engaged: 2 },
  { name: "Create an account on RoundTables",  engaged: 1 },
  { name: "Welcome",                           engaged: 1 },
];

const TOP_OPTIONS = [
  { answer: "Access & Permissions Issue",       option: "Access & Permissions Issue", total: 5 },
  { answer: "Extend Survey Deadline",           option: "Extend Survey Deadline",     total: 3 },
  { answer: "Create an account on RoundTables", option: "No",                         total: 1 },
  { answer: "Create an account on RoundTables", option: "Yes",                        total: 1 },
  { answer: "Get in touch with someone",        option: "Yes",                        total: 1 },
];

// ── Conversations stacked bar chart ───────────────────────────────────────────

type SeriesVis = { autoRes: boolean; escalations: boolean; dropOffs: boolean };

function ConversationsChart({ data }: { data: MonthRow[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef  = useRef<SVGSVGElement>(null);
  const tipRef  = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState<SeriesVis>({ autoRes: true, escalations: true, dropOffs: true });

  useEffect(() => {
    if (!svgRef.current || !wrapRef.current) return;
    const el = svgRef.current;
    const W  = wrapRef.current.clientWidth || 620;
    const H  = 230;
    const mg = { top: 6, right: 12, bottom: 36, left: 34 };
    const iw = W - mg.left - mg.right;
    const ih = H - mg.top - mg.bottom;

    d3.select(el).selectAll("*").remove();
    el.setAttribute("viewBox", `0 0 ${W} ${H}`);
    el.setAttribute("height", String(H));

    const svg = d3.select(el).append("g").attr("transform", `translate(${mg.left},${mg.top})`);

    const keys: (keyof Omit<MonthRow, "month" | "conversations">)[] = [];
    if (vis.dropOffs)    keys.push("dropOffs");
    if (vis.escalations) keys.push("escalations");
    if (vis.autoRes)     keys.push("autoRes");
    if (keys.length === 0) return;

    const colors: Record<string, string> = {
      autoRes:     "#00b8a9",
      escalations: "#0d5e58",
      dropOffs:    "#e2e8f0",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stack = (d3.stack<MonthRow>() as any).keys(keys);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stacked: any[] = stack(data);
    const maxVal = d3.max(stacked[stacked.length - 1], (d: [number, number]) => d[1]) as number ?? 110;

    const x = d3.scaleBand().domain(data.map(d => d.month)).range([0, iw]).padding(0.28);
    const y = d3.scaleLinear().domain([0, Math.max(maxVal * 1.1, 20)]).range([ih, 0]).nice();

    // Gridlines
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(-iw).tickFormat(() => "").ticks(5))
      .call(g => {
        g.select(".domain").remove();
        g.selectAll(".tick line").attr("stroke", "#f1f5f9").attr("stroke-dasharray", "0");
      });

    // Bars
    stacked.forEach((layer) => {
      const key = layer.key as string;
      const isTop = layer === stacked[stacked.length - 1];
      svg.selectAll(`.b-${key}`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .data(layer as any[])
        .join("rect")
        .attr("x", (d: { data: MonthRow }) => x(d.data.month) ?? 0)
        .attr("y", ih).attr("width", x.bandwidth()).attr("height", 0)
        .attr("fill", colors[key] ?? "#94a3b8")
        .attr("rx", isTop ? 2 : 0)
        .on("mouseover", function(event: MouseEvent, d: { data: MonthRow } & [number, number]) {
          if (!tipRef.current) return;
          const md = d.data;
          tipRef.current.style.display = "block";
          tipRef.current.innerHTML = `
            <p class="font-semibold text-slate-800 mb-1">${md.month}</p>
            <div class="space-y-0.5 text-[11px] text-slate-500">
              <div>Conversations: <span class="font-semibold text-slate-700">${md.conversations}</span></div>
              <div>Auto Resolved: <span class="font-semibold" style="color:#00897b">${md.autoRes}</span></div>
              <div>Escalated: <span class="font-semibold text-slate-700">${md.escalations}</span></div>
              <div>Drop-offs: <span class="font-semibold text-slate-700">${md.dropOffs}</span></div>
            </div>
          `;
        })
        .on("mousemove", function(event: MouseEvent) {
          if (!tipRef.current || !wrapRef.current) return;
          const rect = wrapRef.current.getBoundingClientRect();
          tipRef.current.style.left = (event.clientX - rect.left + 12) + "px";
          tipRef.current.style.top  = Math.max(0, event.clientY - rect.top - 80) + "px";
        })
        .on("mouseout", function() {
          if (tipRef.current) tipRef.current.style.display = "none";
        })
        .transition().duration(500).delay((_: unknown, i: number) => i * 25)
        .attr("y", (d: [number, number]) => y(d[1]))
        .attr("height", (d: [number, number]) => y(d[0]) - y(d[1]));
    });

    // X axis
    svg.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(g => {
        g.select(".domain").attr("stroke", "#e2e8f0");
        g.selectAll(".tick text").attr("fill", "#94a3b8").attr("font-size", "10").attr("dy", "1.2em");
      });

    // Y axis
    svg.append("g").call(d3.axisLeft(y).ticks(5).tickSize(0))
      .call(g => {
        g.select(".domain").remove();
        g.selectAll(".tick text").attr("fill", "#94a3b8").attr("font-size", "10").attr("dx", "-4");
      });
  }, [data, vis]);

  const legendItems = [
    { key: "autoRes",     label: "Auto Resolved", color: "#00b8a9" },
    { key: "escalations", label: "Escalations",   color: "#0d5e58" },
    { key: "dropOffs",    label: "Drop-offs",      color: "#e2e8f0", border: "#cbd5e1" },
  ];

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-4 mb-3">
        {legendItems.map(item => (
          <button
            key={item.key}
            onClick={() => setVis(v => ({ ...v, [item.key]: !v[item.key as keyof SeriesVis] }))}
            className={`flex items-center gap-1.5 text-[11px] transition-opacity duration-200 ${
              vis[item.key as keyof SeriesVis] ? "opacity-100" : "opacity-30"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
              style={{ background: item.color, border: item.border ? `1px solid ${item.border}` : undefined }}
            />
            <span className="text-slate-500">{item.label}</span>
          </button>
        ))}
      </div>
      <svg ref={svgRef} className="w-full" />
      <div
        ref={tipRef}
        className="pointer-events-none absolute hidden z-20 p-2.5 rounded-lg bg-white border border-slate-200 shadow-lg text-[11.5px] leading-relaxed"
        style={{ minWidth: 148 }}
      />
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────

function DonutChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const el   = svgRef.current;
    const size = 180;
    const r    = 68;
    const ir   = 44;

    d3.select(el).selectAll("*").remove();
    el.setAttribute("viewBox", `0 0 ${size} ${size}`);
    el.setAttribute("height", String(size));

    const svg = d3.select(el).append("g")
      .attr("transform", `translate(${size / 2},${size / 2})`);

    const pie = d3.pie<typeof AI_RESPONSES[0]>().value(d => d.value).sort(null).padAngle(0.035);
    const arc    = d3.arc<d3.PieArcDatum<typeof AI_RESPONSES[0]>>().innerRadius(ir).outerRadius(r);
    const arcHov = d3.arc<d3.PieArcDatum<typeof AI_RESPONSES[0]>>().innerRadius(ir).outerRadius(r + 6);

    svg.selectAll("path")
      .data(pie(AI_RESPONSES))
      .join("path")
      .attr("fill", d => d.data.color)
      .style("cursor", "pointer")
      .on("mouseover", function() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.select(this).transition().duration(100).attr("d", arcHov as any);
      })
      .on("mouseout", function() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.select(this).transition().duration(100).attr("d", arc as any);
      })
      .transition().duration(700)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attrTween("d", function(d: any) {
        const interp = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (t: number) => arc(interp(t) as any) ?? "";
      });

    svg.append("text")
      .attr("text-anchor", "middle").attr("dy", "-0.15em")
      .attr("font-size", "20").attr("font-weight", "700").attr("fill", "#0f172a").text("18%");
    svg.append("text")
      .attr("text-anchor", "middle").attr("dy", "1.25em")
      .attr("font-size", "8.5").attr("fill", "#94a3b8").text("resolution rate");
  }, []);

  return <svg ref={svgRef} className="block mx-auto" style={{ maxWidth: 180 }} />;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HelpCenterPage() {
  const [period, setPeriod] = useState("30d");
  const kpi = PERIOD_KPIS[period];

  return (
    <div className="space-y-5">

      {/* ── Executive Summary ── */}
      <div className="rounded-xl bg-[#0f1923] p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-[#00b8a9]/15 border border-[#00b8a9]/30 flex items-center justify-center mt-0.5">
            <Bot size={15} className="text-[#00b8a9]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <p className="text-[13px] font-bold text-white">Lenni Bott — Support Intelligence Summary</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00b8a9]/15 text-[#00b8a9] border border-[#00b8a9]/25">
                Zendesk AI Agent · Jul 6, 2026
              </span>
            </div>
            <div className="space-y-1.5 text-[12px] leading-relaxed text-white/55">
              <p>
                <span className="text-[#00b8a9] font-semibold">Lenni Bott has autonomously resolved 89 cumulative conversations</span> since launch — sustaining an 18–21% automated resolution rate over the past 6 months with <span className="text-white/80">zero human escalations</span> in the last quarter, protecting the support team&apos;s bandwidth.
              </p>
              <p>
                Traffic spiked to <span className="text-white/80">95 conversations in December 2025</span> and <span className="text-white/80">98 in April 2026</span> — both surges absorbed entirely by Lenni Bott with no agent transfers, proving elastic AI capacity at peak demand.
              </p>
              <p>
                The top unresolved need is <span className="text-amber-400 font-medium">Access &amp; Permissions Issues</span> (5 selections) followed by Survey Deadline Extensions (3) — two targeted expansions to the knowledge base could push automated resolution past 25%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Period Selector + KPI Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Performance Overview</p>
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-white">
            {[
              { k: "7d",  l: "7D"  },
              { k: "30d", l: "30D" },
              { k: "90d", l: "90D" },
              { k: "6m",  l: "6M"  },
            ].map(({ k, l }) => (
              <button
                key={k}
                onClick={() => setPeriod(k)}
                className={`px-3.5 py-1.5 text-[11px] font-semibold transition-colors duration-150 ${
                  period === k
                    ? "bg-[#00b8a9] text-white"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Conversations", value: kpi.conversations, icon: MessageSquare, color: "text-blue-600",    bg: "bg-blue-50"           },
            { label: "Auto Resolved", value: kpi.autoRes,       icon: CheckCircle2,  color: "text-[#00897b]",   bg: "bg-[#00b8a9]/10"      },
            { label: "Escalations",   value: kpi.escalations,   icon: AlertTriangle, color: "text-amber-600",   bg: "bg-amber-50"          },
            { label: "Drop-offs",     value: kpi.dropOffs,      icon: XCircle,       color: "text-slate-500",   bg: "bg-slate-100"         },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon size={14} className={color} strokeWidth={1.75} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              {label === "Auto Resolved" && kpi.conversations > 0 && (
                <p className="text-[10.5px] text-[#00897b] font-medium mt-1">
                  {Math.round((value / kpi.conversations) * 100)}% resolution rate
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Conversations Chart + AI Donut ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Stacked bar chart */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 size={13} className="text-[#00b8a9]" strokeWidth={2} />
                <h2 className="text-sm font-semibold text-slate-900">Conversations by Month</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Jul 2025 – Jun 2026 · click legend to filter series</p>
            </div>
          </div>
          <div className="px-5 py-4">
            <ConversationsChart data={MONTHLY_DATA} />
          </div>
        </div>

        {/* Donut + stats */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Activity size={13} className="text-[#00b8a9]" strokeWidth={2} />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">AI Response Mix</h2>
              <p className="text-xs text-slate-400 mt-0.5">30-day · Jun 7 – Jul 6</p>
            </div>
          </div>
          <div className="p-5">
            <DonutChart />
            <div className="mt-4 space-y-2">
              {AI_RESPONSES.map(r => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-[11.5px] text-slate-500 flex-1">{r.label}</span>
                  <span className="text-[12px] font-semibold text-slate-700">{r.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 grid grid-cols-2 gap-3 border-t border-slate-100">
              {[
                { v: "31",  l: "Active Users",   c: "text-slate-900" },
                { v: "0%",  l: "Transfer Rate",  c: "text-slate-900" },
                { v: "18%", l: "AI Resolution",  c: "text-[#00897b]" },
                { v: "96%", l: "Engage Rate",    c: "text-blue-600"  },
              ].map(m => (
                <div key={m.l} className="text-center">
                  <p className={`text-[18px] font-bold leading-none ${m.c}`}>{m.v}</p>
                  <p className="text-[9.5px] text-slate-400 mt-0.5">{m.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Answers + Top Options ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Top answers */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Zap size={13} className="text-[#00b8a9]" strokeWidth={2} />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Top Lenni Bott Answers</h2>
              <p className="text-xs text-slate-400 mt-0.5">Most-triggered response flows</p>
            </div>
          </div>
          <div className="p-5 space-y-3.5">
            {TOP_ANSWERS.map((a, i) => (
              <div key={a.name} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9.5px] font-bold flex-shrink-0"
                  style={i < 2
                    ? { background: "#00b8a9", color: "white" }
                    : { background: "#f1f5f9", color: "#94a3b8" }
                  }
                >{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-slate-700 font-medium truncate">{a.name}</p>
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#00b8a9] transition-all"
                      style={{ width: `${(a.engaged / 4) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700 flex-shrink-0">{a.engaged}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top options */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Layers size={13} className="text-blue-500" strokeWidth={2} />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Top User Selections</h2>
              <p className="text-xs text-slate-400 mt-0.5">Options chosen in bot conversations</p>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="grid px-5 py-2" style={{ gridTemplateColumns: "1fr auto auto" }}>
              {["Issue", "Option", "Total"].map((h, i) => (
                <p key={h} className={`text-[10px] font-semibold uppercase tracking-wide text-slate-400 ${i > 0 ? (i === 2 ? "text-right" : "mr-4") : ""}`}>{h}</p>
              ))}
            </div>
            {TOP_OPTIONS.map((o, i) => (
              <div
                key={i}
                className="grid items-center px-5 py-3 hover:bg-slate-50/60 transition-colors"
                style={{ gridTemplateColumns: "1fr auto auto" }}
              >
                <p className="text-[12px] text-slate-600 truncate pr-3">{o.answer}</p>
                <span className="mr-4 text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap">
                  {o.option}
                </span>
                <p className="text-sm font-bold text-slate-700 text-right">{o.total}</p>
              </div>
            ))}
          </div>

          {/* Jun snapshot */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-xl">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={11} className="text-[#00897b]" />
              <p className="text-[10.5px] font-semibold text-slate-500">June 2026 Snapshot</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: "24",  l: "Total",    c: "text-slate-900" },
                { v: "23",  l: "Engaged",  c: "text-[#00897b]" },
                { v: "0",   l: "Transfer", c: "text-slate-400" },
                { v: "96%", l: "Rate",     c: "text-blue-600"  },
              ].map(m => (
                <div key={m.l} className="text-center">
                  <p className={`text-base font-bold ${m.c}`}>{m.v}</p>
                  <p className="text-[9px] text-slate-400">{m.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Users by Month ── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <Users size={13} className="text-[#00b8a9]" strokeWidth={2} />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Users by Month</h2>
            <p className="text-xs text-slate-400 mt-0.5">Total · Engaged with bot · Transferred to agent</p>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex gap-8">
            {[
              { month: "Jun '26", total: 24, engaged: 23, transferred: 0  },
              { month: "Jul '26", total:  3, engaged:  3, transferred: 1  },
            ].map(row => (
              <div key={row.month} className="flex-1 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-wide">{row.month}</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Total users",       value: row.total,       color: "#0f1923" },
                    { label: "Engaged with bot",  value: row.engaged,     color: "#00b8a9" },
                    { label: "Transferred",       value: row.transferred, color: "#f59e0b" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="text-[11.5px] text-slate-500">{s.label}</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex-1 rounded-xl border border-[#00b8a9]/20 bg-[#00b8a9]/5 p-4 flex flex-col justify-center">
              <p className="text-[10.5px] font-semibold text-[#00897b] uppercase tracking-wide mb-3">Key Insights</p>
              <ul className="space-y-2 text-[11.5px] text-slate-600 leading-snug">
                <li className="flex gap-2"><span className="text-[#00b8a9] font-bold mt-0.5">·</span>96% of June users engaged with Lenni Bott directly</li>
                <li className="flex gap-2"><span className="text-[#00b8a9] font-bold mt-0.5">·</span>Zero transfers to human agents in June</li>
                <li className="flex gap-2"><span className="text-[#00b8a9] font-bold mt-0.5">·</span>Bot contained all traffic autonomously</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <p className="text-[11px] text-slate-300">
          Data source: Zendesk AI · Lenni Bott Agent · Through July 6, 2026
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-400">Live sync</span>
        </div>
      </div>

    </div>
  );
}
