"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrgById, getSurveyById } from "@/lib/mock-data";
import {
  ChevronRight,
  Printer,
  Download,
  LayoutDashboard,
  BarChart2,
  ShieldCheck,
  Users,
} from "lucide-react";

// ─── Hardcoded demographics data ─────────────────────────────────────────────

const COLUMNS = [
  { key: "invStaffUS",     label: "Investment Staff (US)",              group: "inv",  subLabel: "U.S. only (A)",  n: 26 },
  { key: "invStaffGlobal", label: "Investment Staff Global",            group: "inv",  subLabel: "Global* (B)",    n: 33 },
  { key: "invCommittee",   label: "Investment Committee (Global only)", group: "ic",   subLabel: "Firmwide (C)",   n: 10 },
  { key: "ftStaffUS",      label: "Full-time Staff (US)",               group: "ft",   subLabel: "U.S. only (D)",  n: 73 },
  { key: "ftStaffGlobal",  label: "Full-time Staff (Global)",           group: "ft",   subLabel: "Global* (E)",    n: 77 },
] as const;

type ColKey = typeof COLUMNS[number]["key"];

interface DiversityRow {
  label: string;
  section: "race" | "gender";
  values: Record<ColKey, string>;
}

const ROWS: DiversityRow[] = [
  {
    label: "Asian",
    section: "race",
    values: { invStaffUS: "38.46%", invStaffGlobal: "36.36%", invCommittee: "10.00%", ftStaffUS: "31.51%", ftStaffGlobal: "29.87%" },
  },
  {
    label: "Black",
    section: "race",
    values: { invStaffUS: "3.85%", invStaffGlobal: "3.03%", invCommittee: "0.00%", ftStaffUS: "2.74%", ftStaffGlobal: "2.60%" },
  },
  {
    label: "Hispanic / Latino",
    section: "race",
    values: { invStaffUS: "3.85%", invStaffGlobal: "3.03%", invCommittee: "10.00%", ftStaffUS: "1.37%", ftStaffGlobal: "1.30%" },
  },
  {
    label: "Two or More Races",
    section: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "1.37%", ftStaffGlobal: "1.30%" },
  },
  {
    label: "White",
    section: "race",
    values: { invStaffUS: "53.85%", invStaffGlobal: "57.58%", invCommittee: "80.00%", ftStaffUS: "61.64%", ftStaffGlobal: "63.64%" },
  },
  {
    label: "Other",
    section: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
  {
    label: "Indigenous – North America",
    section: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
  {
    label: "Indigenous – Outside North America",
    section: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
  {
    label: "North African / Southwest Asian / Middle Eastern",
    section: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
  {
    label: "Not Available",
    section: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "1.37%", ftStaffGlobal: "1.30%" },
  },
  {
    label: "Female Total",
    section: "gender",
    values: { invStaffUS: "19.23%", invStaffGlobal: "24.24%", invCommittee: "0.00%", ftStaffUS: "39.73%", ftStaffGlobal: "37.66%" },
  },
  {
    label: "Female Non-White",
    section: "gender",
    values: { invStaffUS: "7.69%", invStaffGlobal: "12.12%", invCommittee: "0.00%", ftStaffUS: "17.81%", ftStaffGlobal: "16.88%" },
  },
  {
    label: "Female White",
    section: "gender",
    values: { invStaffUS: "11.54%", invStaffGlobal: "12.12%", invCommittee: "0.00%", ftStaffUS: "21.92%", ftStaffGlobal: "20.78%" },
  },
  {
    label: "Female Not Available",
    section: "gender",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
];

// ─── Column group style maps ──────────────────────────────────────────────────

const GROUP_HEADER: Record<string, { label: string; span: number; headerBg: string; headerText: string }> = {
  inv: { label: "Investment Professionals",    span: 2, headerBg: "bg-sky-700",    headerText: "text-white" },
  ic:  { label: "Investment Committee members", span: 1, headerBg: "bg-slate-600",  headerText: "text-white" },
  ft:  { label: "All Employees**",              span: 2, headerBg: "bg-sky-400/80", headerText: "text-white" },
};

const COL_BG: Record<ColKey, string> = {
  invStaffUS:     "bg-sky-50",
  invStaffGlobal: "bg-sky-100/70",
  invCommittee:   "bg-slate-50",
  ftStaffUS:      "bg-sky-50",
  ftStaffGlobal:  "bg-sky-100/70",
};

const SECTION_ROW_BG: Record<DiversityRow["section"], string> = {
  race:   "",
  gender: "bg-purple-50/60",
};

function isHighlighted(val: string) {
  const n = parseFloat(val);
  return n > 0;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemographicsReportPage() {
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

  const reportDate = new Date("2026-04-07").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  // Build group headers (deduplicated in render order)
  const groupOrder = ["inv", "ic", "ft"];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="h-[3px] bg-gradient-to-r from-sky-500 via-sky-400/70 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 h-11 flex items-center justify-between gap-4">
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
            <span className="text-slate-700 font-semibold shrink-0">Demographics %</span>
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

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">

        {/* ── Report header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-sky-500 via-sky-400 to-[#00b8a9]" />
          <div className="p-6 flex items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0f1923] flex items-center justify-center shrink-0 shadow-md">
                <span className="text-[18px] font-black text-[#00b8a9]">
                  {org.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Demographics Percentage Chart
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
          <div className="px-6 pb-5 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold">
              <ShieldCheck size={12} strokeWidth={2} />
              Admin Access · Confidential
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <Users size={12} strokeWidth={2} />
              5 Staff Categories
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold">
              <BarChart2 size={12} strokeWidth={2} />
              Race &amp; Gender Breakdowns
            </div>
          </div>
        </div>

        {/* ── Legend ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 px-1">
          {groupOrder.map((g) => {
            const gh = GROUP_HEADER[g];
            return (
              <div key={g} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${gh.headerBg} inline-block`} />
                <span className="text-[11px] text-slate-500">{gh.label}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="w-3 h-3 rounded bg-purple-100 border border-purple-200 inline-block" />
            <span className="text-[11px] text-slate-500">Gender rows</span>
          </div>
        </div>

        {/* ── Main table ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                {/* Group header row */}
                <tr>
                  <th
                    className="text-left px-4 py-3 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider border-r border-slate-600 align-bottom"
                    rowSpan={2}
                  >
                    Diversity Category
                  </th>
                  {groupOrder.map((g) => {
                    const gh = GROUP_HEADER[g];
                    const colsInGroup = COLUMNS.filter((c) => c.group === g);
                    return (
                      <th
                        key={g}
                        colSpan={gh.span}
                        className={`text-center px-4 py-2.5 text-[10.5px] font-bold ${gh.headerBg} ${gh.headerText} border-r border-white/20`}
                      >
                        {gh.label}
                        <div className="text-[9px] font-normal opacity-80 mt-0.5">
                          {colsInGroup.length > 1 ? "U.S.; Global" : "Firmwide"}
                        </div>
                      </th>
                    );
                  })}
                </tr>
                {/* Sub-column header row */}
                <tr>
                  {COLUMNS.map((col, i) => (
                    <th
                      key={col.key}
                      className={`text-center px-3 py-2 text-[9.5px] font-semibold text-slate-700 border-t border-slate-200 ${COL_BG[col.key]} ${i < COLUMNS.length - 1 ? "border-r border-slate-200" : ""}`}
                    >
                      {col.subLabel}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Section divider: Race */}
                <tr>
                  <td
                    colSpan={COLUMNS.length + 1}
                    className="px-4 py-1.5 bg-slate-100 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest border-y border-slate-200"
                  >
                    Race / Ethnicity
                  </td>
                </tr>

                {ROWS.filter((r) => r.section === "race").map((row, ri) => (
                  <tr
                    key={row.label}
                    className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${ri % 2 === 1 ? "bg-slate-50/30" : ""}`}
                  >
                    <td className="px-4 py-2.5 text-[11.5px] text-slate-700 font-medium border-r border-slate-100 max-w-[180px] leading-snug">
                      {row.label}
                    </td>
                    {COLUMNS.map((col, ci) => {
                      const val = row.values[col.key];
                      const highlighted = isHighlighted(val);
                      return (
                        <td
                          key={col.key}
                          className={`text-center px-3 py-2.5 tabular-nums ${COL_BG[col.key]} ${ci < COLUMNS.length - 1 ? "border-r border-slate-200" : ""} ${highlighted ? "text-slate-800 font-semibold" : "text-slate-400"}`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Section divider: Gender */}
                <tr>
                  <td
                    colSpan={COLUMNS.length + 1}
                    className="px-4 py-1.5 bg-purple-100/60 text-[9.5px] font-bold text-purple-700 uppercase tracking-widest border-y border-purple-200/60"
                  >
                    Gender
                  </td>
                </tr>

                {ROWS.filter((r) => r.section === "gender").map((row, ri) => (
                  <tr
                    key={row.label}
                    className={`border-b border-slate-100 hover:bg-purple-50/40 transition-colors ${SECTION_ROW_BG[row.section]}`}
                  >
                    <td className="px-4 py-2.5 text-[11.5px] text-slate-700 font-medium border-r border-slate-100 italic leading-snug">
                      {row.label}
                    </td>
                    {COLUMNS.map((col, ci) => {
                      const val = row.values[col.key];
                      const highlighted = isHighlighted(val);
                      return (
                        <td
                          key={col.key}
                          className={`text-center px-3 py-2.5 tabular-nums ${COL_BG[col.key]} ${ci < COLUMNS.length - 1 ? "border-r border-slate-200" : ""} ${highlighted ? "text-purple-800 font-semibold" : "text-slate-400"}`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Total row */}
                <tr className="bg-slate-800 border-t-2 border-slate-700">
                  <td className="px-4 py-3 text-[11px] font-bold text-white border-r border-slate-600">
                    Total (n)
                  </td>
                  {COLUMNS.map((col, ci) => (
                    <td
                      key={col.key}
                      className={`text-center px-3 py-3 text-[13px] font-bold text-white tabular-nums ${ci < COLUMNS.length - 1 ? "border-r border-slate-600" : ""}`}
                    >
                      {col.n}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Column key ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm px-6 py-4">
          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">Column Key</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {COLUMNS.map((col) => (
              <div key={col.key} className="flex items-start gap-2.5">
                <span className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${COL_BG[col.key]} text-slate-600 border border-slate-200 shrink-0`}>
                  {col.subLabel.split(" ")[col.subLabel.split(" ").length - 1]}
                </span>
                <div>
                  <p className="text-[11.5px] font-semibold text-slate-700">{col.label}</p>
                  <p className="text-[10.5px] text-slate-400">{col.subLabel} · n = {col.n}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
            <p className="text-[10.5px] text-slate-400">
              * Global includes U.S. employees
            </p>
            <p className="text-[10.5px] text-slate-400">
              ** All Employees includes investment professionals, operations, compliance, and other full-time staff
            </p>
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
