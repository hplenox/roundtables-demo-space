"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  SlidersHorizontal,
  ListChecks,
  MessageSquareText,
  LayoutGrid,
  ArrowRight,
  Check,
  Send,
  RotateCcw,
  Lock,
} from "lucide-react";
import {
  computeOverallProgress,
  computeSectionStatus,
  discardDraft,
  isReadyToSubmit,
  sectionProgressLabel,
  useDraft,
} from "@/lib/survey-draft-store";
import { SectionKey, SectionStatus } from "@/types/survey-draft";
import StatusBadge from "@/components/surveys/StatusBadge";

const SECTIONS: {
  key: SectionKey;
  href: string;
  label: string;
  description: string;
  icon: typeof ClipboardList;
  optional?: boolean;
}[] = [
  {
    key: "basics",
    href: "/surveys/new/basics",
    label: "Survey Basics",
    description: "Client, request type, survey title, timeline, and points of contact.",
    icon: ClipboardList,
  },
  {
    key: "lpi-settings",
    href: "/surveys/new/lpi-settings",
    label: "LPI Data Fields",
    description: "Choose which workforce and ownership data points this cycle collects.",
    icon: SlidersHorizontal,
  },
  {
    key: "practices",
    href: "/surveys/new/practices",
    label: "Practices Questions",
    description: "Optional — pick the Organizational Activities, ESG, and Impact questions to include.",
    icon: ListChecks,
  },
  {
    key: "standard-questions",
    href: "/surveys/new/standard-questions",
    label: "Standard Questions",
    description: "Survey introduction copy and consent terms shown to respondents.",
    icon: MessageSquareText,
  },
  {
    key: "custom-questions",
    href: "/surveys/new/custom-questions",
    label: "Custom Questions",
    description: "Add your own sections and questions beyond the standard set.",
    icon: LayoutGrid,
    optional: true,
  },
];

function ctaLabel(status: SectionStatus): string {
  if (status === "complete") return "Review";
  if (status === "in-progress") return "Continue";
  return "Start";
}

export default function NewSurveyHubPage() {
  const draft = useDraft();
  const router = useRouter();

  if (!draft) {
    return <p className="text-[13px] text-slate-400">Setting up your draft…</p>;
  }

  const progress = computeOverallProgress(draft);
  const ready = isReadyToSubmit(draft);
  const remaining = progress.total - progress.completed;

  // The first unfinished section is the one we spotlight — this is what makes
  // the stack read chronologically instead of as a menu of equal choices.
  const activeKey =
    SECTIONS.find((s) => computeSectionStatus(draft, s.key) !== "complete")?.key ?? null;

  function handleDiscard() {
    if (window.confirm("Discard this draft? This can't be undone.")) {
      discardDraft();
      router.push("/surveys");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Your survey sections</h2>
        <button
          onClick={handleDiscard}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
        >
          <RotateCcw size={12} />
          Start over
        </button>
      </div>

      {/* Stacked, chronological step list — one section per row, joined by a rail */}
      <ol className="relative">
        {SECTIONS.map((section, index) => {
          const status = computeSectionStatus(draft, section.key);
          const isActive = section.key === activeKey;
          const isComplete = status === "complete";
          const Icon = section.icon;
          return (
            <li key={section.key} className="relative pl-12 pb-3">
              <span
                aria-hidden
                className={`absolute left-[15px] top-10 bottom-0 w-[2px] ${
                  isComplete ? "bg-[#00b8a9]/40" : "bg-slate-200"
                }`}
              />
              <span
                aria-hidden
                className={`absolute left-0 top-4 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-colors ${
                  isComplete
                    ? "bg-[#00b8a9] border-[#00b8a9] text-white"
                    : isActive
                      ? "bg-white border-[#00b8a9] text-[#00897b] shadow-[0_0_0_4px_rgba(0,184,169,0.12)]"
                      : "bg-white border-slate-200 text-slate-400"
                }`}
              >
                {isComplete ? <Check size={15} strokeWidth={3} /> : index + 1}
              </span>

              <Link
                href={section.href}
                className={`group block bg-white rounded-2xl border p-5 transition-all ${
                  isActive
                    ? "border-[#00b8a9]/50 shadow-md"
                    : "border-slate-200 shadow-sm hover:border-[#00b8a9]/40 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-[#00b8a9]/8 border-[#00b8a9]/20 text-[#00897b]"
                        : "bg-slate-50 border-slate-100 text-slate-500 group-hover:text-[#00897b] group-hover:bg-[#00b8a9]/8"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[14.5px] font-bold text-slate-900">{section.label}</h3>
                      {section.optional && (
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          Optional
                        </span>
                      )}
                      <StatusBadge status={status} />
                    </div>
                    <p className="text-[12.5px] text-slate-500 leading-snug mt-1">{section.description}</p>
                    <p className="text-[11.5px] text-slate-400 mt-1.5">{sectionProgressLabel(draft, section.key)}</p>
                  </div>

                  <span
                    className={`shrink-0 self-center inline-flex items-center gap-1.5 rounded-lg text-[12.5px] font-semibold transition-all ${
                      isActive
                        ? "px-4 py-2 bg-[#00b8a9] text-white group-hover:bg-[#00a094]"
                        : "px-1 text-[#3650d4] group-hover:gap-2.5"
                    }`}
                  >
                    {ctaLabel(status)}
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}

        {/* Final step: Review & Submit — TurboTax's "File" row, on the same rail */}
        <li className="relative pl-12">
          <span
            aria-hidden
            className={`absolute left-0 top-4 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
              ready
                ? "bg-[#3fae4a] border-[#3fae4a] text-white shadow-[0_0_0_4px_rgba(63,174,74,0.15)]"
                : "bg-white border-slate-200 text-slate-400"
            }`}
          >
            {ready ? <Send size={14} /> : <Lock size={13} />}
          </span>

          <div
            className={`bg-white rounded-2xl border p-5 shadow-sm ${
              ready ? "border-[#3fae4a]/40" : "border-slate-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-bold text-slate-900">Review &amp; submit</h3>
                <p className="text-[12.5px] text-slate-500 leading-snug mt-1">
                  {ready
                    ? "Every required section is complete. Review your survey and send it live."
                    : `Complete the remaining ${remaining} required section${
                        remaining === 1 ? "" : "s"
                      } to unlock submission.`}
                </p>
              </div>
              {ready ? (
                <Link
                  href="/surveys/new/review"
                  className="shrink-0 self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3fae4a] text-[12.5px] font-semibold text-white hover:bg-[#379a41] transition-colors"
                >
                  <Send size={13} />
                  Review &amp; Submit
                </Link>
              ) : (
                <button
                  disabled
                  className="shrink-0 self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 text-[12.5px] font-semibold text-slate-400 cursor-not-allowed"
                >
                  <Lock size={13} />
                  Review &amp; Submit
                </button>
              )}
            </div>
          </div>
        </li>
      </ol>
    </div>
  );
}
