"use client";

import { useEffect, useRef, useState } from "react";
import {
  Lock, TrendingUp, Landmark, MapPin, Users, BadgeCheck,
  History, Bell, Bookmark, Share2, ChevronDown, Check, Copy, Mail, FileDown,
} from "lucide-react";
import type { InvitedOrg } from "@/types/survey";

function ownershipLabel(org: InvitedOrg): string {
  return org.type === "GP" ? "Privately held" : "Publicly reporting";
}

function employeeCount(org: InvitedOrg): number | null {
  if (!org.genderDemographics) return null;
  const wf = org.genderDemographics.workforce;
  return wf.men + wf.women;
}

function cohortBracket(n: number | null): string | null {
  if (n === null) return null;
  if (n <= 50) return "1–50";
  if (n <= 150) return "51–150";
  if (n <= 500) return "151–500";
  return "500+";
}

function verifiedDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─── Secondary action popover shell ────────────────────────────────────────────

function ActionPopover({
  label, icon: Icon, open, onToggle, children, width = "w-72", align = "left",
}: {
  label: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  width?: string;
  align?: "left" | "right";
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
          open ? "border-slate-400 bg-slate-50 text-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        <Icon size={13} />
        {label}
        <ChevronDown size={11} className={`text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div className={`absolute ${align === "left" ? "left-0" : "right-0"} top-9 z-50 ${width} bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden`}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main card ──────────────────────────────────────────────────────────────────

export default function ManagerProfileCard({ org }: { org: InvitedOrg }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [nudged, setNudged] = useState(false);
  const nudgeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (nudgeTimeout.current) clearTimeout(nudgeTimeout.current);
  }, []);

  if (!org.lpiScore || !org.benchmarks) return null;

  const empCount = employeeCount(org);
  const cohort = cohortBracket(empCount);
  const verified = verifiedDate(org.submissionDate);

  function sendNudge() {
    setNudged(true);
    nudgeTimeout.current = setTimeout(() => setNudged(false), 2500);
  }

  return (
    <>
      <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-[#0f1923] flex items-center justify-center shrink-0 shadow-md">
            <span className="text-[22px] font-black text-[#00b8a9] leading-none">
              {org.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Identity + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-bold text-slate-900 leading-tight mb-1.5">{org.name}</h1>

            <p className="text-[12.5px] text-slate-500 flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1"><Lock size={11} className="text-slate-400" />{ownershipLabel(org)}</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <TrendingUp size={11} className="text-slate-400" />
                AUM {org.aum}{org.aumBenchmarks && ` · ${org.aumBenchmarks.managerBracket} bracket`}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1"><Landmark size={11} className="text-slate-400" />{org.assetClass}</span>
            </p>

            <p className="text-[12.5px] text-slate-500 flex items-center gap-1.5 flex-wrap mt-1">
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-slate-400" />
                {org.headquarters}{org.geography?.region && ` · ${org.geography.region} Region`}
              </span>
              {empCount !== null && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1">
                    <Users size={11} className="text-slate-400" />
                    {empCount} employees{cohort && ` · ${cohort} cohort`}
                  </span>
                </>
              )}
            </p>

            {verified && (
              <p className="text-[11.5px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5">
                <BadgeCheck size={12} />
                Survey-verified profile · updated {verified}
              </p>
            )}
          </div>
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-2 flex-wrap mt-5">
        <ActionPopover label="Interaction history" icon={History} open={historyOpen} onToggle={() => setHistoryOpen((v) => !v)}>
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent activity</p>
          </div>
          <ul className="divide-y divide-slate-50">
            {[
              { label: "Survey submitted", date: org.submissionDate },
              { label: "Last activity recorded", date: org.lastActivity },
              { label: "Invited to survey", date: org.invitedDate },
            ].filter((e) => e.date).map((e) => (
              <li key={e.label} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-[12px] text-slate-600">{e.label}</span>
                <span className="text-[11px] text-slate-400 shrink-0">{e.date}</span>
              </li>
            ))}
          </ul>
        </ActionPopover>

        <button
          onClick={sendNudge}
          disabled={nudged}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
            nudged ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {nudged ? <Check size={13} /> : <Bell size={13} />}
          {nudged ? "Nudge sent" : "Nudge to update profile"}
        </button>

        <button
          onClick={() => setPinned((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
            pinned ? "border-[#00b8a9]/40 bg-[#00b8a9]/5 text-[#00897b]" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Bookmark size={13} fill={pinned ? "currentColor" : "none"} />
          {pinned ? "Pinned" : "Pin to my lists"}
        </button>

        <ActionPopover label="Share" icon={Share2} open={shareOpen} onToggle={() => setShareOpen((v) => !v)} width="w-56" align="right">
          <div className="py-1">
            {[
              { label: "Copy link", icon: Copy },
              { label: "Email this report", icon: Mail },
              { label: "Export as PDF", icon: FileDown },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setShareOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[12.5px] text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Icon size={13} className="text-slate-400" />
                {label}
              </button>
            ))}
          </div>
        </ActionPopover>
      </div>
    </>
  );
}
