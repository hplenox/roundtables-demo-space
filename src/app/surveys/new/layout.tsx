"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Building2, ChevronRight, LayoutDashboard, Lock, X } from "lucide-react";
import {
  SECTION_ORDER,
  computeOverallProgress,
  computeRequiredProgress,
  ensureDraft,
  useDraft,
} from "@/lib/survey-draft-store";
import { LIFECYCLE_CONFIG } from "@/lib/cycle-survey-link";

export default function NewSurveyLayout({ children }: { children: React.ReactNode }) {
  const draft = useDraft();

  useEffect(() => {
    ensureDraft();
  }, []);

  // Totals come from the section list itself so the header can't drift out of
  // step with the numbered sections the hub renders.
  const emptyProgress = { completed: 0, total: SECTION_ORDER.length, remaining: SECTION_ORDER.length, percent: 0 };
  const progress = draft ? computeOverallProgress(draft) : emptyProgress;
  const required = draft ? computeRequiredProgress(draft) : emptyProgress;
  const draftLabel = draft?.basics.name?.trim() || "Untitled survey";

  // A draft opened from the Client CRM belongs to a specific survey cycle —
  // the chrome says whose it is and sends every exit back to that onboarding
  // tab, so the admin never loses their place in the client's workflow.
  const context = draft?.context ?? null;
  const exitHref = context?.returnTo ?? "/surveys";
  const locked = draft?.lifecycle === "locked";

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 pt-5 pb-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-[11.5px]">
              {context ? (
                <>
                  <Link
                    href="/client-crm"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0f1923] text-[#00b8a9] hover:bg-[#1a2d3d] transition-colors font-semibold text-[10.5px] tracking-wide"
                  >
                    <Building2 size={10} strokeWidth={2} />
                    Client CRM
                  </Link>
                  <ChevronRight size={12} className="text-slate-300 shrink-0" />
                  <Link href={context.returnTo} className="text-slate-500 hover:text-slate-800 transition-colors">
                    {context.clientName}
                  </Link>
                  <ChevronRight size={12} className="text-slate-300 shrink-0" />
                  <span className="text-slate-700 font-medium">Survey Buildout</span>
                </>
              ) : (
                <>
                  <Link
                    href="/surveys"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0f1923] text-[#00b8a9] hover:bg-[#1a2d3d] transition-colors font-semibold text-[10.5px] tracking-wide"
                  >
                    <LayoutDashboard size={10} strokeWidth={2} />
                    Survey Admin
                  </Link>
                  <ChevronRight size={12} className="text-slate-300 shrink-0" />
                  <span className="text-slate-700 font-medium">New Survey</span>
                </>
              )}
            </div>
            <Link
              href={exitHref}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={13} />
              {context ? "Exit to Onboarding" : "Exit"}
            </Link>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[19px] font-bold text-slate-900 leading-tight">{draftLabel}</h1>
              {context ? (
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  Onboarding step 1 for{" "}
                  <span className="font-semibold text-slate-700">{context.clientName}</span> ·{" "}
                  {context.cycleLabel}
                </p>
              ) : (
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  Build your survey one section at a time — pick up wherever you left off.
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[12px] font-semibold text-slate-700 tabular-nums">
                {progress.completed} of {progress.total} sections complete
              </p>
              <div
                className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={progress.total}
                aria-valuenow={progress.completed}
                aria-label="Survey sections complete"
              >
                <div
                  className="h-full bg-[#00b8a9] rounded-full transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
                {required.remaining === 0
                  ? "All required sections complete"
                  : `${required.remaining} required section${required.remaining === 1 ? "" : "s"} left`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {locked && (
        <div className="border-b border-emerald-200 bg-emerald-50/70">
          <div className="max-w-4xl mx-auto px-6 py-2.5 flex items-center gap-2">
            <Lock size={13} className="text-emerald-600 shrink-0" />
            <p className="text-[12px] text-emerald-800">
              <span className="font-semibold">Read-only.</span> {LIFECYCLE_CONFIG.locked.blurb}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-6">{children}</div>
    </div>
  );
}
