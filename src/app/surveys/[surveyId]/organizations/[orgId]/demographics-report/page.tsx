"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrgById, getSurveyById } from "@/lib/mock-data";
import { ChevronRight, Printer, Download, LayoutDashboard } from "lucide-react";

// ─── Column groups ────────────────────────────────────────────────────────────
//
// The layout mirrors the Investment Committee workbook tab: three colour-coded
// population bands (investment professionals, the IC itself, all employees),
// each split into the U.S.-only and global cuts the workbook uses.

type GroupKey = "ip" | "ic" | "ae";

/** Workbook fills: header band, body cells, and the saturated gender block. */
const FILL: Record<GroupKey, { head: string; body: string; strong: string }> = {
  ip: { head: "#FBE2A0", body: "#FCEBC6", strong: "#F0B93F" },
  ic: { head: "#DFEDD5", body: "#E8F2E1", strong: "#A8C88A" },
  ae: { head: "#D5E2F2", body: "#E1EAF6", strong: "#7FA6D0" },
};

const GROUPS: { key: GroupKey; title: string; sub: string; span: number }[] = [
  { key: "ip", title: "Investment Professionals", sub: "U.S.;  Global", span: 2 },
  { key: "ic", title: "Investment Committee", sub: "members", span: 1 },
  { key: "ae", title: "All Employees**", sub: "U.S.;  Global", span: 2 },
];

const COLUMNS = [
  { key: "invStaffUS",     group: "ip", header: "U.S. only (A)",  legend: "Investment professionals, U.S. offices only",              n: 26 },
  { key: "invStaffGlobal", group: "ip", header: "Global* (B)",    legend: "Investment professionals, all offices worldwide",           n: 33 },
  { key: "invCommittee",   group: "ic", header: "Firmwide (C)",   legend: "Voting members of the investment committee, firmwide",      n: 10 },
  { key: "ftStaffUS",      group: "ae", header: "U.S. only (D)",  legend: "All full-time employees, U.S. offices only",                n: 73 },
  { key: "ftStaffGlobal",  group: "ae", header: "Global* (E)",    legend: "All full-time employees, all offices worldwide",            n: 77 },
] as const;

type ColKey = (typeof COLUMNS)[number]["key"];

// ─── Rows ─────────────────────────────────────────────────────────────────────

interface DiversityRow {
  label: string;
  /** Gender rows sit in the saturated block at the bottom of the workbook. */
  block: "race" | "gender";
  /** The workbook italicises the three Female breakdown rows. */
  italic?: boolean;
  values: Record<ColKey, string>;
}

const ROWS: DiversityRow[] = [
  {
    label: "Asian",
    block: "race",
    values: { invStaffUS: "38.46%", invStaffGlobal: "36.36%", invCommittee: "10.00%", ftStaffUS: "31.51%", ftStaffGlobal: "29.87%" },
  },
  {
    label: "Black",
    block: "race",
    values: { invStaffUS: "3.85%", invStaffGlobal: "3.03%", invCommittee: "0.00%", ftStaffUS: "2.74%", ftStaffGlobal: "2.60%" },
  },
  {
    label: "Hispanic/Latino/a",
    block: "race",
    values: { invStaffUS: "3.85%", invStaffGlobal: "3.03%", invCommittee: "10.00%", ftStaffUS: "1.37%", ftStaffGlobal: "1.30%" },
  },
  {
    label: "Two or More Races",
    block: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "1.37%", ftStaffGlobal: "1.30%" },
  },
  {
    label: "White",
    block: "race",
    values: { invStaffUS: "53.85%", invStaffGlobal: "57.58%", invCommittee: "80.00%", ftStaffUS: "61.64%", ftStaffGlobal: "63.64%" },
  },
  {
    label: "Other",
    block: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
  {
    label: "Indigenous - North America",
    block: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
  {
    label: "Indigenous - Outside North America",
    block: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
  {
    label: "North African / Southwest Asian / Middle Eastern",
    block: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
  {
    label: "Not Available",
    block: "race",
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "1.37%", ftStaffGlobal: "1.30%" },
  },
  {
    label: "Female Total",
    block: "gender",
    values: { invStaffUS: "19.23%", invStaffGlobal: "24.24%", invCommittee: "0.00%", ftStaffUS: "39.73%", ftStaffGlobal: "37.66%" },
  },
  {
    label: "Female Non-White",
    block: "gender",
    italic: true,
    values: { invStaffUS: "7.69%", invStaffGlobal: "12.12%", invCommittee: "0.00%", ftStaffUS: "17.81%", ftStaffGlobal: "16.88%" },
  },
  {
    label: "Female White",
    block: "gender",
    italic: true,
    values: { invStaffUS: "11.54%", invStaffGlobal: "12.12%", invCommittee: "0.00%", ftStaffUS: "21.92%", ftStaffGlobal: "20.78%" },
  },
  {
    label: "Female Not Available",
    block: "gender",
    italic: true,
    values: { invStaffUS: "0.00%", invStaffGlobal: "0.00%", invCommittee: "0.00%", ftStaffUS: "0.00%", ftStaffGlobal: "0.00%" },
  },
];

// Every cell carries the workbook's hairline grid.
const CELL = "border border-slate-900/85";
/** The category column stays put while the value columns scroll sideways. */
// `border-collapse` drops a sticky cell's own right border while the value
// columns scroll under it, so the edge is drawn with a shadow instead.
const STICKY =
  "sticky left-0 z-20 bg-white shadow-[1px_0_0_0_rgba(15,23,42,0.85)]";

function fillFor(col: (typeof COLUMNS)[number], row: DiversityRow) {
  const f = FILL[col.group as GroupKey];
  return row.block === "gender" ? f.strong : f.body;
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
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="h-[3px] bg-gradient-to-r from-sky-500 via-sky-400/70 to-transparent" />
        <div className="max-w-[1120px] mx-auto px-6 h-11 flex items-center justify-between gap-4">
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
            <span className="text-slate-700 font-semibold shrink-0">Investment Committee</span>
          </nav>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Printer size={13} />
              Print
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1923] text-[12px] text-white font-medium hover:bg-slate-800 transition-colors">
              <Download size={13} />
              Export XLSX
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-6 py-7 space-y-4">

        {/* ── Worksheet title bar ───────────────────────────────────── */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.18em]">
              Investment Committee Report
            </p>
            <h1 className="text-[21px] font-bold text-slate-900 leading-tight mt-0.5">
              {org.name}
            </h1>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {org.assetClass} · {org.aum} AUM · {org.headquarters}
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700">{survey.year} {survey.name}</p>
            <p>{survey.hostOrg}</p>
            <p className="text-slate-400">As of {reportDate}</p>
          </div>
        </div>

        {/* ── Worksheet ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-5 print:border-0 print:shadow-none print:p-0">
          <div className="overflow-x-auto">
            <table className="border-collapse text-[13px] text-slate-900 w-full min-w-[860px]">
              <caption className="sr-only">
                Diversity percentages for {org.name} by population and geography, with
                headcount for each column in the final row.
              </caption>

              <thead>
                {/* Group band */}
                <tr>
                  <th
                    rowSpan={2}
                    scope="col"
                    className={`${CELL} ${STICKY} w-[38%] min-w-[260px] text-left align-bottom px-3 py-3 font-bold bg-white`}
                  >
                    Diversity Category
                  </th>
                  {GROUPS.map((g) => (
                    <th
                      key={g.key}
                      scope="colgroup"
                      colSpan={g.span}
                      style={{ backgroundColor: FILL[g.key].head }}
                      className={`${CELL} px-3 pt-2.5 pb-2 text-center font-bold leading-tight`}
                    >
                      <span className="block">{g.title}</span>
                      <span className="block font-normal text-[12.5px] mt-1.5 whitespace-pre">
                        {g.sub}
                      </span>
                    </th>
                  ))}
                </tr>
                {/* Sub-column band */}
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      title={col.legend}
                      style={{ backgroundColor: FILL[col.group as GroupKey].head }}
                      className={`${CELL} px-3 py-1.5 text-center font-normal whitespace-nowrap`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="group">
                    <th
                      scope="row"
                      className={`${CELL} ${STICKY} text-left px-3 py-2 font-normal leading-snug group-hover:bg-slate-50 transition-colors ${row.italic ? "italic" : ""}`}
                    >
                      {row.label}
                    </th>
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        style={{ backgroundColor: fillFor(col, row) }}
                        className={`${CELL} px-3 py-2 text-left tabular-nums`}
                      >
                        {row.values[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Headcount row — the workbook leaves the label cell empty */}
                <tr>
                  <td className={`${STICKY} px-3 py-2 bg-white`}>
                    <span className="sr-only">Headcount (n)</span>
                  </td>
                  {COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      style={{ backgroundColor: FILL[col.group as GroupKey].strong }}
                      className={`${CELL} px-3 py-2 text-left tabular-nums`}
                    >
                      {col.n}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Column key & footnotes ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 print:border-0 print:shadow-none print:px-0">
          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-3">
            Column Key
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {COLUMNS.map((col) => (
              <li key={col.key} className="flex items-start gap-2.5">
                <span
                  style={{ backgroundColor: FILL[col.group as GroupKey].body }}
                  className="mt-[1px] shrink-0 border border-slate-900/85 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
                >
                  {col.header}
                </span>
                <span className="text-[11.5px] text-slate-600 leading-snug">
                  {col.legend} · n = {col.n}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
            <p>* Global figures include U.S. employees.</p>
            <p>
              ** All Employees covers every full-time employee — investment, operations,
              compliance, and support staff.
            </p>
            <p>
              The final row is headcount (n) for each column; all other figures are
              percentages of that column&apos;s headcount.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center pb-4">
          {survey.year} {survey.name} · {survey.hostOrg} · Confidential — authorized
          administrators only · Generated {reportDate}
        </p>

      </div>
    </div>
  );
}
