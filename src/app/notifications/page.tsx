"use client";

import { useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Forward,
  Lock,
  Users,
  ExternalLink,
  BellOff,
  Circle,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-notifications";
import type { Notification, NotificationType } from "@/types/notification";

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    color: string;
    dot: string;
    bg: string;
    border: string;
    unreadBg: string;
  }
> = {
  submission: {
    label: "Submission",
    icon: CheckCircle2,
    color: "text-emerald-600",
    dot: "bg-emerald-600",
    bg: "bg-emerald-100",
    border: "border-emerald-400",
    unreadBg: "bg-emerald-50/60",
  },
  reminder: {
    label: "Reminder",
    icon: Clock,
    color: "text-amber-600",
    dot: "bg-amber-600",
    bg: "bg-amber-100",
    border: "border-amber-400",
    unreadBg: "bg-amber-50/60",
  },
  forward: {
    label: "Forwarded",
    icon: Forward,
    color: "text-blue-600",
    dot: "bg-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-400",
    unreadBg: "bg-blue-50/60",
  },
  progress: {
    label: "Progress",
    icon: TrendingUp,
    color: "text-violet-600",
    dot: "bg-violet-600",
    bg: "bg-violet-100",
    border: "border-violet-400",
    unreadBg: "bg-violet-50/60",
  },
  closed: {
    label: "Closed",
    icon: Lock,
    color: "text-slate-500",
    dot: "bg-slate-500",
    bg: "bg-slate-100",
    border: "border-slate-400",
    unreadBg: "bg-slate-50",
  },
  incomplete: {
    label: "Incomplete",
    icon: AlertTriangle,
    color: "text-orange-600",
    dot: "bg-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-400",
    unreadBg: "bg-orange-50/60",
  },
  inactive: {
    label: "Not Started",
    icon: Users,
    color: "text-rose-600",
    dot: "bg-rose-600",
    bg: "bg-rose-100",
    border: "border-rose-400",
    unreadBg: "bg-rose-50/60",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "submission", label: "Submissions" },
  { key: "reminder", label: "Reminders" },
  { key: "progress", label: "Progress" },
  { key: "incomplete", label: "Alerts" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const now = new Date("2026-04-07T12:00:00Z");
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getGroupLabel(iso: string): string {
  const now = new Date("2026-04-07T12:00:00Z");
  const date = new Date(iso);
  const diffD = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffD === 0) return "Today";
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return "Earlier this week";
  return "Older";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DigestCard({ notifications }: { notifications: Notification[] }) {
  const unread = notifications.filter((n) => !n.read).length;
  const highPriority = notifications.filter((n) => n.priority === "high" && !n.read).length;
  const submitted = notifications.filter((n) => n.type === "submission").length;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#0f1923] to-[#1a2d3d] p-5 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-[#00b8a9]" />
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[#00b8a9]">
          Activity Digest
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-2xl font-bold text-white">{unread}</p>
          <p className="text-[11px] text-white/50 mt-0.5">Unread</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-400">{highPriority}</p>
          <p className="text-[11px] text-white/50 mt-0.5">Needs attention</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-400">{submitted}</p>
          <p className="text-[11px] text-white/50 mt-0.5">New submissions</p>
        </div>
      </div>
      {highPriority > 0 && (
        <div className="mt-4 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 flex items-center gap-2">
          <AlertTriangle size={12} className="text-orange-400 shrink-0" />
          <p className="text-[11.5px] text-orange-300">
            {highPriority} notification{highPriority > 1 ? "s" : ""} require your immediate attention
          </p>
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notif,
  onToggleRead,
  onSnooze,
}: {
  notif: Notification;
  onToggleRead: (id: string) => void;
  onSnooze: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];
  const Icon = cfg.icon;
  const [hovered, setHovered] = useState(false);
  const [snoozed, setSnoozed] = useState(false);

  if (snoozed) return null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group relative flex gap-4 px-5 py-4 rounded-xl border transition-all duration-150 cursor-default
        ${notif.read
          ? "bg-white border-slate-200/80 hover:border-slate-300"
          : `${cfg.unreadBg} border-l-[3px] ${cfg.border} border-r-slate-200/80 border-t-slate-200/80 border-b-slate-200/80 hover:border-l-[3px]`
        }
        ${notif.priority === "high" && !notif.read ? "ring-1 ring-orange-200/80" : ""}
      `}
    >
      {/* Icon */}
      <div className={`shrink-0 w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center mt-0.5`}>
        <Icon size={16} className={cfg.color} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {!notif.read && (
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
              )}
              {notif.priority === "high" && !notif.read && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[9.5px] font-bold uppercase tracking-wide">
                  Urgent
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
            <p className={`mt-1 text-[13px] font-semibold leading-snug ${notif.read ? "text-slate-600" : "text-slate-900"}`}>
              {notif.title}
            </p>
            <p className="mt-1 text-[12px] text-slate-500 leading-relaxed">{notif.description}</p>

            {/* Survey pill */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200/80">
                <Bell size={9} className="text-slate-400" />
                {notif.surveyName}
              </span>
            </div>

            {/* Metadata chips */}
            {notif.metadata && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {notif.metadata.submitted !== undefined && notif.metadata.total !== undefined && (
                  <span className="text-[11px] text-violet-700 font-medium bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200/80">
                    {notif.metadata.submitted}/{notif.metadata.total} submitted ({notif.metadata.percentage}%)
                  </span>
                )}
                {notif.metadata.daysRemaining !== undefined && (
                  <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                    {notif.metadata.daysRemaining === 1 ? "24 hours" : `${notif.metadata.daysRemaining} days`} remaining
                  </span>
                )}
                {notif.metadata.transparencyScore !== undefined && (
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    notif.metadata.transparencyScore >= 70
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200/80"
                      : "text-orange-700 bg-orange-50 border-orange-200/80"
                  }`}>
                    Transparency: {notif.metadata.transparencyScore}/100
                  </span>
                )}
                {notif.metadata.inactiveCount !== undefined && (
                  <span className="text-[11px] text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80">
                    {notif.metadata.inactiveCount} inactive · {notif.metadata.daysSinceLaunch}d since launch
                  </span>
                )}
                {notif.metadata.fromManager && (
                  <span className="text-[11px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80">
                    {notif.metadata.fromManager} → {notif.metadata.toManager}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Time + actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              {formatRelativeTime(notif.timestamp)}
            </span>
            <div
              className={`flex items-center gap-1 transition-opacity duration-150 ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <button
                onClick={() => onToggleRead(notif.id)}
                title={notif.read ? "Mark as unread" : "Mark as read"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#00b8a9] hover:bg-[#00b8a9]/10 transition-colors"
              >
                {notif.read ? <Circle size={13} /> : <CheckCheck size={13} />}
              </button>
              <button
                onClick={() => {
                  onSnooze(notif.id);
                  setSnoozed(true);
                }}
                title="Snooze for later"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <BellOff size={13} />
              </button>
              <button
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="View survey"
              >
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationGroup({
  label,
  notifications,
  onToggleRead,
  onSnooze,
}: {
  label: string;
  notifications: Notification[];
  onToggleRead: (id: string) => void;
  onSnooze: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const unreadInGroup = notifications.filter((n) => !n.read).length;

  return (
    <div className="mb-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-3 group"
      >
        {collapsed ? (
          <ChevronRight size={13} className="text-slate-400" />
        ) : (
          <ChevronDown size={13} className="text-slate-400" />
        )}
        <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 group-hover:text-slate-600 transition-colors">
          {label}
        </span>
        {unreadInGroup > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#00b8a9] text-white text-[9px] font-bold">
            {unreadInGroup}
          </span>
        )}
      </button>
      {!collapsed && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notif={n}
              onToggleRead={onToggleRead}
              onSnooze={onSnooze}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [snoozed, setSnoozed] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.read).length;

  function toggleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function snoozeNotif(id: string) {
    setSnoozed((prev) => new Set([...prev, id]));
  }

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (snoozed.has(n.id)) return false;
      if (activeFilter === "all") return true;
      if (activeFilter === "unread") return !n.read;
      if (activeFilter === "incomplete") return n.type === "incomplete" || n.type === "inactive";
      return n.type === activeFilter;
    });
  }, [notifications, activeFilter, snoozed]);

  // Group by date label
  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    const order = ["Today", "Yesterday", "Earlier this week", "Older"];
    for (const n of filtered) {
      const label = getGroupLabel(n.timestamp);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    }
    return order.filter((l) => map.has(l)).map((l) => ({ label: l, items: map.get(l)! }));
  }, [filtered]);

  return (
    <div className="min-h-full bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center shrink-0">
                <Bell size={17} className="text-[#00b8a9]" strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-slate-900">Notifications</h1>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Stay on top of survey activity and deadlines
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-[#00897b] bg-[#00b8a9]/10 hover:bg-[#00b8a9]/20 transition-colors"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 mt-5 -mb-[1px]">
            {FILTERS.map((f) => {
              const count =
                f.key === "all"
                  ? notifications.filter((n) => !snoozed.has(n.id)).length
                  : f.key === "unread"
                  ? notifications.filter((n) => !n.read && !snoozed.has(n.id)).length
                  : f.key === "incomplete"
                  ? notifications.filter((n) => (n.type === "incomplete" || n.type === "inactive") && !snoozed.has(n.id)).length
                  : notifications.filter((n) => n.type === f.key && !snoozed.has(n.id)).length;

              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium border-b-2 transition-all duration-150 whitespace-nowrap
                    ${
                      activeFilter === f.key
                        ? "border-[#00b8a9] text-[#00897b]"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }
                  `}
                >
                  {f.label}
                  {count > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9.5px] font-bold ${
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
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-8 py-6">
        {/* Digest card (only on "all" + "unread" tabs) */}
        {(activeFilter === "all" || activeFilter === "unread") && (
          <DigestCard notifications={notifications.filter((n) => !snoozed.has(n.id))} />
        )}

        {/* Snooze banner */}
        {snoozed.size > 0 && (
          <div className="mb-4 flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200/80">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <BellOff size={13} />
              {snoozed.size} notification{snoozed.size > 1 ? "s" : ""} snoozed
            </div>
            <button
              onClick={() => setSnoozed(new Set())}
              className="text-[11.5px] font-medium text-[#00897b] hover:underline"
            >
              Restore all
            </button>
          </div>
        )}

        {/* Grouped notifications */}
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Bell size={22} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-semibold text-slate-500">All caught up</p>
            <p className="text-[12px] text-slate-400 mt-1">No notifications match this filter</p>
          </div>
        ) : (
          groups.map(({ label, items }) => (
            <NotificationGroup
              key={label}
              label={label}
              notifications={items}
              onToggleRead={toggleRead}
              onSnooze={snoozeNotif}
            />
          ))
        )}
      </div>
    </div>
  );
}
