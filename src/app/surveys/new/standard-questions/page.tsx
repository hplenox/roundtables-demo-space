"use client";

import { useEffect } from "react";
import { ensureDraft, markTouched, setAllStandardQuestions, updateStandardQuestion, useDraft } from "@/lib/survey-draft-store";
import { STANDARD_QUESTIONS_CONFIG } from "@/lib/survey-draft-config";
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

export default function StandardQuestionsPage() {
  const draft = useDraft();

  useEffect(() => {
    ensureDraft();
    markTouched("standard-questions");
  }, []);

  if (!draft) return null;

  const allEnabled = Object.values(draft.standardQuestions).every((q) => q.enabled);
  const categories = Array.from(new Set(STANDARD_QUESTIONS_CONFIG.map((q) => q.category)));

  return (
    <SectionPageShell
      title="Standard Questions"
      description="The boilerplate copy and consent terms every invited organization sees before starting the survey."
    >
      <div className="flex items-center gap-3 pb-4 mb-2 border-b border-slate-100">
        <Toggle checked={allEnabled} onChange={(v) => setAllStandardQuestions(v)} />
        <span className="text-[13px] font-semibold text-slate-800">Enable All Questions</span>
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const questions = STANDARD_QUESTIONS_CONFIG.filter((q) => q.category === category);
          return (
            <div key={category}>
              <h3 className="text-[13.5px] font-bold text-slate-900">{category}</h3>
              <p className="text-[11.5px] text-slate-400 mb-2">{questions[0].categorySublabel}</p>
              <div className="space-y-3">
                {questions.map((q) => {
                  const state = draft.standardQuestions[q.key];
                  const enabled = state?.enabled ?? false;
                  return (
                    <div
                      key={q.key}
                      className={`flex items-start gap-3 px-4 py-3.5 border border-slate-100 rounded-xl ${
                        enabled ? "bg-white" : "bg-slate-50/60"
                      }`}
                    >
                      <Toggle checked={enabled} onChange={(v) => updateStandardQuestion(q.key, { enabled: v })} />
                      <div className="flex-1">
                        <span
                          className={`inline-block mb-1.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                            enabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {enabled ? "Question Enabled" : "Question Disabled"}
                        </span>
                        <p className={`text-[12.5px] font-medium ${enabled ? "text-slate-700" : "text-slate-400"}`}>{q.label}</p>
                        {q.kind === "paragraph" && (
                          <textarea
                            className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 text-[12.5px] text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30 focus:border-[#00b8a9]"
                            rows={5}
                            value={state?.text ?? ""}
                            onChange={(e) => updateStandardQuestion(q.key, { text: e.target.value })}
                          />
                        )}
                        {q.kind === "consent" && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            Answers (Exclusive choice): I agree · I do not agree
                          </p>
                        )}
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
