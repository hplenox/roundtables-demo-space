"use client";

import { useState } from "react";
import {
  GEOGRAPHY_OPTIONS, AUM_SIZE_OPTIONS, ASSET_CLASS_OPTIONS, WORKFORCE_SIZE_OPTIONS,
  EMPTY_FILTER_SELECTIONS, type LpiFilterSelections,
} from "@/lib/lpi-filter-mock";

function FilterRow<T extends string>({
  label, options, selected, onToggle,
}: {
  label: string;
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`px-3.5 py-1.5 rounded-full border text-[12.5px] font-medium transition-colors ${
                active ? "border-[#0f1923] bg-[#0f1923] text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function PeerFilterPanel({
  initial,
  onApply,
}: {
  initial: LpiFilterSelections;
  onApply: (selections: LpiFilterSelections) => void;
}) {
  const [draft, setDraft] = useState<LpiFilterSelections>(initial);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-5">
      <FilterRow
        label="Geography"
        options={GEOGRAPHY_OPTIONS}
        selected={draft.geography}
        onToggle={(v) => setDraft((d) => ({ ...d, geography: toggleIn(d.geography, v) }))}
      />
      <FilterRow
        label="AUM Size"
        options={AUM_SIZE_OPTIONS}
        selected={draft.aumSize}
        onToggle={(v) => setDraft((d) => ({ ...d, aumSize: toggleIn(d.aumSize, v) }))}
      />
      <FilterRow
        label="Asset Class"
        options={ASSET_CLASS_OPTIONS}
        selected={draft.assetClass}
        onToggle={(v) => setDraft((d) => ({ ...d, assetClass: toggleIn(d.assetClass, v) }))}
      />
      <FilterRow
        label="Workforce Size"
        options={WORKFORCE_SIZE_OPTIONS}
        selected={draft.workforceSize}
        onToggle={(v) => setDraft((d) => ({ ...d, workforceSize: toggleIn(d.workforceSize, v) }))}
      />

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => { setDraft(EMPTY_FILTER_SELECTIONS); onApply(EMPTY_FILTER_SELECTIONS); }}
          className="text-[12.5px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          className="px-4 py-2 rounded-lg bg-[#0f1923] text-white text-[12.5px] font-semibold hover:bg-slate-800 transition-colors"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
