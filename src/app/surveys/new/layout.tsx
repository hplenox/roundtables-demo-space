"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight, LayoutDashboard, X } from "lucide-react";
import { computeOverallProgress, ensureDraft, useDraft } from "@/lib/survey-draft-store";

export default function NewSurveyLayout({ children }: { children: React.ReactNode }) {
  const draft = useDraft();

  useEffect(() => {
    ensureDraft();
  }, []);

  const progress = draft ? computeOverallProgress(draft) : { completed: 0, total: 4, percent: 0 };
  const draftLabel = draft?.basics.name?.trim() || "Untitled survey";

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 pt-5 pb-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-[11.5px]">
              <Link
                href="/surveys"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0f1923] text-[#00b8a9] hover:bg-[#1a2d3d] transition-colors font-semibold text-[10.5px] tracking-wide"
              >
                <LayoutDashboard size={10} strokeWidth={2} />
                Survey Admin
              </Link>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <span className="text-slate-700 font-medium">New Survey</span>
            </div>
            <Link
              href="/surveys"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={13} />
              Exit
            </Link>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[19px] font-bold text-slate-900 leading-tight">{draftLabel}</h1>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Build your survey one section at a time — pick up wherever you left off.</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[12px] font-semibold text-slate-700 tabular-nums">
                {progress.completed} of {progress.total} sections complete
              </p>
              <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-[#00b8a9] rounded-full transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">{children}</div>
    </div>
  );
}
