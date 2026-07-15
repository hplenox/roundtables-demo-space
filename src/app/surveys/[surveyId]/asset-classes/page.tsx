"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { getSurveyById, getOrgsBySurveyId, getCustomAssetClassesBySurveyId } from "@/lib/mock-data";
import { BENCHMARK_GROUPS, benchmarkGroupLabel, type BenchmarkGroupKey } from "@/lib/asset-class-groups";
import type { CustomAssetClass } from "@/types/survey";
import { Plus, ArrowRight, X, Layers, Trash2, Search, Info, ChevronDown, Check } from "lucide-react";

// ─── Benchmark category multi-select ───────────────────────────────────────
// Reused in both the Add Asset Class modal and each list row's inline
// remapping control, since a custom asset class can map to more than one
// benchmark category (or none yet).

function BenchmarkGroupMultiSelect({
  selected,
  onChange,
  placeholder = "Not mapped",
  size = "md",
}: {
  selected: BenchmarkGroupKey[];
  onChange: (next: BenchmarkGroupKey[]) => void;
  placeholder?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The panel is portaled to document.body and positioned `fixed` from the
  // anchor's live bounding box, so it isn't clipped by an ancestor's
  // `overflow-hidden` (e.g. the rounded list container) — same fix pattern
  // as the org list's HoverTooltip.
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggleOpen() {
    if (!open) {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
    setOpen((o) => !o);
  }

  function toggle(key: BenchmarkGroupKey) {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  const isSm = size === "sm";

  return (
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className={`w-full flex items-center gap-1.5 rounded-lg border bg-white transition-colors ${
          isSm ? "min-h-8 px-2.5 py-1" : "min-h-9 px-3 py-1.5"
        } ${open ? "border-[#00b8a9] ring-1 ring-[#00b8a9]/20" : selected.length === 0 ? "border-amber-200 bg-amber-50/40" : "border-slate-200 hover:border-slate-300"}`}
      >
        <div className="flex-1 flex items-center gap-1 flex-wrap min-w-0">
          {selected.length === 0 ? (
            <span className={`text-slate-400 ${isSm ? "text-[11.5px]" : "text-[13px]"}`}>{placeholder}</span>
          ) : (
            selected.map((key) => (
              <span
                key={key}
                className={`inline-flex items-center gap-1 rounded font-medium bg-[#e8f5f3] text-[#00897b] ${
                  isSm ? "px-1.5 py-0.5 text-[10.5px]" : "px-1.5 py-0.5 text-[11.5px]"
                }`}
              >
                {benchmarkGroupLabel(key)}
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(key);
                  }}
                  className="hover:text-[#00695c]"
                >
                  <X size={10} />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown size={13} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: coords.top, left: coords.left, minWidth: Math.max(coords.width, 224) }}
            className="z-[9999] bg-white rounded-lg border border-slate-200 shadow-lg py-1.5"
          >
            {BENCHMARK_GROUPS.map((g) => {
              const checked = selected.includes(g.key);
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => toggle(g.key)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      checked ? "bg-[#00b8a9] border-[#00b8a9]" : "border-slate-300"
                    }`}
                  >
                    {checked && <Check size={11} className="text-white" strokeWidth={2.5} />}
                  </span>
                  <span className="text-[12.5px] text-slate-700">{g.label}</span>
                  {g.note && <span className="text-[10px] text-slate-400 ml-auto shrink-0">{g.note}</span>}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

// ─── Add Asset Class modal ─────────────────────────────────────────────────

function AddAssetClassModal({
  existingNames,
  onClose,
  onAdd,
}: {
  existingNames: string[];
  onClose: () => void;
  onAdd: (name: string, groups: BenchmarkGroupKey[]) => void;
}) {
  const [name, setName] = useState("");
  const [groups, setGroups] = useState<BenchmarkGroupKey[]>([]);

  const trimmed = name.trim();
  const isDuplicate = trimmed !== "" && existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase());
  const canSubmit = trimmed !== "" && !isDuplicate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5f3] flex items-center justify-center">
              <Layers size={15} className="text-[#00897b]" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800">Add Asset Class</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Define a label, and optionally map it to benchmark categories</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Asset Class Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Growth Buyout"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#00b8a9] transition-colors"
            />
            {isDuplicate && (
              <p className="text-[11px] text-red-500 mt-1.5">An asset class with this name already exists.</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Maps To <span className="text-slate-400 font-normal normal-case">(optional — can pick more than one, or set this later)</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="w-5 flex items-center justify-center shrink-0">
                <ArrowRight size={15} className="text-slate-300" />
              </div>
              <div className="flex-1">
                <BenchmarkGroupMultiSelect selected={groups} onChange={setGroups} placeholder="Select benchmark categories…" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-start gap-1">
              <Info size={11} className="mt-[1.5px] shrink-0" />
              Organizations tagged with this asset class will be benchmarked against every mapped category&apos;s peer group.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
          <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => canSubmit && onAdd(trimmed, groups)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={12} /> Add Asset Class
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AssetClassesPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const survey = getSurveyById(surveyId);
  const orgs = getOrgsBySurveyId(surveyId);

  const [classes, setClasses] = useState<CustomAssetClass[]>(() => getCustomAssetClassesBySurveyId(surveyId));
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  if (!survey) {
    return <div className="text-slate-500 text-sm py-10 text-center">Survey not found.</div>;
  }

  function orgCount(className: string) {
    return orgs.filter((o) => o.customAssetClass === className).length;
  }

  function handleAdd(name: string, groups: BenchmarkGroupKey[]) {
    setClasses((prev) => [
      ...prev,
      { id: `cac-custom-${prev.length}-${name.toLowerCase().replace(/\s+/g, "-")}`, surveyId, name, benchmarkGroups: groups, createdAt: "Just now" },
    ]);
    setShowAdd(false);
  }

  function handleRemap(id: string, groups: BenchmarkGroupKey[]) {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, benchmarkGroups: groups } : c)));
  }

  function handleRemove(id: string) {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = classes.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const unmappedCount = classes.filter((c) => c.benchmarkGroups.length === 0).length;

  const groupSummary = BENCHMARK_GROUPS.map((g) => {
    const classesInGroup = classes.filter((c) => c.benchmarkGroups.includes(g.key));
    return {
      ...g,
      classCount: classesInGroup.length,
      orgCount: classesInGroup.reduce((sum, c) => sum + orgCount(c.name), 0),
    };
  });

  return (
    <div className="space-y-4">
      {showAdd && (
        <AddAssetClassModal
          existingNames={classes.map((c) => c.name)}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-slate-800">Asset Classes</h2>
          <p className="text-[12px] text-slate-400 mt-0.5 max-w-xl">
            Define the asset class labels used across this survey, then map each one to one or more Roundtables
            benchmark categories so peer comparisons stay accurate.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0f1923] text-white text-[12.5px] font-medium hover:bg-[#1a2733] transition-colors"
        >
          <Plus size={14} /> Add Asset Class
        </button>
      </div>

      {/* Benchmark category summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {groupSummary.map((g) => (
          <div key={g.key} className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 shadow-sm">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate" title={g.label}>
              {g.label}
            </p>
            <p className="text-[16px] font-bold text-slate-800 mt-0.5 tabular-nums">{g.orgCount}</p>
            <p className="text-[10.5px] text-slate-400">
              {g.classCount} class{g.classCount === 1 ? "" : "es"}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search asset classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 w-56 rounded-lg bg-white border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition-all duration-150"
          />
        </div>
        <p className="text-[11.5px] text-slate-400 ml-auto">
          {classes.length} asset class{classes.length === 1 ? "" : "es"} defined
          {unmappedCount > 0 && (
            <span className="text-amber-600 font-medium"> · {unmappedCount} not yet mapped</span>
          )}
        </p>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Custom Asset Class</div>
          <div className="w-5" />
          <div className="w-60 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Benchmark Categories</div>
          <div className="w-28 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Organizations</div>
          <div className="w-7" />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <Layers size={18} className="text-slate-300" />
            </div>
            <p className="text-[13px] font-medium text-slate-600">
              {classes.length === 0 ? "No asset classes yet" : "No asset classes match your search"}
            </p>
            <p className="text-[11.5px] text-slate-400 mt-1 max-w-xs">
              {classes.length === 0
                ? "Add your first custom asset class. You can map it to one or more benchmark categories now or later."
                : "Try a different search term."}
            </p>
            {classes.length === 0 && (
              <button
                onClick={() => setShowAdd(true)}
                className="mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
              >
                <Plus size={13} /> Add Asset Class
              </button>
            )}
          </div>
        ) : (
          filtered.map((c) => {
            const n = orgCount(c.name);
            return (
              <div
                key={c.id}
                className="flex items-start gap-4 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex-1 min-w-0 flex items-center gap-2 h-8">
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                    <Layers size={12} className="text-slate-500" />
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 truncate">{c.name}</p>
                </div>

                <div className="w-5 h-8 flex items-center justify-center shrink-0">
                  <ArrowRight size={14} className="text-slate-300" />
                </div>

                <div className="w-60 shrink-0">
                  <BenchmarkGroupMultiSelect
                    selected={c.benchmarkGroups as BenchmarkGroupKey[]}
                    onChange={(next) => handleRemap(c.id, next)}
                    size="sm"
                  />
                </div>

                <div className="w-28 h-8 flex items-center justify-end shrink-0">
                  <span className={`text-[11.5px] ${n > 0 ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                    {n} org{n === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="w-7 h-8 flex items-center justify-end shrink-0">
                  <button
                    onClick={() => handleRemove(c.id)}
                    title="Remove asset class"
                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
