"use client";

import { useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  UserCheck,
  Calendar,
  FileText,
  Lock,
  Mail,
  BellOff,
  Circle,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Building2,
  User,
  ShieldCheck,
  Info,
} from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-notifications";
import type { Notification, NotificationType, NotificationRole } from "@/types/notification";

// ─── Type config ──────────────────────────────────────────────────────────────

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
  csv_approved: {
    label: "CSV Approved",
    icon: CheckCircle2,
    color: "text-emerald-600",
    dot: "bg-emerald-500",
    bg: "bg-emerald-100",
    border: "border-emerald-400",
    unreadBg: "bg-emerald-50/70",
  },
  invitations_sent: {
    label: "Invitations Sent",
    icon: Mail,
    color: "text-[#00897b]",
    dot: "bg-[#00b8a9]",
    bg: "bg-[#00b8a9]/15",
    border: "border-[#00b8a9]",
    unreadBg: "bg-[#00b8a9]/5",
  },
  email_bounce: {
    label: "Email Bounce",
    icon: AlertTriangle,
    color: "text-orange-600",
    dot: "bg-orange-500",
    bg: "bg-orange-100",
    border: "border-orange-400",
    unreadBg: "bg-orange-50/70",
  },
  survey_submitted: {
    label: "Submission",
    icon: UserCheck,
    color: "text-emerald-600",
    dot: "bg-emerald-500",
    bg: "bg-emerald-100",
    border: "border-emerald-400",
    unreadBg: "bg-emerald-50/70",
  },
  weekly_update: {
    label: "Weekly Update",
    icon: BarChart3,
    color: "text-violet-600",
    dot: "bg-violet-500",
    bg: "bg-violet-100",
    border: "border-violet-400",
    unreadBg: "bg-violet-50/70",
  },
  survey_started: {
    label: "Survey Opened",
    icon: Calendar,
    color: "text-blue-600",
    dot: "bg-blue-500",
    bg: "bg-blue-100",
    border: "border-blue-400",
    unreadBg: "bg-blue-50/70",
  },
  survey_reminder: {
    label: "Reminder",
    icon: Clock,
    color: "text-amber-600",
    dot: "bg-amber-500",
    bg: "bg-amber-100",
    border: "border-amber-400",
    unreadBg: "bg-amber-50/70",
  },
  csv_review: {
    label: "Action Required",
    icon: FileText,
    color: "text-blue-600",
    dot: "bg-blue-500",
    bg: "bg-blue-100",
    border: "border-blue-400",
    unreadBg: "bg-blue-50/70",
  },
  closed: {
    label: "Closed",
    icon: Lock,
    color: "text-slate-500",
    dot: "bg-slate-400",
    bg: "bg-slate-100",
    border: "border-slate-300",
    unreadBg: "bg-slate-50",
  },
};

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  NotificationRole,
  {
    label: string;
    sublabel: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    headerBg: string;
    headerText: string;
    headerSubText: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    chevronColor: string;
    dark: boolean;
  }
> = {
  host: {
    label: "Survey Host (Client)",
    sublabel: "Survey administrator — LP client view",
    description:
      "Notifications for LP clients who administer surveys: CSV status, invitation delivery, submission alerts, and weekly progress digests.",
    icon: Building2,
    headerBg: "bg-[#00b8a9]/8",
    headerText: "text-slate-900",
    headerSubText: "text-slate-500",
    iconBg: "bg-[#00b8a9]/20",
    iconColor: "text-[#00897b]",
    badgeBg: "bg-[#00b8a9]/20",
    badgeText: "text-[#00897b]",
    chevronColor: "text-slate-400",
    dark: false,
  },
  manager: {
    label: "Survey Taker (Manager)",
    sublabel: "Survey respondent — GP organization view",
    description:
      "Notifications for GP organizations participating in surveys: survey open alerts and deadline reminders.",
    icon: User,
    headerBg: "bg-violet-50",
    headerText: "text-slate-900",
    headerSubText: "text-slate-500",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
    chevronColor: "text-slate-400",
    dark: false,
  },
  admin: {
    label: "LPS Admin",
    sublabel: "Internal — Lenox Park administrative team",
    description:
      "Internal notifications for Lenox Park admins: CSV review requests, bounce alerts, submission confirmations, and survey deadline warnings.",
    icon: ShieldCheck,
    headerBg: "bg-[#0f1923]",
    headerText: "text-white",
    headerSubText: "text-white/50",
    iconBg: "bg-white/10",
    iconColor: "text-[#00b8a9]",
    badgeBg: "bg-white/15",
    badgeText: "text-white",
    chevronColor: "text-white/40",
    dark: true,
  },
};

const ROLE_ORDER: NotificationRole[] = ["host", "manager", "admin"];

type RoleFilter = "all" | NotificationRole;

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Reference: today = 2026-06-11 12:00 UTC
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
  if (diffD < 7) return `${diffD} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Notification Card ────────────────────────────────────────────────────────

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
        group relative flex gap-4 px-5 py-4 transition-all duration-150 cursor-default
        ${notif.read
          ? "bg-white hover:bg-slate-50/60"
          : `${cfg.unreadBg} border-l-[3px] ${cfg.border} hover:brightness-[0.98]`
        }
        ${notif.priority === "high" && !notif.read ? "ring-inset ring-1 ring-orange-200/60" : ""}
      `}
    >
      {/* Type icon */}
      <div className={`shrink-0 w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center mt-0.5`}>
        <Icon size={16} className={cfg.color} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">

            {/* Tags row */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {!notif.read && (
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
              )}
              {notif.priority === "high" && !notif.read && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[9.5px] font-bold uppercase tracking-wide">
                  Urgent
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>

            {/* Title */}
            <p className={`text-[13px] font-semibold leading-snug ${notif.read ? "text-slate-600" : "text-slate-900"}`}>
              {notif.title}
            </p>

            {/* Description */}
            <p className="mt-1 text-[12px] text-slate-500 leading-relaxed">{notif.description}</p>

            {/* Metadata chips */}
            {notif.metadata && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                {notif.metadata.csvCount !== undefined && (
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80">
                    {notif.metadata.csvCount} contacts
                  </span>
                )}
                {notif.metadata.bouncedCount !== undefined && (
                  <span className="text-[11px] font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/80">
                    {notif.metadata.bouncedCount} bounced
                  </span>
                )}
                {notif.metadata.submitted !== undefined && notif.metadata.total !== undefined && (
                  <span className="text-[11px] font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200/80">
                    {notif.metadata.submitted}/{notif.metadata.total} submitted
                  </span>
                )}
                {notif.metadata.daysRemaining !== undefined && (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                    {notif.metadata.daysRemaining} days remaining
                  </span>
                )}
                {notif.metadata.deadline && (
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
                    Deadline: {notif.metadata.deadline}
                  </span>
                )}
                {notif.metadata.weekStart && notif.metadata.weekEnd && (
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
                    {notif.metadata.weekStart} – {notif.metadata.weekEnd}
                  </span>
                )}
                {notif.metadata.managerName && (
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
                    {notif.metadata.managerName}
                    {notif.metadata.orgName ? ` · ${notif.metadata.orgName}` : ""}
                  </span>
                )}
                {notif.metadata.clientName && !notif.metadata.managerName && (
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
                    {notif.metadata.clientName}
                  </span>
                )}
                {notif.metadata.surveyStartDate && (
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80">
                    Opened {notif.metadata.surveyStartDate}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Time + hover actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              {formatRelativeTime(notif.timestamp)}
            </span>
            <div
              className={`flex items-center gap-0.5 transition-opacity duration-150 ${hovered ? "opacity-100" : "opacity-0"}`}
            >
              <button
                onClick={() => onToggleRead(notif.id)}
                title={notif.read ? "Mark as unread" : "Mark as read"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#00b8a9] hover:bg-[#00b8a9]/10 transition-colors"
              >
                {notif.read ? <Circle size={13} /> : <CheckCheck size={13} />}
              </button>
              <button
                onClick={() => { onSnooze(notif.id); setSnoozed(true); }}
                title="Dismiss"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <BellOff size={13} />
              </button>
              <button
                title="View survey"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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

// ─── Role Section ─────────────────────────────────────────────────────────────

function RoleSection({
  role,
  notifications,
  onToggleRead,
  onSnooze,
}: {
  role: NotificationRole;
  notifications: Notification[];
  onToggleRead: (id: string) => void;
  onSnooze: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  const unread = notifications.filter((n) => !n.read).length;
  const highPriority = notifications.filter((n) => n.priority === "high" && !n.read).length;

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Section header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors group ${cfg.headerBg} ${cfg.dark ? "hover:brightness-125" : "hover:brightness-[0.97]"}`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
          <Icon size={16} className={cfg.iconColor} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className={`text-[13px] font-bold ${cfg.headerText}`}>{cfg.label}</p>
          <p className={`text-[11px] ${cfg.headerSubText}`}>{cfg.sublabel}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {highPriority > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
              <AlertTriangle size={9} />
              {highPriority} urgent
            </span>
          )}
          {unread > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${cfg.badgeBg} ${cfg.badgeText}`}>
              {unread}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${collapsed ? "-rotate-90" : ""} ${cfg.chevronColor}`}
          />
        </div>
      </button>

      {/* Description row */}
      {!collapsed && (
        <div className={`px-5 py-2.5 border-b ${cfg.dark ? "border-white/8 bg-[#0f1923]/90" : "border-slate-100 bg-slate-50/40"}`}>
          <p className={`text-[11.5px] leading-relaxed ${cfg.dark ? "text-white/40" : "text-slate-400"}`}>
            {cfg.description}
          </p>
        </div>
      )}

      {/* Notification list */}
      {!collapsed && (
        <div className={`divide-y ${cfg.dark ? "divide-white/5 bg-white" : "divide-slate-50/80 bg-white"}`}>
          {notifications.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-[12.5px] text-slate-400">No notifications in this section</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationCard
                key={n.id}
                notif={n}
                onToggleRead={onToggleRead}
                onSnooze={onSnooze}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Activity Digest ──────────────────────────────────────────────────────────

function ActivityDigest({ notifications }: { notifications: Notification[] }) {
  const unread = notifications.filter((n) => !n.read).length;
  const urgent = notifications.filter((n) => n.priority === "high" && !n.read).length;
  const byRole = {
    host:    notifications.filter((n) => n.role === "host").length,
    manager: notifications.filter((n) => n.role === "manager").length,
    admin:   notifications.filter((n) => n.role === "admin").length,
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0f1923] to-[#162332] p-5 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={13} className="text-[#00b8a9]" />
        <span className="text-[10.5px] font-bold tracking-widest uppercase text-[#00b8a9]">
          Activity Digest
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-2xl font-bold text-white">{notifications.length}</p>
          <p className="text-[11px] text-white/45 mt-0.5">Total</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{unread}</p>
          <p className="text-[11px] text-white/45 mt-0.5">Unread</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-400">{urgent}</p>
          <p className="text-[11px] text-white/45 mt-0.5">Urgent</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40">Host</span>
            <span className="text-[11px] font-semibold text-white/70">{byRole.host}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40">Manager</span>
            <span className="text-[11px] font-semibold text-white/70">{byRole.manager}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40">Admin</span>
            <span className="text-[11px] font-semibold text-white/70">{byRole.admin}</span>
          </div>
        </div>
      </div>
      {urgent > 0 && (
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 flex items-center gap-2">
          <AlertTriangle size={11} className="text-orange-400 shrink-0" />
          <p className="text-[11.5px] text-orange-300">
            {urgent} notification{urgent !== 1 ? "s" : ""} require immediate attention
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [snoozed, setSnoozed] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.read).length;

  function toggleRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function snoozeNotif(id: string) {
    setSnoozed((prev) => new Set([...prev, id]));
  }

  const visibleNotifs = useMemo(
    () => notifications.filter((n) => !snoozed.has(n.id)),
    [notifications, snoozed],
  );

  const visibleRoles = ROLE_ORDER.filter(
    (r) => roleFilter === "all" || roleFilter === r,
  );

  const roleLabels: Record<RoleFilter, string> = {
    all:     "All",
    host:    "Survey Host",
    manager: "Survey Taker",
    admin:   "LPS Admin",
  };

  const roleCounts: Record<RoleFilter, number> = {
    all:     visibleNotifs.length,
    host:    visibleNotifs.filter((n) => n.role === "host").length,
    manager: visibleNotifs.filter((n) => n.role === "manager").length,
    admin:   visibleNotifs.filter((n) => n.role === "admin").length,
  };

  return (
    <div className="min-h-full bg-slate-50">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center shrink-0">
                <Bell size={17} className="text-[#00b8a9]" strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-slate-900">Global Notifications</h1>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Platform-wide user-specific notifications — connected to the bell icon
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

          {/* Role filter tabs */}
          <div className="flex items-center gap-1 -mb-[1px]">
            {(["all", "host", "manager", "admin"] as RoleFilter[]).map((key) => {
              const count = roleCounts[key];
              return (
                <button
                  key={key}
                  onClick={() => setRoleFilter(key)}
                  className={`
                    flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium border-b-2 transition-all whitespace-nowrap
                    ${roleFilter === key
                      ? "border-[#00b8a9] text-[#00897b]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                    }
                  `}
                >
                  {roleLabels[key]}
                  {count > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9.5px] font-bold ${
                      roleFilter === key ? "bg-[#00b8a9]/15 text-[#00897b]" : "bg-slate-100 text-slate-500"
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
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-5">

        {/* Engineering preview banner */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-semibold text-blue-800">Engineering Demo View</p>
            <p className="text-[11.5px] text-blue-600 mt-0.5 leading-relaxed">
              This page displays all notification types across all user roles for engineering review.
              In production, each authenticated user sees only their own role&apos;s notifications.
            </p>
          </div>
        </div>

        {/* Digest (all-role view only) */}
        {roleFilter === "all" && (
          <ActivityDigest notifications={visibleNotifs} />
        )}

        {/* Snooze restore banner */}
        {snoozed.size > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200/80">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <BellOff size={13} />
              {snoozed.size} notification{snoozed.size !== 1 ? "s" : ""} dismissed
            </div>
            <button
              onClick={() => setSnoozed(new Set())}
              className="text-[11.5px] font-medium text-[#00897b] hover:underline"
            >
              Restore all
            </button>
          </div>
        )}

        {/* Role sections */}
        {visibleRoles.map((role) => {
          const roleNotifs = visibleNotifs
            .filter((n) => n.role === role)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          return (
            <RoleSection
              key={role}
              role={role}
              notifications={roleNotifs}
              onToggleRead={toggleRead}
              onSnooze={snoozeNotif}
            />
          );
        })}

        {visibleNotifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Bell size={22} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-semibold text-slate-500">All caught up</p>
            <p className="text-[12px] text-slate-400 mt-1">No notifications to show</p>
          </div>
        )}
      </div>
    </div>
  );
}
