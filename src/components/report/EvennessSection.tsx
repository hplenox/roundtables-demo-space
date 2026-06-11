import { Info } from "lucide-react";

function ord(n: number): string {
  const r = n % 100;
  if (r >= 11 && r <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function pctColor(p: number): string {
  return p >= 70 ? "#059669" : p >= 40 ? "#b45309" : "#dc2626";
}

interface BarRow {
  label: string;
  q1: number;
  median: number;
  q3: number;
  score: number;
  max: number;
  percentile: number;
}

const PRIME_ROWS: BarRow[] = [
  { label: "RT Universe",  q1: 0.40, median: 0.70, q3: 1.10, score: 1.31, max: 4.00, percentile: 82 },
  { label: "My Portfolio", q1: 0.60, median: 1.28, q3: 1.95, score: 1.31, max: 4.00, percentile: 51 },
];

const GENDER_ROWS: BarRow[] = [
  { label: "RT Universe",  q1: 0.20, median: 0.35, q3: 0.55, score: 0.51, max: 2.00, percentile: 74 },
  { label: "My Portfolio", q1: 0.45, median: 0.68, q3: 0.95, score: 0.51, max: 2.00, percentile: 32 },
];

const RACIAL_ROWS: BarRow[] = [
  { label: "RT Universe",  q1: 0.25, median: 0.45, q3: 0.65, score: 0.80, max: 2.00, percentile: 87 },
  { label: "My Portfolio", q1: 0.35, median: 0.61, q3: 0.97, score: 0.80, max: 2.00, percentile: 67 },
];

// ─── EvenBar ──────────────────────────────────────────────────────────────────

function EvenBar({ row }: { row: BarRow }) {
  const p = (v: number) => `${((v / row.max) * 100).toFixed(2)}%`;
  const iqrWidthPct = ((row.q3 - row.q1) / row.max) * 100;

  return (
    <div className="flex items-start gap-3">
      {/* Row label */}
      <div className="w-24 shrink-0 pt-[1.4rem] text-right">
        <span className="text-[11.5px] font-semibold text-slate-600">{row.label}</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Score label above dot position */}
        <div className="relative h-5">
          <span
            className="absolute text-[10.5px] font-bold text-orange-500 -translate-x-1/2"
            style={{ left: p(row.score) }}
          >
            {row.score.toFixed(2)}
          </span>
        </div>

        {/* Track + dot wrapper — 20px tall so 16px dot (w-4) has 2px margin top/bottom */}
        <div className="relative" style={{ height: "20px" }}>
          {/* Track with overflow-hidden to clip IQR to rounded edges */}
          <div className="absolute inset-y-0 left-0 right-0 my-auto h-3 bg-slate-100 rounded-full overflow-hidden">
            {/* IQR band */}
            <div
              className="absolute top-0 h-full bg-blue-300/60 rounded-full"
              style={{ left: p(row.q1), width: `${iqrWidthPct}%` }}
            />
            {/* Median tick */}
            <div
              className="absolute top-0 h-full w-[2px] bg-blue-700"
              style={{ left: p(row.median), transform: "translateX(-50%)" }}
            />
          </div>
          {/* Orange dot — outside track so not clipped */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-md z-10"
            style={{ left: p(row.score) }}
          />
        </div>

        {/* Q1 / median / Q3 labels below */}
        <div className="relative mt-1.5" style={{ height: "14px" }}>
          {[
            { v: row.q1,    text: `Q1 ${row.q1.toFixed(2)}` },
            { v: row.median, text: `Md ${row.median.toFixed(2)}` },
            { v: row.q3,    text: `Q3 ${row.q3.toFixed(2)}` },
          ].map(({ v, text }) => (
            <span
              key={text}
              className="absolute text-[9px] text-slate-400 -translate-x-1/2"
              style={{ left: `${(v / row.max) * 100}%` }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Max label */}
      <div className="w-16 shrink-0 pt-[1.4rem]">
        <span className="text-[10px] text-slate-400">/ {row.max.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── DimensionCard ────────────────────────────────────────────────────────────

function DimensionCard({
  title, rows, rtPct, portPct,
}: {
  title: string;
  rows: BarRow[];
  rtPct: number;
  portPct: number;
}) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-2 mb-4">
        <h4 className="text-[13px] font-bold text-slate-800">{title}</h4>
        <div className="shrink-0 flex items-center gap-1.5 text-[11px]">
          <span style={{ color: pctColor(rtPct) }}>RT: {ord(rtPct)}</span>
          <span className="text-slate-300">·</span>
          <span style={{ color: pctColor(portPct) }}>Port: {ord(portPct)}</span>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <EvenBar key={row.label} row={row} />
        ))}
      </div>
    </div>
  );
}

// ─── EvennessSection ──────────────────────────────────────────────────────────

export default function EvennessSection() {
  const rtPct   = PRIME_ROWS[0].percentile;
  const portPct = PRIME_ROWS[1].percentile;

  return (
    <div className="space-y-5">

      {/* Description + weighting pills */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-[12.5px] text-slate-600 leading-relaxed mb-3">
          <strong className="text-slate-800">Evenness Prime</strong> measures distributional
          balance across the workforce and leadership.{" "}
          <strong className="text-slate-800">Evenness Ownership</strong> measures distributional
          balance among the owners. Together they form the full Evenness score.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Ownership",  weight: "60%", cls: "bg-violet-50 text-violet-700 border-violet-200" },
            { label: "Leadership", weight: "20%", cls: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Workforce",  weight: "20%", cls: "bg-teal-50 text-teal-700 border-teal-200" },
          ].map(({ label, weight, cls }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${cls}`}
            >
              {label}
              <span className="opacity-60">{weight}</span>
            </span>
          ))}
          <span className="text-[11.5px] text-slate-500">
            Gender and Racial dimensions each contribute 50%.
          </span>
        </div>
      </div>

      {/* Evenness Prime heading with percentile summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-bold text-slate-800">Evenness Prime</h3>
          <div className="relative group inline-flex items-center shrink-0">
            <div className="w-[17px] h-[17px] rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors">
              <Info size={10} className="text-white" />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[280px] bg-[#0f1923] rounded-xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
              <p className="text-[12.5px] text-slate-200 leading-relaxed">
                <strong className="text-amber-400">Evenness Prime</strong>
                {" "}— distributional balance across the workforce and leadership
                (NHHI-based, 40% of total Evenness). Maximum 4.00 points.
              </p>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0f1923] rotate-45 rounded-sm" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-slate-500">RT Universe:</span>
          <span className="font-bold" style={{ color: pctColor(rtPct) }}>{ord(rtPct)}</span>
          <span className="text-slate-300 mx-0.5">·</span>
          <span className="text-slate-500">Portfolio:</span>
          <span className="font-bold" style={{ color: pctColor(portPct) }}>{ord(portPct)}</span>
        </div>
      </div>

      {/* EvenBar rows */}
      <div className="space-y-3 px-1">
        {PRIME_ROWS.map((row) => (
          <EvenBar key={row.label} row={row} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Legend</span>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-3 rounded-sm bg-blue-300/60" />
          <span className="text-[11px] text-slate-600">IQR (25th–75th)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-0.5 h-4 rounded bg-blue-700" />
          <span className="text-[11px] text-slate-600">Median</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-[11px] text-slate-600">This organization</span>
        </div>
      </div>

      {/* Dimension cards */}
      <div className="flex gap-4">
        <DimensionCard
          title="Evenness Prime — Gender"
          rows={GENDER_ROWS}
          rtPct={74}
          portPct={32}
        />
        <DimensionCard
          title="Evenness Prime — Racial"
          rows={RACIAL_ROWS}
          rtPct={87}
          portPct={67}
        />
      </div>
    </div>
  );
}
