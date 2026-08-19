"use client";

import { useState } from "react";
import Link from "next/link";
import { useClientCtx } from "../client-context";
import { CyclePicker, useSelectedCycle } from "../cycle-picker";
import { fmtDate } from "@/lib/mock-clients";
import type { Client, ClientSurveyCycle, OnboardingStep, OnboardingStepStatus } from "@/types/client";
import {
  FileText, Users, Mail, ChevronDown, ExternalLink, Send, X,
  CheckCircle2, Paperclip, FileSignature, ClipboardList,
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
              <Mail size={15} className="text-[#3147af]" />
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
              <Mail size={15} className="text-[#3147af]" />
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
            : "border-[#4361ee]/30 bg-[#4361ee]/5 text-[#3147af] hover:bg-[#4361ee]/10"
        }`}
      >
        <Send size={12} />
        {step.status === "approved" ? "Complete" : step.status === "not_started" ? "Send Request Email" : "Send Reminder Email"}
      </button>
    </div>
  );
}

function QuestionsStep({
  step,
  client,
  onSetStatus,
  onRequestAction,
}: {
  step: OnboardingStep;
  client: Client;
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
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-[#3147af] transition-colors"
        >
          <ChevronDown size={13} className={`transition-transform ${showPreview ? "rotate-180" : ""}`} />
          Review previous year&rsquo;s questions
        </button>
        <StatusSelect value={step.status} onChange={onSetStatus} />
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

      <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end">
        <StepEmailAction step={step} onOpen={() => setShowEmail(true)} />
      </div>

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
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#3147af] hover:underline"
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
            <Mail size={15} className="text-[#3147af]" />
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
            step.status === "approved" ? "text-slate-400 cursor-not-allowed" : "text-[#3147af] hover:underline"
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
  const { client, activeCycle, startOnboarding, setOnboardingStepStatus, requestOnboardingStepAction, sendFinalizationEmail } = useClientCtx();
  const { selected: cycle, selectCycle } = useSelectedCycle(client, activeCycle);

  function handleStartOnboarding() {
    const id = startOnboarding();
    selectCycle(id);
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

  const questions = cycle.onboarding.find((s) => s.key === "questions");
  const contacts = cycle.onboarding.find((s) => s.key === "contacts");
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

      {questions && (
        <QuestionsStep
          step={questions}
          client={client}
          onSetStatus={(v) => setOnboardingStepStatus(cycle.id, "questions", v)}
          onRequestAction={() => requestOnboardingStepAction(cycle.id, "questions")}
        />
      )}
      {contacts && (
        <ContactsStep
          step={contacts}
          surveyId={cycle.surveyId}
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
