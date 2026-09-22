"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Send, PenLine } from "lucide-react";
import { ensureDraft, isReadyToSubmit, submitDraft, useDraft } from "@/lib/survey-draft-store";
import { LPI_SETTINGS_CONFIG, PRACTICES_CONFIG, STANDARD_QUESTIONS_CONFIG } from "@/lib/survey-draft-config";

function SummaryCard({ title, editHref, children }: { title: string; editHref: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13.5px] font-bold text-slate-900">{title}</h3>
        <Link href={editHref} className="inline-flex items-center gap-1 text-[12px] font-medium text-[#3650d4] hover:underline">
          <PenLine size={11} />
          Edit
        </Link>
      </div>
      {children}
    </div>
  );
}

export default function ReviewPage() {
  const draft = useDraft();
  const router = useRouter();

  useEffect(() => {
    ensureDraft();
  }, []);

  useEffect(() => {
    if (draft && !isReadyToSubmit(draft)) {
      router.replace("/surveys/new");
    }
  }, [draft, router]);

  if (!draft || !isReadyToSubmit(draft)) return null;
  const currentDraft = draft;

  const { basics } = currentDraft;
  const enabledLpi = LPI_SETTINGS_CONFIG.filter((row) => currentDraft.lpiSettings[row.key]?.enabled);
  const enabledPractices = PRACTICES_CONFIG.flatMap((cat) => cat.questions.filter((q) => currentDraft.practices[q.key]?.enabled));
  const enabledStandard = STANDARD_QUESTIONS_CONFIG.filter((q) => currentDraft.standardQuestions[q.key]?.enabled);

  function handleSubmit() {
    const id = submitDraft(currentDraft);
    router.push(`/surveys/${id}`);
  }

  return (
    <div>
      <Link href="/surveys/new" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-800 transition-colors mb-5">
        <ArrowLeft size={14} />
        Back to overview
      </Link>

      <div className="mb-5">
        <h2 className="text-[19px] font-bold text-slate-900">Review &amp; submit</h2>
        <p className="text-[12.5px] text-slate-500 mt-1">
          Double check everything below, then submit to send this survey live and start inviting organizations.
        </p>
      </div>

      <div className="space-y-4">
        <SummaryCard title="Survey Basics" editHref="/surveys/new/basics">
          <div className="grid grid-cols-2 gap-y-2.5 text-[12.5px]">
            <p className="text-slate-400">Organization</p>
            <p className="text-slate-800 font-medium">{basics.organization}</p>
            <p className="text-slate-400">Request Type</p>
            <p className="text-slate-800 font-medium">{basics.requestType}</p>
            <p className="text-slate-400">Name</p>
            <p className="text-slate-800 font-medium">{basics.name}</p>
            <p className="text-slate-400">Timeline</p>
            <p className="text-slate-800 font-medium">{basics.startDate} → {basics.dueDate}</p>
            <p className="text-slate-400">Primary Contact</p>
            <p className="text-slate-800 font-medium">{basics.primaryContact} ({basics.contactEmail})</p>
          </div>
        </SummaryCard>

        <SummaryCard title="LPI Data Fields" editHref="/surveys/new/lpi-settings">
          {enabledLpi.length === 0 ? (
            <p className="text-[12.5px] text-slate-400">No data groups enabled.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {enabledLpi.map((row) => (
                <span key={row.key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
                  <CheckCircle2 size={10} />
                  {row.label}
                </span>
              ))}
            </div>
          )}
        </SummaryCard>

        <SummaryCard title="Practices Questions" editHref="/surveys/new/practices">
          <p className="text-[12.5px] text-slate-600 mb-2">{enabledPractices.length} question{enabledPractices.length === 1 ? "" : "s"} enabled</p>
          <ul className="space-y-1">
            {enabledPractices.map((q) => (
              <li key={q.key} className="text-[12px] text-slate-500 flex items-start gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                {q.question}
              </li>
            ))}
          </ul>
        </SummaryCard>

        <SummaryCard title="Standard Questions" editHref="/surveys/new/standard-questions">
          {enabledStandard.length === 0 ? (
            <p className="text-[12.5px] text-slate-400">No standard questions enabled.</p>
          ) : (
            <ul className="space-y-1">
              {enabledStandard.map((q) => (
                <li key={q.key} className="text-[12px] text-slate-500 flex items-start gap-1.5">
                  <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                  {q.label}
                </li>
              ))}
            </ul>
          )}
        </SummaryCard>

        <SummaryCard title="Custom Questions" editHref="/surveys/new/custom-questions">
          {currentDraft.customSections.length === 0 ? (
            <p className="text-[12.5px] text-slate-400">No custom sections added.</p>
          ) : (
            <ul className="space-y-1">
              {currentDraft.customSections.map((s) => (
                <li key={s.id} className="text-[12px] text-slate-500">
                  <span className="font-medium text-slate-700">{s.name || "Untitled section"}</span> — {s.questions.length} question
                  {s.questions.length === 1 ? "" : "s"}
                </li>
              ))}
            </ul>
          )}
        </SummaryCard>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3fae4a] text-[14px] font-semibold text-white hover:bg-[#379a41] transition-colors shadow-sm"
        >
          <Send size={15} />
          Submit Survey
        </button>
      </div>
    </div>
  );
}
