"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getSurveyById, getOrgsBySurveyId } from "@/lib/mock-data";
import { ArrowRight, TrendingUp, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${accent ? "border-[#00b8a9]/30 bg-[#00b8a9]/[0.03]" : "border-slate-200"}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-[#00b8a9]/10" : "bg-slate-100"}`}>
            <Icon size={14} className={accent ? "text-[#00b8a9]" : "text-slate-500"} strokeWidth={1.75} />
          </div>
        )}
      </div>
      <p className={`text-[26px] font-semibold leading-none tabular-nums ${accent ? "text-[#00897b]" : "text-slate-800"}`}>
        {value}
      </p>
      {sub && <p className="text-[11.5px] text-slate-400 mt-1.5">{sub}</p>}
    </div>
  );
}

function SubmissionBar({ submitted, inProgress, notStarted, total }: {
  submitted: number; inProgress: number; notStarted: number; total: number;
}) {
  const s = total === 0 ? 0 : (submitted / total) * 100;
  const p = total === 0 ? 0 : (inProgress / total) * 100;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-[12px] font-semibold text-slate-600 mb-4">Submission Breakdown</p>
      {/* Stacked bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100 mb-5">
        <div className="h-full bg-[#00b8a9] transition-all duration-700" style={{ width: `${s}%` }} />
        <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${p}%` }} />
      </div>
      {/* Legend */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Submitted", value: submitted, pct: Math.round(s), color: "bg-[#00b8a9]", textColor: "text-emerald-700" },
          { label: "In Progress", value: inProgress, pct: Math.round(p), color: "bg-amber-400", textColor: "text-amber-700" },
          { label: "Not Started", value: notStarted, pct: Math.round(100 - s - p), color: "bg-slate-200", textColor: "text-slate-500" },
        ].map(({ label, value, pct, color, textColor }) => (
          <div key={label} className="flex items-start gap-2">
            <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
            <div>
              <p className="text-[12px] text-slate-500">{label}</p>
              <p className={`text-[17px] font-semibold tabular-nums ${textColor}`}>{value}</p>
              <p className="text-[10.5px] text-slate-400">{pct}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivityRow({ name, status, progress, lastActivity }: {
  name: string; status: string; progress: number; lastActivity: string | null;
}) {
  const statusMap = {
    submitted:   { label: "Submitted",   cls: "text-emerald-600", dot: "bg-emerald-400" },
    in_progress: { label: "In Progress", cls: "text-amber-600",   dot: "bg-amber-400" },
    not_started: { label: "Not Started", cls: "text-slate-400",   dot: "bg-slate-300" },
  };
  const s = statusMap[status as keyof typeof statusMap];
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      <p className="flex-1 text-[13px] text-slate-700 font-medium truncate">{name}</p>
      <div className="w-24 hidden sm:block">
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#00b8a9] rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className={`text-[11.5px] font-medium w-20 text-right ${s.cls}`}>{s.label}</p>
      <p className="text-[11px] text-slate-400 w-24 text-right hidden lg:block">
        {lastActivity ?? "—"}
      </p>
    </div>
  );
}

export default function ResponseRatesPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const survey = getSurveyById(surveyId);
  const orgs = getOrgsBySurveyId(surveyId);

  if (!survey) return null;

  const responseRate = survey.totalInvited === 0 ? "0%" : `${Math.round((survey.submitted / survey.totalInvited) * 100)}%`;
  const recentOrgs = [...orgs].sort((a, b) => {
    if (a.lastActivity && b.lastActivity) return b.lastActivity.localeCompare(a.lastActivity);
    if (a.lastActivity) return -1;
    return 1;
  }).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Response Rate"
          value={responseRate}
          sub={`${survey.submitted} / ${survey.totalInvited} completed`}
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="Days Remaining"
          value={survey.daysRemaining !== null ? String(survey.daysRemaining) : "—"}
          sub={`Due ${survey.targetCloseDate}`}
          icon={Clock}
        />
        <StatCard
          label="Total Invited"
          value={String(survey.totalInvited)}
          sub="Organizations"
          icon={Users}
        />
        <StatCard
          label="Last Submission"
          value={survey.lastSubmission ?? "—"}
          sub={survey.lastSubmission ? "Most recent response" : "No submissions yet"}
          icon={CheckCircle2}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard label="Submitted"   value={`${survey.submitted} (${Math.round((survey.submitted/survey.totalInvited||0)*100)}%)`} />
        <StatCard label="In Progress" value={`${survey.inProgress} (${Math.round((survey.inProgress/survey.totalInvited||0)*100)}%)`} />
        <StatCard label="Not Started" value={`${survey.notStarted} (${Math.round((survey.notStarted/survey.totalInvited||0)*100)}%)`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SubmissionBar
          submitted={survey.submitted}
          inProgress={survey.inProgress}
          notStarted={survey.notStarted}
          total={survey.totalInvited}
        />

        {/* Survey metadata */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-[12px] font-semibold text-slate-600 mb-4">Survey Details</p>
          <dl className="space-y-3">
            {[
              { label: "Survey Name",      value: `${survey.year} ${survey.name}` },
              { label: "Organization",      value: survey.hostOrg },
              { label: "Start Date",        value: survey.startDate },
              { label: "Target Close",      value: survey.targetCloseDate },
              { label: "Survey Host",       value: survey.hostContact },
              { label: "Privacy Level",     value: survey.privacyLevel },
              { label: "Asset Classes",     value: survey.assetClasses.join(", ") },
            ].map(({ label, value }) => (
              <div key={label} className="grid grid-cols-2 gap-2">
                <dt className="text-[11.5px] text-slate-400">{label}</dt>
                <dd className="text-[12px] font-medium text-slate-700 leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Recent activity + link to orgs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-[13px] font-semibold text-slate-700">Recent Activity</p>
          <Link
            href={`/surveys/${surveyId}/organizations`}
            className="flex items-center gap-1 text-[12px] font-medium text-[#00897b] hover:underline"
          >
            View all organizations <ArrowRight size={12} />
          </Link>
        </div>
        <div className="px-5">
          {/* Header */}
          <div className="flex items-center gap-4 py-2 border-b border-slate-100">
            <div className="w-1.5" />
            <p className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Organization</p>
            <p className="w-24 hidden sm:block text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Progress</p>
            <p className="w-20 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
            <p className="w-24 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:block">Last Activity</p>
          </div>
          {recentOrgs.map((org) => (
            <RecentActivityRow
              key={org.id}
              name={org.name}
              status={org.status}
              progress={org.progress}
              lastActivity={org.lastActivity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
