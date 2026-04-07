"use client";

import { useState } from "react";
import { Check, Mail, BarChart3, Upload } from "lucide-react";
import type { WalkthroughStep } from "@/types/support";
import { MOCK_WALKTHROUGH_STEPS } from "@/lib/mock-support-data";

// ─── Visual Mockups ────────────────────────────────────────────────────────────

function SurveyLocatorVisual() {
  return (
    <div className="pointer-events-none select-none space-y-4">
      {/* Fake email */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail size={14} className="text-slate-400" />
          <span className="text-[11px] text-slate-400">Inbox — noreply@roundtables.com</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-semibold text-slate-800">2026 DEI Survey Invitation</p>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              You have been invited to complete the Lenox Park 2026 DEI Survey.
            </p>
          </div>
          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-4">Mar 1, 9:00 AM</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="px-4 py-1.5 rounded-lg bg-[#00b8a9] text-white text-[12px] font-semibold">
            Open Survey
          </div>
          <div className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px]">
            View Instructions
          </div>
        </div>
      </div>
      {/* Fake dashboard card */}
      <div className="bg-white rounded-lg border border-[#00b8a9]/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-semibold text-slate-800">2026 Lenox Park DEI Survey</p>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Active</span>
        </div>
        <p className="text-[11.5px] text-slate-500 mb-3">Lenox Park Solutions · Closes April 30, 2026</p>
        <div className="h-1.5 bg-slate-100 rounded-full mb-1">
          <div className="h-full w-0 bg-[#00b8a9] rounded-full" />
        </div>
        <p className="text-[10.5px] text-slate-400">0% complete · Not started</p>
      </div>
    </div>
  );
}

function LpiExplainerVisual() {
  const bars = [
    { label: "Ownership", pct: 35, sub: "Equity stakeholders" },
    { label: "Leadership", pct: 42, sub: "C-suite & MDs" },
    { label: "Workforce", pct: 58, sub: "All employees" },
  ];
  return (
    <div className="pointer-events-none select-none space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-[#00b8a9]" />
          <span className="text-[13px] font-semibold text-slate-800">LP Inclusion Index</span>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-bold text-[#00b8a9]">7.4</p>
          <p className="text-[10px] text-slate-400">out of 10</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Gender LPI", score: 7.8, color: "bg-violet-400" },
          { label: "Racial LPI", score: 6.9, color: "bg-teal-400" },
        ].map(({ label, score, color }) => (
          <div key={label} className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-[11px] text-slate-500 mb-1">{label}</p>
            <p className="text-[18px] font-bold text-slate-800">{score}</p>
            <div className="h-1 bg-slate-100 rounded-full mt-2">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${score * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {bars.map(({ label, pct, sub }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-[12px] font-medium text-slate-700">{label}</span>
                <span className="text-[10.5px] text-slate-400 ml-2">{sub}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600">{pct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-full bg-[#00b8a9] rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OwnershipFormVisual() {
  const rows = [
    { name: "Sarah Chen", gender: "Woman", race: "Asian" },
    { name: "Marcus Williams", gender: "Man", race: "Black or African American" },
    { name: "Elena Rodriguez", gender: "Woman", race: "Hispanic or Latino" },
  ];
  return (
    <div className="pointer-events-none select-none">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Section 1 — Ownership
      </p>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 px-4 py-2">
          {["Name / Title", "Gender Identity", "Race / Ethnicity"].map((h) => (
            <p key={h} className="text-[10.5px] font-semibold text-slate-500">{h}</p>
          ))}
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-3 px-4 py-2.5 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-[12px] font-medium text-slate-800">{row.name}</p>
              <p className="text-[10.5px] text-slate-400">Partner</p>
            </div>
            <div className="flex items-center">
              <div className="bg-slate-100 rounded-md px-2.5 py-1 text-[11.5px] text-slate-600 w-full max-w-[130px]">
                {row.gender}
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-slate-100 rounded-md px-2.5 py-1 text-[11px] text-slate-600 w-full">
                {row.race}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-3 text-[11.5px] text-[#00b8a9] font-semibold">+ Add another equity owner</button>
    </div>
  );
}

function LeadershipFormVisual() {
  const rows = [
    { name: "James Park", title: "CEO", gender: "Man", race: "Asian" },
    { name: "Diana Foster", title: "CFO", gender: "Woman", race: "White" },
    { name: "Andre Thompson", title: "COO", gender: "Man", race: "Black or African American" },
  ];
  return (
    <div className="pointer-events-none select-none">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Section 2 — Leadership
      </p>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 px-4 py-2">
          {["Name", "Title", "Gender", "Race / Ethnicity"].map((h) => (
            <p key={h} className="text-[10.5px] font-semibold text-slate-500">{h}</p>
          ))}
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-4 px-4 py-2.5 border-b border-slate-100 last:border-0 items-center">
            <p className="text-[12px] font-medium text-slate-800">{row.name}</p>
            <div className="bg-slate-100 rounded-md px-2 py-0.5 text-[11px] text-slate-600 w-fit">
              {row.title}
            </div>
            <div className="bg-slate-100 rounded-md px-2 py-0.5 text-[11px] text-slate-600 w-fit">
              {row.gender}
            </div>
            <div className="bg-slate-100 rounded-md px-2 py-0.5 text-[11px] text-slate-600">
              {row.race}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkforceFormVisual() {
  const races = ["Asian", "Black", "Hispanic", "White", "Other"];
  const genders = ["Men", "Women", "Non-binary"];
  const data = [
    [42, 28, 2],
    [18, 22, 1],
    [15, 19, 1],
    [61, 47, 3],
    [8, 6, 0],
  ];
  return (
    <div className="pointer-events-none select-none">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Section 3 — Workforce Diversity
      </p>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 font-semibold text-slate-500">Race / Ethnicity</th>
                {genders.map((g) => (
                  <th key={g} className="text-center px-3 py-2 font-semibold text-slate-500">{g}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {races.map((race, ri) => (
                <tr key={race} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-700">{race}</td>
                  {genders.map((_, gi) => (
                    <td key={gi} className="px-3 py-1.5 text-center">
                      <div className="bg-slate-100 rounded-md px-2 py-1 text-slate-700 font-mono text-[11px] inline-block min-w-[32px]">
                        {data[ri][gi]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UploadSubmitVisual() {
  return (
    <div className="pointer-events-none select-none space-y-4">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        Section 4 — Policy Documents (Optional)
      </p>
      {/* Upload zone */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Upload size={18} className="text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-[12.5px] font-medium text-slate-600">Drop PDF or DOCX here</p>
          <p className="text-[11px] text-slate-400 mt-0.5">or click to browse · Max 25MB per file</p>
        </div>
      </div>
      {/* Completion checklist */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">
        {[
          { label: "Section 1 — Ownership", done: true },
          { label: "Section 2 — Leadership", done: true },
          { label: "Section 3 — Workforce", done: true },
          { label: "Section 4 — Policy Upload", done: false, optional: true },
        ].map(({ label, done, optional }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${done ? "bg-emerald-500" : "bg-slate-200"}`}>
              {done && <Check size={9} className="text-white" strokeWidth={3} />}
            </div>
            <span className={`text-[12px] ${done ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
            {optional && <span className="text-[10px] text-slate-400">(optional)</span>}
          </div>
        ))}
      </div>
      {/* Submit button */}
      <div className="flex justify-end">
        <div className="px-6 py-2.5 rounded-lg bg-[#00b8a9] text-white text-[13px] font-semibold">
          Submit Survey
        </div>
      </div>
    </div>
  );
}

function StepVisual({ visualType }: { visualType: WalkthroughStep["visualType"] }) {
  switch (visualType) {
    case "survey-locator":  return <SurveyLocatorVisual />;
    case "lpi-explainer":   return <LpiExplainerVisual />;
    case "ownership-form":  return <OwnershipFormVisual />;
    case "leadership-form": return <LeadershipFormVisual />;
    case "workforce-form":  return <WorkforceFormVisual />;
    case "upload-submit":   return <UploadSubmitVisual />;
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function WalkthroughGuide() {
  const [currentStep, setCurrentStep]       = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const activeStep = MOCK_WALKTHROUGH_STEPS.find((s) => s.stepNumber === currentStep)!;

  function markComplete(stepNumber: number) {
    setCompletedSteps((prev) => new Set(prev).add(stepNumber));
    if (stepNumber < 6) setCurrentStep(stepNumber + 1);
  }

  return (
    <div className="grid grid-cols-[240px_1fr] gap-5 min-h-[600px]">
      {/* Step list */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
        <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Survey Guide
        </p>
        <ol className="space-y-0.5 flex-1">
          {MOCK_WALKTHROUGH_STEPS.map((step, idx) => (
            <li key={step.stepNumber}>
              <button
                onClick={() => setCurrentStep(step.stepNumber)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                  ${currentStep === step.stepNumber
                    ? "bg-[#00b8a9]/10 text-[#00897b]"
                    : "hover:bg-slate-50 text-slate-600"
                  }`}
              >
                <div
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10.5px] font-bold transition-colors
                    ${completedSteps.has(step.stepNumber)
                      ? "bg-emerald-500 text-white"
                      : currentStep === step.stepNumber
                        ? "bg-[#00b8a9] text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                >
                  {completedSteps.has(step.stepNumber)
                    ? <Check size={11} strokeWidth={3} />
                    : step.stepNumber
                  }
                </div>
                <span className="text-[12px] font-medium leading-tight">{step.title}</span>
              </button>
              {idx < MOCK_WALKTHROUGH_STEPS.length - 1 && (
                <div className="ml-[22px] w-px h-2 bg-slate-100" />
              )}
            </li>
          ))}
        </ol>

        {/* Progress */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-[10.5px] text-slate-400 mb-1.5">
            <span>{completedSteps.size} of 6 complete</span>
            <span>{Math.round((completedSteps.size / 6) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00b8a9] rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps.size / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 flex flex-col overflow-y-auto">
          <p className="text-[11px] font-semibold text-[#00b8a9] uppercase tracking-wider mb-1">
            Step {activeStep.stepNumber} of 6
          </p>
          <h2 className="text-[20px] font-semibold text-slate-900 mb-1">{activeStep.title}</h2>
          <p className="text-[13px] text-slate-500 mb-5">{activeStep.subtitle}</p>

          {/* Visual mockup */}
          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-5 mb-5 overflow-auto">
            <StepVisual visualType={activeStep.visualType} />
          </div>

          {/* Guidance text */}
          <p className="text-[13.5px] text-slate-600 leading-relaxed">{activeStep.guidanceText}</p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="text-[12.5px] text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => markComplete(currentStep)}
            disabled={completedSteps.has(currentStep)}
            className={`px-5 py-2 rounded-lg text-[12.5px] font-semibold transition-colors disabled:opacity-60
              ${completedSteps.has(currentStep)
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-[#0f1923] text-white hover:bg-slate-800"
              }`}
          >
            {completedSteps.has(currentStep) ? "✓ Completed" : "Mark Complete →"}
          </button>
        </div>
      </div>
    </div>
  );
}
