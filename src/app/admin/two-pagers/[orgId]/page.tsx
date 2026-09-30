"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Download, Search,
  Building2, Calendar, FileText, Clock, Info, Keyboard,
} from "lucide-react";
import {
  ADMIN_TWO_PAGERS_AVAILABLE,
  getAdminTwoPager,
  getTwoPagerNeighbors,
  surveyLabel,
  type AdminTwoPagerEntry,
} from "@/lib/admin-two-pager";
import { formatLongDate } from "@/lib/format-date";
import AiInsightsBox from "@/components/report/AiInsightsBox";
import BenchmarksCard from "@/components/report/BenchmarksCard";
import ManagerProfileCard from "@/components/report/ManagerProfileCard";
import WorkplacePoliciesCard from "@/components/report/WorkplacePoliciesCard";
import GenderDemographicsSection from "@/components/report/GenderDemographicsSection";
import RacialDemographicsSection from "@/components/report/RacialDemographicsSection";

function ReportSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-slate-100 bg-slate-50/60">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">{children}</span>
    </div>
  );
}

// ─── Organization switcher ────────────────────────────────────────────────
// Jumping straight to a named organization, for when paging one at a time is
// the slow way there.

function OrgSwitcher({
  current,
  onPick,
}: {
  current: AdminTwoPagerEntry;
  onPick: (orgId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_TWO_PAGERS_AVAILABLE;
    return ADMIN_TWO_PAGERS_AVAILABLE.filter(
      (e) => e.name.toLowerCase().includes(q) || e.orgCode?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div
      className="relative min-w-0 flex-1"
      tabIndex={-1}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) close();
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 max-w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
      >
        <Building2 size={13} className="text-slate-400 shrink-0" />
        <span className="text-[13px] font-semibold text-slate-800 truncate">{current.name}</span>
        <ChevronDown size={13} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-50 w-[340px] max-w-[88vw] bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="relative border-b border-slate-100">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump to organization…"
              className="w-full h-9 pl-8 pr-3 text-[12.5px] text-slate-700 placeholder:text-slate-400 placeholder:italic focus:outline-none"
            />
          </div>
          <div className="max-h-[320px] overflow-y-auto py-1">
            {matches.length === 0 ? (
              <p className="px-3 py-4 text-center text-[12px] text-slate-400">No organization matches.</p>
            ) : (
              matches.map((e) => (
                <button
                  key={e.orgId}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onPick(e.orgId);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                    e.orgId === current.orgId ? "bg-blue-50/60" : ""
                  }`}
                >
                  <span className={`flex-1 min-w-0 truncate text-[12.5px] ${
                    e.orgId === current.orgId ? "font-semibold text-blue-700" : "text-slate-700"
                  }`}>
                    {e.name}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-violet-600 tabular-nums">
                    {e.lpiScore?.toFixed(3)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AdminTwoPagerViewerPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const router = useRouter();
  const entry = getAdminTwoPager(orgId);
  const neighbors = getTwoPagerNeighbors(orgId);
  const [sourceOpen, setSourceOpen] = useState(false);

  const prevId = neighbors.prev?.orgId;
  const nextId = neighbors.next?.orgId;

  // ← / → page through the rotation without leaving the viewer.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowLeft" && prevId) router.push(`/admin/two-pagers/${prevId}`);
      if (e.key === "ArrowRight" && nextId) router.push(`/admin/two-pagers/${nextId}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, router]);

  if (!entry) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <p className="text-[14px] font-semibold text-slate-700 mb-1">Organization not found</p>
        <p className="text-[13px] text-slate-400 mb-4">
          No organization with this ID is registered on the platform.
        </p>
        <Link href="/admin/two-pagers" className="text-[12.5px] font-medium text-blue-600 hover:underline">
          ← Back to all 2-pagers
        </Link>
      </div>
    );
  }

  const { org, source } = entry;

  if (!org || !source) {
    return (
      <div className="max-w-xl mx-auto px-6 pt-10 space-y-4">
        <Link
          href="/admin/two-pagers"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={13} /> All 2-pagers
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <FileText size={22} className="mx-auto text-slate-300 mb-3" />
          <p className="text-[14px] font-semibold text-slate-700 mb-1">
            No 2-pager for {entry.name}
          </p>
          <p className="text-[13px] text-slate-400 max-w-sm mx-auto leading-relaxed">
            This organization has no completed survey submission on record, so there is nothing to
            score or benchmark yet. The 2-pager appears here as soon as it submits a response.
          </p>
          <Link
            href={`/admin/organizations/${entry.orgId}`}
            className="inline-block mt-4 text-[12.5px] font-medium text-blue-600 hover:underline"
          >
            View organization record →
          </Link>
        </div>
      </div>
    );
  }

  const benchmarkPools = [
    { key: "universe",   data: org.benchmarks!.universe },
    { key: "portfolio",  data: org.benchmarks!.portfolio },
    { key: "assetClass", data: org.benchmarks!.assetClass },
  ];

  return (
    <div>
      {/* Sticky toggle bar — the whole point of this screen: run the list
          without going back out to Organizations between each one. */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 py-2 flex items-center gap-2.5">
          <Link
            href="/admin/two-pagers"
            className="flex items-center gap-1.5 shrink-0 text-[12px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
            title="Back to all 2-pagers"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">All</span>
          </Link>

          <span className="w-px h-5 bg-slate-200 shrink-0" />

          <OrgSwitcher current={entry} onPick={(id) => router.push(`/admin/two-pagers/${id}`)} />

          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/admin/two-pagers/${neighbors.prev?.orgId ?? entry.orgId}`}
              title={neighbors.prev ? `Previous — ${neighbors.prev.name} (←)` : "Previous"}
              className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft size={14} />
            </Link>
            <span className="px-1.5 text-[11.5px] font-semibold text-slate-500 tabular-nums whitespace-nowrap">
              {neighbors.position} / {neighbors.total}
            </span>
            <Link
              href={`/admin/two-pagers/${neighbors.next?.orgId ?? entry.orgId}`}
              title={neighbors.next ? `Next — ${neighbors.next.name} (→)` : "Next"}
              className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <ChevronRight size={14} />
            </Link>
          </div>

          <span
            className="hidden lg:flex items-center gap-1 shrink-0 text-[11px] text-slate-400"
            title="Use the arrow keys to page through organizations"
          >
            <Keyboard size={12} /> ← →
          </span>

          <button className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1923] text-[12px] text-white font-medium hover:bg-slate-800 transition-colors">
            <Download size={13} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50 pb-10">
        {/* Provenance — an admin opening this cold needs to know which
            submission the numbers came from before trusting them. */}
        <div className="max-w-5xl mx-auto px-6 pt-5">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm px-4 py-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={14} className="text-[#00b8a9] shrink-0" />
                <p className="text-[12.5px] text-slate-600 min-w-0">
                  Built from {entry.name}&rsquo;s latest submission —{" "}
                  <span className="font-semibold text-slate-800">{surveyLabel(source)}</span>{" "}
                  <span className="text-slate-400">· hosted by {source.hostOrg}</span>
                </p>
              </div>
              <button
                onClick={() => setSourceOpen((v) => !v)}
                className="shrink-0 flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Info size={12} />
                {sourceOpen ? "Hide source" : "Source details"}
              </button>
            </div>

            {sourceOpen && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 mt-3 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <Calendar size={12} className="text-slate-400" />
                  Submitted: <span className="font-semibold text-slate-800">{formatLongDate(source.submittedDate)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <Building2 size={12} className="text-slate-400" />
                  Filed by: <span className="font-semibold text-slate-800">{source.filedBy}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <Clock size={12} className="text-slate-400" />
                  Cycles on record: <span className="font-semibold text-slate-800">{source.cyclesOnRecord}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  Org code: <span className="font-semibold text-slate-800 tabular-nums">{entry.orgCode ?? "—"}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <AiInsightsBox org={org} className="max-w-5xl mx-auto px-6 pt-4 print:hidden" />

        <div className="max-w-5xl mx-auto px-6 py-5 space-y-5">
          <ReportSection>
            <SectionLabel>Section 1 · Organization Overview</SectionLabel>
            <div className="p-6">
              <ManagerProfileCard org={org} />
            </div>
          </ReportSection>

          <ReportSection>
            <SectionLabel>Section 2 · Benchmarks</SectionLabel>
            <div className="p-6">
              <BenchmarksCard org={org} benchmarkPools={benchmarkPools} />
            </div>
          </ReportSection>

          <ReportSection>
            <SectionLabel>Section 3 · Workplace Policies</SectionLabel>
            <div className="p-6">
              <WorkplacePoliciesCard />
            </div>
          </ReportSection>

          {org.genderDemographics && (
            <ReportSection>
              <SectionLabel>Section 4 · Gender Diversity Demographics</SectionLabel>
              <div className="p-6">
                <GenderDemographicsSection
                  ownership={org.genderDemographics.ownership}
                  leadership={org.genderDemographics.leadership}
                  workforce={org.genderDemographics.workforce}
                />
              </div>
            </ReportSection>
          )}

          {org.racialDemographics && (
            <ReportSection>
              <SectionLabel>Section 5 · Racial Diversity Demographics</SectionLabel>
              <div className="p-6">
                <RacialDemographicsSection data={org.racialDemographics} />
              </div>
            </ReportSection>
          )}
        </div>

        {/* Bottom pager — so a long scroll doesn't mean scrolling back up. */}
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between gap-3 print:hidden">
          {neighbors.prev ? (
            <Link
              href={`/admin/two-pagers/${neighbors.prev.orgId}`}
              className="flex items-center gap-2 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              <ChevronLeft size={14} className="text-slate-400 shrink-0" />
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Previous</span>
                <span className="block text-[12.5px] font-semibold text-slate-700 truncate">{neighbors.prev.name}</span>
              </span>
            </Link>
          ) : <span />}

          {neighbors.next ? (
            <Link
              href={`/admin/two-pagers/${neighbors.next.orgId}`}
              className="flex items-center gap-2 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors text-right"
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Next</span>
                <span className="block text-[12.5px] font-semibold text-slate-700 truncate">{neighbors.next.name}</span>
              </span>
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
