"use client";

import { useEffect } from "react";
import {
  addCustomQuestion,
  addCustomSection,
  ensureDraft,
  markTouched,
  removeCustomQuestion,
  removeCustomSection,
  updateCustomQuestion,
  updateCustomSection,
  useDraft,
} from "@/lib/survey-draft-store";
import { CUSTOM_QUESTION_TYPES } from "@/lib/survey-draft-config";
import SectionPageShell from "@/components/surveys/SectionPageShell";
import { Plus, Trash2, Type, AlignLeft, Hash, List, ListChecks } from "lucide-react";
import { CustomQuestionType } from "@/types/survey-draft";

const TYPE_ICON: Record<CustomQuestionType, typeof Type> = {
  text: Type,
  "formatted-text": AlignLeft,
  number: Hash,
  select: List,
  "multi-select": ListChecks,
};

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30 focus:border-[#00b8a9]";

export default function CustomQuestionsPage() {
  const draft = useDraft();

  useEffect(() => {
    ensureDraft();
    markTouched("custom-questions");
  }, []);

  if (!draft) return null;

  return (
    <SectionPageShell
      title="Custom Questions"
      description="Optional — add your own sections and questions on top of the standard survey."
    >
      <div className="space-y-5">
        {draft.customSections.length === 0 && (
          <p className="text-[12.5px] text-slate-400 py-4">No custom sections yet. Add one below.</p>
        )}

        {draft.customSections.map((section) => (
          <div key={section.id} className="border border-slate-200 rounded-2xl p-5 relative">
            <button
              onClick={() => removeCustomSection(section.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
              aria-label="Remove section"
            >
              <Trash2 size={15} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pr-8">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Section Name *</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Supplier Diversity"
                  value={section.name}
                  onChange={(e) => updateCustomSection(section.id, { name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Section Description</label>
                <input
                  className={inputCls}
                  placeholder="Optional context shown above the questions"
                  value={section.description}
                  onChange={(e) => updateCustomSection(section.id, { description: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4">
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 min-h-[80px] space-y-2">
                {section.questions.length === 0 && (
                  <p className="text-[12px] text-slate-400 text-center py-4">Add a question type from the right →</p>
                )}
                {section.questions.map((q) => {
                  const Icon = TYPE_ICON[q.type];
                  return (
                    <div key={q.id} className="bg-white rounded-lg border border-slate-200 px-3 py-2.5 flex items-start gap-2.5">
                      <Icon size={14} className="text-slate-400 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <input
                          className="w-full text-[12.5px] text-slate-800 border-0 focus:outline-none placeholder:text-slate-400"
                          placeholder="Question text…"
                          value={q.label}
                          onChange={(e) => updateCustomQuestion(section.id, q.id, { label: e.target.value })}
                        />
                        {(q.type === "select" || q.type === "multi-select") && (
                          <div className="mt-1.5 space-y-1">
                            {(q.options ?? [""]).map((opt, i) => (
                              <input
                                key={i}
                                className="w-full text-[11.5px] text-slate-600 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#00b8a9]/40"
                                placeholder={`Option ${i + 1}`}
                                value={opt}
                                onChange={(e) => {
                                  const next = [...(q.options ?? [""])];
                                  next[i] = e.target.value;
                                  updateCustomQuestion(section.id, q.id, { options: next });
                                }}
                              />
                            ))}
                            <button
                              onClick={() => updateCustomQuestion(section.id, q.id, { options: [...(q.options ?? [""]), ""] })}
                              className="text-[11px] font-medium text-[#3650d4] hover:underline"
                            >
                              + Add option
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeCustomQuestion(section.id, q.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                        aria-label="Remove question"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div>
                <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Input Types</p>
                <div className="space-y-1.5">
                  {CUSTOM_QUESTION_TYPES.map(({ type, label }) => {
                    const Icon = TYPE_ICON[type];
                    return (
                      <button
                        key={type}
                        onClick={() => addCustomQuestion(section.id, type)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-[12.5px] text-slate-600 hover:bg-slate-50 hover:border-[#00b8a9]/40 transition-colors text-left"
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addCustomSection}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[#0f1923] text-[13px] font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <Plus size={14} />
          Add New Custom Section
        </button>
      </div>
    </SectionPageShell>
  );
}
