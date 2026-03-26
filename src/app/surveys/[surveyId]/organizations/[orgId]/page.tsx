"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrgById, getSurveyById } from "@/lib/mock-data";
import { ArrowLeft, ArrowRight, FileText, ExternalLink, MapPin, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  submitted:   { label: "Submitted",   badge: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: CheckCircle2, iconColor: "text-emerald-500" },
  in_progress: { label: "In Progress", badge: "bg-amber-50 border-amber-200 text-amber-700",       icon: Clock,         iconColor: "text-amber-500" },
  not_started: { label: "Not Started", badge: "bg-slate-50 border-slate-200 text-slate-500",       icon: AlertCircle,   iconColor: "text-slate-400" },
};

function DetailBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[13.5px] text-slate-800 font-medium leading-snug">{value}</p>
    </div>
  );
}

export default function OrgDetailPage() {
  const { surveyId, orgId } = useParams<{ surveyId: string; orgId: string }>();
  const org = getOrgById(orgId);
  const survey = getSurveyById(surveyId);

  if (!org || !survey) {
    return <div className="text-slate-500 text-sm py-10 text-center">Organization not found.</div>;
  }

  const st = STATUS_CONFIG[org.status];
  const StatusIcon = st.icon;

  return (
    <div className="space-y-5">
      {/* Back breadcrumb (within the survey layout) */}
      <div>
        <Link
          href={`/surveys/${surveyId}/organizations`}
          className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 transition-colors mb-5"
        >
          <ArrowLeft size={13} />
          Back to Organizations
        </Link>

        {/* Org hero */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-[#0f1923] flex items-center justify-center shrink-0">
                <span className="text-[16px] font-bold text-[#00b8a9]">
                  {org.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-[20px] font-semibold text-slate-900">{org.name}</h2>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {org.type}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${st.badge}`}>
                    <StatusIcon size={11} />
                    {st.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[12.5px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {org.location}
                  </span>
                  <span>·</span>
                  <span>{org.assetClass}</span>
                  <span>·</span>
                  <span>{org.aum} AUM</span>
                </div>
              </div>
            </div>

            {/* CTA: View Report */}
            {org.status === "submitted" && (
              <Link
                href={`/surveys/${surveyId}/organizations/${orgId}/report`}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-xl
                  bg-[#0f1923] text-white text-[13px] font-semibold
                  hover:bg-slate-800 transition-colors shadow-sm shrink-0
                "
              >
                <FileText size={14} />
                View 2-Pager Report
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-400 mb-2">Survey Progress</p>
          <p className="text-[24px] font-semibold text-slate-800 tabular-nums">{org.progress}%</p>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${org.progress}%`,
                backgroundColor: org.progress === 100 ? "#00b8a9" : "#fbbf24",
              }}
            />
          </div>
        </div>

        <div className={`bg-white rounded-xl border p-4 ${org.lpiScore !== null ? "border-[#00b8a9]/30" : "border-slate-200"}`}>
          <p className="text-[11px] text-slate-400 mb-2">LPI Score</p>
          {org.lpiScore !== null ? (
            <>
              <p className={`text-[24px] font-semibold tabular-nums ${org.lpiScore >= 8 ? "text-emerald-600" : org.lpiScore >= 6.5 ? "text-amber-600" : "text-red-600"}`}>
                {org.lpiScore}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">out of 10</p>
            </>
          ) : (
            <p className="text-[20px] text-slate-300 font-semibold mt-1">Not available</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-400 mb-2">Invited</p>
          <p className="text-[24px] font-semibold text-slate-800">{org.invitedDate}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-400 mb-2">Last Activity</p>
          <p className="text-[24px] font-semibold text-slate-800 leading-tight">{org.lastActivity ?? "—"}</p>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-[12px] font-semibold text-slate-600 mb-4">Contact Information</p>
          <div className="grid grid-cols-2 gap-4">
            <DetailBlock label="Primary Contact" value={org.contactName} />
            <DetailBlock label="Email" value={
              <a href={`mailto:${org.contactEmail}`} className="text-[#00897b] hover:underline">
                {org.contactEmail}
              </a>
            } />
            <DetailBlock label="Organization Type" value={org.type} />
            <DetailBlock label="Asset Class" value={org.assetClass} />
            <DetailBlock label="AUM" value={org.aum} />
            <DetailBlock label="Headquarters" value={org.location} />
          </div>
        </div>

        {/* Survey participation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-[12px] font-semibold text-slate-600 mb-4">Survey Participation</p>
          <div className="grid grid-cols-2 gap-4">
            <DetailBlock label="Survey" value={`${survey.year} ${survey.name}`} />
            <DetailBlock label="Host" value={survey.hostOrg} />
            <DetailBlock label="Invited Date" value={org.invitedDate} />
            <DetailBlock label="Target Close" value={survey.targetCloseDate} />
            <DetailBlock label="Privacy Level" value={survey.privacyLevel} />
            <DetailBlock label="Status" value={
              <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${st.badge.includes("emerald") ? "text-emerald-700" : st.badge.includes("amber") ? "text-amber-700" : "text-slate-500"}`}>
                <StatusIcon size={12} className={st.iconColor} />
                {st.label}
              </span>
            } />
          </div>
        </div>
      </div>

      {/* Report CTA — only if submitted */}
      {org.status === "submitted" ? (
        <div className="bg-[#0f1923] rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-[15px] mb-1">Manager Report Ready</p>
            <p className="text-slate-400 text-[13px]">
              View the full 2-pager DEI manager report with LPI score, benchmarks, and demographic breakdown.
            </p>
          </div>
          <Link
            href={`/surveys/${surveyId}/organizations/${orgId}/report`}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-xl shrink-0
              bg-[#00b8a9] text-white text-[13px] font-semibold
              hover:bg-[#00a99b] transition-colors shadow-sm ml-6
            "
          >
            <FileText size={14} />
            Open Report
            <ExternalLink size={13} />
          </Link>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-xl p-5 text-center">
          <p className="text-[13px] text-slate-500">
            The manager report will be available once this organization completes the survey.
          </p>
        </div>
      )}
    </div>
  );
}
