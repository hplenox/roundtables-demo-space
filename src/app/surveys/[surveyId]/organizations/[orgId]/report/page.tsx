"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { getOrgById, getSurveyById, getOrgsBySurveyId, getCustomAssetClassesBySurveyId } from "@/lib/mock-data";
import { buildBenchmarkPool, type BenchmarkGroupKey } from "@/lib/asset-class-groups";
import BenchmarksCard from "@/components/report/BenchmarksCard";
import ManagerFunnelBar from "@/components/report/ManagerFunnelBar";
import ManagerProfileCard from "@/components/report/ManagerProfileCard";
import WorkplacePoliciesCard, { POLICIES } from "@/components/report/WorkplacePoliciesCard";
import GenderDemographicsSection from "@/components/report/GenderDemographicsSection";
import RacialDemographicsSection from "@/components/report/RacialDemographicsSection";

import {
  ArrowLeft, ChevronDown, Download,
  User, Mail, Calendar, Clock, TrendingUp, TrendingDown, BadgeCheck,
  Building2, Sparkles, Info,
} from "lucide-react";
import type { InvitedOrg } from "@/types/survey";

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

// ─── Insights helpers ─────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const r = n % 100;
  if (r >= 11 && r <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function pct(value: number, total: number): string {
  return total === 0 ? "0.0" : ((value / total) * 100).toFixed(1);
}

const RACE_LABELS: Record<string, string> = {
  white:          "White/European",
  asian:          "Asian",
  black:          "Black/African American",
  latino:         "Hispanic/Latino/a/e/x",
  mena:           "Middle Eastern/North African",
  indigenous_na:  "Indigenous North American",
  indigenous_out: "Indigenous (other)",
  other:          "Other",
  multiracial:    "Multiracial",
};

function buildInsightsText(org: InvitedOrg): string {
  if (!org.lpiScore || !org.benchmarks) return "";

  const univPct = org.benchmarks.universe.managerPercentile;
  const univN = org.benchmarks.universe.n.toLocaleString();

  const perfLabel =
    univPct >= 90 ? "exceptional diversity performance" :
    univPct >= 75 ? "strong diversity performance" :
    univPct >= 50 ? "above-average diversity performance" :
    "competitive diversity performance";

  let para1 = `${org.name} demonstrates ${perfLabel} with an LPI score of ${org.lpiScore.toFixed(1)}, ranking in the ${ordinal(univPct)} percentile among ${univN} organizations in the Roundtables universe.`;

  // Sub-components sentence
  if (org.lpiSubComponents?.dimensions) {
    const racial = org.lpiSubComponents.dimensions.find(d => d.dimension === "Racial");
    const gender = org.lpiSubComponents.dimensions.find(d => d.dimension === "Gender");
    const parts: string[] = [];
    if (racial) {
      const ownerPct = racial.ownership.percentile;
      const workPct  = racial.workforce.percentile;
      if (ownerPct !== null && workPct !== null) {
        parts.push(`racial diversity ownership score of ${racial.ownership.rawScore.toFixed(2)} (${ordinal(ownerPct)} percentile) and workforce score of ${racial.workforce.rawScore.toFixed(2)} (${ordinal(workPct)} percentile)`);
      }
    }
    if (gender) {
      const ownerPct = gender.ownership.percentile;
      const workPct  = gender.workforce.percentile;
      if (ownerPct !== null && workPct !== null) {
        parts.push(`gender diversity ownership score of ${gender.ownership.rawScore.toFixed(2)} (${ordinal(ownerPct)} percentile) and workforce score of ${gender.workforce.rawScore.toFixed(2)} (${ordinal(workPct)} percentile)`);
      }
    }
    if (parts.length > 0) {
      para1 += ` The organization shows a ${parts.join(", while recording a ")}.`;
    }
  }

  // Workforce composition sentence
  let para2 = "";
  if (org.genderDemographics && org.racialDemographics) {
    const wf = org.genderDemographics.workforce;
    const total = wf.men + wf.women;
    const menPct   = pct(wf.men, total);
    const womenPct = pct(wf.women, total);

    const rwf = org.racialDemographics.workforce;
    const raceTotal = Object.values(rwf).reduce((s, v) => s + v, 0);
    const raceParts = (Object.entries(rwf) as [string, number][])
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([k, v]) => `${pct(v, raceTotal)}% ${RACE_LABELS[k] ?? k}`)
      .join(", ");

    para2 = `The workforce of ${total} employees comprises ${menPct}% men and ${womenPct}% women, with racial composition of ${raceParts}.`;

    // Notable ownership/leadership observations
    const ro = org.racialDemographics.ownership;
    const rl = org.racialDemographics.leadership;
    const ownerTotal  = Object.values(ro).reduce((s, v) => s + v, 0);
    const leaderTotal = Object.values(rl).reduce((s, v) => s + v, 0);
    const ownerWhitePct  = ownerTotal  > 0 ? Math.round((ro.white / ownerTotal) * 100) : 0;
    const leaderWhitePct = leaderTotal > 0 ? Math.round((rl.white / leaderTotal) * 100) : 0;

    if (ownerWhitePct === 0 && leaderWhitePct === 0) {
      para2 += " Notably, both ownership and leadership are 100% racially diverse with no White/European representation in either category.";
    } else {
      const ownerPOCPct  = 100 - ownerWhitePct;
      const leaderPOCPct = 100 - leaderWhitePct;
      if (ownerPOCPct > 0 || leaderPOCPct > 0) {
        para2 += ` Racially diverse individuals represent ${ownerPOCPct}% of ownership and ${leaderPOCPct}% of leadership.`;
      }
    }
  }

  return [para1, para2].filter(Boolean).join(" ");
}

interface InsightBullet {
  lead: string;
  rest: string;
  trend: "up" | "down";
}

function buildInsightBullets(org: InvitedOrg): InsightBullet[] {
  const bullets: InsightBullet[] = [];

  if (org.lpiScore && org.benchmarks) {
    const univPct = org.benchmarks.universe.managerPercentile;
    const trend: "up" | "down" = univPct >= 50 ? "up" : "down";
    bullets.push({
      lead: `${ordinal(univPct)} percentile`,
      rest: ` in the Roundtables universe — among ${trend === "up" ? "stronger" : "weaker"} performers on leadership and inclusion maturity.`,
      trend,
    });
  }

  if (org.racialDemographics) {
    const ro = org.racialDemographics.ownership;
    const ownerTotal = Object.values(ro).reduce((s, v) => s + v, 0);
    if (ownerTotal > 0) {
      const whitePct = Math.round((ro.white / ownerTotal) * 100);
      const nonWhitePct = 100 - whitePct;
      const topGroups = (Object.entries(ro) as [string, number][])
        .filter(([k, v]) => k !== "white" && v > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([k, v]) => `${RACE_LABELS[k] ?? k} representation ${Math.round((v / ownerTotal) * 100)}%`)
        .join(", ");

      const trend: "up" | "down" = nonWhitePct >= 25 ? "up" : "down";
      bullets.push(trend === "up"
        ? { lead: "Ownership-level strength:", rest: ` ${topGroups || `non-White/European individuals hold ${nonWhitePct}% of ownership`}.`, trend }
        : { lead: "Ownership concentration:", rest: ` White/European individuals hold ${whitePct}% of ownership, limiting broader representation at the top.`, trend });
    }
  }

  if (org.genderDemographics) {
    const wf = org.genderDemographics.workforce;
    const ld = org.genderDemographics.leadership;
    const wfTotal = wf.men + wf.women;
    const ldTotal = ld.men + ld.women;
    if (wfTotal > 0 && ldTotal > 0) {
      const menWfPct = Math.round((wf.men / wfTotal) * 100);
      const menLdPct = Math.round((ld.men / ldTotal) * 100);
      const trend: "up" | "down" = menLdPct <= 60 ? "up" : "down";
      bullets.push(trend === "down"
        ? { lead: "Gender is the growth area:", rest: ` men are ${menWfPct}% of the workforce and ${menLdPct}% of leadership.`, trend }
        : { lead: "Gender balance strength:", rest: ` leadership is ${100 - menLdPct}% women, close to parity with the ${100 - menWfPct}% share of the workforce.`, trend });
    }
  }

  const adoptedCount = POLICIES.filter((p) => p.uploaded).length;
  const trend: "up" | "down" = adoptedCount >= Math.ceil(POLICIES.length / 2) ? "up" : "down";
  bullets.push(trend === "up"
    ? { lead: "Policy foundation in place:", rest: ` ${adoptedCount} of ${POLICIES.length} foundational policies adopted, supporting sustained inclusion practices.`, trend }
    : { lead: "Policy gaps remain:", rest: ` only ${adoptedCount} of ${POLICIES.length} foundational policies adopted. Broader policy coverage is associated with stronger leadership diversity outcomes.`, trend });

  return bullets;
}

// ─── Insights Box ─────────────────────────────────────────────────────────────

function InsightsBox({ org }: { org: InvitedOrg }) {
  const [expanded, setExpanded] = useState(false);
  const text = buildInsightsText(org);
  if (!text) return null;

  const bullets = buildInsightBullets(org);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-5 print:hidden">
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-violet-500" strokeWidth={2} />
              <h3 className="text-[14px] font-bold text-slate-800">AI Insights</h3>
              <div className="relative group inline-flex items-center">
                <Info size={13} className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
                <div className="absolute top-full left-0 mt-3 w-72 bg-[#0f1923] rounded-xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                  <p className="text-[12.5px] text-slate-200 leading-relaxed">
                    AI-generated observations drawn from {org.name}&apos;s survey data and benchmark position.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors shrink-0"
            >
              {expanded ? "Collapse narrative" : "Read full narrative"}
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
            {bullets.map((b, i) => {
              const Icon = b.trend === "up" ? TrendingUp : TrendingDown;
              return (
                <div key={i} className="flex items-start gap-2">
                  <Icon
                    size={14}
                    className={`shrink-0 mt-0.5 ${b.trend === "up" ? "text-emerald-600" : "text-orange-500"}`}
                  />
                  <p className="text-[13px] text-slate-700 leading-snug">
                    <strong className="font-semibold text-slate-900">{b.lead}</strong>
                    {b.rest}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-4 pt-3 border-t border-slate-100">
            <p className="text-[13px] text-slate-600 leading-relaxed">{text}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
              AI-generated summary of underlying survey data. All data is self-reported and unaudited;
              observations describe composition and are directionally informative. Intent should be
              assessed through direct engagement with the organization.
            </p>
          </div>
        )}
      </div>
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

      <InsightsBox org={org} />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        {/* SECTION 1 */}
        <ReportSection>
          <SectionLabel>Section 1 · Organization Overview</SectionLabel>
          <div className="p-6">
            <ManagerProfileCard org={org} />
            <div className="flex items-center gap-2.5 flex-wrap pt-5 mt-5 border-t border-slate-100">
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{org.type}</span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <BadgeCheck size={10} /> Submitted
              </span>
              <span className="text-[12px] text-slate-400">
                {survey.year} {survey.name} · Hosted by {survey.hostOrg}
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 pt-5 border-t border-slate-100">
              <InfoPill icon={User}      label="Primary Contact"   value={org.contactName} />
              <InfoPill icon={Building2} label="Title"             value={org.contactTitle} />
              <InfoPill icon={Mail}      label="Email"             value={org.contactEmail} />
              <InfoPill icon={TrendingUp} label="AUM"             value={org.aum} />
              <InfoPill icon={Calendar}  label="Survey Submission" value={org.submissionDate ?? "Pending"} />
              <InfoPill icon={Clock}     label="Dashboard Generated"  value={dashboardDate} />
              <InfoPill icon={Calendar}  label="Survey Opens"      value={survey.startDate} />
              <InfoPill icon={Calendar}  label="Survey Closes"     value={survey.targetCloseDate} />
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
