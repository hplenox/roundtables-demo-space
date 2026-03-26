"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { getOrgsBySurveyId } from "@/lib/mock-data";
import { InvitedOrg } from "@/types/survey";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";

type StatusFilter = "all" | "submitted" | "in_progress" | "not_started";

const STATUS_CONFIG = {
  submitted:   { label: "Submitted",   dot: "bg-emerald-400", text: "text-emerald-700", badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  in_progress: { label: "In Progress", dot: "bg-amber-400",   text: "text-amber-700",   badge: "bg-amber-50 border-amber-200 text-amber-700" },
  not_started: { label: "Not Started", dot: "bg-slate-300",   text: "text-slate-500",   badge: "bg-slate-50 border-slate-200 text-slate-500" },
};

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2.5 w-36">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: value === 100 ? "#00b8a9" : value > 0 ? "#fbbf24" : "transparent",
          }}
        />
      </div>
      <span className="text-[11.5px] text-slate-500 tabular-nums w-8 text-right">{value}%</span>
    </div>
  );
}

function LpiScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[12px] text-slate-300">—</span>;
  const color = score >= 8 ? "text-emerald-600" : score >= 6.5 ? "text-amber-600" : "text-red-600";
  return (
    <span className={`text-[13px] font-semibold tabular-nums ${color}`}>{score}</span>
  );
}

function OrgRow({ org, surveyId }: { org: InvitedOrg; surveyId: string }) {
  const st = STATUS_CONFIG[org.status];
  return (
    <Link href={`/surveys/${surveyId}/organizations/${org.id}`} className="group block">
      <div className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
        {/* Org name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-slate-600">
                {org.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <p className="text-[13px] font-semibold text-slate-800 group-hover:text-[#00897b] transition-colors truncate">
              {org.name}
            </p>
            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              {org.type}
            </span>
          </div>
          <p className="text-[11.5px] text-slate-400 ml-8 truncate">
            {org.contactName} · {org.assetClass} · {org.location}
          </p>
        </div>

        {/* AUM */}
        <div className="hidden xl:block w-16 text-right">
          <p className="text-[12.5px] font-medium text-slate-700">{org.aum}</p>
          <p className="text-[10.5px] text-slate-400">AUM</p>
        </div>

        {/* LPI Score */}
        <div className="hidden lg:block w-16 text-center">
          <LpiScore score={org.lpiScore} />
          {org.lpiScore !== null && <p className="text-[10px] text-slate-400">LPI Score</p>}
        </div>

        {/* Progress */}
        <div className="hidden sm:block">
          <ProgressCell value={org.progress} />
        </div>

        {/* Status badge */}
        <div className="w-24 text-right">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${st.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>

        {/* Last activity */}
        <div className="hidden lg:block w-24 text-right">
          <p className="text-[11.5px] text-slate-400">{org.lastActivity ?? "No activity"}</p>
        </div>

        {/* Arrow */}
        <ArrowRight
          size={14}
          className="shrink-0 text-slate-300 group-hover:text-[#00b8a9] group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </Link>
  );
}

export default function OrganizationsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const allOrgs = getOrgsBySurveyId(surveyId);

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = allOrgs.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch = !search || o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.contactName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: allOrgs.length,
    submitted: allOrgs.filter((o) => o.status === "submitted").length,
    in_progress: allOrgs.filter((o) => o.status === "in_progress").length,
    not_started: allOrgs.filter((o) => o.status === "not_started").length,
  };

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "submitted", "in_progress", "not_started"] as StatusFilter[]).map((key) => {
          const isAll = key === "all";
          const cfg = isAll ? null : STATUS_CONFIG[key as keyof typeof STATUS_CONFIG];
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
                border transition-all duration-150
                ${active
                  ? "bg-[#0f1923] border-[#0f1923] text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
              {isAll ? "All Organizations" : cfg!.label}
              <span className={`text-[10.5px] px-1 rounded ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                {counts[key]}
              </span>
            </button>
          );
        })}

        {/* Search */}
        <div className="ml-auto relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              h-8 pl-8 pr-3 w-52 rounded-lg
              bg-white border border-slate-200
              text-[12.5px] text-slate-700 placeholder:text-slate-400
              focus:outline-none focus:border-slate-300
              transition-all duration-150
            "
          />
        </div>
        <button className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 text-[12px]">
          <SlidersHorizontal size={13} />
          Sort
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Column headers */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Organization</div>
          <div className="hidden xl:block w-16 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">AUM</div>
          <div className="hidden lg:block w-16 text-center text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">LPI</div>
          <div className="hidden sm:block w-36 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Progress</div>
          <div className="w-24 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
          <div className="hidden lg:block w-24 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Last Activity</div>
          <div className="w-4" />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[13px] text-slate-500">No organizations match your filter.</p>
          </div>
        ) : (
          filtered.map((org) => <OrgRow key={org.id} org={org} surveyId={surveyId} />)
        )}
      </div>

      <p className="text-center text-[11.5px] text-slate-400">
        {filtered.length} of {allOrgs.length} organizations shown
      </p>
    </div>
  );
}
