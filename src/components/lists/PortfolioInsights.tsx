"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, Info, TrendingUp, TrendingDown, PieChart, Bell,
  ArrowUpCircle, ArrowDownCircle, ChevronUp, ChevronDown, CheckCircle,
} from "lucide-react";
import {
  SCORECARD_MANAGERS, AI_INSIGHT_BULLETS, OUTCOME_TILES, INFRASTRUCTURE_TILES,
  CULTURE_DURABLE, INVESTMENT_PERFORMANCE_BY_ASSET_CLASS, PORTFOLIO_TOTAL_NAV,
  ENGAGEMENT, RATING_REQUEST_BANNER, type ScorecardManager, type SummaryTile,
} from "@/lib/mock-insights-data";

// ─── shared bits ─────────────────────────────────────────────────────────────

function fmt$M(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}B` : `$${n.toFixed(1)}M`;
}

const PERF_COLOR: Record<string, string> = {
  above: "#16a34a", at: "#94a3b8", under: "#dc2626", unrated: "#e2e8f0",
};

function InsightIcon({ icon }: { icon: "up" | "down" | "pie" }) {
  if (icon === "up") return <TrendingUp size={15} className="text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.25} />;
  if (icon === "down") return <TrendingDown size={15} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2.25} />;
  return <PieChart size={15} className="text-sky-600 shrink-0 mt-0.5" strokeWidth={2.25} />;
}

function TrendLine({ trend, children }: { trend: "up" | "down"; children: React.ReactNode }) {
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  const color = trend === "up" ? "text-emerald-600" : "text-amber-600";
  return (
    <p className="flex items-start gap-1 text-[10.5px] text-slate-500 mt-2">
      <Icon size={11} className={`shrink-0 mt-0.5 ${color}`} strokeWidth={2.25} />
      <span>{children}</span>
    </p>
  );
}

// ─── AI Insights banner ────────────────────────────────────────────────────

function AIInsightsPanel({ scope }: { scope: string }) {
  const [left, right] = [
    [AI_INSIGHT_BULLETS[0], AI_INSIGHT_BULLETS[2]],
    [AI_INSIGHT_BULLETS[1], AI_INSIGHT_BULLETS[3]],
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={15} className="text-violet-500" strokeWidth={2.25} />
        <p className="text-[13.5px] font-bold text-slate-900">AI Insights</p>
        <span className="text-slate-300">·</span>
        <p className="text-[13.5px] font-semibold text-slate-500">{scope}</p>
        <Info size={12} className="text-slate-300 ml-0.5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
        {[left, right].map((col, i) => (
          <div key={i} className="space-y-3">
            {col.map((b, j) => (
              <div key={j} className="flex items-start gap-2">
                <InsightIcon icon={b.icon} />
                <p className="text-[12.5px] text-slate-700 leading-snug">
                  <span className="font-bold text-slate-900">{b.lead}</span> {b.text}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Outcomes / Infrastructure stat tiles ──────────────────────────────────

function SummaryTileCard({ tile }: { tile: SummaryTile }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-1 mb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{tile.label}</p>
        {tile.infoTooltip && (
          <span title={tile.infoTooltip}>
            <Info size={11} className="text-slate-300" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 mb-2.5">
        <p className="text-[24px] font-bold text-slate-900 leading-none tabular-nums">{tile.value}</p>
        <p className="text-[11px] text-slate-400">{tile.unit}</p>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, tile.barPct)}%`, backgroundColor: tile.color }}
        />
      </div>
      <TrendLine trend={tile.trend}>{tile.footnote}</TrendLine>
    </div>
  );
}

function OutcomesInfrastructureRow() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mb-2 px-0.5">
        <p className="text-[11px] text-slate-500">
          <span className="font-bold text-slate-700 uppercase tracking-wide">Outcomes</span>{" "}
          what the cultures are — representation &amp; balance
        </p>
        <p className="text-[11px] text-slate-500">
          <span className="font-bold text-slate-700 uppercase tracking-wide">Infrastructure</span>{" "}
          what is operationalized to create them — transparency &amp; policies
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...OUTCOME_TILES, ...INFRASTRUCTURE_TILES].map((tile) => (
          <SummaryTileCard key={tile.label} tile={tile} />
        ))}
      </div>
    </div>
  );
}

// ─── Culture-Durable Selection card ────────────────────────────────────────

function CultureDurableCard() {
  const c = CULTURE_DURABLE;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
      <div className="flex items-center gap-1 mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Culture-Durable Selection</p>
        <TrendingUp size={11} className="text-emerald-600" strokeWidth={2.5} />
        <Info size={11} className="text-slate-300" />
      </div>
      <div className="flex items-baseline gap-2 mb-2.5">
        <p className="text-[30px] font-extrabold text-emerald-600 leading-none">{c.grade}</p>
        <p className="text-[13px] font-semibold text-slate-500">{c.score.toFixed(1)} / {c.scoreMax}</p>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-amber-300 mb-2.5">
        <div className="h-full bg-emerald-500" style={{ width: `${c.barPct}%` }} />
      </div>
      <p className="text-[11.5px] text-slate-500 leading-snug flex-1">{c.description}</p>
      <TrendLine trend={c.trend}>{c.footnote}</TrendLine>
    </div>
  );
}

// ─── Investment Performance by Asset Class card ────────────────────────────

function InvestmentPerformanceCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight">
            Investment Performance<br />by Asset Class
          </p>
          <Info size={11} className="text-slate-300 shrink-0" />
        </div>
        <p className="text-[12px] font-semibold text-slate-700 shrink-0">{fmt$M(PORTFOLIO_TOTAL_NAV)} NAV</p>
      </div>
      <div className="space-y-2 flex-1">
        {INVESTMENT_PERFORMANCE_BY_ASSET_CLASS.map((row) => {
          const rowTotal = row.above + row.at + row.under + row.unrated;
          return (
            <div key={row.assetClass} className="flex items-center gap-2.5">
              <p className="text-[11.5px] text-slate-600 w-[108px] shrink-0 truncate">
                {row.assetClass} <span className="text-slate-400">({row.managerCount})</span>
              </p>
              <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100 flex">
                {rowTotal > 0 ? (
                  <>
                    {row.above > 0 && <div className="h-full bg-emerald-500" style={{ width: `${(row.above / rowTotal) * 100}%` }} />}
                    {row.at > 0 && <div className="h-full bg-slate-400" style={{ width: `${(row.at / rowTotal) * 100}%` }} />}
                    {row.under > 0 && <div className="h-full bg-red-500" style={{ width: `${(row.under / rowTotal) * 100}%` }} />}
                    {row.unrated > 0 && <div className="h-full bg-slate-200" style={{ width: `${(row.unrated / rowTotal) * 100}%` }} />}
                  </>
                ) : (
                  <div className="h-full w-full bg-slate-200" />
                )}
              </div>
              <p className="text-[11.5px] font-semibold text-slate-700 w-14 text-right shrink-0 tabular-nums">
                {row.total !== null ? fmt$M(row.total) : "—"}
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-slate-100">
        {[
          { label: "Above", color: "bg-emerald-500" },
          { label: "At", color: "bg-slate-400" },
          { label: "Under", color: "bg-red-500" },
          { label: "Unrated", color: "bg-slate-200" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1 text-[10.5px] text-slate-500">
            <span className={`w-1.5 h-1.5 rounded-full ${l.color}`} /> {l.label}
          </span>
        ))}
      </div>
      <TrendLine trend="down">Hedge Fund mix eroding · Kessler &amp; Voss downgraded to under in Jul</TrendLine>
    </div>
  );
}

// ─── Your Engagement card ───────────────────────────────────────────────────

function EngagementCard() {
  const e = ENGAGEMENT;
  const maxCount = Math.max(...e.categories.map((c) => c.count));
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
      <div className="flex items-center gap-1 mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Your Engagement</p>
        <Info size={11} className="text-slate-300" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[24px] font-bold text-slate-900 leading-none tabular-nums">{e.totalSent}</p>
          <p className="text-[11px] text-slate-400 mt-1">engagements sent · this selection</p>
        </div>
        <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0">
          #{e.rank} of {e.ofAllocators} allocators
        </span>
      </div>
      <div className="space-y-2">
        {e.categories.map((c) => (
          <div key={c.label} className="flex items-center gap-2.5">
            <p className="text-[11px] text-slate-500 w-16 shrink-0">{c.label}</p>
            <div className="relative flex-1 h-1.5 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${(c.count / maxCount) * 100}%`, backgroundColor: c.color }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[2px] h-3 bg-slate-400/70 rounded-full"
                style={{ left: `${c.benchmarkPct}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-slate-700 w-16 text-right shrink-0 tabular-nums">
              {c.count} · avg {c.avg}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-2">{e.benchmarkCaption}</p>

      <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <p className="text-[11px] text-slate-500 w-16 shrink-0">Engaged</p>
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-sky-400" style={{ width: `${e.engagedPct}%` }} />
          </div>
          <p className="text-[11px] font-semibold text-slate-700 w-10 text-right shrink-0 tabular-nums">{e.engagedPct}%</p>
        </div>
        <div className="flex items-center gap-2.5">
          <p className="text-[11px] text-slate-500 w-16 shrink-0">Unengaged</p>
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-slate-300" style={{ width: `${e.unengagedPct}%` }} />
          </div>
          <p className="text-[11px] font-semibold text-slate-700 w-10 text-right shrink-0 tabular-nums">{e.unengagedPct}%</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-2">{e.comparisonCaption}</p>
    </div>
  );
}

// ─── Rating-requested notification banner ──────────────────────────────────

function RatingRequestBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[#e8f8f4] border border-emerald-100 px-4 py-3.5">
      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
        <Bell size={13} className="text-emerald-600" />
      </div>
      <p className="text-[12px] text-slate-700 leading-snug">
        <span className="font-bold text-slate-900">{RATING_REQUEST_BANNER.lead}</span> {RATING_REQUEST_BANNER.text}
      </p>
    </div>
  );
}

// ─── Scorecard table ─────────────────────────────────────────────────────────

function PctPill({ percentile }: { percentile: number | null }) {
  if (percentile == null) return <span className="text-[11px] text-slate-300">—</span>;
  const color = percentile >= 70 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : percentile >= 40 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-red-700 bg-red-50 border-red-200";
  const ord = percentile % 10 === 1 && percentile % 100 !== 11 ? "st"
    : percentile % 10 === 2 && percentile % 100 !== 12 ? "nd"
    : percentile % 10 === 3 && percentile % 100 !== 13 ? "rd" : "th";
  return (
    <span className={`inline-block text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full border ${color}`}>
      {percentile}{ord}
    </span>
  );
}

function GradeText({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-[12px] text-slate-300">—</span>;
  const color = grade.startsWith("A") ? "text-emerald-600" : grade.startsWith("B") ? "text-teal-600" : grade.startsWith("C") ? "text-amber-600" : "text-red-500";
  return <span className={`text-[12px] font-bold ${color}`}>{grade}</span>;
}

function RatingArrows({ managerId }: { managerId: string }) {
  const [rated, setRated] = useState<"up" | "down" | null>(null);
  return (
    <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setRated("up")}
        title="Rate positively"
        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${rated === "up" ? "text-emerald-600" : "text-slate-300 hover:text-emerald-500"}`}
      >
        <ArrowUpCircle size={14} />
      </button>
      <button
        onClick={() => setRated("down")}
        title="Rate negatively"
        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${rated === "down" ? "text-red-600" : "text-slate-300 hover:text-red-500"}`}
      >
        <ArrowDownCircle size={14} />
      </button>
      {rated && <CheckCircle size={11} className="text-emerald-500 ml-0.5" />}
      <span className="sr-only" aria-hidden data-manager={managerId} />
    </span>
  );
}

function ScorecardRow({ manager }: { manager: ScorecardManager }) {
  return (
    <Link
      href={`/surveys/${manager.surveyId}/organizations/${manager.orgId}/report`}
      className="group flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors"
    >
      <input type="checkbox" onClick={(e) => e.stopPropagation()} className="w-3.5 h-3.5 rounded border-slate-300 shrink-0" />
      <div className="w-9 h-9 rounded-lg bg-[#0f1923] flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-white">{manager.name.substring(0, 2).toUpperCase()}</span>
      </div>
      <div className="w-[220px] shrink-0 min-w-0">
        <p className="text-[12.5px] font-semibold text-slate-800 group-hover:text-[#00897b] truncate transition-colors">{manager.name}</p>
        <p className="text-[10.5px] text-slate-400 flex items-center gap-1.5">
          {manager.location}
          <span className={`inline-flex items-center gap-1 ${manager.status === "Active" ? "text-emerald-600" : "text-sky-600"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${manager.status === "Active" ? "bg-emerald-500" : "bg-sky-500"}`} />
            {manager.status}
          </span>
        </p>
        {manager.ratingRequested && (
          <span className="inline-flex items-center gap-1.5 mt-1 text-[9.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
            Rating requested <RatingArrows managerId={manager.id} />
          </span>
        )}
      </div>
      <div className="w-[150px] shrink-0 truncate text-[11.5px] text-slate-500">{manager.assetClasses.join(" · ")}</div>
      <div className="w-16 shrink-0 text-[12px] font-medium text-slate-700 text-right">{manager.aum}</div>
      <div className="w-16 shrink-0 text-right">
        {manager.lpiScore != null ? <span className="text-[12px] font-bold text-slate-800 tabular-nums">{manager.lpiScore.toFixed(2)}</span> : <span className="text-[12px] text-slate-300">—</span>}
      </div>
      <div className="w-14 shrink-0 text-right"><PctPill percentile={manager.lpiPercentile} /></div>
      <div className="w-14 shrink-0 text-right"><PctPill percentile={manager.evennessPercentile} /></div>
      <div className="w-16 shrink-0 text-right text-[12px] font-medium text-slate-700 tabular-nums">
        {manager.transparencyPct != null ? `${manager.transparencyPct.toFixed(1)}%` : <span className="text-slate-300">—</span>}
      </div>
      <div className="w-14 shrink-0 text-right"><GradeText grade={manager.policyGrade} /></div>
      <div className="w-14 shrink-0 text-right"><GradeText grade={manager.durabilityGrade} /></div>
      <div className="w-20 shrink-0 text-right flex items-center justify-end gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0`} style={{ backgroundColor: PERF_COLOR[manager.performance] }} />
        <span className="text-[12px] font-semibold text-slate-800 tabular-nums">{manager.nav != null ? fmt$M(manager.nav) : "—"}</span>
      </div>
    </Link>
  );
}

function ScorecardTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
      <div className="min-w-[920px]">
        {/* Group header */}
        <div className="flex items-center gap-3 px-5 pt-3 text-[9.5px] font-bold uppercase tracking-wider">
          <div className="w-3.5 shrink-0" /><div className="w-9 shrink-0" />
          <div className="w-[220px] shrink-0" /><div className="w-[150px] shrink-0" /><div className="w-16 shrink-0" />
          <div className="flex items-center gap-3">
            <div className="w-[412px] shrink-0 text-violet-600 border-b-2 border-violet-200 pb-1.5 flex items-center gap-1">
              Human Capital Optimization <Info size={9} className="text-violet-300" />
            </div>
            <div className="w-20 shrink-0 text-sky-600 border-b-2 border-sky-200 pb-1.5 text-right">Investment</div>
          </div>
        </div>
        {/* Column header */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">
          <div className="w-3.5 shrink-0" />
          <div className="w-9 shrink-0" />
          <div className="w-[220px] shrink-0">Manager</div>
          <div className="w-[150px] shrink-0">Asset Class</div>
          <div className="w-16 shrink-0 text-right flex items-center justify-end gap-0.5">AUM <ChevronDown size={10} /></div>
          <div className="w-16 shrink-0 text-right">LPI</div>
          <div className="w-14 shrink-0 text-right flex items-center justify-end gap-0.5">Pct <ChevronDown size={10} /></div>
          <div className="w-14 shrink-0 text-right flex items-center justify-end gap-0.5">Evenness <ChevronUp size={10} /></div>
          <div className="w-16 shrink-0 text-right">Transp.</div>
          <div className="w-14 shrink-0 text-right">Policy</div>
          <div className="w-14 shrink-0 text-right flex items-center justify-end gap-0.5">Durab. <ChevronDown size={10} /></div>
          <div className="w-20 shrink-0 text-right flex items-center justify-end gap-0.5">NAV <ChevronDown size={10} /></div>
        </div>
        {SCORECARD_MANAGERS.map((m) => <ScorecardRow key={m.id} manager={m} />)}
      </div>
    </div>
  );
}

// ─── Root component ─────────────────────────────────────────────────────────

export default function PortfolioInsights() {
  const [tab, setTab] = useState<"scorecard" | "demographic">("scorecard");

  return (
    <div className="space-y-5 mb-6">
      <AIInsightsPanel scope="All managers" />
      <OutcomesInfrastructureRow />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <CultureDurableCard />
        <InvestmentPerformanceCard />
        <EngagementCard />
      </div>
      <RatingRequestBanner />

      <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setTab("scorecard")}
          className={`px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${tab === "scorecard" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Scorecard
        </button>
        <button
          onClick={() => setTab("demographic")}
          className={`px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${tab === "demographic" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Demographic compilation
        </button>
      </div>

      {tab === "scorecard" ? (
        <ScorecardTable />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16 gap-2">
          <PieChart size={22} className="text-slate-300" />
          <p className="text-[12.5px] font-medium text-slate-500">Demographic compilation is coming soon</p>
          <p className="text-[11px] text-slate-400">Aggregate workforce, leadership, and ownership demographics across this selection.</p>
        </div>
      )}
    </div>
  );
}
