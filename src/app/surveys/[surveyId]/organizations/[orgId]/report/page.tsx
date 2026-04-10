"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getOrgById, getSurveyById, getOrgsBySurveyId } from "@/lib/mock-data";
import LpiGaugeBar from "@/components/report/LpiGaugeBar";
import BenchmarkDistributionChart from "@/components/report/BenchmarkDistributionChart";
import LpiSubComponentsSection from "@/components/report/LpiSubComponentsSection";
import WorkplacePoliciesCard from "@/components/report/WorkplacePoliciesCard";
import GenderDemographicsSection from "@/components/report/GenderDemographicsSection";
import RacialDemographicsSection from "@/components/report/RacialDemographicsSection";

import {
  ChevronRight, ChevronLeft, ChevronDown, Printer, Download,
  User, Mail, Calendar, Clock, MapPin, TrendingUp, BadgeCheck,
  Lock, LayoutDashboard, Search, Lightbulb, Building2, Sparkles,
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

    const raceLabels: Record<string, string> = {
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
    const rwf = org.racialDemographics.workforce;
    const raceTotal = Object.values(rwf).reduce((s, v) => s + v, 0);
    const raceParts = (Object.entries(rwf) as [string, number][])
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([k, v]) => `${pct(v, raceTotal)}% ${raceLabels[k] ?? k}`)
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

// ─── Insights Box ─────────────────────────────────────────────────────────────

function InsightsBox({ org }: { org: InvitedOrg }) {
  const [expanded, setExpanded] = useState(false);
  const text = buildInsightsText(org);
  if (!text) return null;

  const preview = text.length > 180 ? text.slice(0, 180).trimEnd() + "…" : text;

  return (
    <div className="max-w-5xl mx-auto px-6 pt-5 print:hidden">
      <div className="rounded-xl border border-[#00b8a9]/30 bg-[#00b8a9]/5 overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#00b8a9]/5 transition-colors group"
        >
          <div className="w-6 h-6 rounded-lg bg-[#00b8a9]/15 flex items-center justify-center shrink-0">
            <Sparkles size={12} className="text-[#00897b]" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-[#00897b] uppercase tracking-widest">AI Insights Summary</span>
            {!expanded && (
              <p className="text-[12px] text-slate-500 leading-snug mt-0.5 truncate">{preview}</p>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`shrink-0 text-[#00897b]/60 transition-transform duration-200 group-hover:text-[#00897b] ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        {expanded && (
          <div className="px-4 pb-4 pt-1 border-t border-[#00b8a9]/20">
            <p className="text-[12.5px] text-slate-600 leading-relaxed">{text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Manager Switcher ─────────────────────────────────────────────────────────

function ManagerSwitcher({
  surveyId,
  currentOrgId,
  submittedOrgs,
}: {
  surveyId: string;
  currentOrgId: string;
  submittedOrgs: Array<{ id: string; name: string; lpiScore: number | null; assetClass: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showHint, setShowHint] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const currentIdx = submittedOrgs.findIndex((o) => o.id === currentOrgId);
  const prevOrg = currentIdx > 0 ? submittedOrgs[currentIdx - 1] : null;
  const nextOrg = currentIdx < submittedOrgs.length - 1 ? submittedOrgs[currentIdx + 1] : null;

  // Fade hint out after 4 s
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Keyboard: ← → to jump prev/next
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (open) return; // let dropdown handle its own keys
      if (e.altKey && e.key === "ArrowLeft" && prevOrg) {
        router.push(`/surveys/${surveyId}/organizations/${prevOrg.id}/report`);
      }
      if (e.altKey && e.key === "ArrowRight" && nextOrg) {
        router.push(`/surveys/${surveyId}/organizations/${nextOrg.id}/report`);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prevOrg, nextOrg, router, surveyId]);

  const filtered = submittedOrgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  function navigate(id: string) {
    setOpen(false);
    setSearch("");
    router.push(`/surveys/${surveyId}/organizations/${id}/report`);
  }

  const lpiColor = (score: number | null) =>
    score === null ? "text-slate-400" :
    score >= 8 ? "text-emerald-600" :
    score >= 6.5 ? "text-amber-600" : "text-red-500";

  return (
    <div className="flex items-center gap-0 shrink-0 relative" ref={dropdownRef}>
      {/* Prev button */}
      <button
        onClick={() => prevOrg && navigate(prevOrg.id)}
        disabled={!prevOrg}
        title={prevOrg ? `← ${prevOrg.name} (Alt+←)` : undefined}
        className={`h-7 w-6 flex items-center justify-center rounded-l-lg border border-r-0 text-[12px] transition-all ${
          prevOrg
            ? "border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-400"
            : "border-slate-200 text-slate-300 cursor-not-allowed"
        }`}
      >
        <ChevronLeft size={12} strokeWidth={2.5} />
      </button>

      {/* Dropdown trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="h-7 flex items-center gap-1.5 px-3 border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all text-[12px] font-semibold text-slate-800 max-w-[180px]"
      >
        <span className="truncate">{submittedOrgs[currentIdx]?.name ?? "Select manager"}</span>
        <span className="shrink-0 text-[10px] font-normal text-slate-400 hidden sm:inline">
          {currentIdx + 1}/{submittedOrgs.length}
        </span>
        <ChevronDown size={11} className={`shrink-0 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Next button */}
      <button
        onClick={() => nextOrg && navigate(nextOrg.id)}
        disabled={!nextOrg}
        title={nextOrg ? `→ ${nextOrg.name} (Alt+→)` : undefined}
        className={`h-7 w-6 flex items-center justify-center rounded-r-lg border border-l-0 text-[12px] transition-all ${
          nextOrg
            ? "border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-400"
            : "border-slate-200 text-slate-300 cursor-not-allowed"
        }`}
      >
        <ChevronRight size={12} strokeWidth={2.5} />
      </button>

      {/* First-visit hint bubble */}
      {showHint && (
        <div
          className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0f1923] text-white text-[10.5px] font-medium whitespace-nowrap shadow-lg pointer-events-none z-50 animate-fade-in"
          style={{ animation: "fadeInUp 0.3s ease, fadeOut 0.5s ease 3.5s forwards" }}
        >
          <Lightbulb size={10} className="text-[#00b8a9] shrink-0" />
          Switch managers · Alt+← →
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 overflow-hidden">
            <span className="block w-2 h-2 bg-[#0f1923] rotate-45 translate-y-1 mx-auto" />
          </span>
        </div>
      )}

      {/* Dropdown panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch(""); }} />
          <div className="absolute top-9 left-1/2 -translate-x-1/2 z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search managers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Org list */}
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-[12px] text-slate-400 text-center">No managers found</li>
              ) : (
                filtered.map((o, i) => {
                  const isCurrent = o.id === currentOrgId;
                  return (
                    <li key={o.id}>
                      <button
                        onClick={() => !isCurrent && navigate(o.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          isCurrent
                            ? "bg-[#00b8a9]/8 cursor-default"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Rank badge */}
                        <span className="shrink-0 w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-[12.5px] font-semibold truncate ${isCurrent ? "text-[#00897b]" : "text-slate-800"}`}>
                              {o.name}
                            </p>
                            {isCurrent && (
                              <span className="shrink-0 text-[9px] font-bold text-[#00b8a9] uppercase tracking-wide">current</span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-400 truncate">{o.assetClass}</p>
                        </div>
                        <span className={`shrink-0 text-[13px] font-bold tabular-nums ${lpiColor(o.lpiScore)}`}>
                          {o.lpiScore ?? "—"}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-slate-100 flex items-center gap-1.5 bg-slate-50/60">
              <span className="text-[10px] text-slate-400">{submittedOrgs.length} submitted managers</span>
              <span className="ml-auto text-[9.5px] text-slate-300 font-mono">Alt+← →</span>
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

  // All submitted orgs with reports available for the switcher
  const allOrgs = getOrgsBySurveyId(surveyId ?? "");
  const submittedOrgs = allOrgs
    .filter((o) => o.status === "submitted" && o.lpiScore !== null && o.benchmarks !== null)
    .map((o) => ({ id: o.id, name: o.name, lpiScore: o.lpiScore, assetClass: o.assetClass }));

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
        <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 h-11 flex items-center gap-3">

          {/* Breadcrumb — left */}
          <nav className="flex items-center gap-1.5 text-[11px] min-w-0 overflow-hidden flex-1">
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
              className="text-slate-400 hover:text-slate-700 transition-colors font-medium truncate max-w-[110px] hidden sm:block"
            >
              {survey.year} {survey.name}
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0 hidden sm:block" />
            <Link
              href={`/surveys/${surveyId}/organizations`}
              className="text-slate-400 hover:text-slate-700 transition-colors font-medium hidden lg:block"
            >
              Managers
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0 hidden lg:block" />
            <span className="text-slate-500 font-medium hidden lg:block shrink-0">2-Pager</span>
          </nav>

          {/* Manager Switcher — center */}
          {submittedOrgs.length > 1 && (
            <ManagerSwitcher
              surveyId={surveyId ?? ""}
              currentOrgId={orgId ?? ""}
              submittedOrgs={submittedOrgs}
            />
          )}

          {/* Actions — right */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 hidden xl:block">{org.lpiVersion}</span>
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

      <InsightsBox org={org} />

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
