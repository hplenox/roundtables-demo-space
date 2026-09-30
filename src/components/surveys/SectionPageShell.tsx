"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

// Chronological order of the stacked sections on the /surveys/new hub. Used to
// offer a "continue to the next section" hand-off so an admin can work straight
// down the list without bouncing back to the overview each time.
const STEPS: { href: string; label: string }[] = [
  { href: "/surveys/new/basics", label: "Survey Basics" },
  { href: "/surveys/new/lpi-settings", label: "LPI Data Fields" },
  { href: "/surveys/new/practices", label: "Practices Questions" },
  { href: "/surveys/new/standard-questions", label: "Standard Questions" },
  { href: "/surveys/new/custom-questions", label: "Custom Questions" },
];

export default function SectionPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const index = STEPS.findIndex((step) => step.href === pathname);
  const next = index >= 0 ? STEPS[index + 1] : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Link
          href="/surveys/new"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to overview
        </Link>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-emerald-600 font-medium">
          <CheckCircle2 size={13} />
          Saved automatically
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          {index >= 0 && (
            <p className="text-[11px] font-bold text-[#00897b] uppercase tracking-wide mb-1">
              Step {index + 1} of {STEPS.length}
            </p>
          )}
          <h2 className="text-[17px] font-bold text-slate-900">{title}</h2>
          <p className="text-[12.5px] text-slate-500 mt-0.5">{description}</p>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>

      <div className="flex justify-end items-center gap-2 mt-5">
        <Link
          href="/surveys/new"
          className={
            next
              ? "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              : "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0f1923] text-[13px] font-semibold text-white hover:bg-slate-800 transition-colors"
          }
        >
          Save &amp; back to overview
        </Link>
        {next && (
          <Link
            href={next.href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0f1923] text-[13px] font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Next: {next.label}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
