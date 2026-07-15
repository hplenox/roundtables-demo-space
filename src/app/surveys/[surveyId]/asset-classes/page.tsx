"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getSurveyById, getOrgsBySurveyId, getCustomAssetClassesBySurveyId } from "@/lib/mock-data";
import { BENCHMARK_GROUPS, type BenchmarkGroupKey } from "@/lib/asset-class-groups";
import type { CustomAssetClass } from "@/types/survey";
import { Plus, ArrowRight, X, Layers, Trash2, Search, Info } from "lucide-react";

// ─── Add Asset Class modal ─────────────────────────────────────────────────

function AddAssetClassModal({
  existingNames,
  onClose,
  onAdd,
}: {
  existingNames: string[];
  onClose: () => void;
  onAdd: (name: string, group: BenchmarkGroupKey) => void;
}) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<BenchmarkGroupKey | "">("");

  const trimmed = name.trim();
  const isDuplicate = trimmed !== "" && existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase());
  const canSubmit = trimmed !== "" && group !== "" && !isDuplicate;

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
              <p className="text-[11px] text-slate-400 mt-0.5">Define a label and map it to a benchmark category</p>
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
              Maps To
            </label>
            <div className="flex items-center gap-2">
              <div className="w-5 flex items-center justify-center shrink-0">
                <ArrowRight size={15} className="text-slate-300" />
              </div>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as BenchmarkGroupKey)}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 focus:outline-none focus:border-[#00b8a9] transition-colors"
              >
                <option value="" disabled>Select benchmark category…</option>
                {BENCHMARK_GROUPS.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}{g.note ? ` — ${g.note}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-start gap-1">
              <Info size={11} className="mt-[1.5px] shrink-0" />
              Organizations tagged with this asset class will be benchmarked against the mapped category&apos;s peer group.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
          <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => canSubmit && onAdd(trimmed, group as BenchmarkGroupKey)}
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

  function handleAdd(name: string, group: BenchmarkGroupKey) {
    setClasses((prev) => [
      ...prev,
      { id: `cac-custom-${prev.length}-${name.toLowerCase().replace(/\s+/g, "-")}`, surveyId, name, benchmarkGroup: group, createdAt: "Just now" },
    ]);
    setShowAdd(false);
  }

  function handleRemap(id: string, group: BenchmarkGroupKey) {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, benchmarkGroup: group } : c)));
  }

  function handleRemove(id: string) {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = classes.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const groupSummary = BENCHMARK_GROUPS.map((g) => {
    const classesInGroup = classes.filter((c) => c.benchmarkGroup === g.key);
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
            Define the asset class labels used across this survey, then map each one to a Roundtables benchmark
            category so peer comparisons stay accurate.
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
        </p>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Custom Asset Class</div>
          <div className="w-5" />
          <div className="w-48 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Benchmark Category</div>
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
                ? "Add your first custom asset class and map it to a benchmark category to start organizing invited organizations."
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
                className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                    <Layers size={12} className="text-slate-500" />
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 truncate">{c.name}</p>
                </div>

                <div className="w-5 flex justify-center shrink-0">
                  <ArrowRight size={14} className="text-slate-300" />
                </div>

                <div className="w-48 shrink-0">
                  <select
                    value={c.benchmarkGroup}
                    onChange={(e) => handleRemap(c.id, e.target.value as BenchmarkGroupKey)}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[12px] font-medium text-slate-700 focus:outline-none focus:border-[#00b8a9] transition-colors"
                  >
                    {BENCHMARK_GROUPS.map((g) => (
                      <option key={g.key} value={g.key}>{g.label}</option>
                    ))}
                  </select>
                </div>

                <div className="w-28 text-right shrink-0">
                  <span className={`text-[11.5px] ${n > 0 ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                    {n} org{n === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="w-7 flex justify-end shrink-0">
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
