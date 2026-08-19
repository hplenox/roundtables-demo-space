"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getSurveyById, getOrgsBySurveyId } from "@/lib/mock-data";
import { ArrowRight, CheckCircle2, Clock, AlertCircle, TrendingUp, Upload, Users } from "lucide-react";

function SubmissionBar({ submitted, inProgress, notStarted, total }: {
  submitted: number; inProgress: number; notStarted: number; total: number;
}) {
  const s = total === 0 ? 0 : (submitted / total) * 100;
  const p = total === 0 ? 0 : (inProgress / total) * 100;
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
      <div className="h-full bg-[#4361ee] transition-all duration-700" style={{ width: `${s}%` }} />
      <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${p}%` }} />
    </div>
  );
}

export default function OverviewPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const survey = getSurveyById(surveyId);
  const orgs = getOrgsBySurveyId(surveyId);

  if (!survey) return null;

  const rate = survey.totalInvited === 0 ? 0 : Math.round((survey.submitted / survey.totalInvited) * 100);

  const recentOrgs = [...orgs]
    .sort((a, b) => {
      if (a.lastActivity && b.lastActivity) return b.lastActivity.localeCompare(a.lastActivity);
      return a.lastActivity ? -1 : 1;
    })
    .slice(0, 5);

  const baseOrgsHref = `/surveys/${surveyId}/organizations`;

  const statusCards = [
    {
      label: "Submitted",
      value: survey.submitted,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200 hover:border-emerald-300",
      filter: "submitted",
    },
    {
      label: "In Progress",
      value: survey.inProgress,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200 hover:border-amber-300",
      filter: "in_progress",
    },
    {
      label: "Not Started",
      value: survey.notStarted,
      icon: AlertCircle,
      color: "text-slate-500",
      bg: "bg-slate-50",
      border: "border-slate-200 hover:border-slate-300",
      filter: "not_started",
    },
  ];

  const statusMap = {
    submitted:   { label: "Submitted",   dot: "bg-emerald-400", text: "text-emerald-600" },
    in_progress: { label: "In Progress", dot: "bg-amber-400",   text: "text-amber-600" },
    not_started: { label: "Not Started", dot: "bg-slate-300",   text: "text-slate-400" },
  };

  const noContacts = survey.totalInvited === 0;

  return (
    <div className="space-y-5 relative">

      {/* ── No-contacts blur overlay ───────────────────────────────── */}
      {noContacts && (
        <div className="absolute inset-0 z-20 flex items-start justify-center pt-24 pointer-events-none">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-sm w-full text-center pointer-events-auto mx-4"
            style={{ boxShadow: "0 25px 60px -10px rgba(0,0,0,0.18)" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#4361ee]/10 flex items-center justify-center mx-auto mb-4">
              <Upload size={24} className="text-[#4361ee]" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-800">Upload your contacts first</h3>
            <p className="text-[12.5px] text-slate-500 mt-2 leading-relaxed">
              This survey has no invited organizations yet. Upload your contact list to unlock the overview and start tracking responses.
            </p>
            <Link
              href={`/surveys/${surveyId}/organizations`}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f1923] text-white text-[13px] font-semibold hover:bg-[#1a2733] transition-colors"
            >
              <Users size={14} />
              Go to Invited Organizations
            </Link>
          </div>
        </div>
      )}

      {/* ── Content (blurred when no contacts) ────────────────────── */}
      <div className={noContacts ? "blur-sm pointer-events-none select-none opacity-60" : ""}>

      {/* ── At-a-glance strip ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-wrap items-center gap-6">
        {/* Response rate — hero stat */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4361ee]/10 flex items-center justify-center">
            <TrendingUp size={15} className="text-[#4361ee]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Response Rate</p>
            <p className="text-[22px] font-bold text-[#3147af] leading-none tabular-nums">{rate}%</p>
          </div>
        </div>

        <div className="w-px h-10 bg-slate-100 shrink-0" />

        {/* Progress bar + breakdown inline */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] text-slate-400">{survey.submitted} of {survey.totalInvited} organizations</p>
            <p className="text-[11px] text-slate-400">
              {survey.inProgress > 0 ? `${survey.inProgress} in progress` : ""}
            </p>
          </div>
          <SubmissionBar
            submitted={survey.submitted}
            inProgress={survey.inProgress}
            notStarted={survey.notStarted}
            total={survey.totalInvited}
          />
        </div>

        <div className="w-px h-10 bg-slate-100 shrink-0" />

        {/* Days remaining */}
        <div className="text-right">
          <p className="text-[11px] text-slate-400 font-medium">Closes</p>
          <p className="text-[14px] font-semibold text-slate-700">{survey.targetCloseDate}</p>
          {survey.daysRemaining !== null && (
            <p className={`text-[11px] font-medium ${survey.daysRemaining <= 3 ? "text-red-500" : "text-slate-400"}`}>
              {survey.daysRemaining}d remaining
            </p>
          )}
        </div>

        {/* Last submission */}
        {survey.lastSubmission && (
          <>
            <div className="w-px h-10 bg-slate-100 shrink-0" />
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium">Last Submission</p>
              <p className="text-[13px] font-semibold text-slate-700">{survey.lastSubmission}</p>
            </div>
          </>
        )}
      </div>

      {/* ── Clickable status cards → org list ─────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {statusCards.map(({ label, value, icon: Icon, color, bg, border, filter }) => (
          <Link
            key={filter}
            href={`${baseOrgsHref}?status=${filter}`}
            className={`group flex items-center gap-4 bg-white rounded-xl border ${border} px-5 py-4 transition-all duration-150 hover:shadow-sm`}
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={17} className={color} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11.5px] text-slate-400 font-medium">{label}</p>
              <p className={`text-[24px] font-bold leading-none tabular-nums ${color}`}>{value}</p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-200 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </Link>
        ))}
      </div>

      {/* ── Details + Recent Activity ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Survey details — compact */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Survey Details</p>
          <dl className="space-y-2.5">
            {[
              { label: "Host",         value: survey.hostOrg },
              { label: "Contact",      value: survey.hostContact },
              { label: "Start Date",   value: survey.startDate },
              { label: "Close Date",   value: survey.targetCloseDate },
              { label: "Privacy",      value: survey.privacyLevel },
              { label: "Asset Classes",value: survey.assetClasses.join(", ") },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <dt className="w-24 shrink-0 text-[11.5px] text-slate-400">{label}</dt>
                <dd className="text-[12px] font-medium text-slate-700 leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Recent Activity</p>
            <Link
              href={baseOrgsHref}
              className="flex items-center gap-1 text-[12px] font-medium text-[#3147af] hover:underline"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrgs.map((org) => {
              const s = statusMap[org.status as keyof typeof statusMap];
              return (
                <Link
                  key={org.id}
                  href={`${baseOrgsHref}/${org.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-500">
                      {org.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <p className="flex-1 text-[12.5px] font-medium text-slate-700 group-hover:text-[#3147af] transition-colors truncate">
                    {org.name}
                  </p>
                  {/* Mini progress bar */}
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${org.progress}%`,
                        backgroundColor: org.progress === 100 ? "#4361ee" : org.progress > 0 ? "#fbbf24" : "transparent",
                      }}
                    />
                  </div>
                  <span className={`text-[11px] font-medium w-20 text-right shrink-0 ${s.text}`}>
                    {s.label}
                  </span>
                  <p className="text-[11px] text-slate-400 w-20 text-right hidden lg:block shrink-0">
                    {org.lastActivity ?? "—"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      </div>{/* end blurred wrapper */}
    </div>
  );
}
