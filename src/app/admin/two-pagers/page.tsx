"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Search, X, ArrowRight } from "lucide-react";
import { ADMIN_TWO_PAGERS, ADMIN_TWO_PAGERS_AVAILABLE, surveyLabel } from "@/lib/admin-two-pager";
import { formatShortDate } from "@/lib/format-date";

export default function AdminTwoPagersPage() {
  const [search, setSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ADMIN_TWO_PAGERS.filter((e) => {
      if (availableOnly && !e.org) return false;
      if (!q) return true;
      return e.name.toLowerCase().includes(q) || e.orgCode?.toLowerCase().includes(q);
    });
  }, [search, availableOnly]);

  const first = ADMIN_TWO_PAGERS_AVAILABLE[0];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-[22px] font-bold text-gray-900">Organization 2-Pagers</h2>
          <p className="text-[13px] text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Every registered organization&rsquo;s manager 2-pager, built from its most recent survey
            submission — no survey cycle to pick first. Open one in a new tab, then use the switcher
            or the arrow keys to run the whole list without coming back here.
          </p>
        </div>
        {first && (
          <Link
            href={`/admin/two-pagers/${first.orgId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-[12.5px] font-semibold hover:bg-blue-700 transition-colors"
          >
            Start with {first.name} <ArrowRight size={13} />
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="font-serif text-[15px] font-semibold text-gray-900">2-Pagers</span>
          <span className="bg-gray-100 text-gray-600 text-[12px] font-semibold px-2 py-0.5 rounded">
            {ADMIN_TWO_PAGERS_AVAILABLE.length} available
          </span>
          <span className="text-[12px] text-gray-400">of {ADMIN_TWO_PAGERS.length} organizations</span>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setAvailableOnly((v) => !v)}
            className={`px-3 py-1.5 rounded-md border text-[12.5px] font-medium transition-colors ${
              availableOnly
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            Available only
          </button>
          <button
            type="button"
            onClick={() => {
              setAvailableOnly(false);
              setSearch("");
            }}
            disabled={!availableOnly && search.trim() === ""}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-[12.5px] font-medium text-gray-400 disabled:opacity-50 disabled:pointer-events-none hover:border-gray-300 hover:text-gray-600 transition-colors"
          >
            <X size={12} /> Clear
          </button>
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search organizations or org codes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 w-64 rounded-md bg-white border border-gray-300 text-[12.5px] text-gray-700 placeholder:text-gray-400 placeholder:italic focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50/60 text-[13px] font-semibold text-gray-900">
              <div className="flex-1 min-w-[160px]">Organization</div>
              <div className="w-20 shrink-0">LPI Score</div>
              <div className="flex-1 min-w-[180px]">Latest submission</div>
              <div className="w-28 shrink-0">Submitted</div>
              <div className="w-28 shrink-0 text-right">2-Pager</div>
            </div>

            {rows.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[13px] text-gray-500">No organizations match your filter.</p>
              </div>
            ) : (
              rows.map((e) => (
                <div
                  key={e.orgId}
                  className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors text-[13px]"
                >
                  <div className="flex-1 min-w-[160px]">
                    <Link
                      href={`/admin/organizations/${e.orgId}`}
                      className="text-blue-600 font-medium truncate hover:underline block"
                      title={e.name}
                    >
                      {e.name}
                    </Link>
                  </div>
                  <div className="w-20 shrink-0 tabular-nums">
                    {e.lpiScore !== null ? (
                      <span className="text-violet-600 font-medium">{e.lpiScore.toFixed(3)}</span>
                    ) : (
                      <span className="text-violet-300 italic">N/A</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-[180px] text-gray-600 truncate">
                    {e.source ? surveyLabel(e.source) : (
                      <span className="text-gray-400 italic">No submission on record</span>
                    )}
                  </div>
                  <div className="w-28 shrink-0 text-gray-400">
                    {e.source ? formatShortDate(e.source.submittedDate) : "—"}
                  </div>
                  <div className="w-28 shrink-0 flex justify-end">
                    {e.org ? (
                      <Link
                        href={`/admin/two-pagers/${e.orgId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-[12px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <FileText size={11} /> View <ExternalLink size={10} />
                      </Link>
                    ) : (
                      <span className="text-[12px] text-gray-300">—</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="text-center text-[11.5px] text-gray-400 py-3">
          {rows.length} of {ADMIN_TWO_PAGERS.length} organizations shown
        </p>
      </div>
    </div>
  );
}
