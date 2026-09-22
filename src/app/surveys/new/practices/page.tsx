"use client";

import { useEffect } from "react";
import { ensureDraft, markTouched, setAllPractices, updatePracticeQuestion, useDraft } from "@/lib/survey-draft-store";
import { PRACTICES_CONFIG } from "@/lib/survey-draft-config";
import SectionPageShell from "@/components/surveys/SectionPageShell";

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

  const allEnabled = Object.values(draft.practices).every((p) => p.enabled);

  return (
    <SectionPageShell
      title="Practices Questions"
      description="Turn on the governance and talent practice questions you want organizations to answer this cycle."
    >
      <div className="flex items-center gap-3 pb-4 mb-2 border-b border-slate-100">
        <Toggle checked={allEnabled} onChange={(v) => setAllPractices(v)} />
        <span className="text-[13px] font-semibold text-slate-800">Enable All Questions</span>
      </div>

      <div className="space-y-6">
        {PRACTICES_CONFIG.map((category) => (
          <div key={category.key}>
            <h3 className="text-[13.5px] font-bold text-slate-900">{category.label}</h3>
            <p className="text-[11.5px] text-slate-400 mb-2">{category.sublabel}</p>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {category.questions.map((q) => {
                const enabled = draft.practices[q.key]?.enabled ?? false;
                return (
                  <div key={q.key} className={`flex items-start gap-3 px-4 py-3.5 ${enabled ? "bg-white" : "bg-slate-50/60"}`}>
                    <Toggle checked={enabled} onChange={(v) => updatePracticeQuestion(q.key, v)} />
                    <div className="flex-1">
                      <span
                        className={`inline-block mb-1.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          enabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {enabled ? "Question Enabled" : "Question Disabled"}
                      </span>
                      <p className={`text-[12.5px] leading-snug ${enabled ? "text-slate-700" : "text-slate-400"}`}>{q.question}</p>
                      <p className={`text-[11px] mt-1 ${enabled ? "text-slate-400" : "text-slate-300"}`}>
                        Answers (Exclusive choice): Yes · No · Declines to specify
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SectionPageShell>
  );
}
