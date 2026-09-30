"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClientCtx } from "../client-context";
import { CyclePicker, useSelectedCycle } from "../cycle-picker";
import { fmtDate } from "@/lib/mock-clients";
import type { Client, ClientSurveyCycle, OnboardingStep, OnboardingStepStatus } from "@/types/client";
import type { SurveyDraft } from "@/types/survey-draft";
import {
  approveDraftQuestions,
  beginCycleDraft,
  computeOverallProgress,
  discardDraftById,
  draftContentSummary,
  isReadyToSubmit,
  lockDraft,
  reopenDraftQuestions,
  useAllSurveys,
  useCycleDraft,
} from "@/lib/survey-draft-store";
import {
  PANEL_STATE_CONFIG,
  buildBasicsPrefill,
  buildCycleContext,
  cycleHasLaunched,
  panelStateForDraft,
  stepStatusForDraft,
} from "@/lib/cycle-survey-link";
import {
  FileText, Users, Mail, ChevronDown, ExternalLink, Send, X,
  CheckCircle2, Paperclip, FileSignature, ClipboardList,
  PencilRuler, Lock, RotateCcw, Trash2, ArrowRight, Layers,
} from "lucide-react";

const STEP_STATUS_CONFIG: Record<OnboardingStepStatus, { label: string; badge: string }> = {
  not_started: { label: "Not Started", badge: "bg-slate-50 border-slate-200 text-slate-500" },
  in_progress: { label: "In Progress", badge: "bg-blue-50 border-blue-200 text-blue-700" },
  submitted:   { label: "Submitted",   badge: "bg-amber-50 border-amber-200 text-amber-700" },
  approved:    { label: "Approved",    badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
};

const SAMPLE_QUESTIONS = [
  "Workforce Composition by Gender & Race",
  "Leadership & Ownership Representation",
  "Pay Equity & Compensation Practices",
  "DEI Program Maturity & Governance",
];

function StatusSelect({ value, onChange }: { value: OnboardingStepStatus; onChange: (v: OnboardingStepStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as OnboardingStepStatus)}
      className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[12px] text-slate-600 focus:outline-none focus:border-slate-300 transition-colors"
    >
      {Object.entries(STEP_STATUS_CONFIG).map(([key, cfg]) => (
        <option key={key} value={key}>{cfg.label}</option>
      ))}
    </select>
  );
}

function RequirementsList({ step }: { step: OnboardingStep }) {
  return (
    <div className="px-5 py-3.5 bg-slate-50/60 border-b border-slate-100">
      <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide mb-2">What the client needs to do</p>
      <ul className="space-y-1.5">
        {step.requirements.map((r) => (
          <li key={r} className="flex items-start gap-2 text-[12px] text-slate-600 leading-snug">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Generic "request this step" email modal (steps 1 & 2) ─────────────────

function RequestActionModal({
  step,
  client,
  onClose,
  onSend,
}: {
  step: OnboardingStep;
  client: Client;
  onClose: () => void;
  onSend: () => void;
}) {
  const [sent, setSent] = useState(false);
  const isReminder = step.status !== "not_started";
  const subject = `${isReminder ? "Reminder" : "Action Required"}: ${step.label}`;

  const body = `Dear ${client.primaryContactName},

${isReminder
    ? `Just a friendly follow-up on "${step.label}" for your upcoming survey cycle.`
    : `We're moving forward with your upcoming survey cycle and need your input on the next step: "${step.label}".`
  }

Please take care of the following:
${step.requirements.map((r) => `• ${r}`).join("\n")}

Let us know if you have any questions — we're here to help.

Warm regards,
The RoundTables LPS Team`;

  function handleSend() {
    setSent(true);
    setTimeout(() => {
      onSend();
      onClose();
    }, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5f3] flex items-center justify-center shrink-0">
              <Mail size={15} className="text-[#00897b]" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800">{isReminder ? "Send Reminder" : "Send Request"}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{client.primaryContactEmail}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <p className="text-[14px] font-semibold text-slate-800">Email Sent!</p>
            <p className="text-[12px] text-slate-400 text-center max-w-xs">
              {client.primaryContactName} has been asked to complete &ldquo;{step.label}.&rdquo;
            </p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100">
              <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">Subject</span>
              <p className="text-[12px] text-slate-700 mt-0.5">{subject}</p>
            </div>
            <div className="px-5 py-4 max-h-72 overflow-y-auto">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <pre className="text-[11.5px] text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">{body}</pre>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-2 text-center italic">For demo purposes only — no actual email will be sent.</p>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
              <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
              >
                <Send size={12} /> {isReminder ? "Send Reminder" : "Send Request"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Finalization email modal (step 3) ──────────────────────────────────────

function FinalizationModal({
  client,
  cycle,
  onClose,
  onSend,
}: {
  client: Client;
  cycle: ClientSurveyCycle;
  onClose: () => void;
  onSend: () => void;
}) {
  const [sent, setSent] = useState(false);
  const dates = cycle.keyDates;

  const body = `Dear ${client.primaryContactName},

Congratulations — your survey onboarding is complete! Here's a recap of what's ahead for the ${cycle.year} cycle:

${dates.launchDate ? `• Survey Launch: ${fmtDate(dates.launchDate)}` : ""}
${dates.endDate ? `• Response Window Closes: ${fmtDate(dates.endDate)}` : ""}
${dates.targetCloseDate ? `• Target Close: ${fmtDate(dates.targetCloseDate)}` : ""}
${dates.reportingDueDate ? `• Reporting Delivered By: ${fmtDate(dates.reportingDueDate)}` : ""}

Attached is your onboarding instructions PDF along with the email template to forward to your managers so they know what to expect and how to respond.

Thank you for partnering with us this cycle.

Warm regards,
The RoundTables LPS Team`;

  function handleSend() {
    setSent(true);
    setTimeout(() => {
      onSend();
      onClose();
    }, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5f3] flex items-center justify-center shrink-0">
              <Mail size={15} className="text-[#00897b]" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800">Send Onboarding Finalization Email</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{client.primaryContactEmail}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <p className="text-[14px] font-semibold text-slate-800">Finalization Email Sent!</p>
            <p className="text-[12px] text-slate-400 text-center max-w-xs">
              {client.primaryContactName} will receive onboarding instructions, key dates, and the manager outreach template.
            </p>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 max-h-72 overflow-y-auto">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <pre className="text-[11.5px] text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">{body}</pre>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 font-medium">
                  <Paperclip size={11} /> Onboarding_Instructions.pdf
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 font-medium">
                  <FileSignature size={11} /> Manager_Outreach_Template.docx
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-2 text-center italic">For demo purposes only — no actual email will be sent.</p>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
              <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
              >
                <Send size={12} /> Send Finalization Email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Step cards ──────────────────────────────────────────────────────────

function StepEmailAction({
  step,
  onOpen,
}: {
  step: OnboardingStep;
  onOpen: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {step.lastEmailSentAt && <span className="text-[11px] text-slate-400">Last emailed {fmtDate(step.lastEmailSentAt)}</span>}
      <button
        onClick={onOpen}
        disabled={step.status === "approved"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
          step.status === "approved"
            ? "border-slate-100 text-slate-300 cursor-not-allowed"
            : "border-[#00b8a9]/30 bg-[#00b8a9]/5 text-[#00897b] hover:bg-[#00b8a9]/10"
        }`}
      >
        <Send size={12} />
        {step.status === "approved" ? "Complete" : step.status === "not_started" ? "Send Request Email" : "Send Reminder Email"}
      </button>
    </div>
  );
}

// ─── Step 1: Survey buildout ────────────────────────────────────────────────
//
// This step owns exactly one survey draft per cycle (see cycle-survey-link.ts).
// Before one exists it reads as a request — requirements, prior-year questions,
// a "Configure Survey" hand-off into the TurboTax-style flow at /surveys/new.
// Once a draft exists the step *becomes* the survey: the request framing drops
// away and the panel below shows what's configured, what's left, and the one
// action that moves it forward.

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-[12.5px] text-slate-700 font-medium mt-0.5 truncate">{value || "—"}</p>
    </div>
  );
}

function SurveyPanel({
  draft,
  onEdit,
  onApprove,
  onReopen,
  onDiscard,
}: {
  draft: SurveyDraft;
  onEdit: () => void;
  onApprove: () => void;
  onReopen: () => void;
  onDiscard: () => void;
}) {
  const state = panelStateForDraft(draft);
  const cfg = PANEL_STATE_CONFIG[state];
  const progress = computeOverallProgress(draft);
  const counts = draftContentSummary(draft);
  const ready = isReadyToSubmit(draft);
  const locked = state === "locked";

  const contentChips = [
    `${counts.lpiGroups} LPI data group${counts.lpiGroups === 1 ? "" : "s"}`,
    `${counts.practices} practices question${counts.practices === 1 ? "" : "s"}`,
    `${counts.standardQuestions} standard question${counts.standardQuestions === 1 ? "" : "s"}`,
    counts.customSections > 0
      ? `${counts.customQuestions} custom question${counts.customQuestions === 1 ? "" : "s"} in ${counts.customSections} section${counts.customSections === 1 ? "" : "s"}`
      : "No custom questions",
  ];

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden">
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 bg-white border-b border-slate-100">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
              <Layers size={15} className="text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">
                {draft.basics.name?.trim() || "Untitled survey"}
              </p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">{cfg.blurb}</p>
            </div>
          </div>
          <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-3.5">
          <SummaryStat label="Request Type" value={draft.basics.requestType} />
          <SummaryStat label="Launches" value={draft.basics.startDate} />
          <SummaryStat label="Due" value={draft.basics.dueDate} />
          <SummaryStat label="Primary Contact" value={draft.basics.primaryContact} />
        </div>

        {state === "configuring" ? (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <p className="text-[11.5px] text-slate-500">
                {progress.completed} of {progress.total} required sections complete
              </p>
              <p className="text-[11.5px] font-semibold text-slate-600 tabular-nums">{progress.percent}%</p>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00b8a9] transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            {ready && (
              <p className="text-[11.5px] text-emerald-700 mt-2">
                All sections are done — open the builder and submit to create the survey.
              </p>
            )}
          </div>
        ) : (
          <div className="px-4 pb-4 flex flex-wrap gap-1.5">
            {contentChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-600"
              >
                <CheckCircle2 size={10} className="text-emerald-500" />
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onEdit}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-colors ${
              locked
                ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                : state === "configuring"
                  ? "bg-[#0f1923] text-white hover:bg-[#1a2733]"
                  : "border border-[#00b8a9]/30 bg-[#00b8a9]/5 text-[#00897b] hover:bg-[#00b8a9]/10"
            }`}
          >
            {locked ? <Lock size={13} /> : <PencilRuler size={13} />}
            {locked ? "View Question Set" : state === "configuring" ? "Continue Configuring" : "Edit Survey Setup"}
            {!locked && <ArrowRight size={12} />}
          </button>

          {draft.surveyId && (
            <Link
              href={`/surveys/${draft.surveyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Open Survey <ExternalLink size={12} />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {state === "review" && (
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-[12.5px] font-medium hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 size={13} /> Mark Question Set Approved
            </button>
          )}
          {state === "approved" && (
            <button
              onClick={onReopen}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={12} /> Reopen for Changes
            </button>
          )}
          {!locked && (
            <button
              onClick={onDiscard}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={12} /> Discard
            </button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        {draft.approvedAt && `Approved ${fmtDate(draft.approvedAt.slice(0, 10))} · `}
        Last edited {fmtDate(draft.updatedAt.slice(0, 10))}
      </p>
    </div>
  );
}

function SurveyBuildStep({
  step,
  status,
  client,
  draft,
  legacySurvey,
  onConfigure,
  onEdit,
  onApprove,
  onReopen,
  onDiscard,
  onSetStatus,
  onRequestAction,
}: {
  step: OnboardingStep;
  /** Derived from the draft once one exists, so the badge can't drift from the panel. */
  status: OnboardingStepStatus;
  client: Client;
  draft: SurveyDraft | null;
  /** A survey this cycle was already linked to before the buildout flow existed. */
  legacySurvey: { id: string; name: string } | null;
  onConfigure: () => void;
  onEdit: () => void;
  onApprove: () => void;
  onReopen: () => void;
  onDiscard: () => void;
  onSetStatus: (v: OnboardingStepStatus) => void;
  onRequestAction: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
            <FileText size={15} className="text-violet-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800">1. {step.label}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5 max-w-md">
              {draft
                ? `The survey for this cycle, built and tracked right here.`
                : step.description}
            </p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${STEP_STATUS_CONFIG[status].badge}`}>
          {STEP_STATUS_CONFIG[status].label}
        </span>
      </div>

      {draft ? (
        <SurveyPanel draft={draft} onEdit={onEdit} onApprove={onApprove} onReopen={onReopen} onDiscard={onDiscard} />
      ) : legacySurvey ? (
        // Cycles that predate the buildout flow already point at a survey.
        // There's no draft to edit, so the step just surfaces what's linked.
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
              <Layers size={15} className="text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{legacySurvey.name}</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                This cycle is already linked to a survey built outside this flow.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/surveys/${legacySurvey.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Open Survey <ExternalLink size={12} />
            </Link>
            <StatusSelect value={status} onChange={onSetStatus} />
          </div>
        </div>
      ) : (
        <>
          <RequirementsList step={step} />

          <div className="px-5 py-3.5 flex items-center justify-between gap-3">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-[#00897b] transition-colors"
            >
              <ChevronDown size={13} className={`transition-transform ${showPreview ? "rotate-180" : ""}`} />
              Review previous year&rsquo;s questions
            </button>
            <StatusSelect value={status} onChange={onSetStatus} />
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

          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onConfigure}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0f1923] text-white text-[12.5px] font-medium hover:bg-[#1a2733] transition-colors"
            >
              <PencilRuler size={13} /> Configure Survey <ArrowRight size={12} />
            </button>
            <StepEmailAction step={step} onOpen={() => setShowEmail(true)} />
          </div>
        </>
      )}

      {showEmail && (
        <RequestActionModal step={step} client={client} onClose={() => setShowEmail(false)} onSend={onRequestAction} />
      )}
    </div>
  );
}

function ContactsStep({
  step,
  surveyId,
  client,
  onSetStatus,
  onRequestAction,
}: {
  step: OnboardingStep;
  surveyId: string | null;
  client: Client;
  onSetStatus: (v: OnboardingStepStatus) => void;
  onRequestAction: () => void;
}) {
  const [showEmail, setShowEmail] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <Users size={15} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800">2. {step.label}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5 max-w-md">{step.description}</p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${STEP_STATUS_CONFIG[step.status].badge}`}>
          {STEP_STATUS_CONFIG[step.status].label}
        </span>
      </div>

      <RequirementsList step={step} />

      <div className="px-5 py-3.5 flex items-center justify-between gap-3">
        {surveyId ? (
          <Link
            href={`/surveys/${surveyId}/contacts`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#00897b] hover:underline"
          >
            Review Contact List <ExternalLink size={12} />
          </Link>
        ) : (
          <span className="text-[12px] text-slate-400" title="No survey cycle linked yet">
            Review Contact List — available once this cycle is linked to a survey
          </span>
        )}
        <StatusSelect value={step.status} onChange={onSetStatus} />
      </div>

      <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end">
        <StepEmailAction step={step} onOpen={() => setShowEmail(true)} />
      </div>

      {showEmail && (
        <RequestActionModal step={step} client={client} onClose={() => setShowEmail(false)} onSend={onRequestAction} />
      )}
    </div>
  );
}

function FinalizationStep({
  step,
  cycle,
  client,
  onSend,
}: {
  step: OnboardingStep;
  cycle: ClientSurveyCycle;
  client: Client;
  onSend: () => void;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#e8f5f3] flex items-center justify-center shrink-0 mt-0.5">
            <Mail size={15} className="text-[#00897b]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800">3. {step.label}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5 max-w-md">{step.description}</p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${STEP_STATUS_CONFIG[step.status].badge}`}>
          {STEP_STATUS_CONFIG[step.status].label}
        </span>
      </div>

      <RequirementsList step={step} />

      <div className="px-5 py-3.5 flex items-center justify-between gap-3">
        <button
          onClick={() => setShowModal(true)}
          disabled={step.status === "approved"}
          className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${
            step.status === "approved" ? "text-slate-400 cursor-not-allowed" : "text-[#00897b] hover:underline"
          }`}
        >
          <Send size={12} /> {step.status === "approved" ? "Finalization email sent" : "Preview & Send Finalization Email"}
        </button>
        {step.lastEmailSentAt && <span className="text-[11px] text-slate-400">Last emailed {fmtDate(step.lastEmailSentAt)}</span>}
      </div>

      {showModal && (
        <FinalizationModal client={client} cycle={cycle} onClose={() => setShowModal(false)} onSend={onSend} />
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────

export default function ClientOnboardingPage() {
  const {
    client, activeCycle, startOnboarding, setOnboardingStepStatus, requestOnboardingStepAction,
    sendFinalizationEmail, linkCycleSurvey, completeQuestionBuildout, resetQuestionBuildout,
  } = useClientCtx();
  const { selected: cycle, selectCycle } = useSelectedCycle(client, activeCycle);
  const router = useRouter();

  // Step 1's survey lives in the draft store, which is persisted; the client
  // record here is in-memory demo state. The draft is therefore the source of
  // truth, and these effects push its state back into the CRM record so the
  // step badge, the cycle's survey link, and the launch checklist all agree.
  const draft = useCycleDraft(cycle?.id ?? null);
  const allSurveys = useAllSurveys();
  const questionsStep = cycle?.onboarding.find((s) => s.key === "questions");
  const derivedStepStatus = draft ? stepStatusForDraft(draft) : questionsStep?.status ?? "not_started";

  useEffect(() => {
    if (!cycle || !draft?.surveyId) return;
    if (cycle.surveyId !== draft.surveyId) linkCycleSurvey(cycle.id, draft.surveyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle?.id, cycle?.surveyId, draft?.surveyId]);

  // Launching the cycle is what freezes the question set — "editable until the
  // survey is launched", enforced in one place rather than at every edit site.
  useEffect(() => {
    if (!cycle || !draft) return;
    if (cycleHasLaunched(cycle) && draft.lifecycle === "submitted") lockDraft(draft.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle?.id, cycle?.status, draft?.id, draft?.lifecycle]);

  useEffect(() => {
    if (!cycle || !draft || !questionsStep || questionsStep.status === derivedStepStatus) return;
    if (derivedStepStatus === "approved") completeQuestionBuildout(cycle.id);
    else setOnboardingStepStatus(cycle.id, "questions", derivedStepStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle?.id, questionsStep?.status, derivedStepStatus, draft?.id]);

  function handleStartOnboarding() {
    const id = startOnboarding();
    selectCycle(id);
  }

  /** Opens this cycle's draft in the creation flow, creating it the first time. */
  function openSurveyBuilder() {
    if (!cycle) return;
    beginCycleDraft(buildCycleContext(client, cycle), buildBasicsPrefill(client, cycle));
    router.push("/surveys/new");
  }

  function handleDiscardSurvey() {
    if (!cycle || !draft) return;
    const filed = draft.lifecycle !== "configuring";
    const message = filed
      ? "Discard this survey? It will be removed from the Survey Dashboard and step 1 will reset."
      : "Discard this survey draft? This can't be undone.";
    if (!window.confirm(message)) return;
    discardDraftById(draft.id);
    resetQuestionBuildout(cycle.id);
  }

  if (!cycle) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
          <ClipboardList size={18} className="text-slate-300" />
        </div>
        <p className="text-[13px] font-medium text-slate-600">Onboarding hasn&rsquo;t started for this client</p>
        <p className="text-[11.5px] text-slate-400 mt-1 mb-4">Kick things off to send the initial invitation and begin the 3-step process below.</p>
        <button
          onClick={handleStartOnboarding}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0f1923] text-white text-[12.5px] font-medium hover:bg-[#1a2733] transition-colors"
        >
          <Send size={13} /> Start Client Onboarding
        </button>
      </div>
    );
  }

  const contacts = cycle.onboarding.find((s) => s.key === "contacts");

  // A pre-existing link (from the seeded CRM data) only counts as "legacy"
  // while this cycle has no draft of its own to show instead.
  const legacyMatch = !draft && cycle.surveyId ? allSurveys.find((s) => s.id === cycle.surveyId) : undefined;
  const legacySurvey = cycle.surveyId && !draft
    ? { id: cycle.surveyId, name: legacyMatch?.name ?? "Linked survey" }
    : null;
  const finalization = cycle.onboarding.find((s) => s.key === "finalization");

  return (
    <div className="space-y-4">
      <CyclePicker cycles={client.surveys} selectedId={cycle.id} onSelect={selectCycle} />

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-5 py-3.5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-slate-700">
            {cycle.name} &rsquo;{String(cycle.year).slice(2)} Onboarding
          </p>
          <p className="text-[12px] text-slate-500 mt-0.5">
            These 3 steps can be revisited any time onboarding items need attention — nothing here is one-and-done.
          </p>
        </div>
        {(!activeCycle || activeCycle.status === "onboarding") && (
          <button
            onClick={handleStartOnboarding}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Send size={12} /> {activeCycle ? "Resend Onboarding Invite" : "Start Next Cycle's Onboarding"}
          </button>
        )}
      </div>

      {questionsStep && (
        <SurveyBuildStep
          step={questionsStep}
          status={derivedStepStatus}
          client={client}
          draft={draft}
          legacySurvey={legacySurvey}
          onConfigure={openSurveyBuilder}
          onEdit={openSurveyBuilder}
          onApprove={() => draft && approveDraftQuestions(draft.id)}
          onReopen={() => draft && reopenDraftQuestions(draft.id)}
          onDiscard={handleDiscardSurvey}
          onSetStatus={(v) => setOnboardingStepStatus(cycle.id, "questions", v)}
          onRequestAction={() => requestOnboardingStepAction(cycle.id, "questions")}
        />
      )}
      {contacts && (
        <ContactsStep
          step={contacts}
          surveyId={cycle.surveyId ?? draft?.surveyId ?? null}
          client={client}
          onSetStatus={(v) => setOnboardingStepStatus(cycle.id, "contacts", v)}
          onRequestAction={() => requestOnboardingStepAction(cycle.id, "contacts")}
        />
      )}
      {finalization && (
        <FinalizationStep
          step={finalization}
          cycle={cycle}
          client={client}
          onSend={() => sendFinalizationEmail(cycle.id)}
        />
      )}
    </div>
  );
}
