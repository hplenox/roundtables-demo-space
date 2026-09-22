"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

export default function SectionPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
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
          <h2 className="text-[17px] font-bold text-slate-900">{title}</h2>
          <p className="text-[12.5px] text-slate-500 mt-0.5">{description}</p>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>

      <div className="flex justify-end mt-5">
        <Link
          href="/surveys/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0f1923] text-[13px] font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Save &amp; back to overview
        </Link>
      </div>
    </div>
  );
}
