"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { getSurveyById } from "@/lib/mock-data";
import { ArrowLeft, Download } from "lucide-react";

const SUB_TABS = [
  { key: "overview",       label: "Overview",              href: "" },
  { key: "organizations",  label: "Invited Organizations", href: "/organizations" },
  { key: "analytics",      label: "Analytics",             href: "/analytics" },
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
      {/* Survey header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11.5px] text-slate-400 mb-4">
            <Link href="/surveys" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
              <ArrowLeft size={11} />
              Surveys
            </Link>
            <span>/</span>
            <span className="text-slate-600">Hosting</span>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-xs">
              {survey.year} {survey.name}
            </span>
          </div>

          {/* Survey identity row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Icon */}
              <div className="shrink-0 w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00b8a9" strokeWidth="1.75">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[18px] font-semibold text-slate-900 leading-tight">
                    {survey.year} {survey.name}
                  </h1>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${statusColors[survey.status]}`}>
                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-400 mt-0.5">
                  {survey.hostOrg} · Host: {survey.hostContact} · Closes {survey.targetCloseDate}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Download size={13} />
                Weekly Report
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-[12px] font-medium text-slate-500 border border-slate-200">
                Administrator Access Granted
              </button>
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
