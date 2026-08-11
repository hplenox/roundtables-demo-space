"use client";

import { useState } from "react";
import { CYCLE_STATUS_CONFIG } from "@/lib/mock-clients";
import type { Client, ClientSurveyCycle } from "@/types/client";

export function sortCyclesForPicker(cycles: ClientSurveyCycle[]): ClientSurveyCycle[] {
  return [...cycles].sort((a, b) => {
    const aActive = a.status !== "completed";
    const bActive = b.status !== "completed";
    if (aActive !== bActive) return aActive ? -1 : 1;
    return b.year - a.year;
  });
}

/**
 * Checklist, Key Dates, and Onboarding all belong to a single survey
 * cycle, so each of those tabs needs to know which cycle is currently
 * selected. Defaults to the active (non-completed) cycle, falling back to
 * the most recent one — and re-derives on every render rather than
 * freezing at mount, so a freshly-created cycle (e.g. from "Start
 * Onboarding" on a client with none yet) is picked up automatically.
 */
export function useSelectedCycle(client: Client, activeCycle: ClientSurveyCycle | null) {
  const [manualId, setManualId] = useState<string | null>(null);
  const fallback = activeCycle ?? sortCyclesForPicker(client.surveys)[0] ?? null;
  const manual = manualId ? client.surveys.find((s) => s.id === manualId) ?? null : null;
  return { selected: manual ?? fallback, selectCycle: setManualId };
}

export function CyclePicker({
  cycles,
  selectedId,
  onSelect,
}: {
  cycles: ClientSurveyCycle[];
  selectedId: string | null | undefined;
  onSelect: (id: string) => void;
}) {
  if (cycles.length <= 1) return null;
  const sorted = sortCyclesForPicker(cycles);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">Survey Cycle</span>
      {sorted.map((c) => {
        const cfg = CYCLE_STATUS_CONFIG[c.status];
        const active = c.id === selectedId;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150 ${
              active
                ? "bg-[#0f1923] border-[#0f1923] text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {c.name} &rsquo;{String(c.year).slice(2)}
          </button>
        );
      })}
    </div>
  );
}
