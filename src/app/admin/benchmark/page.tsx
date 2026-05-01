"use client";

import { useState, useMemo } from "react";
import {
  BarChart3, ChevronDown, ChevronUp, Search, Filter,
  EyeOff, Eye, CheckCircle2, X, Info, ArrowUpDown,
  TrendingUp, Users, Layers,
} from "lucide-react";
import {
  BENCHMARK_ENTRIES,
  ASSET_CLASSES,
  AssetClass,
  BenchmarkEntry,
  DistStats,
  computeDistStats,
} from "@/lib/mock-benchmark";

// ── Distribution bar (matches 2-pager visual language exactly) ───────────────
function DistBar({
  stats,
  size = "md",
}: {
  stats: DistStats;
  size?: "sm" | "md" | "lg";
}) {
  const pos = (v: number) => `${(v / 10) * 100}%`;
  const wid = (a: number, b: number) => `${Math.max(0, (b - a) / 10) * 100}%`;
  const trackH = size === "sm" ? "h-2" : size === "lg" ? "h-6" : "h-4";

  return (
    <div>
      {/* Q1 / Median / Q3 labels */}
      <div className="relative h-[18px] mb-1">
        {[
          { v: stats.q1,     label: stats.q1.toFixed(1),                cls: "text-[9px] text-slate-500" },
          { v: stats.median, label: `Median ${stats.median.toFixed(2)}`, cls: "text-[9.5px] font-semibold text-blue-700" },
          { v: stats.q3,     label: stats.q3.toFixed(1),                cls: "text-[9px] text-slate-500" },
        ].map(({ v, label, cls }) => (
          <span
            key={v}
            className={`absolute leading-none -translate-x-1/2 ${cls}`}
            style={{ left: pos(v) }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Bar layers */}
      <div className={`relative w-full ${trackH} rounded bg-[#e2e8f0] overflow-visible`}>
        {/* P10–P90 band */}
        <div
          className={`absolute top-0 bottom-0 bg-[#bfdbfe] rounded`}
          style={{ left: pos(stats.p10), width: wid(stats.p10, stats.p90) }}
        />
        {/* IQR Q1–Q3 */}
        <div
          className={`absolute top-0 bottom-0 bg-[#3b82f6] rounded`}
          style={{ left: pos(stats.q1), width: wid(stats.q1, stats.q3) }}
        />
        {/* Median line */}
        <div
          className="absolute top-0 bottom-0 w-[2.5px] bg-[#1d4ed8]"
          style={{ left: pos(stats.median), transform: "translateX(-50%)" }}
        />
        {/* P10/P90 tick caps */}
        {[stats.p10, stats.p90].map((v) => (
          <div
            key={v}
            className="absolute top-0 bottom-0 w-px bg-slate-400/60"
            style={{ left: pos(v) }}
          />
        ))}
      </div>

      {/* Bracket ticks at Q1 / Q3 */}
      <div className="relative h-1.5">
        {[stats.q1, stats.median, stats.q3].map((v) => (
          <div
            key={v}
            className={`absolute w-px h-1.5 -translate-x-1/2 ${
              v === stats.median ? "bg-[#1d4ed8]" : "bg-slate-400"
            }`}
            style={{ left: pos(v) }}
          />
        ))}
      </div>

      {/* Axis: Low / High */}
      <div className="flex justify-between text-[9px] text-slate-300 mt-0.5">
        <span>Low · 0</span>
        <span>5</span>
        <span>10 · High</span>
      </div>
    </div>
  );
}

// ── Mini score badge ──────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8   ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    score >= 6.5 ? "bg-[#00b8a9]/8 text-[#00897b] border-[#00b8a9]/25" :
    score >= 5   ? "bg-amber-50 text-amber-700 border-amber-200" :
                   "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`inline-flex items-center text-[12px] font-bold px-2 py-0.5 rounded-lg border font-mono ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}

// ── Inline score bar (for table) ──────────────────────────────────────────────
function MiniBar({ score }: { score: number }) {
  const pct = `${(score / 10) * 100}%`;
  const bg =
    score >= 8   ? "#10b981" :
    score >= 6.5 ? "#00b8a9" :
    score >= 5   ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <ScoreBadge score={score} />
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
        <div className="h-full rounded-full" style={{ width: pct, background: bg }} />
      </div>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function ChartLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap text-[10.5px] text-slate-500">
      {[
        { color: "bg-[#e2e8f0]",  label: "Full range (min–max)" },
        { color: "bg-[#bfdbfe]",  label: "10th–90th pct." },
        { color: "bg-[#3b82f6]",  label: "IQR (25th–75th)" },
        { color: "bg-[#1d4ed8] w-0.5 h-3", label: "Median" },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={`${color} h-3 w-6 rounded-sm`} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Asset Class card (By Asset Class tab) ────────────────────────────────────
function AssetClassCard({
  cls,
  entries,
}: {
  cls: string;
  entries: BenchmarkEntry[];
}) {
  const active = entries.filter((e) => !e.excludedFromBenchmark);
  const scores = active.map((e) => e.lpiScore);
  const stats = computeDistStats(scores);
  const medianColor =
    !stats ? "text-slate-300" :
    stats.median >= 8   ? "text-emerald-600" :
    stats.median >= 6.5 ? "text-[#00897b]" :
    stats.median >= 5   ? "text-amber-600" : "text-red-500";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-bold text-slate-800 leading-tight">{cls}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          {stats ? (
            <span className={`text-[18px] font-bold leading-none ${medianColor}`}>
              {stats.median.toFixed(1)}
            </span>
          ) : (
            <span className="text-[13px] font-bold text-slate-300">—</span>
          )}
          <span className="text-[10px] text-slate-400 font-medium">
            {active.length > 0 ? `n=${active.length}` : "no data"}
          </span>
        </div>
      </div>

      <div className="px-4 py-3">
        {stats && active.length >= 3 ? (
          <DistBar stats={stats} size="sm" />
        ) : active.length > 0 ? (
          <div className="space-y-1 py-1">
            {active.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate max-w-[120px]">{e.orgName}</span>
                <ScoreBadge score={e.lpiScore} />
              </div>
            ))}
            {active.length < 3 && (
              <p className="text-[10px] text-slate-300 mt-1.5">Min. 3 entries needed for distribution</p>
            )}
          </div>
        ) : (
          <div className="py-3 text-center text-[11px] text-slate-300">
            No submissions in this class
          </div>
        )}
      </div>

      {stats && (
        <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 grid grid-cols-3 text-center gap-0 divide-x divide-slate-100">
          {[
            { label: "25th",   val: stats.q1 },
            { label: "Median", val: stats.median },
            { label: "75th",   val: stats.q3 },
          ].map(({ label, val }) => (
            <div key={label} className="px-1">
              <p className="text-[10px] text-slate-400">{label}</p>
              <p className="text-[12px] font-semibold text-slate-700 font-mono">{val.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
type SubTab = "overview" | "by-class";
type SortKey = "org" | "score" | "survey" | "class";

export default function BenchmarkPage() {
  const [entries, setEntries] = useState<BenchmarkEntry[]>(
    BENCHMARK_ENTRIES.map((e) => ({ ...e }))
  );
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [search, setSearch]         = useState("");
  const [filterSurvey, setFilterSurvey] = useState("All");
  const [filterClass, setFilterClass]   = useState("All");
  const [sortKey, setSortKey]       = useState<SortKey>("score");
  const [sortAsc, setSortAsc]       = useState(false);
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [toast, setToast]           = useState<string | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const surveys = useMemo(() => {
    const s = new Set(entries.map((e) => e.surveyLabel));
    return ["All", ...Array.from(s)];
  }, [entries]);

  const activeEntries = useMemo(
    () => entries.filter((e) => !e.excludedFromBenchmark),
    [entries]
  );

  const overallStats = useMemo(
    () => computeDistStats(activeEntries.map((e) => e.lpiScore)),
    [activeEntries]
  );

  const unassignedCount = useMemo(
    () => entries.filter((e) => !e.assetClass).length,
    [entries]
  );

  const filteredEntries = useMemo(() => {
    let res = [...entries];
    if (filterSurvey !== "All") res = res.filter((e) => e.surveyLabel === filterSurvey);
    if (filterClass  !== "All") {
      if (filterClass === "__unassigned__") res = res.filter((e) => !e.assetClass);
      else res = res.filter((e) => e.assetClass === filterClass);
    }
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(
        (e) => e.orgName.toLowerCase().includes(q) || (e.assetClass ?? "").toLowerCase().includes(q)
      );
    }
    res.sort((a, b) => {
      let diff = 0;
      if (sortKey === "score")  diff = a.lpiScore - b.lpiScore;
      if (sortKey === "org")    diff = a.orgName.localeCompare(b.orgName);
      if (sortKey === "survey") diff = a.surveyLabel.localeCompare(b.surveyLabel);
      if (sortKey === "class")  diff = (a.assetClass ?? "").localeCompare(b.assetClass ?? "");
      return sortAsc ? diff : -diff;
    });
    return res;
  }, [entries, filterSurvey, filterClass, search, sortKey, sortAsc]);

  // ── By-class data ──────────────────────────────────────────────────────────
  const classData = useMemo(() => {
    return ASSET_CLASSES.map((cls) => ({
      cls,
      entries: entries.filter((e) => e.assetClass === cls),
    })).sort((a, b) => {
      const na = a.entries.filter((e) => !e.excludedFromBenchmark).length;
      const nb = b.entries.filter((e) => !e.excludedFromBenchmark).length;
      return nb - na;
    });
  }, [entries]);

  // ── Class rankings for overview ────────────────────────────────────────────
  const classRankings = useMemo(() => {
    return ASSET_CLASSES.map((cls) => {
      const scores = entries
        .filter((e) => e.assetClass === cls && !e.excludedFromBenchmark)
        .map((e) => e.lpiScore);
      const stats = computeDistStats(scores);
      return { cls, n: scores.length, median: stats?.median ?? null };
    })
      .filter((r) => r.median !== null)
      .sort((a, b) => (b.median ?? 0) - (a.median ?? 0));
  }, [entries]);

  // ── Actions ────────────────────────────────────────────────────────────────
  function toggleExclude(id: string) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, excludedFromBenchmark: !e.excludedFromBenchmark } : e
      )
    );
    const entry = entries.find((e) => e.id === id);
    if (entry) showToast(entry.excludedFromBenchmark ? `${entry.orgName} included in benchmark.` : `${entry.orgName} excluded from benchmark.`);
  }

  function assignClass(id: string, cls: AssetClass) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, assetClass: cls } : e))
    );
    setEditingClass(null);
    const entry = entries.find((e) => e.id === id);
    if (entry) showToast(`${entry.orgName} → ${cls}`);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(k)}
      className="flex items-center gap-0.5 hover:text-slate-700 transition-colors group"
    >
      {label}
      <ArrowUpDown size={10} className={`transition-colors ${sortKey === k ? "text-[#00b8a9]" : "text-slate-300 group-hover:text-slate-400"}`} />
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-[#0f1923] text-white px-4 py-2.5 rounded-xl shadow-xl border border-white/10 text-[13px] font-medium">
          <CheckCircle2 size={14} className="text-[#00b8a9]" />
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#00b8a9]" />
            LPI Benchmark
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Platform-wide distribution of LPI scores across all surveys and asset classes. Manage which submissions are included in benchmark calculations.
          </p>
        </div>

        {unassignedCount > 0 && (
          <button
            onClick={() => { setSubTab("overview"); setFilterClass("__unassigned__"); }}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11.5px] font-semibold hover:bg-amber-100 transition-colors"
          >
            <Info size={11} />
            {unassignedCount} missing asset class{unassignedCount !== 1 ? "es" : ""}
          </button>
        )}
      </div>

      {/* Sub-tab row */}
      <div className="flex items-end gap-0 border-b border-slate-200 -mb-1">
        {([
          { key: "overview",  label: "All Surveys",    Icon: Users  },
          { key: "by-class",  label: "By Asset Class", Icon: Layers },
        ] as { key: SubTab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-150 ${
              subTab === key
                ? "border-[#00b8a9] text-[#00897b]"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── ALL SURVEYS TAB ──────────────────────────────────────────────────── */}
      {subTab === "overview" && (
        <div className="space-y-5">

          {/* Summary stat cards */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Total Submitted",  value: entries.length,       sub: "across all surveys" },
              { label: "In Benchmark",     value: activeEntries.length, sub: `${entries.length - activeEntries.length} excluded` },
              { label: "25th Percentile",  value: overallStats ? overallStats.q1.toFixed(2)     : "—", sub: "Q1 (LPI score)" },
              { label: "Median (50th)",    value: overallStats ? overallStats.median.toFixed(2) : "—", sub: "LPI score" },
              { label: "75th Percentile",  value: overallStats ? overallStats.q3.toFixed(2)     : "—", sub: "Q3 (LPI score)" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                <p className="text-[22px] font-bold text-slate-800 leading-none">{value}</p>
                <p className="text-[11.5px] font-semibold text-slate-600 mt-1">{label}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Main distribution chart */}
          {overallStats && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Platform LPI Distribution</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">
                    All {activeEntries.length} active submissions · LPI score 0–10
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {[
                    { label: "P10",    val: overallStats.p10 },
                    { label: "Q1",     val: overallStats.q1 },
                    { label: "Median", val: overallStats.median },
                    { label: "Q3",     val: overallStats.q3 },
                    { label: "P90",    val: overallStats.p90 },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[9.5px] text-slate-400">{label}</p>
                      <p className="text-[12px] font-bold text-slate-700 font-mono">{val.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-2">
                <DistBar stats={overallStats} size="lg" />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <ChartLegend />
              </div>
            </div>
          )}

          {/* Class rankings bar chart */}
          {classRankings.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Median Score by Asset Class</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">Ranked highest to lowest — active submissions only</p>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                  {classRankings.length} classes with data
                </span>
              </div>
              <div className="space-y-2">
                {classRankings.map(({ cls, n, median }) => (
                  <div key={cls} className="flex items-center gap-3">
                    <span className="text-[11.5px] text-slate-600 w-40 shrink-0 text-right">{cls}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${((median ?? 0) / 10) * 100}%`,
                          background:
                            (median ?? 0) >= 8   ? "#10b981" :
                            (median ?? 0) >= 6.5 ? "#00b8a9" :
                            (median ?? 0) >= 5   ? "#f59e0b" : "#ef4444",
                        }}
                      />
                      <span
                        className="absolute right-2 top-0 bottom-0 flex items-center text-[9.5px] font-semibold text-white mix-blend-difference"
                      >
                        {(median ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-slate-400 w-12 shrink-0">n={n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations…"
                className="w-full pl-7 pr-3 py-1.5 text-[12px] border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30 focus:border-[#00b8a9]"
              />
            </div>

            <select
              value={filterSurvey}
              onChange={(e) => setFilterSurvey(e.target.value)}
              className="text-[12px] border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30"
            >
              {surveys.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="text-[12px] border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30"
            >
              <option value="All">All Asset Classes</option>
              <option value="__unassigned__">⚠ Unassigned ({unassignedCount})</option>
              {ASSET_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="ml-auto text-[11.5px] text-slate-400">
              {filteredEntries.length} of {entries.length} shown
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <SortBtn k="org" label="Organization" />
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <SortBtn k="survey" label="Survey" />
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <SortBtn k="score" label="LPI Score" />
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <SortBtn k="class" label="Asset Class" />
                  </th>
                  <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Benchmark
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-50/60 transition-colors ${entry.excludedFromBenchmark ? "opacity-45" : ""}`}
                  >
                    {/* Org name */}
                    <td className="px-4 py-3 font-medium text-slate-800">{entry.orgName}</td>

                    {/* Survey */}
                    <td className="px-4 py-3 text-slate-500">{entry.surveyLabel}</td>

                    {/* Score */}
                    <td className="px-4 py-3">
                      <MiniBar score={entry.lpiScore} />
                    </td>

                    {/* Asset class */}
                    <td className="px-4 py-3">
                      {editingClass === entry.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            autoFocus
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) assignClass(entry.id, e.target.value as AssetClass);
                            }}
                            className="text-[11px] border border-[#00b8a9]/40 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30"
                          >
                            <option value="" disabled>Select class…</option>
                            {ASSET_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <button onClick={() => setEditingClass(null)} className="text-slate-300 hover:text-slate-500">
                            <X size={12} />
                          </button>
                        </div>
                      ) : entry.assetClass ? (
                        <button
                          onClick={() => setEditingClass(entry.id)}
                          className="flex items-center gap-1 text-[11.5px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg hover:border-[#00b8a9]/40 hover:bg-[#00b8a9]/4 transition-colors group"
                        >
                          {entry.assetClass}
                          <ChevronDown size={9} className="text-slate-300 group-hover:text-[#00b8a9] transition-colors" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingClass(entry.id)}
                          className="flex items-center gap-1 text-[11.5px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <Info size={10} />
                          Assign class
                          <ChevronDown size={9} />
                        </button>
                      )}
                    </td>

                    {/* Exclude toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleExclude(entry.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                          entry.excludedFromBenchmark
                            ? "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                            : "bg-[#00b8a9]/8 text-[#00897b] border-[#00b8a9]/25 hover:bg-[#00b8a9]/15"
                        }`}
                      >
                        {entry.excludedFromBenchmark
                          ? <><EyeOff size={10} /> Excluded</>
                          : <><Eye size={10} /> Included</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEntries.length === 0 && (
              <div className="text-center py-10">
                <BarChart3 size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No entries match your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BY ASSET CLASS TAB ──────────────────────────────────────────────── */}
      {subTab === "by-class" && (
        <div className="space-y-5">

          {/* Summary */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[12px] text-slate-500">
              <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                <TrendingUp size={11} className="text-[#00b8a9]" />
                {classRankings.length} / {ASSET_CLASSES.length} classes have data
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                <Users size={11} className="text-slate-400" />
                {activeEntries.length} active submissions
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Cards sorted by number of submissions</p>
          </div>

          {/* Single large "universe" chart at top for reference */}
          {overallStats && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Roundtables Universe</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">All {activeEntries.length} active submissions · reference benchmark</p>
                </div>
                <div className="flex gap-3 text-center text-[11px]">
                  {[
                    { l: "25th", v: overallStats.q1 },
                    { l: "50th", v: overallStats.median },
                    { l: "75th", v: overallStats.q3 },
                  ].map(({ l, v }) => (
                    <div key={l} className="px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <p className="text-[9px] text-slate-400 uppercase">{l}</p>
                      <p className="text-[13px] font-bold text-slate-700 font-mono">{v.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <DistBar stats={overallStats} size="md" />
              <div className="mt-3 pt-3 border-t border-slate-100">
                <ChartLegend />
              </div>
            </div>
          )}

          {/* Grid of 17 asset class cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classData.map(({ cls, entries: clsEntries }) => (
              <AssetClassCard key={cls} cls={cls} entries={clsEntries} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
