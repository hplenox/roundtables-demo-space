"use client";

import Link from "next/link";
import { useClientCtx } from "../client-context";
import { fmtDate, responseRate, CYCLE_STATUS_CONFIG } from "@/lib/mock-clients";
import type { ClientSurveyCycle } from "@/types/client";
import { ArrowUpRight, CalendarRange, Layers } from "lucide-react";

function CycleCard({ cycle }: { cycle: ClientSurveyCycle }) {
  const rate = responseRate(cycle);
  const cfg = CYCLE_STATUS_CONFIG[cycle.status];

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Layers size={15} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800">{cycle.name} &rsquo;{String(cycle.year).slice(2)}</p>
        <p className="text-[11.5px] text-slate-400 mt-0.5">
          {cycle.startDate ? fmtDate(cycle.startDate) : "Not launched"} – {cycle.closeDate ? fmtDate(cycle.closeDate) : "Ongoing"}
        </p>
      </div>
      <div className="hidden sm:block w-40 shrink-0">
        <p className="text-[12.5px] font-medium text-slate-700">
          {cycle.submitted}/{cycle.totalInvited} <span className="text-slate-400 font-normal">submitted</span>
        </p>
        {rate !== null && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#00b8a9]" style={{ width: `${rate}%` }} />
            </div>
            <span className="text-[10.5px] text-slate-500 tabular-nums">{rate}%</span>
          </div>
        )}
      </div>
      <div className="w-24 shrink-0 text-right">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>
      {cycle.surveyId ? (
        <Link
          href={`/surveys/${cycle.surveyId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 text-[11.5px] font-medium text-[#00897b] hover:underline"
        >
          Full Detail <ArrowUpRight size={11} />
        </Link>
      ) : (
        <span className="shrink-0 w-[76px]" />
      )}
    </div>
  );
}

export default function ClientSurveysPage() {
  const { client } = useClientCtx();

  const active = client.surveys.filter((s) => s.status !== "completed").sort((a, b) => b.year - a.year);
  const completed = client.surveys.filter((s) => s.status === "completed").sort((a, b) => b.year - a.year);

  if (client.surveys.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
          <CalendarRange size={18} className="text-slate-300" />
        </div>
        <p className="text-[13px] font-medium text-slate-600">No survey history yet</p>
        <p className="text-[11.5px] text-slate-400 mt-1 max-w-xs mx-auto">
          This client hasn&rsquo;t hosted a survey. Kick off onboarding to schedule their first cycle.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Active Cycle</span>
          <span className="text-[11px] text-slate-400">{active.length} in progress</span>
        </div>
        {active.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-[12px] text-slate-400">No survey currently in flight — every cycle has been completed.</p>
          </div>
        ) : (
          active.map((c) => <CycleCard key={c.id} cycle={c} />)
        )}
      </div>

      {completed.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Completed Cycles</span>
            <span className="text-[11px] text-slate-400">{completed.length} survey{completed.length !== 1 ? "s" : ""}</span>
          </div>
          {completed.map((c) => <CycleCard key={c.id} cycle={c} />)}
        </div>
      )}
    </div>
  );
}
