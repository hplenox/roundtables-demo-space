"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart3, ChevronDown, ChevronUp, Search,
  EyeOff, Eye, CheckCircle2, X, Info,
  TrendingUp, Users, Layers, ChevronRight,
  History, ArrowUp, ArrowDown,
} from "lucide-react";
import {
  BENCHMARK_ORGS,
  ASSET_CLASSES,
  AssetClass,
  OrgBenchmarkEntry,
  DistStats,
  computeDistStats,
} from "@/lib/mock-benchmark";

// ── Distribution bar ──────────────────────────────────────────────────────────
function DistBar({ stats, size = "md" }: { stats: DistStats; size?: "sm" | "md" | "lg" }) {
  const pos = (v: number) => `${(v / 10) * 100}%`;
  const wid = (a: number, b: number) => `${Math.max(0, (b - a) / 10) * 100}%`;
  const trackH = size === "sm" ? "h-2" : size === "lg" ? "h-6" : "h-4";
  return (
    <div>
      <div className="relative h-[18px] mb-1">
        {[
          { v: stats.q1,     label: stats.q1.toFixed(1),                 cls: "text-[9px] text-slate-500" },
          { v: stats.median, label: `Median ${stats.median.toFixed(2)}`, cls: "text-[9.5px] font-semibold text-blue-700" },
          { v: stats.q3,     label: stats.q3.toFixed(1),                 cls: "text-[9px] text-slate-500" },
        ].map(({ v, label, cls }) => (
          <span key={v} className={`absolute leading-none -translate-x-1/2 ${cls}`} style={{ left: pos(v) }}>
            {label}
          </span>
        ))}
      </div>
      <div className={`relative w-full ${trackH} rounded bg-[#e2e8f0] overflow-visible`}>
        <div className="absolute top-0 bottom-0 bg-[#bfdbfe] rounded" style={{ left: pos(stats.p10), width: wid(stats.p10, stats.p90) }} />
        <div className="absolute top-0 bottom-0 bg-[#3b82f6] rounded" style={{ left: pos(stats.q1), width: wid(stats.q1, stats.q3) }} />
        <div className="absolute top-0 bottom-0 w-[2.5px] bg-[#1d4ed8]" style={{ left: pos(stats.median), transform: "translateX(-50%)" }} />
        {[stats.p10, stats.p90].map((v) => (
          <div key={v} className="absolute top-0 bottom-0 w-px bg-slate-400/60" style={{ left: pos(v) }} />
        ))}
      </div>
      <div className="relative h-1.5">
        {[stats.q1, stats.median, stats.q3].map((v) => (
          <div key={v} className={`absolute w-px h-1.5 -translate-x-1/2 ${v === stats.median ? "bg-[#1d4ed8]" : "bg-slate-400"}`} style={{ left: pos(v) }} />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-slate-300 mt-0.5">
        <span>Low · 0</span><span>5</span><span>10 · High</span>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score === 0  ? "bg-slate-50 text-slate-400 border-slate-200" :
    score >= 8   ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    score >= 6.5 ? "bg-[#00b8a9]/8 text-[#00897b] border-[#00b8a9]/25" :
    score >= 5   ? "bg-amber-50 text-amber-700 border-amber-200" :
                   "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`inline-flex items-center text-[12px] font-bold px-2 py-0.5 rounded-lg border font-mono ${color}`}>
      {score === 0 ? "—" : score.toFixed(1)}
    </span>
  );
}

function MiniBar({ score }: { score: number }) {
  if (score === 0) return <ScoreBadge score={0} />;
  const pct = `${(score / 10) * 100}%`;
  const bg = score >= 8 ? "#10b981" : score >= 6.5 ? "#00b8a9" : score >= 5 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <ScoreBadge score={score} />
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
        <div className="h-full rounded-full" style={{ width: pct, background: bg }} />
      </div>
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap text-[10.5px] text-slate-500">
      {[
        { color: "bg-[#e2e8f0]",             label: "Full range (min–max)" },
        { color: "bg-[#bfdbfe]",             label: "10th–90th pct." },
        { color: "bg-[#3b82f6]",             label: "IQR (25th–75th)" },
        { color: "bg-[#1d4ed8] w-0.5 h-3",  label: "Median" },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={`${color} h-3 w-6 rounded-sm`} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function AssetClassCard({ cls, entries }: { cls: string; entries: OrgBenchmarkEntry[] }) {
  const active = entries.filter((e) => !e.excludedFromBenchmark);
  const scores = active.map((e) => e.lpiScore).filter((s) => s > 0);
  const stats = computeDistStats(scores);
  const medianColor =
    !stats        ? "text-slate-300"  :
    stats.median >= 8   ? "text-emerald-600" :
    stats.median >= 6.5 ? "text-[#00897b]"   :
    stats.median >= 5   ? "text-amber-600"   : "text-red-500";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-bold text-slate-800 leading-tight">{cls}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          {stats
            ? <span className={`text-[18px] font-bold leading-none ${medianColor}`}>{stats.median.toFixed(1)}</span>
            : <span className="text-[13px] font-bold text-slate-300">—</span>}
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
          <div className="py-3 text-center text-[11px] text-slate-300">No submissions in this class</div>
        )}
      </div>
      {stats && (
        <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 grid grid-cols-3 text-center divide-x divide-slate-100">
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

// ── Excel-style column filter dropdown ───────────────────────────────────────
interface ColFilterDropdownProps {
  column: string;
  label: string;
  options: string[];
  selected: string[];
  onSelect: (values: string[]) => void;
  onSort: (dir: "asc" | "desc") => void;
  onClose: () => void;
  anchorRect: DOMRect;
}

function ColFilterDropdown({
  label, options, selected, onSelect, onSort, onClose, anchorRect,
}: ColFilterDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const filtered = options.filter((o) =>
    (o === "__unassigned__" ? "(Unassigned)" : o).toLowerCase().includes(search.toLowerCase())
  );
  const allSelected = selected.length === 0;

  function toggle(val: string) {
    const next = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    onSelect(next.length === options.length ? [] : next);
  }

  const top  = Math.min(anchorRect.bottom + 4, window.innerHeight - 300);
  const left = Math.min(anchorRect.left, window.innerWidth - 260);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-[230px] overflow-hidden"
      style={{ top, left }}
    >
      <div className="px-3 py-2 border-b border-slate-100 space-y-0.5">
        <button
          onClick={() => { onSort("asc"); onClose(); }}
          className="flex items-center gap-2 w-full text-[12px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors"
        >
          <ArrowUp size={11} className="text-slate-400" /> Sort Ascending
        </button>
        <button
          onClick={() => { onSort("desc"); onClose(); }}
          className="flex items-center gap-2 w-full text-[12px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors"
        >
          <ArrowDown size={11} className="text-slate-400" /> Sort Descending
        </button>
      </div>

      {options.length > 0 && (
        <div className="max-h-[240px] overflow-y-auto">
          {options.length > 6 && (
            <div className="px-3 pt-2 pb-1">
              <div className="relative">
                <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Filter ${label}…`}
                  className="w-full pl-6 pr-2 py-1 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00b8a9]/30"
                />
              </div>
            </div>
          )}
          <div className="px-2 py-1.5 space-y-0.5">
            <label className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer text-[11.5px] text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onSelect([])}
                className="accent-[#00b8a9] w-3.5 h-3.5"
              />
              (Select All)
            </label>
            {filtered.map((opt) => (
              <label key={opt} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer text-[11.5px] text-slate-600">
                <input
                  type="checkbox"
                  checked={allSelected || selected.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="accent-[#00b8a9] w-3.5 h-3.5"
                />
                {opt === "__unassigned__" ? "(Unassigned)" : opt}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Focused asset class groups (user-defined) ─────────────────────────────────
type FocusedGroup = { key: string; label: string; sourceClasses: AssetClass[]; note: string | null };

const FOCUSED_GROUPS: FocusedGroup[] = [
  { key: "private-equity", label: "Private Equity",  sourceClasses: ["Private Equity", "Venture Capital"], note: "Incl. Venture Capital" },
  { key: "hedge-funds",    label: "Hedge Funds",      sourceClasses: ["Hedge Fund"],                        note: null },
  { key: "long-only",      label: "Long-Only",        sourceClasses: ["Long-Only"],                         note: null },
  { key: "credit",         label: "Credit",           sourceClasses: ["Credit"],                            note: null },
  { key: "real-estate",    label: "Real Estate",      sourceClasses: ["Real Estate"],                       note: null },
  { key: "real-assets",    label: "Real Assets",      sourceClasses: ["Real Assets"],                       note: null },
];

// ── Score range labels for filter ─────────────────────────────────────────────
const SCORE_RANGES = ["Zero", "Low (<5)", "Mid (5–6.5)", "Good (6.5–8)", "High (≥8)"] as const;

function scoreInRange(score: number, range: string): boolean {
  if (range === "Zero")          return score === 0;
  if (range === "Low (<5)")      return score > 0 && score < 5;
  if (range === "Mid (5–6.5)")   return score >= 5 && score < 6.5;
  if (range === "Good (6.5–8)")  return score >= 6.5 && score < 8;
  if (range === "High (≥8)")     return score >= 8;
  return false;
}

// ── Page ──────────────────────────────────────────────────────────────────────
type SubTab = "overview" | "by-class";
type SortKey = "org" | "score" | "aum" | "class" | "state" | "country";
type ColFilterState = Record<string, string[]>;

export default function BenchmarkPage() {
  const [orgs, setOrgs]           = useState<OrgBenchmarkEntry[]>(() => BENCHMARK_ORGS.map((e) => ({ ...e })));
  const [subTab, setSubTab]       = useState<SubTab>("overview");
  const [search, setSearch]       = useState("");
  const [sortKey, setSortKey]     = useState<SortKey>("score");
  const [sortAsc, setSortAsc]     = useState(false);
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [toast, setToast]         = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [colFilters, setColFilters]     = useState<ColFilterState>({});
  const [openFilter, setOpenFilter]     = useState<string | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<DOMRect | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeOrgs = useMemo(
    () => orgs.filter((e) => !e.excludedFromBenchmark && e.lpiScore > 0),
    [orgs]
  );
  const overallStats   = useMemo(() => computeDistStats(activeOrgs.map((e) => e.lpiScore)), [activeOrgs]);
  const unassignedCount = useMemo(() => orgs.filter((e) => !e.assetClass).length, [orgs]);

  const allStates = useMemo(() => {
    const s = new Set(orgs.map((e) => e.state).filter((v) => v !== "—"));
    return Array.from(s).sort();
  }, [orgs]);

  const allCountries = useMemo(() => {
    const s = new Set(orgs.map((e) => e.country));
    return Array.from(s).sort();
  }, [orgs]);

  const filteredOrgs = useMemo(() => {
    let res = [...orgs];

    if (search) {
      const q = search.toLowerCase();
      res = res.filter(
        (e) => e.orgName.toLowerCase().includes(q) || (e.assetClass ?? "").toLowerCase().includes(q)
      );
    }

    const cf = colFilters;
    if ((cf["score"]?.length ?? 0) > 0)
      res = res.filter((e) => cf["score"].some((r) => scoreInRange(e.lpiScore, r)));
    if ((cf["class"]?.length ?? 0) > 0)
      res = res.filter((e) => cf["class"].includes(e.assetClass ?? "__unassigned__"));
    if ((cf["state"]?.length ?? 0) > 0)
      res = res.filter((e) => cf["state"].includes(e.state));
    if ((cf["country"]?.length ?? 0) > 0)
      res = res.filter((e) => cf["country"].includes(e.country));

    res.sort((a, b) => {
      let diff = 0;
      if (sortKey === "score")   diff = a.lpiScore - b.lpiScore;
      if (sortKey === "org")     diff = a.orgName.localeCompare(b.orgName);
      if (sortKey === "aum")     diff = a.aumRaw - b.aumRaw;
      if (sortKey === "class")   diff = (a.assetClass ?? "").localeCompare(b.assetClass ?? "");
      if (sortKey === "state")   diff = a.state.localeCompare(b.state);
      if (sortKey === "country") diff = a.country.localeCompare(b.country);
      return sortAsc ? diff : -diff;
    });
    return res;
  }, [orgs, search, colFilters, sortKey, sortAsc]);

  const classData = useMemo(() =>
    ASSET_CLASSES.map((cls) => ({
      cls,
      entries: orgs.filter((e) => e.assetClass === cls),
    })).sort((a, b) => {
      const na = a.entries.filter((e) => !e.excludedFromBenchmark).length;
      const nb = b.entries.filter((e) => !e.excludedFromBenchmark).length;
      return nb - na;
    }),
    [orgs]
  );

  const activeFiltersCount = Object.values(colFilters).filter((v) => v.length > 0).length;

  // ── Focused asset class group ────────────────────────────────────────────────
  const [focusedGroupKey, setFocusedGroupKey] = useState<string>("private-equity");

  const focusedGroupData = useMemo(() => {
    const group = FOCUSED_GROUPS.find((g) => g.key === focusedGroupKey);
    if (!group) return null;
    const entries = orgs.filter(
      (e) =>
        !e.excludedFromBenchmark &&
        e.lpiScore > 0 &&
        e.assetClass !== null &&
        (group.sourceClasses as string[]).includes(e.assetClass)
    );
    const stats = computeDistStats(entries.map((e) => e.lpiScore));
    return { group, entries, stats };
  }, [focusedGroupKey, orgs]);

  // ── Actions ────────────────────────────────────────────────────────────────
  function toggleExclude(id: string) {
    const entry = orgs.find((e) => e.id === id);
    setOrgs((prev) => prev.map((e) => e.id === id ? { ...e, excludedFromBenchmark: !e.excludedFromBenchmark } : e));
    if (entry) showToast(entry.excludedFromBenchmark ? `${entry.orgName} included.` : `${entry.orgName} excluded.`);
  }

  function bulkSetExclude(exclude: boolean) {
    setOrgs((prev) => prev.map((e) => selectedIds.has(e.id) ? { ...e, excludedFromBenchmark: exclude } : e));
    showToast(`${selectedIds.size} org${selectedIds.size !== 1 ? "s" : ""} ${exclude ? "excluded from" : "included in"} benchmark.`);
    setSelectedIds(new Set());
  }

  function assignClass(id: string, cls: AssetClass) {
    const entry = orgs.find((e) => e.id === id);
    setOrgs((prev) => prev.map((e) => e.id === id ? { ...e, assetClass: cls } : e));
    setEditingClass(null);
    if (entry) showToast(`${entry.orgName} → ${cls}`);
  }

  function handleSort(key: SortKey, dir?: "asc" | "desc") {
    if (dir) { setSortKey(key); setSortAsc(dir === "asc"); }
    else if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredOrgs.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredOrgs.map((e) => e.id)));
  }

  function openColFilter(col: string, e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (openFilter === col) { setOpenFilter(null); return; }
    setFilterAnchor(rect);
    setOpenFilter(col);
  }

  function setColFilter(col: string, values: string[]) {
    setColFilters((prev) => ({ ...prev, [col]: values }));
  }

  // ── Column header renderer ─────────────────────────────────────────────────
  function ColH({
    col,
    label,
    filterOpts,
  }: {
    col: SortKey;
    label: string;
    filterOpts?: string[];
  }) {
    const isActive  = sortKey === col;
    const hasFilter = (colFilters[col]?.length ?? 0) > 0;
    return (
      <div className="flex items-center gap-1 group">
        <button
          onClick={() => handleSort(col)}
          className="flex items-center gap-0.5 hover:text-slate-700 transition-colors"
        >
          {label}
          {isActive
            ? (sortAsc ? <ArrowUp size={9} className="text-[#00b8a9]" /> : <ArrowDown size={9} className="text-[#00b8a9]" />)
            : <ChevronDown size={9} className="text-slate-300 group-hover:text-slate-400" />}
        </button>
        {filterOpts && (
          <button
            onClick={(e) => openColFilter(col, e)}
            className={`p-0.5 rounded transition-colors ${
              hasFilter
                ? "text-[#00897b] bg-[#00b8a9]/10"
                : "text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100"
            }`}
          >
            <ChevronDown size={9} />
          </button>
        )}
        {hasFilter && <span className="w-1.5 h-1.5 rounded-full bg-[#00b8a9] shrink-0" />}
      </div>
    );
  }

  // ── Active filter dropdown options ─────────────────────────────────────────
  const filterDropdownOpts: string[] =
    openFilter === "score"   ? [...SCORE_RANGES] :
    openFilter === "class"   ? [...(ASSET_CLASSES as readonly string[]), "__unassigned__"] :
    openFilter === "state"   ? allStates :
    openFilter === "country" ? allCountries :
    [];

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

      {/* Column filter dropdown portal */}
      {openFilter && filterAnchor && (
        <ColFilterDropdown
          column={openFilter}
          label={openFilter}
          options={filterDropdownOpts}
          selected={colFilters[openFilter] ?? []}
          onSelect={(v) => setColFilter(openFilter, v)}
          onSort={(dir) => handleSort(openFilter as SortKey, dir)}
          onClose={() => setOpenFilter(null)}
          anchorRect={filterAnchor}
        />
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#00b8a9]" />
            LPI Benchmark
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Platform-wide LPI score distribution across all organizations and asset classes.
          </p>
        </div>
        {unassignedCount > 0 && (
          <button
            onClick={() => setColFilter("class", ["__unassigned__"])}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11.5px] font-semibold hover:bg-amber-100 transition-colors"
          >
            <Info size={11} />
            {unassignedCount} missing asset class{unassignedCount !== 1 ? "es" : ""}
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex items-end gap-0 border-b border-slate-200 -mb-px">
        {([
          { key: "overview",  label: "All Organizations", Icon: Users  },
          { key: "by-class",  label: "By Asset Class",    Icon: Layers },
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

      {/* ── ALL ORGANIZATIONS TAB ─────────────────────────────────────────── */}
      {subTab === "overview" && (
        <div className="space-y-5">

          {/* Stat cards */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Total Organizations", value: orgs.length,            sub: "across all asset classes" },
              { label: "In Benchmark",         value: activeOrgs.length,      sub: `${orgs.length - activeOrgs.length} excluded` },
              { label: "25th Percentile",      value: overallStats?.q1.toFixed(2)     ?? "—", sub: "Q1 (LPI score)" },
              { label: "Median (50th)",         value: overallStats?.median.toFixed(2) ?? "—", sub: "LPI score" },
              { label: "75th Percentile",       value: overallStats?.q3.toFixed(2)     ?? "—", sub: "Q3 (LPI score)" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                <p className="text-[22px] font-bold text-slate-800 leading-none">{value}</p>
                <p className="text-[11.5px] font-semibold text-slate-600 mt-1">{label}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Distribution chart */}
          {overallStats && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Platform LPI Distribution</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">
                    {activeOrgs.length} active organizations · LPI score 0–10
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {(["P10","Q1","Median","Q3","P90"] as const).map((l) => {
                    const val = l === "P10" ? overallStats.p10 : l === "Q1" ? overallStats.q1 : l === "Median" ? overallStats.median : l === "Q3" ? overallStats.q3 : overallStats.p90;
                    return (
                      <div key={l} className="text-center px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-[9.5px] text-slate-400">{l}</p>
                        <p className="text-[12px] font-bold text-slate-700 font-mono">{val.toFixed(2)}</p>
                      </div>
                    );
                  })}
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

            {activeFiltersCount > 0 && (
              <button
                onClick={() => setColFilters({})}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[12px] text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={11} />
                Clear filters ({activeFiltersCount})
              </button>
            )}

            <div className="ml-auto text-[11.5px] text-slate-400">
              {filteredOrgs.length} of {orgs.length} shown
            </div>
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0f1923] rounded-xl border border-white/10">
              <span className="text-white text-[12.5px] font-medium">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => bulkSetExclude(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00b8a9]/20 border border-[#00b8a9]/30 text-[#00b8a9] text-[12px] hover:bg-[#00b8a9]/30 transition-colors"
                >
                  <Eye size={12} /> Include Selected
                </button>
                <button
                  onClick={() => bulkSetExclude(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] hover:bg-red-500/20 transition-colors"
                >
                  <EyeOff size={12} /> Exclude Selected
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-slate-400 hover:text-white transition-colors ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-3 py-2.5 w-8">
                    <input
                      type="checkbox"
                      checked={filteredOrgs.length > 0 && selectedIds.size === filteredOrgs.length}
                      onChange={toggleSelectAll}
                      className="accent-[#00b8a9] w-3.5 h-3.5"
                    />
                  </th>
                  <th className="w-6 px-1 py-2.5" />
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <ColH col="org" label="Organization" />
                  </th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <ColH col="score" label="LPI Score" filterOpts={[...SCORE_RANGES]} />
                  </th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <ColH col="aum" label="AUM" />
                  </th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <ColH col="class" label="Asset Class" filterOpts={[...(ASSET_CLASSES as readonly string[]), "__unassigned__"]} />
                  </th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <ColH col="state" label="State" filterOpts={allStates} />
                  </th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <ColH col="country" label="Country" filterOpts={allCountries} />
                  </th>
                  <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Benchmark
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrgs.flatMap((entry) => {
                  const rows = [
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50/60 transition-colors ${entry.excludedFromBenchmark ? "opacity-45" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(entry.id)}
                          onChange={() => toggleSelect(entry.id)}
                          className="accent-[#00b8a9] w-3.5 h-3.5"
                        />
                      </td>
                      {/* Expand button */}
                      <td className="px-1 py-3 w-6 text-center">
                        {entry.historicalScores.length > 0 ? (
                          <button
                            onClick={() => toggleRow(entry.id)}
                            className="text-slate-300 hover:text-[#00b8a9] transition-colors"
                          >
                            {expandedRows.has(entry.id)
                              ? <ChevronUp size={13} />
                              : <ChevronRight size={13} />}
                          </button>
                        ) : null}
                      </td>
                      {/* Org name */}
                      <td className="px-3 py-3 font-medium text-slate-800">{entry.orgName}</td>
                      {/* LPI Score */}
                      <td className="px-3 py-3"><MiniBar score={entry.lpiScore} /></td>
                      {/* AUM */}
                      <td className="px-3 py-3 text-slate-600 font-mono text-[11.5px]">{entry.aum}</td>
                      {/* Asset class */}
                      <td className="px-3 py-3">
                        {editingClass === entry.id ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              autoFocus
                              defaultValue=""
                              onChange={(e) => { if (e.target.value) assignClass(entry.id, e.target.value as AssetClass); }}
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
                            <Info size={10} /> Assign class <ChevronDown size={9} />
                          </button>
                        )}
                      </td>
                      {/* State */}
                      <td className="px-3 py-3 text-[11.5px] text-slate-600">
                        {entry.state !== "—" ? entry.state : <span className="text-slate-300">—</span>}
                      </td>
                      {/* Country */}
                      <td className="px-3 py-3 text-[11.5px] text-slate-600">{entry.country}</td>
                      {/* Benchmark toggle */}
                      <td className="px-3 py-3 text-center">
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
                    </tr>,
                  ];

                  if (expandedRows.has(entry.id) && entry.historicalScores.length > 0) {
                    rows.push(
                      <tr key={`${entry.id}-history`} className="bg-slate-50/70 border-b border-slate-100">
                        <td colSpan={9} className="px-12 py-3">
                          <div className="flex items-center gap-2 mb-2.5">
                            <History size={11} className="text-[#00b8a9]" />
                            <span className="text-[11px] font-semibold text-slate-600">Historical LPI Scores</span>
                          </div>
                          <div className="flex items-start gap-5 flex-wrap">
                            {entry.historicalScores.map((hs) => (
                              <div key={hs.year} className="flex flex-col items-center gap-1">
                                <ScoreBadge score={hs.lpiScore} />
                                <span className="text-[10px] font-semibold text-slate-500">{hs.year}</span>
                                <span className="text-[9px] text-slate-400 max-w-[90px] text-center leading-tight">{hs.surveyLabel}</span>
                              </div>
                            ))}
                            <div className="flex flex-col items-center gap-1 border-l-2 border-[#00b8a9]/20 pl-5">
                              <ScoreBadge score={entry.lpiScore} />
                              <span className="text-[10px] font-semibold text-[#00897b]">2026 (current)</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return rows;
                })}
              </tbody>
            </table>

            {filteredOrgs.length === 0 && (
              <div className="text-center py-10">
                <BarChart3 size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No organizations match your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BY ASSET CLASS TAB ────────────────────────────────────────────── */}
      {subTab === "by-class" && (
        <div className="space-y-8 pt-3">
          <div className="flex items-center gap-3 text-[12px] text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              <TrendingUp size={11} className="text-[#00b8a9]" />
              {FOCUSED_GROUPS.length} asset class groups
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              <Users size={11} className="text-slate-400" />
              {activeOrgs.length} active organizations
            </span>
          </div>

          {overallStats && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Roundtables Universe</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">
                    All {activeOrgs.length} active organizations · reference benchmark
                  </p>
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

          {/* ── Focused Asset Class Benchmarks ────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[13px] font-bold text-slate-800">Asset Class Benchmarks</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">Select an asset class to view its LPI distribution</p>
            </div>

            <div className="px-5 py-3.5 flex items-center gap-2 flex-wrap border-b border-slate-100">
              {FOCUSED_GROUPS.map((g) => {
                const n = orgs.filter(
                  (e) =>
                    !e.excludedFromBenchmark &&
                    e.lpiScore > 0 &&
                    e.assetClass !== null &&
                    (g.sourceClasses as string[]).includes(e.assetClass)
                ).length;
                return (
                  <button
                    key={g.key}
                    onClick={() => setFocusedGroupKey(g.key)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-150 ${
                      focusedGroupKey === g.key
                        ? "bg-[#00b8a9] border-[#00b8a9] text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-[#00b8a9]/40 hover:text-[#00897b]"
                    }`}
                  >
                    {g.label}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        focusedGroupKey === g.key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>

            {focusedGroupData && (
              <div className="p-5">
                {/* Title */}
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-bold text-slate-800">{focusedGroupData.group.label}</p>
                  {focusedGroupData.group.note && (
                    <span className="text-[10.5px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {focusedGroupData.group.note}
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] text-slate-400 mb-4">
                  {focusedGroupData.entries.length} organizations · LPI score 0–10
                </p>

                {/* Stat tiles — own row */}
                {focusedGroupData.stats && focusedGroupData.entries.length >= 3 && (
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {(["P10", "Q1", "Median", "Q3", "P90"] as const).map((l) => {
                      const s = focusedGroupData.stats!;
                      const v =
                        l === "P10" ? s.p10 : l === "Q1" ? s.q1 : l === "Median" ? s.median : l === "Q3" ? s.q3 : s.p90;
                      return (
                        <div key={l} className="text-center px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 min-w-[52px]">
                          <p className="text-[9.5px] text-slate-400">{l}</p>
                          <p className="text-[12px] font-bold text-slate-700 font-mono">{v.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {focusedGroupData.stats && focusedGroupData.entries.length >= 3 ? (
                  <>
                    <DistBar stats={focusedGroupData.stats} size="md" />
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <ChartLegend />
                    </div>
                  </>
                ) : focusedGroupData.entries.length > 0 ? (
                  <p className="text-[11px] text-slate-400 py-2">Min. 3 organizations needed for distribution chart.</p>
                ) : (
                  <p className="text-[11px] text-slate-400 py-2">No active organizations in this class.</p>
                )}

                {focusedGroupData.entries.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-2.5 uppercase tracking-wide">
                      Organizations · sorted by score
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[...focusedGroupData.entries]
                        .sort((a, b) => b.lpiScore - a.lpiScore)
                        .map((e) => (
                          <div
                            key={e.id}
                            className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-[11.5px] font-medium text-slate-700 truncate">{e.orgName}</p>
                              {e.assetClass === "Venture Capital" && (
                                <p className="text-[9.5px] text-slate-400">VC</p>
                              )}
                            </div>
                            <ScoreBadge score={e.lpiScore} />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* All classes breakdown */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">All Asset Classes</p>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classData
                .filter(({ cls }) => FOCUSED_GROUPS.some((g) => (g.sourceClasses as string[]).includes(cls)))
                .map(({ cls, entries: clsEntries }) => (
                  <AssetClassCard key={cls} cls={cls} entries={clsEntries} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
