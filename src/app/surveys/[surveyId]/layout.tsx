"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { getSurveyById } from "@/lib/mock-data";
import { ChevronRight, Download, ShieldCheck, LayoutDashboard } from "lucide-react";

const SUB_TABS = [
  { key: "overview",       label: "Overview",              href: "" },
  { key: "organizations",  label: "Invited Organizations", href: "/organizations" },
  { key: "analytics",      label: "Analytics",             href: "/analytics" },
  { key: "data-control",   label: "Data Control",          href: "/data-control" },
  { key: "reports",        label: "Reports",               href: "/reports" },
];

export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  const { surveyId } = useParams<{ surveyId: string }>();
  const pathname = usePathname();
  const survey = getSurveyById(surveyId);

  if (!survey) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 text-sm">Survey not found.</p>
      </div>
    );
  }

  const baseHref = `/surveys/${surveyId}`;

  // Determine active sub-tab from pathname
  const activeSub = (() => {
    if (pathname.includes("/organizations")) return "organizations";
    if (pathname.includes("/analytics"))     return "analytics";
    if (pathname.includes("/data-control"))  return "data-control";
    if (pathname.includes("/reports"))       return "reports";
    return "overview";
  })();

  const statusColors: Record<string, string> = {
    active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    upcoming: "bg-amber-50 text-amber-700 border-amber-200",
    closed:   "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <div className="min-h-full bg-slate-50">
      {/* Survey command header */}
      <div className="bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Premium accent bar */}
        <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />

        <div className="max-w-6xl mx-auto px-6 pt-5 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11.5px] mb-4">
            <Link
              href="/surveys"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0f1923] text-[#00b8a9] hover:bg-[#1a2d3d] transition-colors font-semibold text-[10.5px] tracking-wide"
            >
              <LayoutDashboard size={10} strokeWidth={2} />
              Survey Admin
            </Link>
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
            <span className="text-slate-700 font-medium truncate max-w-xs">
              {survey.year} {survey.name}
            </span>
          </div>

          {/* Survey identity row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Icon */}
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#0f1923] flex items-center justify-center shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00b8a9" strokeWidth="1.75">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[18px] font-bold text-slate-900 leading-tight">
                    {survey.year} {survey.name}
                  </h1>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${statusColors[survey.status]}`}>
                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                  </span>
                </div>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  {survey.hostOrg}
                  <span className="mx-1.5 text-slate-200">·</span>
                  Hosted by {survey.hostContact}
                  <span className="mx-1.5 text-slate-200">·</span>
                  Closes {survey.targetCloseDate}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Download size={13} />
                Weekly Report
              </button>
              {/* Premium admin access badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00b8a9]/8 border border-[#00b8a9]/25 text-[#00897b]">
                <ShieldCheck size={13} strokeWidth={2} />
                <span className="text-[11.5px] font-semibold">Admin Access</span>
              </div>
            </div>
          </div>

          {/* Sub-navigation tabs */}
          <div className="flex items-end gap-0 -mb-px">
            {SUB_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`${baseHref}${tab.href}`}
                className={`
                  px-5 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-150
                  ${activeSub === tab.key
                    ? "border-[#00b8a9] text-[#00897b]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }
                `}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-page content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}
