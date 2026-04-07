"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrgById, getSurveyById } from "@/lib/mock-data";
import LpiGaugeBar from "@/components/report/LpiGaugeBar";
import BenchmarkDistributionChart from "@/components/report/BenchmarkDistributionChart";
import LpiSubComponentsSection from "@/components/report/LpiSubComponentsSection";
import WorkplacePoliciesCard from "@/components/report/WorkplacePoliciesCard";
import GenderDemographicsSection from "@/components/report/GenderDemographicsSection";
import RacialDemographicsSection from "@/components/report/RacialDemographicsSection";

import {
  ChevronRight, Printer, Download, Building2, User, Mail,
  Calendar, Clock, MapPin, TrendingUp, BadgeCheck, Lock, LayoutDashboard,
} from "lucide-react";

function ReportSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-slate-100 bg-slate-50/60">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">{children}</span>
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={13} className="text-slate-500" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-[13px] font-semibold text-slate-800 leading-snug mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ManagerReportPage() {
  const { surveyId, orgId } = useParams<{ surveyId: string; orgId: string }>();
  const org = getOrgById(orgId);
  const survey = getSurveyById(surveyId);

  if (!org || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Report not found.</p>
      </div>
    );
  }

  if (!org.lpiScore || !org.benchmarks) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-sm">
          <p className="text-slate-700 font-semibold mb-2">Report Not Available</p>
          <p className="text-slate-400 text-sm">This organization has not yet completed the survey.</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const reportDate = now.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }) + " at " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const benchmarkPools = [
    { key: "universe",   data: org.benchmarks.universe },
    { key: "portfolio",  data: org.benchmarks.portfolio },
    { key: "assetClass", data: org.benchmarks.assetClass },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky report top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm print:hidden">
        {/* Premium accent bar */}
        <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 h-11 flex items-center justify-between gap-4">
          {/* Full breadcrumb chain */}
          <nav className="flex items-center gap-1.5 text-[11px] min-w-0 overflow-hidden">
            <Link
              href="/surveys"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0f1923] text-[#00b8a9] hover:bg-[#1a2d3d] transition-colors font-semibold text-[9.5px] tracking-wide shrink-0"
            >
              <LayoutDashboard size={9} strokeWidth={2} />
              Survey Admin
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0" />
            <Link
              href={`/surveys/${surveyId}`}
              className="text-slate-400 hover:text-slate-700 transition-colors font-medium truncate max-w-[120px] hidden sm:block"
            >
              {survey.year} {survey.name}
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0 hidden sm:block" />
            <Link
              href={`/surveys/${surveyId}/organizations`}
              className="text-slate-400 hover:text-slate-700 transition-colors font-medium hidden md:block"
            >
              Invited Organizations
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0 hidden md:block" />
            <Link
              href={`/surveys/${surveyId}/organizations/${orgId}`}
              className="text-slate-400 hover:text-slate-700 transition-colors font-medium truncate max-w-[100px]"
            >
              {org.name}
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0" />
            <span className="text-slate-700 font-semibold shrink-0">Manager Report</span>
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10.5px] text-slate-400 mr-1 hidden lg:block">{org.lpiVersion}</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors">
              <Printer size={13} />
              Print
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1923] text-[12px] text-white font-medium hover:bg-slate-800 transition-colors">
              <Download size={13} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        {/* SECTION 1 */}
        <ReportSection>
          <SectionLabel>Section 1 · Organization Overview</SectionLabel>
          <div className="p-6">
            <div className="flex items-start gap-5 mb-7">
              <div className="w-16 h-16 rounded-2xl bg-[#0f1923] flex items-center justify-center shrink-0 shadow-md">
                <span className="text-[22px] font-black text-[#00b8a9] leading-none">
                  {org.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <h1 className="text-[24px] font-bold text-slate-900 leading-tight">{org.name}</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{org.type}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <BadgeCheck size={10} /> Submitted
                  </span>
                </div>
                <p className="text-[13px] text-slate-500">{org.assetClass} · {org.strategyFocus.join(" · ")} · Founded {org.founded}</p>
                <p className="text-[12px] text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={11} />{org.headquarters}</p>
              </div>
              <div className="shrink-0 border border-slate-200 rounded-xl px-4 py-3 text-right bg-slate-50/60">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Survey</p>
                <p className="text-[12px] font-semibold text-slate-700 leading-snug">{survey.year} {survey.name}</p>
                <p className="text-[11px] text-slate-400">{survey.hostOrg}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 pt-5 border-t border-slate-100">
              <InfoPill icon={User}      label="Primary Contact"   value={org.contactName} />
              <InfoPill icon={Building2} label="Title"             value={org.contactTitle} />
              <InfoPill icon={Mail}      label="Email"             value={org.contactEmail} />
              <InfoPill icon={TrendingUp} label="AUM"             value={org.aum} />
              <InfoPill icon={Calendar}  label="Survey Submission" value={org.submissionDate ?? "Pending"} />
              <InfoPill icon={Clock}     label="Report Generated"  value={reportDate} />
              <InfoPill icon={Calendar}  label="Survey Opens"      value={survey.startDate} />
              <InfoPill icon={Calendar}  label="Survey Closes"     value={survey.targetCloseDate} />
            </div>
          </div>
          <div className="border-t border-slate-100 px-2 pb-2">
            <LpiGaugeBar score={org.lpiScore} version={org.lpiVersion} />
          </div>
        </ReportSection>

        {/* SECTION 2 */}
        <ReportSection>
          <SectionLabel>Section 2 · Primary Benchmarking Categories</SectionLabel>
          <div className="p-6">
            <div className="mb-5">
              <h2 className="text-[15px] font-bold text-slate-800 mb-1">LPI Benchmark Comparison</h2>
              <p className="text-[12.5px] text-slate-500 leading-relaxed max-w-2xl">
                The charts below show where <strong>{org.name}</strong>'s LPI score of{" "}
                <strong>{org.lpiScore.toFixed(1)}</strong> falls relative to three benchmark pools.
                The orange marker indicates the manager's exact position within each distribution.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-5 mb-6 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Legend</p>
              {[
                { color: "#e2e8f0",  label: "Full range (min–max)" },
                { color: "#bfdbfe",  label: "10th–90th percentile" },
                { color: "#3b82f6",  label: "IQR (25th–75th)" },
                { color: "#1d4ed8",  label: "Median",        isLine: true },
                { color: "#f97316",  label: "This manager",  isSquare: true },
              ].map(({ color, label, isLine, isSquare }) => (
                <div key={label} className="flex items-center gap-1.5">
                  {isLine   ? <div className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} /> :
                   isSquare ? <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} /> :
                              <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: color }} />}
                  <span className="text-[11px] text-slate-600">{label}</span>
                </div>
              ))}
            </div>

            {/* Three benchmark cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {benchmarkPools.map(({ key, data }) => {
                const pctColor =
                  data.managerPercentile >= 70 ? "#059669" :
                  data.managerPercentile >= 40 ? "#b45309" : "#dc2626";

                return (
                  <div key={key} className={`relative rounded-xl border overflow-hidden ${data.comingSoon ? "border-slate-200" : "border-slate-200"}`}>
                    <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-slate-100">
                      <div>
                        <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Relative to</p>
                        <p className="text-[13px] font-bold text-slate-800 leading-tight">{data.label}</p>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">n = {data.n.toLocaleString()} managers</p>
                      </div>
                      {!data.comingSoon && (
                        <div className="text-right">
                          <p className="text-[26px] font-black tabular-nums leading-none" style={{ color: pctColor }}>
                            {data.managerPercentile}<span className="text-[14px] font-bold">th</span>
                          </p>
                          <p className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider">percentile</p>
                        </div>
                      )}
                    </div>

                    <div className={`px-3 pt-5 pb-3 ${data.comingSoon ? "opacity-50" : ""}`}>
                      {data.comingSoon ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Lock size={14} className="text-slate-400" />
                          </div>
                          <p className="text-[12px] font-semibold text-slate-500">Coming Soon</p>
                          <p className="text-[11px] text-slate-400 text-center leading-snug max-w-[140px]">
                            Asset class benchmarks available Q3 2026
                          </p>
                        </div>
                      ) : (
                        <BenchmarkDistributionChart pool={data} />
                      )}
                    </div>

                    {!data.comingSoon && (
                      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/40">
                        {[
                          { label: "Q1",     value: data.q1.toFixed(2) },
                          { label: "Median", value: data.median.toFixed(2) },
                          { label: "Q3",     value: data.q3.toFixed(2) },
                        ].map(({ label, value }) => (
                          <div key={label} className="px-3 py-2.5 text-center">
                            <p className="text-[11.5px] font-bold text-slate-700 tabular-nums">{value}</p>
                            <p className="text-[9.5px] text-slate-400 font-medium">{label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interpretation note */}
            <div className="mt-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-[11.5px] text-blue-800 leading-relaxed">
                <strong>How to read this:</strong> An LPI score at the{" "}
                <strong>{org.benchmarks.universe.managerPercentile}th percentile</strong> within the
                Roundtables Universe means {org.name} scores higher than{" "}
                {org.benchmarks.universe.managerPercentile}% of all managers in the database across all DEI
                dimensions. The IQR band (dark blue) represents the middle 50% of managers — a score within or
                above this range indicates above-average DEI practice.
              </p>
            </div>
          </div>
        </ReportSection>

        {/* SECTION 3 — LPI Sub-Components */}
        {org.lpiSubComponents && (
          <ReportSection>
            <SectionLabel>Section 3 · LPI Score Sub-Components Benchmarking</SectionLabel>
            <div className="p-6">
              <LpiSubComponentsSection
                data={org.lpiSubComponents}
                orgName={org.name}
              />
            </div>
          </ReportSection>
        )}

        <ReportSection>
          <SectionLabel>Section 4 · Workplace Policies</SectionLabel>
          <div className="p-6">
            <WorkplacePoliciesCard />
          </div>
        </ReportSection>

        {org.genderDemographics && (
          <ReportSection>
            <SectionLabel>Section 5 · Gender Diversity Demographics</SectionLabel>
            <div className="p-6">
              <GenderDemographicsSection
                ownership={org.genderDemographics.ownership}
                leadership={org.genderDemographics.leadership}
                workforce={org.genderDemographics.workforce}
              />
            </div>
          </ReportSection>
        )}

        {org.racialDemographics && (
          <ReportSection>
            <SectionLabel>Section 6 · Racial Diversity Demographics</SectionLabel>
            <div className="p-6">
              <RacialDemographicsSection data={org.racialDemographics} />
            </div>
          </ReportSection>
        )}

      </div>
    </div>
  );
}
