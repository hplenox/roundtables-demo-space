"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getClientById, submitOnboardingStepAsClient, fmtDate, daysUntil, KEY_DATE_LABELS, CYCLE_STATUS_CONFIG, TODAY_ISO,
} from "@/lib/mock-clients";
import type { Client, ClientKeyDates, ClientSurveyCycle, OnboardingStep, OnboardingStepKey, OnboardingStepStatus } from "@/types/client";
import {
  ClipboardList, FileText, Users, Mail, ChevronDown, ExternalLink, CheckCircle2, Check,
  Paperclip, FileSignature, CalendarClock, PartyPopper,
} from "lucide-react";

// Demo: this instance represents Esteban Fernandez's own view at Lenox Park
// Solutions — the same contact the Home dashboard greets by name. Swap this
// id to see the flow for a client mid-onboarding, e.g. "client-hamilton".
const MY_CLIENT_ID = "client-lenox";

const STEP_STATUS_CONFIG: Record<OnboardingStepStatus, { label: string; badge: string }> = {
  not_started: { label: "Not Started", badge: "bg-slate-50 border-slate-200 text-slate-500" },
  in_progress: { label: "In Progress", badge: "bg-blue-50 border-blue-200 text-blue-700" },
  submitted:   { label: "Submitted — Awaiting Review", badge: "bg-amber-50 border-amber-200 text-amber-700" },
  approved:    { label: "Approved", badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
};

const SAMPLE_QUESTIONS = [
  "Workforce Composition by Gender & Race",
  "Leadership & Ownership Representation",
  "Pay Equity & Compensation Practices",
  "DEI Program Maturity & Governance",
];

function pendingStepCount(cycle: ClientSurveyCycle): number {
  return cycle.onboarding.filter((s) => s.status !== "approved").length;
}

// Cycles with steps still outstanding surface first (most recent first
// within that group), so the client lands on whichever survey actually
// needs their attention rather than an arbitrary default.
function sortForSelection(cycles: ClientSurveyCycle[]): ClientSurveyCycle[] {
  return [...cycles].sort((a, b) => {
    const aPending = pendingStepCount(a) > 0;
    const bPending = pendingStepCount(b) > 0;
    if (aPending !== bPending) return aPending ? -1 : 1;
    return b.year - a.year;
  });
}

function upcomingKeyDates(keyDates: ClientKeyDates) {
  const entries = Object.entries(keyDates) as [keyof ClientKeyDates, string | null][];
  return entries
    .filter(([, v]) => v !== null && daysUntil(v as string) >= 0)
    .map(([key, date]) => ({ key, date: date as string, label: KEY_DATE_LABELS[key] }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function SurveySelector({
  cycles,
  selectedId,
  onSelect,
}: {
  cycles: ClientSurveyCycle[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Your Surveys</h2>
        <p className="text-[11.5px] text-slate-400 mt-0.5">Select a survey to view or complete its onboarding steps.</p>
      </div>
      <div className="divide-y divide-slate-50">
        {cycles.map((c) => {
          const pending = pendingStepCount(c);
          const active = c.id === selectedId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full flex items-center justify-between gap-3 px-5 py-3 text-left transition-colors ${
                active ? "bg-[#00b8a9]/5" : "hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-[#00b8a9]" : "bg-transparent"}`} />
                <div className="min-w-0">
                  <p className={`text-[13px] font-medium truncate ${active ? "text-[#00897b]" : "text-slate-700"}`}>
                    {c.name} &rsquo;{String(c.year).slice(2)}
                  </p>
                  <p className="text-[11px] text-slate-400">{CYCLE_STATUS_CONFIG[c.status].label}</p>
                </div>
              </div>
              {pending > 0 ? (
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-amber-50 border border-amber-200 text-amber-700">
                  {pending} step{pending !== 1 ? "s" : ""} needed
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Check size={10} /> Up to date
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuestionsStep({ step, onSubmit }: { step: OnboardingStep; onSubmit: () => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const canSubmit = step.status === "not_started" || step.status === "in_progress";

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
            <FileText size={15} className="text-violet-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800">1. {step.label}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5 max-w-md">Review last year&rsquo;s questions and survey layout, then submit your final selection.</p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${STEP_STATUS_CONFIG[step.status].badge}`}>
          {STEP_STATUS_CONFIG[step.status].label}
        </span>
      </div>

      <div className="px-5 py-3.5 bg-slate-50/60 border-b border-slate-100">
        <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide mb-2">What we need from you</p>
        <ul className="space-y-1.5">
          {step.requirements.map((r) => (
            <li key={r} className="flex items-start gap-2 text-[12px] text-slate-600 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 py-3.5 flex items-center justify-between gap-3">
        <button
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-[#00897b] transition-colors"
        >
          <ChevronDown size={13} className={`transition-transform ${showPreview ? "rotate-180" : ""}`} />
          Review previous year&rsquo;s questions
        </button>
        {canSubmit ? (
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
          >
            <CheckCircle2 size={13} /> Submit My Selection
          </button>
        ) : (
          step.updatedAt && <span className="text-[11px] text-slate-400">Updated {fmtDate(step.updatedAt)}</span>
        )}
      </div>

      {showPreview && (
        <div className="px-5 pb-4">
          <div className="bg-slate-50 rounded-lg border border-slate-100 p-3.5 space-y-1.5">
            {SAMPLE_QUESTIONS.map((q) => (
              <div key={q} className="flex items-center gap-2 text-[12px] text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-300 shrink-0" />
                {q}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContactsStep({ step, surveyId, onSubmit }: { step: OnboardingStep; surveyId: string | null; onSubmit: () => void }) {
  const canSubmit = step.status === "not_started" || step.status === "in_progress";

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <Users size={15} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800">2. {step.label}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5 max-w-md">Review your current contact list and submit any changes for this cycle.</p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${STEP_STATUS_CONFIG[step.status].badge}`}>
          {STEP_STATUS_CONFIG[step.status].label}
        </span>
      </div>

      <div className="px-5 py-3.5 bg-slate-50/60 border-b border-slate-100">
        <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide mb-2">What we need from you</p>
        <ul className="space-y-1.5">
          {step.requirements.map((r) => (
            <li key={r} className="flex items-start gap-2 text-[12px] text-slate-600 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 py-3.5 flex items-center justify-between gap-3">
        {surveyId ? (
          <Link
            href={`/surveys/${surveyId}/contacts`}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#00897b] hover:underline"
          >
            Review My Contact List <ExternalLink size={12} />
          </Link>
        ) : (
          <span className="text-[12px] text-slate-400">Contact list will be available once this cycle is scheduled.</span>
        )}
        {canSubmit ? (
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
          >
            <CheckCircle2 size={13} /> Submit My Contact List
          </button>
        ) : (
          step.updatedAt && <span className="text-[11px] text-slate-400">Updated {fmtDate(step.updatedAt)}</span>
        )}
      </div>
    </div>
  );
}

function FinalizationStep({ step, cycle }: { step: OnboardingStep; cycle: ClientSurveyCycle }) {
  const dates = cycle.keyDates;
  const hasBeenSent = step.status !== "not_started";

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#e8f5f3] flex items-center justify-center shrink-0 mt-0.5">
            <Mail size={15} className="text-[#00897b]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800">3. {step.label}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5 max-w-md">Your onboarding recap, key dates, and manager outreach template from the LPS team.</p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${STEP_STATUS_CONFIG[step.status].badge}`}>
          {STEP_STATUS_CONFIG[step.status].label}
        </span>
      </div>

      {hasBeenSent ? (
        <div className="px-5 py-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 font-medium">
              <Paperclip size={11} /> Onboarding_Instructions.pdf
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 font-medium">
              <FileSignature size={11} /> Manager_Outreach_Template.docx
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg border border-slate-100 p-3.5 space-y-1.5">
            {(["launchDate", "endDate", "targetCloseDate", "reportingDueDate"] as const)
              .filter((k) => dates[k])
              .map((k) => (
                <div key={k} className="flex items-center justify-between text-[12px] text-slate-600">
                  <span>{KEY_DATE_LABELS[k]}</span>
                  <span className="font-medium text-slate-700">{fmtDate(dates[k])}</span>
                </div>
              ))}
          </div>
          {step.lastEmailSentAt && (
            <p className="text-[11px] text-slate-400 mt-2.5">Sent to you on {fmtDate(step.lastEmailSentAt)}</p>
          )}
        </div>
      ) : (
        <div className="px-5 py-6 text-center">
          <p className="text-[12px] text-slate-400">Your LPS account owner will send this once the first two steps are complete.</p>
        </div>
      )}
    </div>
  );
}

export default function ClientOnboardingViewPage() {
  const [client, setClient] = useState<Client | null>(() => getClientById(MY_CLIENT_ID) ?? null);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  if (!client) return null;

  const sortedCycles = sortForSelection(client.surveys);
  const cycle = selectedCycleId ? client.surveys.find((s) => s.id === selectedCycleId) ?? null : sortedCycles[0] ?? null;

  function submitStep(key: OnboardingStepKey) {
    if (!cycle) return;
    const updated = submitOnboardingStepAsClient(MY_CLIENT_ID, cycle.id, key, "submitted", TODAY_ISO);
    if (updated) setClient(updated);
  }

  const questions = cycle?.onboarding.find((s) => s.key === "questions");
  const contacts = cycle?.onboarding.find((s) => s.key === "contacts");
  const finalization = cycle?.onboarding.find((s) => s.key === "finalization");
  const allApproved = cycle ? pendingStepCount(cycle) === 0 : false;
  const dates = cycle ? upcomingKeyDates(cycle.keyDates) : [];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-[#0f1923] flex items-center justify-center">
              <ClipboardList size={18} className="text-[#00b8a9]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold text-slate-900 leading-tight">Onboarding</h1>
              <p className="text-[12px] text-slate-400 mt-1 max-w-xl">
                {cycle
                  ? `Complete the steps below for the ${cycle.name} '${String(cycle.year).slice(2)} cycle — sent to you by the RoundTables LPS team.`
                  : "Your survey onboarding tasks will appear here once your LPS account owner sends an invitation."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {!cycle ? (
          <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
            <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={18} className="text-slate-300" />
            </div>
            <p className="text-[13px] font-medium text-slate-600">No onboarding tasks yet</p>
            <p className="text-[11.5px] text-slate-400 mt-1 max-w-xs mx-auto">
              You&rsquo;ll receive an email as soon as your LPS account owner kicks off your next survey cycle.
            </p>
          </div>
        ) : (
          <>
            {sortedCycles.length > 1 && (
              <SurveySelector cycles={sortedCycles} selectedId={cycle.id} onSelect={setSelectedCycleId} />
            )}

            {allApproved && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 flex items-center gap-3">
                <PartyPopper size={16} className="text-emerald-600 shrink-0" />
                <p className="text-[12.5px] text-emerald-800">
                  <span className="font-semibold">You&rsquo;re all caught up</span> — every onboarding step for the {cycle.name} &rsquo;
                  {String(cycle.year).slice(2)} cycle has been reviewed and approved.
                </p>
              </div>
            )}

            {dates.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
                  <CalendarClock size={14} className="text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">Upcoming Key Dates</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {dates.slice(0, 4).map((d) => (
                    <div key={d.key} className="flex items-center justify-between px-5 py-3">
                      <p className="text-[12.5px] font-medium text-slate-700">{d.label}</p>
                      <div className="text-right">
                        <p className="text-[12.5px] text-slate-600">{fmtDate(d.date)}</p>
                        <p className="text-[10.5px] text-slate-400">in {daysUntil(d.date)}d</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questions && <QuestionsStep step={questions} onSubmit={() => submitStep("questions")} />}
            {contacts && <ContactsStep step={contacts} surveyId={cycle.surveyId} onSubmit={() => submitStep("contacts")} />}
            {finalization && <FinalizationStep step={finalization} cycle={cycle} />}
          </>
        )}
      </div>
    </div>
  );
}
