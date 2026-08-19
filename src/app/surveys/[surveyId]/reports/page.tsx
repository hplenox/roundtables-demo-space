"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getSurveyById, getOrgsBySurveyId } from "@/lib/mock-data";
import {
  FileText,
  Users,
  ArrowRight,
  BadgeCheck,
  BellRing,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  BarChart2,
} from "lucide-react";

const REPORT_TYPES = [
  {
    key: "manager",
    icon: FileText,
    label: "Manager 2-Pager",
    description: "LPI score, benchmark distribution, and demographic overview.",
    color: "text-[#3147af]",
    bg: "bg-[#4361ee]/8",
    border: "border-[#4361ee]/20",
    hoverBorder: "hover:border-[#4361ee]/50",
    href: (surveyId: string, orgId: string) =>
      `/surveys/${surveyId}/organizations/${orgId}/report`,
  },
  {
    key: "staff",
    icon: Users,
    label: "Investment Staff Committee",
    description: "Race & gender breakdowns across ownership, leadership, and workforce.",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    hoverBorder: "hover:border-violet-400",
    href: (surveyId: string, orgId: string) =>
      `/surveys/${surveyId}/organizations/${orgId}/staff-report`,
  },
  {
    key: "demographics",
    icon: BarChart2,
    label: "Demographics Percentage Chart",
    description: "Race & gender percentages across investment staff, committee, and full-time staff by US and global.",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    hoverBorder: "hover:border-sky-400",
    href: (surveyId: string, orgId: string) =>
      `/surveys/${surveyId}/organizations/${orgId}/demographics-report`,
  },
];

export default function ReportsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const survey = getSurveyById(surveyId);
  const allOrgs = getOrgsBySurveyId(surveyId);

  if (!survey) return null;

  const submitted = allOrgs.filter((o) => o.status === "submitted");
  const pending = allOrgs.filter((o) => o.status !== "submitted");

  return (
    <div className="space-y-6">

      {/* ── Report center hero ────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#0f1923] px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={13} className="text-[#4361ee]" />
            <span className="text-[10.5px] font-bold tracking-widest uppercase text-[#4361ee]">
              Report Center
            </span>
          </div>
          <p className="text-white font-bold text-[16px]">
            {survey.year} {survey.name}
          </p>
          <p className="text-white/40 text-[12px] mt-0.5">
            {submitted.length} organization{submitted.length !== 1 ? "s" : ""} with available reports
            {pending.length > 0 && ` · ${pending.length} pending submission`}
          </p>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          {[
            { label: "Reports ready", value: submitted.length * 3, color: "text-[#4361ee]" },
            { label: "Awaiting data", value: pending.length, color: "text-white/40" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-right">
              <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-[10.5px] text-white/35">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Submitted org report cards ────────────────────────────── */}
      {submitted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 px-6 py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] font-semibold text-slate-600">No reports available yet</p>
          <p className="text-[12px] text-slate-400 mt-1">Reports will appear here once organizations submit.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submitted.map((org, i) => (
            <div
              key={org.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-150"
            >
              {/* Org header row */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#0f1923] flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-black text-[#4361ee]">
                    {org.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/surveys/${surveyId}/organizations/${org.id}`}
                      className="text-[14px] font-bold text-slate-900 hover:text-[#3147af] transition-colors truncate"
                    >
                      {org.name}
                    </Link>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      {org.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                      <BadgeCheck size={10} />
                      Submitted
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">
                    {org.contactName}
                    <span className="mx-1.5">·</span>
                    {org.assetClass}
                    <span className="mx-1.5">·</span>
                    {org.aum} AUM
                    {org.submissionDate && (
                      <>
                        <span className="mx-1.5">·</span>
                        Submitted {org.submissionDate}
                      </>
                    )}
                  </p>
                </div>
                {org.lpiScore !== null && (
                  <div className="shrink-0 text-right">
                    <p className={`text-[20px] font-bold tabular-nums ${org.lpiScore >= 8 ? "text-emerald-600" : org.lpiScore >= 6.5 ? "text-amber-600" : "text-red-500"}`}>
                      {org.lpiScore}
                    </p>
                    <p className="text-[10px] text-slate-400">LPI Score</p>
                  </div>
                )}
              </div>

              {/* Report type buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {REPORT_TYPES.map((rt) => {
                  const Icon = rt.icon;
                  const disabled =
                    rt.key === "manager" && (!org.lpiScore || !org.benchmarks);
                  return (
                    <Link
                      key={rt.key}
                      href={disabled ? "#" : rt.href(surveyId, org.id)}
                      className={`group flex items-center gap-4 px-5 py-4 transition-all duration-150 ${
                        disabled
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-slate-50/80"
                      }`}
                      aria-disabled={disabled}
                    >
                      <div className={`w-9 h-9 rounded-xl ${rt.bg} border ${rt.border} flex items-center justify-center shrink-0 transition-colors ${!disabled ? rt.hoverBorder : ""}`}>
                        <Icon size={16} className={rt.color} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 group-hover:text-slate-900">
                          {rt.label}
                        </p>
                        <p className="text-[11.5px] text-slate-400 leading-snug mt-0.5">
                          {rt.description}
                        </p>
                      </div>
                      {!disabled && (
                        <ArrowRight
                          size={14}
                          className="shrink-0 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pending orgs callout ──────────────────────────────────── */}
      {pending.length > 0 && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <BellRing size={14} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-amber-900">
                {pending.length} organization{pending.length !== 1 ? "s haven't" : " hasn't"} submitted yet
              </p>
              <p className="text-[12px] text-amber-700/80 mt-0.5 leading-relaxed">
                Reports are only shown for organizations that have completed their submission.
                Head to <strong>Invited Organizations</strong> to send nudge reminders and track progress.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={`/surveys/${surveyId}/organizations?status=in_progress`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[12px] font-semibold hover:bg-amber-700 transition-colors"
                >
                  <BellRing size={12} />
                  Nudge In Progress ({pending.filter(o => o.status === "in_progress").length})
                </Link>
                <Link
                  href={`/surveys/${surveyId}/organizations?status=not_started`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 text-[12px] font-medium hover:bg-amber-50 transition-colors"
                >
                  <Users size={12} />
                  Not Started ({pending.filter(o => o.status === "not_started").length})
                </Link>
                <Link
                  href={`/surveys/${surveyId}/organizations`}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-700 hover:underline ml-1"
                >
                  View all organizations
                  <ChevronRight size={12} />
                </Link>
              </div>

              {/* Mini list of pending orgs */}
              {pending.length <= 8 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pending.map((o) => (
                    <Link
                      key={o.id}
                      href={`/surveys/${surveyId}/organizations/${o.id}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-amber-200 text-[11px] text-slate-600 hover:border-amber-400 transition-colors"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${o.status === "in_progress" ? "bg-amber-400" : "bg-slate-300"}`} />
                      {o.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Admin tip ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-1">
        <LayoutDashboard size={11} className="text-slate-300 shrink-0" />
        <p className="text-[11px] text-slate-400">
          Reports are generated from submitted survey data.
          All reports are personalized to this survey and are only accessible to authorized administrators.
        </p>
      </div>

    </div>
  );
}
