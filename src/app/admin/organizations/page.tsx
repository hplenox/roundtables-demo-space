"use client";

import { useMemo, useRef, useState } from "react";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { ORG_REGISTRY, OrgRegistryRow } from "@/lib/mock-organizations";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Filter dropdown ────────────────────────────────────────────────────────

function FilterDropdown({
  label,
  activeCount,
  options,
  value,
  onChange,
}: {
  label: string;
  activeCount: number;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative"
      tabIndex={-1}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white text-[12.5px] font-medium text-gray-700 hover:border-gray-400 transition-colors"
      >
        <SlidersHorizontal size={12} className="text-gray-400" />
        {label}
        <span className="bg-gray-900 text-white text-[10px] font-bold rounded px-1.5 py-0.5 min-w-[16px] text-center leading-tight">
          {activeCount}
        </span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 min-w-[200px] bg-white rounded-md border border-gray-200 shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-gray-50 transition-colors ${
                value === opt.value ? "text-blue-600 font-semibold" : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Right rail ──────────────────────────────────────────────────────────

function TopActiveOrgsCard({ rows }: { rows: OrgRegistryRow[] }) {
  const top = [...rows]
    .filter((r) => r.status === "Active")
    .sort((a, b) => b.totalUsers - a.totalUsers)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-serif text-[15px] font-bold text-blue-600 mb-1">Top Active Organizations</h3>
      <span className="inline-block text-[11px] font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 mb-3">
        Last 30 Days
      </span>
      <div className="space-y-2">
        {top.map((row) => (
          <div key={row.orgId} className="flex items-center justify-between gap-2 text-[12.5px]">
            <span className="text-blue-600 font-medium truncate">{row.name}</span>
            <span className="shrink-0 bg-blue-50 text-blue-700 font-semibold rounded px-2 py-0.5 text-[11px] tabular-nums">
              {row.lpiScore !== null ? row.lpiScore.toFixed(3) : "N/A"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "Active" | "Archived";

export default function AdminOrganizationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ORG_REGISTRY.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      return row.name.toLowerCase().includes(q) || row.orgCode?.toLowerCase().includes(q);
    });
  }, [search, statusFilter]);

  const hasActiveFilters = statusFilter !== "all" || search.trim() !== "";
  function clearFilters() {
    setStatusFilter("all");
    setSearch("");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-[22px] font-bold text-gray-900">All Organizations</h2>
        <p className="text-[13px] text-gray-500 mt-1 max-w-2xl leading-relaxed">
          Every organization registered on the platform, with the org code it&rsquo;s most commonly invited under
          and its current LPI score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
        <div className="min-w-0 bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="font-serif text-[15px] font-semibold text-gray-900">Organizations</span>
            <span className="bg-gray-100 text-gray-600 text-[12px] font-semibold px-2 py-0.5 rounded">
              {ORG_REGISTRY.length}
            </span>
          </div>

          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5 flex-wrap">
            <FilterDropdown
              label="Status"
              value={statusFilter}
              activeCount={statusFilter === "all" ? 0 : 1}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "Active", label: "Active" },
                { value: "Archived", label: "Archived" },
              ]}
            />
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
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
            <div className="min-w-[600px]">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50/60 text-[13px] font-semibold text-gray-900">
                <div className="w-14 shrink-0">ID</div>
                <div className="flex-1 min-w-[140px]">Name</div>
                <div className="w-24 shrink-0">Org Code</div>
                <div className="w-20 shrink-0">LPI Score</div>
                <div className="w-28 shrink-0">Last Updated</div>
                <div className="w-24 shrink-0">Total Users</div>
                <div className="w-20 shrink-0">Status</div>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-[13px] text-gray-500">No organizations match your filter.</p>
                </div>
              ) : (
                filtered.map((row) => (
                  <div
                    key={row.orgId}
                    className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors text-[13px]"
                  >
                    <div className="w-14 shrink-0 text-gray-400 tabular-nums">{row.displayId}</div>
                    <div className="flex-1 min-w-[140px] text-blue-600 font-medium truncate" title={row.name}>
                      {row.name}
                    </div>
                    <div className="w-24 shrink-0 text-gray-600 tabular-nums">{row.orgCode ?? "—"}</div>
                    <div className="w-20 shrink-0 tabular-nums">
                      {row.lpiScore !== null ? (
                        <span className="text-violet-600 font-medium">{row.lpiScore.toFixed(3)}</span>
                      ) : (
                        <span className="text-violet-300 italic">N/A</span>
                      )}
                    </div>
                    <div className="w-28 shrink-0 text-gray-400">{formatDate(row.lastUpdated)}</div>
                    <div className="w-24 shrink-0 text-gray-700 tabular-nums">{row.totalUsers}</div>
                    <div className="w-20 shrink-0 text-gray-600">{row.status}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-center text-[11.5px] text-gray-400 py-3">
            {filtered.length} of {ORG_REGISTRY.length} organizations shown
          </p>
        </div>

        <TopActiveOrgsCard rows={ORG_REGISTRY} />
      </div>
    </div>
  );
}
