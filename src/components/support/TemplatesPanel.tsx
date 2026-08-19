"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { QuickReplyTemplate, TemplateCategory } from "@/types/support";
import { MOCK_TEMPLATES } from "@/lib/mock-support-data";

const CATEGORIES: Array<TemplateCategory | "All"> = [
  "All",
  "Permissions & Access",
  "Survey Completion",
  "Data & Benchmarks",
  "Status Updates",
];

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  "Permissions & Access": "bg-violet-50 text-violet-700",
  "Survey Completion":    "bg-[#4361ee]/10 text-[#3147af]",
  "Data & Benchmarks":    "bg-amber-50 text-amber-700",
  "Status Updates":       "bg-blue-50 text-blue-700",
};

function TemplateCard({
  template,
  copied,
  onCopy,
}: {
  template: QuickReplyTemplate;
  copied: boolean;
  onCopy: (t: QuickReplyTemplate) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 hover:border-[#4361ee]/40 hover:shadow-sm transition-all">
      <span className={`self-start text-[10.5px] font-semibold px-2 py-0.5 rounded-md ${CATEGORY_COLORS[template.category]}`}>
        {template.category}
      </span>

      <h3 className="text-[13.5px] font-semibold text-slate-900 leading-tight">{template.title}</h3>

      <p className="text-[12px] text-slate-500 leading-relaxed flex-1">{template.preview}</p>

      {/* Body preview with fade */}
      <div className="relative bg-slate-50 rounded-lg border border-slate-100 p-3 max-h-[72px] overflow-hidden">
        <p className="text-[11px] text-slate-500 font-mono whitespace-pre-wrap leading-relaxed">
          {template.body}
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <button
        onClick={() => onCopy(template)}
        className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[12px] font-semibold transition-all
          ${copied
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-[#0f1923] text-white hover:bg-slate-800"
          }`}
      >
        {copied ? (
          <><Check size={13} /> Copied!</>
        ) : (
          <><Copy size={13} /> Copy Template</>
        )}
      </button>
    </div>
  );
}

export default function TemplatesPanel() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "All">("All");
  const [copiedId, setCopiedId]             = useState<string | null>(null);

  const filtered =
    activeCategory === "All"
      ? MOCK_TEMPLATES
      : MOCK_TEMPLATES.filter((t) => t.category === activeCategory);

  function handleCopy(template: QuickReplyTemplate) {
    navigator.clipboard.writeText(template.body).catch(() => {});
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => {
          const count = cat === "All"
            ? MOCK_TEMPLATES.length
            : MOCK_TEMPLATES.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all
                ${activeCategory === cat
                  ? "bg-[#0f1923] border-[#0f1923] text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
            >
              {cat}
              <span className="ml-1.5 text-[10.5px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            copied={copiedId === template.id}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </div>
  );
}
