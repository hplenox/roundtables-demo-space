"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { getOrgById, getSurveyById, getOrgsBySurveyId, getCustomAssetClassesBySurveyId } from "@/lib/mock-data";
import { buildBenchmarkPool, type BenchmarkGroupKey } from "@/lib/asset-class-groups";
import BenchmarksCard from "@/components/report/BenchmarksCard";
import ManagerFunnelBar from "@/components/report/ManagerFunnelBar";
import ManagerProfileCard from "@/components/report/ManagerProfileCard";
import WorkplacePoliciesCard from "@/components/report/WorkplacePoliciesCard";
import GenderDemographicsSection from "@/components/report/GenderDemographicsSection";
import RacialDemographicsSection from "@/components/report/RacialDemographicsSection";
import AiInsightsBox from "@/components/report/AiInsightsBox";

import {
  ArrowLeft, ChevronDown, ChevronRight, Download,
  User, Mail, Calendar, Clock, Building2, Info,
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
    <div className="flex items-center gap-1.5 min-w-0">
      <Icon size={12} className="text-slate-400 shrink-0" strokeWidth={1.75} />
      <p className="text-[12px] text-slate-500 truncate">
        {label}: <span className="font-semibold text-slate-800">{value}</span>
      </p>
    </div>
  );
}

// ─── How-to-read button (popover) ──────────────────────────────────────────────

function HowToReadButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
          open ? "border-slate-400 bg-slate-50 text-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        <Info size={13} />
        <span className="hidden md:inline">How to read this report</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-50 w-[420px] max-w-[88vw] max-h-[75vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <Info size={14} className="text-blue-500 shrink-0" />
              <span className="text-[13px] font-bold text-slate-800">How to read this dashboard</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white tracking-wide">
                RT-019
              </span>
            </div>

            <div className="space-y-3 text-[12.5px] text-slate-600 leading-relaxed">
              <p>
                This is a <strong className="text-slate-800">human capital monitoring and benchmarking tool</strong>,
                grounded in fiduciary risk management. It collects standardized data on the workforce composition,
                leadership structure, and ownership profile of organizations — the same kind of organizational quality
                data institutional investors routinely collect across other dimensions of due diligence.
              </p>
              <p>
                The <strong className="text-slate-800">Lenox Park Impact (LPI) Score</strong> provides diagnostic signals
                for three categories of risk in engaging with external counterparties:{" "}
                <strong className="text-slate-800">key-person and succession risk</strong> (concentrated decision-making
                authority, limited bench depth);{" "}
                <strong className="text-slate-800">talent retention risk</strong> (gaps between workforce representation
                and leadership advancement correlate with elevated attrition and replacement costs); and{" "}
                <strong className="text-slate-800">decision-making quality risk</strong> (Empirical research, supported
                by the findings of Lenox Park and Oxford University&apos;s SDG Impact Lab, indicates that
                demographically homogeneous leadership teams are more susceptible to groupthink and narrower market
                perspective).
              </p>
              <p>
                The <strong className="text-slate-800">Evenness Score</strong> complements the LPI by measuring{" "}
                <em>distributional balance</em> rather than absolute representation — how evenly an organization&apos;s
                composition is spread across demographic categories at each layer (workforce, leadership, ownership).
                Built on a normalized concentration measure, a higher Evenness score reflects lower demographic
                concentration, used as a proxy for{" "}
                <strong className="text-slate-800">cognitive diversity</strong> — which is associated with reduced
                groupthink and broader market perspective at the decision-making level. Where the LPI asks{" "}
                <em>how much</em> representation is present, Evenness asks <em>how balanced</em> it is.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManagerReportPage() {
  const { surveyId, orgId } = useParams<{ surveyId: string; orgId: string }>();
  const org = getOrgById(orgId);
  const survey = getSurveyById(surveyId);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // All submitted orgs with reports available for the manager funnel bar
  const allOrgs = getOrgsBySurveyId(surveyId ?? "");
  const submittedOrgs = allOrgs
    .filter((o) => o.status === "submitted" && o.lpiScore !== null && o.benchmarks !== null)
    .map((o) => ({
      id: o.id,
      name: o.name,
      lpiScore: o.lpiScore,
      assetClass: o.assetClass,
      percentile: o.benchmarks!.universe.managerPercentile,
    }));

  if (!org || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Dashboard not found.</p>
      </div>
    );
  }

  if (!org.lpiScore || !org.benchmarks) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-sm">
          <p className="text-slate-700 font-semibold mb-2">Dashboard Not Available</p>
          <p className="text-slate-400 text-sm">This organization has not yet completed the survey.</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const dashboardDate = now.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }) + " at " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  // Orgs classified via the survey's Asset Classes tab get a live, computed
  // asset-class benchmark; unclassified (or not-yet-mapped) orgs fall back to
  // a "not mapped" pool. A class can map to multiple categories — the first
  // is used as the primary benchmark surfaced in the Benchmarks card's Asset Class filter.
  const mappedGroups = (org.customAssetClass
    ? getCustomAssetClassesBySurveyId(surveyId).find((c) => c.name === org.customAssetClass)?.benchmarkGroups
    : undefined) as BenchmarkGroupKey[] | undefined;
  const primaryGroup = mappedGroups?.[0];

  const benchmarkPools = [
    { key: "universe",   data: org.benchmarks.universe },
    { key: "portfolio",  data: org.benchmarks.portfolio },
    {
      key: "assetClass",
      data: primaryGroup ? buildBenchmarkPool(primaryGroup, org.lpiScore) : org.benchmarks.assetClass,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky report top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 h-10 flex items-center gap-3">

          {/* Breadcrumb — left, compact */}
          <Link
            href={`/surveys/${surveyId}/organizations`}
            className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-800 transition-colors min-w-0 flex-1"
          >
            <ArrowLeft size={13} className="shrink-0" />
            <span className="truncate">{survey.year} {survey.name}</span>
          </Link>

          {/* Actions — right */}
          <div className="flex items-center gap-1.5 shrink-0">
            <HowToReadButton />
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1923] text-[12px] text-white font-medium hover:bg-slate-800 transition-colors">
              <Download size={13} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {submittedOrgs.length > 1 && (
        <div className="max-w-5xl mx-auto px-6 pt-5">
          <ManagerFunnelBar
            surveyId={surveyId ?? ""}
            currentOrgId={orgId ?? ""}
            orgs={submittedOrgs}
          />
        </div>
      )}

      <AiInsightsBox org={org} className="max-w-5xl mx-auto px-6 pt-5 print:hidden" />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        {/* SECTION 1 */}
        <ReportSection>
          <SectionLabel>Section 1 · Organization Overview</SectionLabel>
          <div className="p-6">
            <ManagerProfileCard org={org} />
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setDetailsOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                {detailsOpen
                  ? <ChevronDown size={12} className="shrink-0" />
                  : <ChevronRight size={12} className="shrink-0" />
                }
                Contact &amp; survey details
              </button>

              {detailsOpen && (
                <div className="flex flex-wrap gap-x-6 gap-y-2.5 pt-3">
                  <InfoPill icon={User}      label="Primary Contact"     value={org.contactName} />
                  <InfoPill icon={Building2} label="Title"               value={org.contactTitle} />
                  <InfoPill icon={Mail}      label="Email"               value={org.contactEmail} />
                  <InfoPill icon={Calendar}  label="Survey Opens"        value={survey.startDate} />
                  <InfoPill icon={Calendar}  label="Survey Closes"       value={survey.targetCloseDate} />
                  <InfoPill icon={Clock}     label="Dashboard Generated" value={dashboardDate} />
                </div>
              )}
            </div>
          </div>
        </ReportSection>

        {/* SECTION 2 */}
        <ReportSection>
          <SectionLabel>Section 2 · Benchmarks</SectionLabel>
          <div className="p-6">
            <BenchmarksCard org={org} benchmarkPools={benchmarkPools} />
          </div>
        </ReportSection>

        <ReportSection>
          <SectionLabel>Section 3 · Workplace Policies</SectionLabel>
          <div className="p-6">
            <WorkplacePoliciesCard />
          </div>
        </ReportSection>

        {org.genderDemographics && (
          <ReportSection>
            <SectionLabel>Section 4 · Gender Diversity Demographics</SectionLabel>
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
            <SectionLabel>Section 5 · Racial Diversity Demographics</SectionLabel>
            <div className="p-6">
              <RacialDemographicsSection data={org.racialDemographics} />
            </div>
          </ReportSection>
        )}

      </div>
    </div>
  );
}
