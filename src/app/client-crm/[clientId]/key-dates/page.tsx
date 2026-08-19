"use client";

import { useState } from "react";
import { useClientCtx } from "../client-context";
import { KEY_DATE_LABELS, daysUntil, fmtDate, CYCLE_STATUS_CONFIG, CYCLE_STATUS_ORDER } from "@/lib/mock-clients";
import type { ClientKeyDates, ClientSurveyCycle, SurveyCycleStatus } from "@/types/client";
import { Save, CalendarClock, CalendarRange } from "lucide-react";

const FIELD_ORDER: (keyof ClientKeyDates)[] = [
  "kickoffCallDate", "onboardingDate", "launchDate", "endDate", "extensionDate", "targetCloseDate", "reportingDueDate",
];

const FIELD_HINTS: Record<keyof ClientKeyDates, string> = {
  kickoffCallDate: "When the LPS team and the client kick off the survey cycle together.",
  onboardingDate: "Target date for the client to complete their onboarding steps.",
  launchDate: "When the survey goes live to the client's contact list.",
  endDate: "Planned close of the response collection window.",
  extensionDate: "Revised deadline if the response window is extended.",
  targetCloseDate: "Overall target date for the survey cycle to be fully closed out.",
  reportingDueDate: "When final reporting outputs are due back to the client.",
};

// The last cycle stage during which each date still represents something
// pending. Once the cycle has moved past that stage, a past date for that
// field is just a historical fact (the kickoff happened, the survey
// launched) — not something to flag red, even though it's chronologically
// in the past.
const LAST_RELEVANT_STAGE: Record<keyof ClientKeyDates, SurveyCycleStatus> = {
  kickoffCallDate: "onboarding",
  onboardingDate: "onboarding",
  launchDate: "onboarding",
  endDate: "live",
  extensionDate: "live",
  targetCloseDate: "closed",
  reportingDueDate: "reporting",
};

function isOverdueEligible(field: keyof ClientKeyDates, cycleStatus: SurveyCycleStatus): boolean {
  return CYCLE_STATUS_ORDER.indexOf(cycleStatus) <= CYCLE_STATUS_ORDER.indexOf(LAST_RELEVANT_STAGE[field]);
}

// Keyed by cycle.id from the parent, so switching cycles remounts this
// component with a fresh `useState` initializer instead of needing an
// effect to re-sync form state from props.
function KeyDatesForm({ cycle, onSave }: { cycle: ClientSurveyCycle; onSave: (patch: ClientKeyDates) => void }) {
  const [form, setForm] = useState<ClientKeyDates>(cycle.keyDates);
  const dirty = FIELD_ORDER.some((k) => form[k] !== cycle.keyDates[k]);

  function handleChange(key: keyof ClientKeyDates, value: string) {
    setForm((prev) => ({ ...prev, [key]: value === "" ? null : value }));
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <CalendarClock size={15} className="text-slate-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                {cycle.name} &rsquo;{String(cycle.year).slice(2)} Key Dates
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold border ${CYCLE_STATUS_CONFIG[cycle.status].badge}`}>
                  {CYCLE_STATUS_CONFIG[cycle.status].label}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Key dates for this client&rsquo;s upcoming survey — keep them current, the whole LPS team relies on this.</p>
            </div>
          </div>
          <button
            onClick={() => onSave(form)}
            disabled={!dirty}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-colors ${
              dirty ? "bg-[#0f1923] text-white hover:bg-[#1a2733]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Save size={13} /> Save Changes
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {FIELD_ORDER.map((key) => {
            const value = form[key];
            const days = value ? daysUntil(value) : null;
            const overdue = days !== null && days < 0 && isOverdueEligible(key, cycle.status);
            const isPastAndDone = days !== null && days < 0 && !overdue;
            return (
              <div key={key} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800">{KEY_DATE_LABELS[key]}</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">{FIELD_HINTS[key]}</p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  {days !== null && (
                    <span className={`text-[11px] font-medium ${overdue ? "text-red-500" : "text-slate-400"}`}>
                      {overdue ? `${Math.abs(days)}d overdue` : isPastAndDone ? `${Math.abs(days)}d ago` : `in ${days}d`}
                    </span>
                  )}
                  <input
                    type="date"
                    value={value ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:border-[#4361ee] transition-colors"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {dirty && (
        <p className="text-center text-[11.5px] text-amber-600">You have unsaved changes — click Save Changes to apply them.</p>
      )}

      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
        <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Current Timeline</p>
        <div className="flex flex-wrap gap-2">
          {FIELD_ORDER.filter((k) => cycle.keyDates[k]).map((k) => (
            <span key={k} className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 font-medium">
              {KEY_DATE_LABELS[k]}: {fmtDate(cycle.keyDates[k])}
            </span>
          ))}
          {FIELD_ORDER.every((k) => !cycle.keyDates[k]) && (
            <span className="text-[11.5px] text-slate-400">No dates have been set yet for this cycle.</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientKeyDatesPage() {
  const { activeCycle, updateKeyDates } = useClientCtx();

  if (!activeCycle) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
          <CalendarRange size={18} className="text-slate-300" />
        </div>
        <p className="text-[13px] font-medium text-slate-600">No upcoming survey to schedule</p>
        <p className="text-[11.5px] text-slate-400 mt-1 max-w-xs mx-auto">
          Key dates apply to this client&rsquo;s upcoming survey cycle — start onboarding from the Home tab to create one.
        </p>
      </div>
    );
  }

  return (
    <KeyDatesForm key={activeCycle.id} cycle={activeCycle} onSave={(patch) => updateKeyDates(activeCycle.id, patch)} />
  );
}
