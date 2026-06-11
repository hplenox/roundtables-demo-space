"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  UserPlus, Play, Eye, Forward, CheckCircle2, Send, MailOpen,
  Pencil, Trash2, Plus, ChevronDown, Building2,
} from "lucide-react";
import { getActivityBySurvey, ACTIVITY_SUBSCRIBERS } from "@/lib/mock-activity";
import type { ActivityEntry, ActivityType, ActivitySubscriber } from "@/lib/mock-activity";

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  ActivityType,
  {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    color: string;
    bg: string;
  }
> = {
  registered: {
    label: "Account Registered",
    icon: UserPlus,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  survey_started: {
    label: "Survey Started",
    icon: Play,
    color: "text-[#00897b]",
    bg: "bg-[#00b8a9]/15",
  },
  accessed: {
    label: "Survey Accessed",
    icon: Eye,
    color: "text-slate-500",
    bg: "bg-slate-100",
  },
  forwarded: {
    label: "Forwarded",
    icon: Forward,
    color: "text-violet-600",
    bg: "bg-violet-100",
  },
  submitted: {
    label: "Submitted",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  invitation_sent: {
    label: "Invitation Sent",
    icon: Send,
    color: "text-[#00897b]",
    bg: "bg-[#00b8a9]/15",
  },
  invitation_opened: {
    label: "Email Opened",
    icon: MailOpen,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
};

// ─── Filter config ────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all",           label: "All",               types: null },
  { key: "submissions",   label: "Submissions",        types: ["submitted"] as ActivityType[] },
  { key: "invitations",   label: "Invitations",        types: ["invitation_sent", "invitation_opened"] as ActivityType[] },
  { key: "access",        label: "Access & Forwards",  types: ["accessed", "forwarded"] as ActivityType[] },
  { key: "registrations", label: "Registrations",      types: ["registered", "survey_started"] as ActivityType[] },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NOW = new Date("2026-06-11T12:00:00Z");

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = NOW.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getGroupLabel(iso: string): string {
  const date = new Date(iso);
  const diffD = Math.floor((NOW.getTime() - date.getTime()) / 86400000);

  if (diffD === 0) return "Today";
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return "Earlier this week";
  if (diffD < 14) return "Last week";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Subscriber Panel ─────────────────────────────────────────────────────────

function SubscriberPanel() {
  const [subscribers, setSubscribers] =
    useState<ActivitySubscriber[]>(ACTIVITY_SUBSCRIBERS);

  function toggleEnabled(id: string) {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  function removeSubscriber(id: string) {
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          Activity Subscribers
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-slate-700">{subscribers.length}</span>
          <button className="flex items-center gap-1 text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            <Plus size={13} strokeWidth={2.5} />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Subscriber rows */}
      {subscribers.length === 0 ? (
        <div className="px-5 py-5 text-center">
          <p className="text-[12.5px] text-slate-400">No subscribers yet. Add one to receive daily email updates.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {subscribers.map((sub) => (
            <div key={sub.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
              {/* Name */}
              <p className="w-36 shrink-0 text-[13.5px] font-semibold text-slate-800">{sub.name}</p>

              {/* Email */}
              <p className="flex-1 min-w-0 text-[13px] text-slate-500 truncate">{sub.email}</p>

              {/* Frequency */}
              <button className="flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-700 transition-colors shrink-0 group/freq">
                {sub.frequency}
                <ChevronDown size={11} className="text-slate-400 group-hover/freq:text-slate-600" />
              </button>

              {/* Enabled toggle */}
              <button
                onClick={() => toggleEnabled(sub.id)}
                className={`shrink-0 text-[13px] font-semibold w-16 text-left transition-colors ${
                  sub.enabled ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {sub.enabled ? "Enabled" : "Disabled"}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => removeSubscriber(sub.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const cfg = TYPE_CONFIG[entry.type];
  const Icon = cfg.icon;

  return (
    <div className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
      {/* Icon */}
      <div className={`shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center ${cfg.bg}`}>
        <Icon size={13} className={cfg.color} strokeWidth={2} />
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-slate-700 leading-snug">
          {entry.actorName ? (
            <>
              <strong className="text-slate-900 font-semibold">{entry.actorName}</strong>
              {entry.orgName && (
                <>
                  {" "}
                  <span className="text-slate-400">at</span>{" "}
                  <strong className="text-slate-900 font-semibold">{entry.orgName}</strong>
                </>
              )}
              {" "}
              {entry.action}
            </>
          ) : (
            entry.action
          )}
        </p>

        {/* Metadata chips */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
          {entry.metadata?.count !== undefined && (
            <span className="text-[11px] text-slate-400">{entry.metadata.count} recipients</span>
          )}
          {entry.metadata?.forwardedTo && (
            <span className="text-[11px] text-slate-400">→ {entry.metadata.forwardedTo}</span>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <span className="shrink-0 text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
        {formatRelativeTime(entry.timestamp)}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActivityLogPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const allEntries = useMemo(
    () =>
      getActivityBySurvey(surveyId ?? "").sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [surveyId]
  );

  const filtered = useMemo(() => {
    const filterCfg = FILTERS.find((f) => f.key === activeFilter);
    if (!filterCfg || !filterCfg.types) return allEntries;
    return allEntries.filter((e) => (filterCfg.types as ActivityType[]).includes(e.type));
  }, [allEntries, activeFilter]);

  // Group by date label
  const groups = useMemo(() => {
    const map = new Map<string, ActivityEntry[]>();
    const ORDER = ["Today", "Yesterday", "Earlier this week", "Last week"];

    for (const e of filtered) {
      const label = getGroupLabel(e.timestamp);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(e);
    }

    // Sort groups: known order first, then remaining (month labels) chronologically
    const knownGroups = ORDER.filter((l) => map.has(l)).map((l) => ({ label: l, items: map.get(l)! }));
    const otherGroups = [...map.entries()]
      .filter(([l]) => !ORDER.includes(l))
      .sort(([, a], [, b]) => new Date(b[0].timestamp).getTime() - new Date(a[0].timestamp).getTime())
      .map(([label, items]) => ({ label, items }));

    return [...knownGroups, ...otherGroups];
  }, [filtered]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return Object.fromEntries(
      FILTERS.map((f) => [
        f.key,
        f.types === null ? allEntries.length : allEntries.filter((e) => (f.types as ActivityType[]).includes(e.type)).length,
      ])
    ) as Record<FilterKey, number>;
  }, [allEntries]);

  return (
    <div className="space-y-5">

      {/* Subscriber panel */}
      <SubscriberPanel />

      {/* Log header + filter tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-4 pb-0 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 size={13} className="text-slate-400" />
              <p className="text-[11.5px] font-semibold text-slate-700">
                Survey Activity Log
              </p>
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-slate-100 text-slate-500 text-[9.5px] font-bold">
                {allEntries.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-end gap-0 -mb-px">
            {FILTERS.map((f) => {
              const count = tabCounts[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`
                    flex items-center gap-1.5 px-3.5 py-2.5 text-[12.5px] font-medium border-b-2 transition-all whitespace-nowrap
                    ${activeFilter === f.key
                      ? "border-[#00b8a9] text-[#00897b]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                    }
                  `}
                >
                  {f.label}
                  {count > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold ${
                      activeFilter === f.key ? "bg-[#00b8a9]/15 text-[#00897b]" : "bg-slate-100 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity feed */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <Eye size={18} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-semibold text-slate-500">No activity yet</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">Events will appear here as they happen</p>
          </div>
        ) : (
          groups.map(({ label, items }) => (
            <div key={label}>
              {/* Group header */}
              <div className="flex items-center gap-3 px-5 py-2 bg-slate-50/60 border-t border-slate-100">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide">
                  {label}
                </span>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10.5px] text-slate-300">
                  {items.length} event{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Entries */}
              <div className="divide-y divide-slate-50/80">
                {items.map((entry) => (
                  <ActivityRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
