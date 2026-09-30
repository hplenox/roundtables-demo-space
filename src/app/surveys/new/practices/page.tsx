"use client";

import { useEffect } from "react";
import { ensureDraft, markTouched, setAllPractices, updatePracticeQuestion, useDraft } from "@/lib/survey-draft-store";
import {
  PRACTICES_CONFIG,
  PRACTICES_INTRO,
  PRACTICES_NONE_LABEL,
  PRACTICE_ANSWER_HINT,
} from "@/lib/survey-draft-config";
import SectionPageShell from "@/components/surveys/SectionPageShell";
import { Info } from "lucide-react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${
        checked ? "bg-[#00b8a9]" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

export default function PracticesPage() {
  const draft = useDraft();

  useEffect(() => {
    ensureDraft();
    markTouched("practices");
  }, []);

  if (!draft) return null;

  const states = Object.values(draft.practices);
  const allEnabled = states.length > 0 && states.every((p) => p.enabled);
  const noneEnabled = states.every((p) => !p.enabled);

  return (
    <SectionPageShell
      title="Practices Questions"
      description="Optional — choose which Organizational Activities, ESG, and Impact questions to include."
    >
      <div className="flex gap-2.5 mb-5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
        <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-slate-600 leading-snug">{PRACTICES_INTRO}</p>
      </div>

      <div className="space-y-2 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Toggle checked={allEnabled} onChange={(v) => setAllPractices(v)} />
          <span className="text-[13px] font-semibold text-slate-800">Enable All Questions</span>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            className="mt-0.5 border-slate-300 text-[#00b8a9] focus:ring-[#00b8a9]/40"
            checked={noneEnabled}
            onChange={() => setAllPractices(false)}
          />
          <span className="text-[12.5px] text-slate-600">
            <span className="font-semibold text-slate-800">None</span> — {PRACTICES_NONE_LABEL}
          </span>
        </label>
      </div>

      <div className="space-y-6">
        {PRACTICES_CONFIG.map((category) => {
          const enabledCount = category.questions.filter((q) => draft.practices[q.key]?.enabled).length;
          return (
            <div key={category.key}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[13.5px] font-bold text-slate-900">{category.label}</h3>
                <span className="text-[11.5px] text-slate-400 tabular-nums shrink-0">
                  {enabledCount} of {category.questions.length} enabled
                </span>
              </div>
              <p className="text-[11.5px] text-slate-400 mb-2">{category.sublabel}</p>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {category.questions.map((q) => {
                  const enabled = draft.practices[q.key]?.enabled ?? false;
                  return (
                    <div
                      key={q.key}
                      className={`flex items-start gap-3 px-4 py-3.5 ${enabled ? "bg-white" : "bg-slate-50/60"}`}
                    >
                      <Toggle checked={enabled} onChange={(v) => updatePracticeQuestion(q.key, v)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                              enabled ? "bg-[#00b8a9]/10 text-[#00897b]" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {q.code}
                          </span>
                          <span
                            className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                              enabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {enabled ? "Question Enabled" : "Question Disabled"}
                          </span>
                        </div>
                        <p className={`text-[12.5px] leading-snug ${enabled ? "text-slate-700" : "text-slate-400"}`}>
                          {q.question}
                        </p>
                        <p className={`text-[11px] mt-1 ${enabled ? "text-slate-400" : "text-slate-300"}`}>
                          {PRACTICE_ANSWER_HINT[q.answerType]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SectionPageShell>
  );
}
