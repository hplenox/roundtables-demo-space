"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrgById, getSurveyById } from "@/lib/mock-data";
import type { GenderDemographics, RacialDemographics, RacialBreakdown } from "@/types/survey";
import {
  ChevronRight,
  Printer,
  Download,
  LayoutDashboard,
  Users,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(n: number, total: number) {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

function genderTotals(g: GenderDemographics) {
  return {
    ownership:  g.ownership.men + g.ownership.women,
    leadership: g.leadership.men + g.leadership.women,
    workforce:  g.workforce.men + g.workforce.women,
  };
}

function racialTotal(rb: RacialBreakdown) {
  return Object.values(rb).reduce((a, b) => a + b, 0);
}

const RACIAL_LABELS: { key: keyof RacialBreakdown; label: string; color: string; bg: string }[] = [
  { key: "white",          label: "White",                       color: "#64748b", bg: "bg-slate-500" },
  { key: "asian",          label: "Asian",                       color: "#6366f1", bg: "bg-indigo-500" },
  { key: "black",          label: "Black or African American",   color: "#0ea5e9", bg: "bg-sky-500" },
  { key: "latino",         label: "Hispanic / Latino",           color: "#f59e0b", bg: "bg-amber-500" },
  { key: "multiracial",    label: "Two or More Races",           color: "#a855f7", bg: "bg-purple-500" },
  { key: "mena",           label: "Middle Eastern / N. African", color: "#10b981", bg: "bg-emerald-500" },
  { key: "indigenous_na",  label: "Indigenous (North American)", color: "#ef4444", bg: "bg-red-500" },
  { key: "indigenous_out", label: "Indigenous (Outside NA)",     color: "#f97316", bg: "bg-orange-500" },
  { key: "other",          label: "Other / Prefer Not to Say",   color: "#94a3b8", bg: "bg-slate-400" },
];

const TIERS = ["ownership", "leadership", "workforce"] as const;
type Tier = typeof TIERS[number];
const TIER_LABELS: Record<Tier, string> = {
  ownership:  "Ownership",
  leadership: "Leadership",
  workforce:  "Workforce",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: Tier }) {
  const colors: Record<Tier, string> = {
    ownership:  "bg-violet-100 text-violet-700 border-violet-200",
    leadership: "bg-blue-100 text-blue-700 border-blue-200",
    workforce:  "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors[tier]}`}>
      {TIER_LABELS[tier]}
    </span>
  );
}

function GenderBar({ men, women }: { men: number; women: number }) {
  const total = men + women;
  const wPct = pct(women, total);
  const mPct = pct(men, total);
  return (
    <div className="space-y-1.5">
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
        <div className="h-full bg-[#00b8a9]" style={{ width: `${wPct}%` }} />
        <div className="h-full bg-slate-300" style={{ width: `${mPct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10.5px]">
        <span className="flex items-center gap-1 text-[#00897b] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#00b8a9] inline-block" />
          Women {wPct}% ({women})
        </span>
        <span className="flex items-center gap-1 text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
          Men {mPct}% ({men})
        </span>
      </div>
    </div>
  );
}

function RaceStackBar({ breakdown }: { breakdown: RacialBreakdown }) {
  const total = racialTotal(breakdown);
  const segments = RACIAL_LABELS
    .map((r) => ({ ...r, n: breakdown[r.key], p: pct(breakdown[r.key], total) }))
    .filter((r) => r.n > 0);

  return (
    <div className="space-y-1.5">
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
        {segments.map((s) => (
          <div
            key={s.key}
            className={s.bg}
            style={{ width: `${s.p}%` }}
            title={`${s.label}: ${s.p}% (${s.n})`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {segments.map((s) => (
          <span key={s.key} className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className={`w-2 h-2 rounded-full ${s.bg} inline-block shrink-0`} />
            {s.label} <strong className="text-slate-700">{s.p}%</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function SummaryKpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5">
      <p className="text-[10.5px] text-slate-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[24px] font-bold text-slate-900 tabular-nums leading-none">{value}</p>
      <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffReportPage() {
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

  if (!org.genderDemographics || !org.racialDemographics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-sm">
          <p className="text-slate-700 font-semibold mb-2">Demographics Not Available</p>
          <p className="text-slate-400 text-sm">This organization has not completed the survey.</p>
          <Link
            href={`/surveys/${surveyId}/organizations/${orgId}`}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-[#00897b] hover:underline"
          >
            <ChevronRight size={13} className="rotate-180" /> Back to {org.name}
          </Link>
        </div>
      </div>
    );
  }

  const g = org.genderDemographics;
  const r = org.racialDemographics;
  const gt = genderTotals(g);

  // Summary stats
  const totalStaff = gt.ownership + gt.leadership + gt.workforce;
  const totalWomen = g.ownership.women + g.leadership.women + g.workforce.women;
  const womenPct = pct(totalWomen, totalStaff);

  const rTotals = {
    ownership:  racialTotal(r.ownership),
    leadership: racialTotal(r.leadership),
    workforce:  racialTotal(r.workforce),
  };
  const totalPOC =
    (rTotals.ownership - r.ownership.white) +
    (rTotals.leadership - r.leadership.white) +
    (rTotals.workforce - r.workforce.white);
  const pocPct = pct(totalPOC, totalStaff);

  const reportDate = new Date("2026-04-07").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="h-[3px] bg-gradient-to-r from-violet-500 via-violet-400/70 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 h-11 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-[11px] min-w-0 overflow-hidden">
            <Link
              href="/surveys"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0f1923] text-[#00b8a9] hover:bg-[#1a2d3d] transition-colors font-semibold text-[9.5px] tracking-wide shrink-0"
            >
              <LayoutDashboard size={9} strokeWidth={2} />
              Survey Admin
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0" />
            <Link href={`/surveys/${surveyId}`} className="text-slate-400 hover:text-slate-700 transition-colors font-medium truncate max-w-[120px] hidden sm:block">
              {survey.year} {survey.name}
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0 hidden sm:block" />
            <Link href={`/surveys/${surveyId}/reports`} className="text-slate-400 hover:text-slate-700 transition-colors font-medium hidden md:block">
              Reports
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0 hidden md:block" />
            <Link href={`/surveys/${surveyId}/organizations/${orgId}`} className="text-slate-400 hover:text-slate-700 transition-colors font-medium truncate max-w-[100px]">
              {org.name}
            </Link>
            <ChevronRight size={11} className="text-slate-300 shrink-0" />
            <span className="text-slate-700 font-semibold shrink-0">Staff Committee</span>
          </nav>
          <div className="flex items-center gap-1.5 shrink-0">
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

        {/* ── Report header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-[#00b8a9]" />
          <div className="p-6 flex items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0f1923] flex items-center justify-center shrink-0 shadow-md">
                <span className="text-[18px] font-black text-[#00b8a9]">
                  {org.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Investment Staff Committee Report
                </p>
                <h1 className="text-[22px] font-bold text-slate-900 leading-tight">{org.name}</h1>
                <p className="text-[12.5px] text-slate-400 mt-0.5">
                  {org.assetClass} · {org.aum} AUM · {org.headquarters}
                </p>
              </div>
            </div>
            <div className="shrink-0 border border-slate-200 rounded-xl px-4 py-3 text-right bg-slate-50/60">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Survey</p>
              <p className="text-[12px] font-semibold text-slate-700">{survey.year} {survey.name}</p>
              <p className="text-[11px] text-slate-400">{survey.hostOrg}</p>
              <p className="text-[10.5px] text-slate-400 mt-1">{reportDate}</p>
            </div>
          </div>

          {/* Access badge */}
          <div className="px-6 pb-5 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-semibold">
              <ShieldCheck size={12} strokeWidth={2} />
              Admin Access · Confidential
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <Users size={12} strokeWidth={2} />
              {totalStaff} Total Reported Staff
            </div>
          </div>
        </div>

        {/* ── Executive summary KPIs ─────────────────────────────────── */}
        <div>
          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-1">Executive Summary</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryKpi
              label="Women (Overall)"
              value={`${womenPct}%`}
              sub={`${totalWomen} of ${totalStaff} total staff`}
            />
            <SummaryKpi
              label="People of Color"
              value={`${pocPct}%`}
              sub={`${totalPOC} of ${totalStaff} total staff`}
            />
            <SummaryKpi
              label="Women in Ownership"
              value={`${pct(g.ownership.women, gt.ownership)}%`}
              sub={`${g.ownership.women} of ${gt.ownership} owners`}
            />
            <SummaryKpi
              label="Women in Leadership"
              value={`${pct(g.leadership.women, gt.leadership)}%`}
              sub={`${g.leadership.women} of ${gt.leadership} leaders`}
            />
          </div>
        </div>

        {/* ── Gender breakdown ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="w-6 h-6 rounded-lg bg-[#00b8a9]/10 flex items-center justify-center">
              <TrendingUp size={13} className="text-[#00b8a9]" strokeWidth={2} />
            </div>
            <p className="text-[12px] font-bold text-slate-700">Gender Representation</p>
            <span className="ml-auto text-[10.5px] text-slate-400">by investment staff tier</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {TIERS.map((tier) => {
              const men = g[tier].men;
              const women = g[tier].women;
              const total = men + women;
              return (
                <div key={tier} className="px-5 py-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <TierBadge tier={tier} />
                    <span className="text-[11px] text-slate-400 font-medium">{total} people</span>
                  </div>

                  {/* Big numbers */}
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-[28px] font-black text-[#00897b] tabular-nums leading-none">
                        {pct(women, total)}%
                      </p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">Women</p>
                    </div>
                    <div className="mb-1">
                      <p className="text-[20px] font-bold text-slate-300 tabular-nums leading-none">
                        {pct(men, total)}%
                      </p>
                      <p className="text-[10px] text-slate-400">Men</p>
                    </div>
                  </div>

                  <GenderBar men={men} women={women} />

                  {/* Raw counts */}
                  <div className="pt-2 border-t border-slate-50 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-[14px] font-bold text-[#00b8a9]">{women}</p>
                      <p className="text-[10px] text-slate-400">Women</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-400">{men}</p>
                      <p className="text-[10px] text-slate-400">Men</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Racial breakdown ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
              <Users size={13} className="text-violet-600" strokeWidth={2} />
            </div>
            <p className="text-[12px] font-bold text-slate-700">Racial & Ethnic Representation</p>
            <span className="ml-auto text-[10.5px] text-slate-400">by investment staff tier</span>
          </div>

          <div className="divide-y divide-slate-100">
            {TIERS.map((tier) => {
              const breakdown = r[tier];
              const total = racialTotal(breakdown);
              const whitePct = pct(breakdown.white, total);
              const pocCount = total - breakdown.white;
              const pocPctTier = pct(pocCount, total);

              return (
                <div key={tier} className="px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <TierBadge tier={tier} />
                      <span className="text-[11.5px] text-slate-500 font-medium">{total} people</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-violet-700 font-semibold">
                        {pocPctTier}% People of Color ({pocCount})
                      </span>
                      <span className="text-slate-400">
                        {whitePct}% White ({breakdown.white})
                      </span>
                    </div>
                  </div>

                  <RaceStackBar breakdown={breakdown} />

                  {/* Detailed table */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {RACIAL_LABELS.filter((rl) => breakdown[rl.key] > 0).map((rl) => {
                      const n = breakdown[rl.key];
                      const p = pct(n, total);
                      return (
                        <div key={rl.key} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2 h-2 rounded-full ${rl.bg} shrink-0`} />
                            <span className="text-[10px] text-slate-500 leading-tight">{rl.label}</span>
                          </div>
                          <p className="text-[16px] font-bold text-slate-800 tabular-nums">{p}%</p>
                          <p className="text-[10px] text-slate-400">{n} {n === 1 ? "person" : "people"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Combined view ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <p className="text-[12px] font-bold text-slate-700">Combined Demographics Overview</p>
            <span className="ml-auto text-[10.5px] text-slate-400">gender × racial across all tiers</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-32">Tier</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-[#00897b] uppercase tracking-wider">Women %</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Men %</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-violet-700 uppercase tracking-wider">POC %</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">White %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {TIERS.map((tier) => {
                  const gTier = g[tier];
                  const rTier = r[tier];
                  const total = gTier.men + gTier.women;
                  const rTotal = racialTotal(rTier);
                  const pocN = rTotal - rTier.white;
                  return (
                    <tr key={tier} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <TierBadge tier={tier} />
                      </td>
                      <td className="text-center px-4 py-3 font-semibold text-slate-700">{total}</td>
                      <td className="text-center px-4 py-3 font-bold text-[#00897b]">
                        {pct(gTier.women, total)}%
                        <span className="block text-[10px] font-normal text-slate-400">{gTier.women}</span>
                      </td>
                      <td className="text-center px-4 py-3 text-slate-500">
                        {pct(gTier.men, total)}%
                        <span className="block text-[10px] text-slate-400">{gTier.men}</span>
                      </td>
                      <td className="text-center px-4 py-3 font-bold text-violet-700">
                        {pct(pocN, rTotal)}%
                        <span className="block text-[10px] font-normal text-slate-400">{pocN}</span>
                      </td>
                      <td className="text-center px-4 py-3 text-slate-500">
                        {pct(rTier.white, rTotal)}%
                        <span className="block text-[10px] text-slate-400">{rTier.white}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footnote ──────────────────────────────────────────────── */}
        <p className="text-[11px] text-slate-400 text-center pb-4">
          Data sourced from {survey.year} {survey.name} · {survey.hostOrg} ·
          Confidential — authorized administrators only · Generated {reportDate}
        </p>

      </div>
    </div>
  );
}
