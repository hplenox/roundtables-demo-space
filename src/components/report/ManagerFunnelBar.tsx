"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import { pctColor, ordinal } from "@/components/report/benchmarkFormat";

interface FunnelOrg {
  id: string;
  name: string;
  lpiScore: number | null;
  assetClass: string;
  percentile: number | null;
}

export default function ManagerFunnelBar({
  surveyId,
  currentOrgId,
  orgs,
}: {
  surveyId: string;
  currentOrgId: string;
  orgs: FunnelOrg[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const currentIdx = orgs.findIndex((o) => o.id === currentOrgId);
  const prevOrg = currentIdx > 0 ? orgs[currentIdx - 1] : null;
  const nextOrg = currentIdx < orgs.length - 1 ? orgs[currentIdx + 1] : null;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (open) return;
      if (e.altKey && e.key === "ArrowLeft" && prevOrg) navigate(prevOrg.id);
      if (e.altKey && e.key === "ArrowRight" && nextOrg) navigate(nextOrg.id);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prevOrg, nextOrg, surveyId]);

  function navigate(id: string) {
    setOpen(false);
    setSearch("");
    router.push(`/surveys/${surveyId}/organizations/${id}/report`);
  }

  const filtered = orgs.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
      {/* Left: position in portfolio */}
      <div className="flex items-center gap-2 min-w-0">
        <Briefcase size={15} className="text-slate-400 shrink-0" />
        <p className="text-[13px] text-slate-500 truncate">
          Manager <strong className="font-bold text-slate-800">{currentIdx + 1} of {orgs.length}</strong>{" "}
          in your organization&apos;s portfolio
        </p>
      </div>

      {/* Right: search + prev/next */}
      <div className="flex items-center gap-2 shrink-0" ref={wrapRef}>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 h-9 w-64 px-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors text-left"
          >
            <Search size={13} className="text-slate-400 shrink-0" />
            <span className="text-[12.5px] text-slate-400 truncate">Search managers in your portfolio…</span>
          </button>

          {open && (
            <div className="absolute right-0 top-10 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
                <Search size={13} className="text-slate-400 shrink-0" />
                <input
                  ref={searchRef}
                  autoFocus
                  type="text"
                  placeholder="Search managers in your portfolio…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <ul className="max-h-72 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-4 py-3 text-[12px] text-slate-400 text-center">No managers found</li>
                ) : (
                  filtered.map((o, i) => {
                    const isCurrent = o.id === currentOrgId;
                    return (
                      <li key={o.id}>
                        <button
                          onClick={() => !isCurrent && navigate(o.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            isCurrent ? "bg-[#00b8a9]/8 cursor-default" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="shrink-0 w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-[12.5px] font-semibold truncate ${isCurrent ? "text-[#00897b]" : "text-slate-800"}`}>
                                {o.name}
                              </p>
                              {isCurrent && (
                                <span className="shrink-0 text-[9px] font-bold text-[#00b8a9] uppercase tracking-wide">current</span>
                              )}
                            </div>
                            <p className="text-[10.5px] text-slate-400 truncate">{o.assetClass}</p>
                          </div>
                          <span className="shrink-0 text-[12px] font-bold tabular-nums" style={{ color: pctColor(o.percentile) }}>
                            {o.percentile !== null ? ordinal(o.percentile) : "—"}
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              <div className="px-3 py-2 border-t border-slate-100 flex items-center gap-1.5 bg-slate-50/60">
                <span className="text-[10px] text-slate-400">{orgs.length} managers in portfolio</span>
                <span className="ml-auto text-[9.5px] text-slate-300 font-mono">Alt+← →</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => prevOrg && navigate(prevOrg.id)}
          disabled={!prevOrg}
          title={prevOrg ? `${prevOrg.name} (Alt+←)` : undefined}
          className={`flex items-center gap-1 h-9 px-3.5 rounded-lg border text-[12.5px] font-semibold transition-colors ${
            prevOrg
              ? "border-slate-300 text-slate-700 hover:bg-slate-50"
              : "border-slate-200 text-slate-300 cursor-not-allowed"
          }`}
        >
          <ChevronLeft size={14} strokeWidth={2.25} />
          Prev
        </button>
        <button
          onClick={() => nextOrg && navigate(nextOrg.id)}
          disabled={!nextOrg}
          title={nextOrg ? `${nextOrg.name} (Alt+→)` : undefined}
          className={`flex items-center gap-1 h-9 px-3.5 rounded-lg border text-[12.5px] font-semibold transition-colors ${
            nextOrg
              ? "border-slate-300 text-slate-700 hover:bg-slate-50"
              : "border-slate-200 text-slate-300 cursor-not-allowed"
          }`}
        >
          Next manager
          <ChevronRight size={14} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
