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
import { SectionKey } from "@/types/survey-draft";
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
    description: "Organization, request type, name, timeline, and points of contact.",
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
    description: "Enable the governance and talent practice questions to include.",
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

export default function NewSurveyHubPage() {
  const draft = useDraft();
  const router = useRouter();

  if (!draft) {
    return <p className="text-[13px] text-slate-400">Setting up your draft…</p>;
  }

  const progress = computeOverallProgress(draft);
  const ready = isReadyToSubmit(draft);

  function handleDiscard() {
    if (window.confirm("Discard this draft? This can't be undone.")) {
      discardDraft();
      router.push("/surveys");
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((section) => {
          const status = computeSectionStatus(draft, section.key);
          const Icon = section.icon;
          return (
            <Link
              key={section.key}
              href={section.href}
              className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#00b8a9]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-[#00897b] group-hover:bg-[#00b8a9]/8 transition-colors">
                  <Icon size={18} />
                </div>
                <StatusBadge status={status} />
              </div>
              <h3 className="text-[14.5px] font-bold text-slate-900 flex items-center gap-1.5">
                {section.label}
                {section.optional && (
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Optional</span>
                )}
              </h3>
              <p className="text-[12.5px] text-slate-500 leading-snug mt-1">{section.description}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11.5px] text-slate-400">{sectionProgressLabel(draft, section.key)}</span>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#3650d4] group-hover:gap-2 transition-all">
                  {status === "not-started" ? "Start" : "Edit"}
                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Review & Submit — TurboTax-style "File" panel */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between gap-6">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">Review &amp; submit</h3>
          <p className="text-[12.5px] text-slate-500 mt-1">
            {ready
              ? "Every required section is complete. Review your survey and send it live."
              : `Complete the remaining ${progress.total - progress.completed} required section${
                  progress.total - progress.completed === 1 ? "" : "s"
                } to submit.`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDiscard}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={13} />
            Start over
          </button>
          {ready ? (
            <Link
              href="/surveys/new/review"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3fae4a] text-[13px] font-semibold text-white hover:bg-[#379a41] transition-colors"
            >
              <Send size={13} />
              Review &amp; Submit
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 text-[13px] font-semibold text-slate-400 cursor-not-allowed"
            >
              <Lock size={13} />
              Review &amp; Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
