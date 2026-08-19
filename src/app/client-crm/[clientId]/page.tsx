"use client";

import Link from "next/link";
import { useClientCtx } from "./client-context";
import {
  fmtDate, getNextMilestone, checklistProgress, onboardingProgress,
  getMostRecentCompletedCycle, responseRate, KEY_DATE_LABELS, STATUS_CONFIG,
  CYCLE_STATUS_CONFIG, CYCLE_STATUS_ORDER, daysUntil,
} from "@/lib/mock-clients";
import type { ClientKeyDates, ClientStatus, SurveyCycleStatus } from "@/types/client";
import {
  CalendarClock, TrendingUp, History, ArrowRight, Send, Rocket,
  StickyNote, ClipboardList, ListChecks,
} from "lucide-react";

// Only genuinely upcoming dates belong on this "Upcoming Key Dates" card —
// a past date whose milestone already happened (e.g. a completed kickoff
// call) shouldn't read as an overdue alarm next to a checklist that shows
// it done.
function upcomingKeyDates(keyDates: ClientKeyDates) {
  const entries = Object.entries(keyDates) as [keyof ClientKeyDates, string | null][];
  return entries
    .filter(([, v]) => v !== null && daysUntil(v as string) >= 0)
    .map(([key, date]) => ({ key, date: date as string, label: KEY_DATE_LABELS[key] }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export default function ClientHomePage() {
  const { client, activeCycle, startOnboarding, launchSurvey, setClientStatus, setCycleStatus } = useClientCtx();
  const milestone = activeCycle ? getNextMilestone(activeCycle.keyDates) : null;
  const checklistPct = checklistProgress(activeCycle);
  const onboardingPct = onboardingProgress(activeCycle);
  const currentRate = responseRate(activeCycle);
  const dates = activeCycle ? upcomingKeyDates(activeCycle.keyDates) : [];

  const pastCycles = client.surveys.filter((s) => s.status === "completed");
  const mostRecentCompleted = getMostRecentCompletedCycle(client);
  const avgPastRate =
    pastCycles.length > 0
      ? Math.round(pastCycles.reduce((sum, c) => sum + (responseRate(c) ?? 0), 0) / pastCycles.length)
      : null;

  const activity = activeCycle
    ? [
        ...activeCycle.checklist
          .filter((c) => c.done && c.completedAt)
          .map((c) => ({ date: c.completedAt as string, label: c.label, by: c.completedBy })),
        ...activeCycle.onboarding
          .filter((s) => s.updatedAt)
          .map((s) => ({ date: s.updatedAt as string, label: `${s.label} → ${s.status.replace("_", " ")}`, by: null })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6)
    : [];

  const canStartOnboarding = !activeCycle || activeCycle.status === "onboarding";
  const onboardingEmailSent = !!activeCycle?.checklist.some((c) => c.key === "onboarding_email" && c.done);
  const canLaunch = activeCycle?.status === "onboarding" && checklistPct.pct === 100;

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        {!canStartOnboarding && !canLaunch && (
          <p className="text-[12px] text-slate-400">No pending onboarding or launch actions for this client right now.</p>
        )}
        {canStartOnboarding && (
          <button
            onClick={startOnboarding}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0f1923] text-white text-[12.5px] font-medium hover:bg-[#1a2733] transition-colors"
          >
            <Send size={13} />
            {activeCycle ? (onboardingEmailSent ? "Resend Onboarding Email" : "Send Onboarding Email") : "Start Client Onboarding"}
          </button>
        )}
        {canLaunch && activeCycle && (
          <button
            onClick={() => launchSurvey(activeCycle.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-[12.5px] font-medium hover:bg-emerald-700 transition-colors"
          >
            <Rocket size={13} />
            Mark Survey as Launched
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          {activeCycle && (
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-slate-400">Cycle status:</span>
              <select
                value={activeCycle.status}
                onChange={(e) => setCycleStatus(activeCycle.id, e.target.value as SurveyCycleStatus)}
                className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[12px] text-slate-600 focus:outline-none focus:border-slate-300 transition-colors"
              >
                {CYCLE_STATUS_ORDER.map((key) => (
                  <option key={key} value={key}>{CYCLE_STATUS_CONFIG[key].label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-slate-400">Client status:</span>
            <select
              value={client.status}
              onChange={(e) => setClientStatus(e.target.value as ClientStatus)}
              className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[12px] text-slate-600 focus:outline-none focus:border-slate-300 transition-colors"
            >
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
            <History size={15} className="text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{client.clientSince ? fmtDate(client.clientSince) : "—"}</p>
          <p className="text-xs text-slate-400 mt-0.5">{client.status === "prospect" ? "In Discussion Since" : "Client Since"}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center mb-3">
            <ClipboardList size={15} className="text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{client.surveys.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Survey Cycles Hosted</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <TrendingUp size={15} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{avgPastRate !== null ? `${avgPastRate}%` : "—"}</p>
          <p className="text-xs text-slate-400 mt-0.5">Avg. Historical Response Rate</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <CalendarClock size={15} className="text-amber-600" />
          </div>
          <p className={`text-2xl font-bold ${milestone?.overdue ? "text-red-600" : "text-slate-900"}`}>
            {milestone ? (milestone.overdue ? "Overdue" : `${milestone.days}d`) : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{milestone ? `Until ${milestone.label}` : "No Dates Scheduled"}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Key dates preview */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Upcoming Key Dates</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeCycle ? `${activeCycle.name} '${String(activeCycle.year).slice(2)} — kickoff through reporting delivery` : "No active survey cycle"}
              </p>
            </div>
            <Link href="./key-dates" className="flex items-center gap-1 text-[#4361ee] text-xs font-semibold hover:underline">
              Manage <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {dates.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[12.5px] text-slate-400">
                  {activeCycle ? "No upcoming dates set for this cycle." : "Start onboarding to schedule this client's next cycle."}
                </p>
              </div>
            ) : (
              dates.slice(0, 5).map((d) => (
                <div key={d.key} className="flex items-center justify-between px-5 py-3">
                  <p className="text-[12.5px] font-medium text-slate-700">{d.label}</p>
                  <div className="text-right">
                    <p className="text-[12.5px] text-slate-600">{fmtDate(d.date)}</p>
                    <p className="text-[10.5px] text-slate-400">in {daysUntil(d.date)}d</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Progress + notes */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-slate-900">Checklist</h3>
              <Link href="./checklist" className="text-[11px] text-[#4361ee] font-semibold hover:underline">View</Link>
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">{checklistPct.done}/{checklistPct.total} items complete</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#4361ee] transition-all" style={{ width: `${checklistPct.pct}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-slate-900">Onboarding</h3>
              <Link href="./onboarding" className="text-[11px] text-[#4361ee] font-semibold hover:underline">View</Link>
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">{onboardingPct.done}/{onboardingPct.total} steps approved</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${onboardingPct.pct}%` }} />
            </div>
          </div>

          {activeCycle && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-slate-900">Active Survey</h3>
                <Link href="./surveys" className="text-[11px] text-[#4361ee] font-semibold hover:underline">View</Link>
              </div>
              <p className="text-[12px] text-slate-600 mb-2.5">
                {activeCycle.name} &rsquo;{String(activeCycle.year).slice(2)}
                <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold border ${CYCLE_STATUS_CONFIG[activeCycle.status].badge}`}>
                  {CYCLE_STATUS_CONFIG[activeCycle.status].label}
                </span>
              </p>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${currentRate ?? 0}%` }} />
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1.5">
                {currentRate !== null ? `${currentRate}% response · ${activeCycle.submitted}/${activeCycle.totalInvited}` : "Not yet launched to contacts"}
              </p>
            </div>
          )}

          {!activeCycle && mostRecentCompleted && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Last Completed Survey</h3>
              <p className="text-[12px] text-slate-600 mb-2.5">{mostRecentCompleted.name} &rsquo;{String(mostRecentCompleted.year).slice(2)}</p>
              <p className="text-[10.5px] text-slate-400">
                {responseRate(mostRecentCompleted)}% final response · closed {fmtDate(mostRecentCompleted.closeDate)}
              </p>
            </div>
          )}

          {client.notes && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-2.5">
              <StickyNote size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-amber-800 leading-relaxed">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <ListChecks size={14} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
        </div>
        {activity.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[12.5px] text-slate-400">No activity recorded yet for this client.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <p className="text-[12.5px] text-slate-700">{a.label}</p>
                <p className="text-[11px] text-slate-400 shrink-0">
                  {fmtDate(a.date)}{a.by ? ` · ${a.by}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
