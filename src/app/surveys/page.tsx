"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_SURVEYS } from "@/lib/mock-data";
import { Survey, SurveyStatus } from "@/types/survey";
import { ArrowRight, Clock, CheckCircle2, Circle, Plus, Filter } from "lucide-react";

const TAB_CONFIG = [
  { key: "active",   label: "Current",  count: MOCK_SURVEYS.filter((s) => s.status === "active").length },
  { key: "upcoming", label: "Upcoming", count: MOCK_SURVEYS.filter((s) => s.status === "upcoming").length },
  { key: "closed",   label: "Past",     count: MOCK_SURVEYS.filter((s) => s.status === "closed").length },
] as const;

function StatusPill({ status }: { status: SurveyStatus }) {
  const map = {
    active:   { label: "Active",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    upcoming: { label: "Upcoming", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    closed:   { label: "Closed",   cls: "bg-slate-100 text-slate-500 border-slate-200" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${cls}`}>
      {label}
    </span>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4361ee] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-slate-400 tabular-nums w-7 text-right">{pct}%</span>
    </div>
  );
}

function SurveyRow({ survey, index }: { survey: Survey; index: number }) {
  const responseRate = survey.totalInvited === 0 ? 0 : Math.round((survey.submitted / survey.totalInvited) * 100);

  return (
    <Link
      href={`/surveys/${survey.id}`}
      className="group block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="
        flex items-center gap-5 px-5 py-4
        border-b border-slate-100 last:border-0
        hover:bg-slate-50/80 transition-colors duration-150
        cursor-pointer
      ">
        {/* Survey icon / year badge */}
        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white tracking-tight leading-none">
            {String(survey.year).slice(2)}
          </span>
        </div>

        {/* Name + org */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5">
            <p className="text-[13.5px] font-semibold text-slate-800 truncate group-hover:text-[#3147af] transition-colors">
              {survey.name}
            </p>
            <StatusPill status={survey.status} />
          </div>
          <p className="text-[12px] text-slate-400 truncate">
            {survey.hostOrg} · {survey.assetClasses.slice(0, 2).join(", ")}
            {survey.assetClasses.length > 2 && ` +${survey.assetClasses.length - 2}`}
          </p>
        </div>

        {/* Stats strip */}
        <div className="hidden md:flex items-center gap-6 shrink-0">
          {/* Invited */}
          <div className="text-center w-14">
            <p className="text-[17px] font-semibold text-slate-800 tabular-nums leading-tight">{survey.totalInvited}</p>
            <p className="text-[10.5px] text-slate-400">Invited</p>
          </div>
          {/* Response rate + mini bar */}
          <div className="w-28">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-slate-500">Response rate</p>
              <p className="text-[11px] font-semibold text-slate-700 tabular-nums">{responseRate}%</p>
            </div>
            <ProgressBar value={survey.submitted} total={survey.totalInvited} />
          </div>
          {/* Due / closed */}
          <div className="w-28 text-right">
            {survey.status === "active" && survey.daysRemaining !== null && (
              <div className="flex items-center justify-end gap-1 text-[11.5px] text-slate-500">
                <Clock size={11} />
                <span>{survey.daysRemaining}d remaining</span>
              </div>
            )}
            {survey.status === "upcoming" && (
              <div className="flex items-center justify-end gap-1 text-[11.5px] text-amber-600">
                <Circle size={11} />
                <span>Starts {survey.startDate}</span>
              </div>
            )}
            {survey.status === "closed" && (
              <div className="flex items-center justify-end gap-1 text-[11.5px] text-slate-400">
                <CheckCircle2 size={11} />
                <span>Closed</span>
              </div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight
          size={15}
          className="shrink-0 text-slate-300 group-hover:text-[#4361ee] group-hover:translate-x-0.5 transition-all duration-150"
        />
      </div>
    </Link>
  );
}

export default function SurveysPage() {
  const [activeTab, setActiveTab] = useState<SurveyStatus>("active");
  const filtered = MOCK_SURVEYS.filter((s) => s.status === activeTab);

  return (
    <div className="min-h-full bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-0">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-1.5">
                Surveys
              </p>
              <h1 className="text-[22px] font-semibold text-slate-900 leading-tight">
                Survey Dashboard
              </h1>
              <p className="text-[13px] text-slate-500 mt-1">
                Manage DEI surveys across your LP &amp; GP network
              </p>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter size={13} />
                Filter
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1923] text-[12px] font-medium text-white hover:bg-slate-800 transition-colors">
                <Plus size={13} />
                New Survey
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-end gap-0">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as SurveyStatus)}
                className={`
                  flex items-center gap-2 px-5 py-3 text-[13px] font-medium
                  border-b-2 transition-all duration-150 -mb-px
                  ${activeTab === tab.key
                    ? "border-[#4361ee] text-[#3147af]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                  }
                `}
              >
                {tab.label}
                <span className={`
                  inline-flex items-center justify-center w-5 h-5 rounded-full text-[10.5px] font-semibold
                  ${activeTab === tab.key ? "bg-[#4361ee]/15 text-[#3147af]" : "bg-slate-100 text-slate-500"}
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Column headers */}
          <div className="flex items-center gap-5 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
            <div className="w-10 shrink-0" />
            <p className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Survey</p>
            <div className="hidden md:flex items-center gap-6 shrink-0">
              <p className="w-14 text-center text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Invited</p>
              <p className="w-28 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Progress</p>
              <p className="w-28 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Timeline</p>
            </div>
            <div className="w-4 shrink-0" />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <ClipboardIcon />
              </div>
              <p className="text-[13px] font-medium text-slate-600">No surveys found</p>
              <p className="text-[12px] text-slate-400 mt-1">There are no {activeTab} surveys at this time.</p>
            </div>
          ) : (
            filtered.map((survey, i) => <SurveyRow key={survey.id} survey={survey} index={i} />)
          )}
        </div>

        {/* Summary footer */}
        <p className="text-center text-[11.5px] text-slate-400 mt-4">
          {filtered.length} survey{filtered.length !== 1 ? "s" : ""} · {MOCK_SURVEYS.reduce((a, s) => a + s.totalInvited, 0)} total organizations invited
        </p>
      </div>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
  );
}
