"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrgById, getSurveyById } from "@/lib/mock-data";
import type { RacialBreakdown } from "@/types/survey";
import { ChevronRight, Printer, Download, LayoutDashboard } from "lucide-react";

// ─── Populations ──────────────────────────────────────────────────────────────
//
// This is the merged investment staff + investment committee report: one sheet
// laid out like the Investment Committee workbook tab. Three colour-coded
// population bands, each split into the U.S.-only and global cuts the workbook
// carries. The survey's three reported tiers feed the bands:
//
//   Ownership  → Investment Professionals
//   Leadership → Investment Committee
//   all tiers  → All Employees
//
// The survey does not collect a geographic split, so the U.S.-only and global
// columns of a band report the same population — as the workbook itself does
// for a single-country firm. Both are kept so the sheet stays column-for-column
// comparable with the workbook.

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
  { key: "ipUS",     group: "ip", header: "U.S. only (A)", source: "ownership",  legend: "Investment professionals, U.S. offices — from reported ownership" },
  { key: "ipGlobal", group: "ip", header: "Global* (B)",   source: "ownership",  legend: "Investment professionals, all offices — from reported ownership" },
  { key: "ic",       group: "ic", header: "Firmwide (C)",  source: "leadership", legend: "Investment committee members, firmwide — from reported leadership" },
  { key: "aeUS",     group: "ae", header: "U.S. only (D)", source: "all",        legend: "All employees, U.S. offices — ownership, leadership, and workforce" },
  { key: "aeGlobal", group: "ae", header: "Global* (E)",   source: "all",        legend: "All employees, all offices — ownership, leadership, and workforce" },
] as const;

type SourceKey = (typeof COLUMNS)[number]["source"];

// ─── Rows ─────────────────────────────────────────────────────────────────────

/** Race rows, in workbook order, mapped onto the survey's breakdown keys. */
const RACE_ROWS: { label: string; key: keyof RacialBreakdown }[] = [
  { label: "Asian",                                             key: "asian" },
  { label: "Black",                                             key: "black" },
  { label: "Hispanic/Latino/a",                                 key: "latino" },
  { label: "Two or More Races",                                 key: "multiracial" },
  { label: "White",                                             key: "white" },
  { label: "Other",                                             key: "other" },
  { label: "Indigenous - North America",                        key: "indigenous_na" },
  { label: "Indigenous - Outside North America",                key: "indigenous_out" },
  { label: "North African / Southwest Asian / Middle Eastern",  key: "mena" },
];

/** A population reduced to the numbers the sheet needs. */
interface Population {
  /** Headcount — the denominator for every percentage in the column. */
  n: number;
  race: RacialBreakdown;
  /** Headcount whose race was not reported. */
  notAvailable: number;
  women: number;
}

const EMPTY_RACE: RacialBreakdown = {
  indigenous_na: 0, asian: 0, black: 0, latino: 0, mena: 0,
  indigenous_out: 0, white: 0, other: 0, multiracial: 0,
};

function addRace(a: RacialBreakdown, b: RacialBreakdown): RacialBreakdown {
  const sum = { ...EMPTY_RACE };
  for (const k of Object.keys(EMPTY_RACE) as (keyof RacialBreakdown)[]) {
    sum[k] = a[k] + b[k];
  }
  return sum;
}

function raceTotal(r: RacialBreakdown) {
  return Object.values(r).reduce((a, b) => a + b, 0);
}

function fmt(count: number, n: number) {
  const p = n === 0 ? 0 : (count / n) * 100;
  return `${p.toFixed(2)}%`;
}

// Every cell carries the workbook's hairline grid.
const CELL = "border border-slate-900/85";
// `border-collapse` drops a sticky cell's own right border while the value
// columns scroll under it, so the edge is drawn with a shadow instead.
const STICKY =
  "sticky left-0 z-20 bg-white shadow-[1px_0_0_0_rgba(15,23,42,0.85)]";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestmentCommitteeReportPage() {
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

  const build = (
    gender: { men: number; women: number },
    race: RacialBreakdown,
  ): Population => {
    const n = gender.men + gender.women;
    return {
      n,
      race,
      notAvailable: Math.max(0, n - raceTotal(race)),
      women: gender.women,
    };
  };

  const POPULATIONS: Record<SourceKey, Population> = {
    ownership: build(g.ownership, r.ownership),
    leadership: build(g.leadership, r.leadership),
    all: build(
      {
        men: g.ownership.men + g.leadership.men + g.workforce.men,
        women: g.ownership.women + g.leadership.women + g.workforce.women,
      },
      addRace(addRace(r.ownership, r.leadership), r.workforce),
    ),
  };

  const popFor = (col: (typeof COLUMNS)[number]) => POPULATIONS[col.source];

  // Women are reported as a headcount, not crossed with race, so the three
  // Female sub-rows apportion that headcount across the population's own
  // white / non-white / not-reported split. They sum back to Female Total.
  function femaleSplit(p: Population) {
    const reported = raceTotal(p.race);
    const nonWhite = Math.max(0, reported - p.race.white);
    if (p.n === 0) return { white: 0, nonWhite: 0, notAvailable: 0 };
    return {
      white: (p.women * p.race.white) / p.n,
      nonWhite: (p.women * nonWhite) / p.n,
      notAvailable: (p.women * p.notAvailable) / p.n,
    };
  }

  /** Rows in workbook order: race block, then the saturated gender block. */
  const ROWS: {
    label: string;
    block: "race" | "gender";
    italic?: boolean;
    value: (p: Population) => string;
  }[] = [
    ...RACE_ROWS.map((row) => ({
      label: row.label,
      block: "race" as const,
      value: (p: Population) => fmt(p.race[row.key], p.n),
    })),
    {
      label: "Not Available",
      block: "race" as const,
      value: (p: Population) => fmt(p.notAvailable, p.n),
    },
    {
      label: "Female Total",
      block: "gender" as const,
      value: (p: Population) => fmt(p.women, p.n),
    },
    {
      label: "Female Non-White",
      block: "gender" as const,
      italic: true,
      value: (p: Population) => fmt(femaleSplit(p).nonWhite, p.n),
    },
    {
      label: "Female White",
      block: "gender" as const,
      italic: true,
      value: (p: Population) => fmt(femaleSplit(p).white, p.n),
    },
    {
      label: "Female Not Available",
      block: "gender" as const,
      italic: true,
      value: (p: Population) => fmt(femaleSplit(p).notAvailable, p.n),
    },
  ];

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
              Investment Staff &amp; Committee Report
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
                Diversity percentages for {org.name} across investment professionals,
                the investment committee, and all employees, with headcount for each
                column in the final row.
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
                  {GROUPS.map((grp) => (
                    <th
                      key={grp.key}
                      scope="colgroup"
                      colSpan={grp.span}
                      style={{ backgroundColor: FILL[grp.key].head }}
                      className={`${CELL} px-3 pt-2.5 pb-2 text-center font-bold leading-tight`}
                    >
                      <span className="block">{grp.title}</span>
                      <span className="block font-normal text-[12.5px] mt-1.5 whitespace-pre">
                        {grp.sub}
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
                      style={{ backgroundColor: FILL[col.group].head }}
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
                        style={{
                          backgroundColor:
                            row.block === "gender"
                              ? FILL[col.group].strong
                              : FILL[col.group].body,
                        }}
                        className={`${CELL} px-3 py-2 text-left tabular-nums`}
                      >
                        {row.value(popFor(col))}
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
                      style={{ backgroundColor: FILL[col.group].strong }}
                      className={`${CELL} px-3 py-2 text-left tabular-nums`}
                    >
                      {popFor(col).n}
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
                  style={{ backgroundColor: FILL[col.group].body }}
                  className="mt-[1px] shrink-0 border border-slate-900/85 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
                >
                  {col.header}
                </span>
                <span className="text-[11.5px] text-slate-600 leading-snug">
                  {col.legend} · n = {popFor(col).n}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
            <p>
              * Global figures include U.S. employees. This survey does not collect a
              geographic split, so the U.S.-only and global columns of a band report
              the same population.
            </p>
            <p>
              ** All Employees covers every reported employee — ownership, leadership,
              and workforce combined.
            </p>
            <p>
              The final row is headcount (n) for each column; all other figures are
              percentages of that column&apos;s headcount. &ldquo;Not Available&rdquo;
              is headcount with no race reported.
            </p>
            <p>
              Gender is reported as a headcount rather than crossed with race, so the
              three italicised Female rows apportion that headcount across the
              column&apos;s own white / non-white / not-reported split; they sum to
              Female Total.
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
