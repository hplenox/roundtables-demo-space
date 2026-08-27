"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, AlertTriangle } from "lucide-react";
import { ORG_CODES, INTEGRITY_CONTACTS, isStaleName } from "@/lib/mock-contacts-management";
import { getOrgById } from "@/lib/mock-org-associations";

export default function AdminOrganizationCodesPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ORG_CODES;
    return ORG_CODES.filter(
      (c) =>
        c.code.includes(q) ||
        c.staticName.toLowerCase().includes(q) ||
        getOrgById(c.matchedOrgId)?.name.toLowerCase().includes(q) ||
        c.hostOrg.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-[22px] font-bold text-gray-900">All Organization Codes</h2>
        <p className="text-[13px] text-gray-500 mt-1 max-w-2xl leading-relaxed">
          The invite-time codes hosts assign to each organization. Each code caches a display name at creation and
          resolves to a matched organization — the two can drift over time.{" "}
          <Link href="/admin/contacts-management" className="text-blue-600 font-medium hover:underline">
            Review drift flags in Contacts Management →
          </Link>
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="font-serif text-[15px] font-semibold text-gray-900">Organization Codes</span>
          <span className="bg-gray-100 text-gray-600 text-[12px] font-semibold px-2 py-0.5 rounded">
            {ORG_CODES.length}
          </span>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search code, cached name, matched org, or host…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 w-72 rounded-md bg-white border border-gray-300 text-[12.5px] text-gray-700 placeholder:text-gray-400 placeholder:italic focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50/60 text-[13px] font-semibold text-gray-900">
              <div className="w-20 shrink-0">Code</div>
              <div className="flex-1 min-w-[150px]">Cached Name</div>
              <div className="flex-1 min-w-[150px]">Matched Org</div>
              <div className="w-28 shrink-0">Host</div>
              <div className="w-20 shrink-0">Contacts</div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-[13px] text-gray-500">No org codes match your search.</p>
              </div>
            ) : (
              filtered.map((c) => {
                const matchedOrg = getOrgById(c.matchedOrgId);
                const stale = isStaleName(c);
                const contactCount = INTEGRITY_CONTACTS.filter((ic) => ic.orgCodeId === c.id).length;
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors text-[13px]"
                  >
                    <div className="w-20 shrink-0 text-gray-600 tabular-nums">{c.code}</div>
                    <div className="flex-1 min-w-[150px] truncate" title={c.staticName}>
                      {stale ? (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <AlertTriangle size={11} className="shrink-0" />
                          {c.staticName}
                        </span>
                      ) : (
                        <span className="text-gray-700">{c.staticName}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-[150px] text-blue-600 font-medium truncate" title={matchedOrg?.name}>
                      {matchedOrg?.name ?? "—"}
                    </div>
                    <div className="w-28 shrink-0 text-gray-500 truncate">{c.hostOrg}</div>
                    <div className="w-20 shrink-0 text-gray-500 tabular-nums">{contactCount}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <p className="text-center text-[11.5px] text-gray-400 py-3">
          {filtered.length} of {ORG_CODES.length} org codes shown
        </p>
      </div>
    </div>
  );
}
