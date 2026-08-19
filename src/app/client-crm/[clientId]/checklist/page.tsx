"use client";

import { useClientCtx } from "../client-context";
import { CyclePicker, useSelectedCycle } from "../cycle-picker";
import { checklistProgress, fmtDate, CYCLE_STATUS_CONFIG } from "@/lib/mock-clients";
import { Check, Rocket, ClipboardCheck } from "lucide-react";

export default function ClientChecklistPage() {
  const { client, activeCycle, toggleChecklistItem, launchSurvey } = useClientCtx();
  const { selected: cycle, selectCycle } = useSelectedCycle(client, activeCycle);

  if (!cycle) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
          <ClipboardCheck size={18} className="text-slate-300" />
        </div>
        <p className="text-[13px] font-medium text-slate-600">No survey cycle to check off yet</p>
        <p className="text-[11.5px] text-slate-400 mt-1 max-w-xs mx-auto">
          The launch checklist is tracked per survey cycle — start onboarding from the Home tab to create this client&rsquo;s first one.
        </p>
      </div>
    );
  }

  const progress = checklistProgress(cycle);
  const allDone = progress.total > 0 && progress.done === progress.total;

  return (
    <div className="space-y-4">
      <CyclePicker cycles={client.surveys} selectedId={cycle.id} onSelect={selectCycle} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              {cycle.name} &rsquo;{String(cycle.year).slice(2)} Launch Checklist
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold border ${CYCLE_STATUS_CONFIG[cycle.status].badge}`}>
                {CYCLE_STATUS_CONFIG[cycle.status].label}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Standard steps the LPS team completes for every client survey cycle.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[13px] font-bold text-slate-800">{progress.done}/{progress.total}</p>
            <p className="text-[10.5px] text-slate-400">complete</p>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-slate-50">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-[#4361ee]"}`}
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {cycle.checklist.map((item, i) => (
            <button
              key={item.key}
              onClick={() => toggleChecklistItem(cycle.id, item.key)}
              className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50/60 transition-colors"
            >
              <span className="text-[11px] text-slate-300 tabular-nums w-4 shrink-0">{i + 1}</span>
              <span
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                  item.done ? "bg-[#4361ee] border-[#4361ee]" : "border-slate-300"
                }`}
              >
                {item.done && <Check size={12} className="text-white" strokeWidth={3} />}
              </span>
              <span className={`flex-1 text-[13px] ${item.done ? "text-slate-400 line-through" : "text-slate-700 font-medium"}`}>
                {item.label}
              </span>
              {item.done && item.completedAt && (
                <span className="shrink-0 text-[11px] text-slate-400">
                  {item.completedBy} · {fmtDate(item.completedAt)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {allDone && cycle.status === "onboarding" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-emerald-800">Every checklist item is complete</p>
            <p className="text-[11.5px] text-emerald-700/80 mt-0.5">This cycle is ready to go live.</p>
          </div>
          <button
            onClick={() => launchSurvey(cycle.id)}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-[12.5px] font-medium hover:bg-emerald-700 transition-colors"
          >
            <Rocket size={13} /> Mark Survey as Launched
          </button>
        </div>
      )}
    </div>
  );
}
