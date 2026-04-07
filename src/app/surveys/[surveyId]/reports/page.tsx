"use client";

import { useParams } from "next/navigation";
import { getSurveyById } from "@/lib/mock-data";
import { FileText, Download, BarChart3, Lock } from "lucide-react";

const REPORT_TYPES = [
  {
    icon: BarChart3,
    title: "Participation Summary",
    description: "Response rates, submission timeline, and organization-level completion status.",
    available: true,
  },
  {
    icon: FileText,
    title: "LPI Benchmark Report",
    description: "Aggregated LPI scores across all submitted organizations with peer group comparisons.",
    available: true,
  },
  {
    icon: FileText,
    title: "Demographics Overview",
    description: "Gender and racial diversity breakdown across submitted organizations.",
    available: true,
  },
  {
    icon: Lock,
    title: "Full Disclosure Report",
    description: "Organization-level detail including individual LPI sub-components. Requires Full Disclosure privacy level.",
    available: false,
  },
];

export default function ReportsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const survey = getSurveyById(surveyId);

  if (!survey) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-800">Reports</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Download or view generated reports for {survey.year} {survey.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORT_TYPES.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.title}
              className={`bg-white rounded-xl border p-5 flex gap-4 ${
                r.available ? "border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all" : "border-slate-100 opacity-60"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.available ? "bg-slate-100" : "bg-slate-50"}`}>
                <Icon size={16} className={r.available ? "text-slate-600" : "text-slate-400"} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-slate-800">{r.title}</p>
                  {!r.available && (
                    <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                      Restricted
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{r.description}</p>
                {r.available && (
                  <button className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#00897b] hover:underline">
                    <Download size={12} />
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
