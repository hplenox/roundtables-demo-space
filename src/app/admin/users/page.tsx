"use client";

import { useMemo, useState } from "react";
import {
  Users2, Search, Plus, X, ChevronDown, ChevronUp, Building2, ShieldCheck,
  History, CheckCircle2, AlertTriangle, Info, Link2, MinusCircle,
} from "lucide-react";
import {
  PLATFORM_ORGS,
  PLATFORM_USERS,
  ORG_ASSOCIATION_AUDIT,
  PlatformUser,
  OrgAssociationAuditEntry,
  getOrgById,
  getUserFullName,
} from "@/lib/mock-org-associations";

const CURRENT_ADMIN = "You (Super Admin)";

function initials(u: PlatformUser) {
  return `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Per-user audit trail ───────────────────────────────────────────────────

function AuditRow({ entry }: { entry: OrgAssociationAuditEntry }) {
  const org = getOrgById(entry.orgId);
  const added = entry.action === "added";
  return (
    <div className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
      <div
        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
          added ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
        }`}
      >
        {added ? <Plus size={10} strokeWidth={2.5} /> : <MinusCircle size={10} strokeWidth={2.5} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] text-slate-600 leading-snug">
          <span className="font-semibold text-slate-800">{entry.adminName}</span>{" "}
          {added ? "added" : "removed"}{" "}
          <span className="font-semibold text-slate-800">{org?.name ?? entry.orgId}</span>
          {added ? " as a secondary organization" : " as a secondary organization"}
        </p>
        {entry.note && <p className="text-[11px] text-slate-400 italic mt-0.5">{entry.note}</p>}
        <p className="text-[10.5px] text-slate-400 mt-0.5">{formatDate(entry.timestamp)}</p>
      </div>
    </div>
  );
}

// ─── Manage panel (expanded "profile" view) ────────────────────────────────

function ManagePanel({
  user,
  audit,
  onAdd,
  onRemove,
}: {
  user: PlatformUser;
  audit: OrgAssociationAuditEntry[];
  onAdd: (orgId: string) => void;
  onRemove: (orgId: string) => void;
}) {
  const [pickedOrgId, setPickedOrgId] = useState("");
  const primaryOrg = getOrgById(user.primaryOrgId);
  const secondaryOrgs = user.secondaryOrgIds.map((id) => getOrgById(id)).filter(Boolean) as NonNullable<
    ReturnType<typeof getOrgById>
  >[];
  const availableOrgs = PLATFORM_ORGS.filter(
    (o) => o.id !== user.primaryOrgId && !user.secondaryOrgIds.includes(o.id)
  );
  const userAudit = audit.filter((a) => a.userId === user.id);

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 space-y-4">
      {/* Primary org confirmation */}
      <div className="flex items-center gap-2 text-[12px] text-slate-600">
        <ShieldCheck size={13} className="text-slate-400" />
        Primary organization: <span className="font-semibold text-slate-800">{primaryOrg?.name ?? "—"}</span>
        <span className="text-slate-400">({primaryOrg?.domain})</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Secondary orgs + add control */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide mb-2">
            Secondary Organizations
          </p>

          {secondaryOrgs.length === 0 ? (
            <p className="text-[11.5px] text-slate-400 italic mb-3">None associated yet.</p>
          ) : (
            <div className="space-y-1.5 mb-3">
              {secondaryOrgs.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#e8f5f3] border border-[#00b8a9]/20"
                >
                  <Building2 size={12} className="text-[#00897b] shrink-0" />
                  <span className="text-[12px] font-medium text-[#00695c] flex-1 truncate">{org.name}</span>
                  <span className="text-[9.5px] font-semibold text-[#00897b]/70 bg-white/70 px-1.5 py-0.5 rounded-full shrink-0">
                    Survey response only
                  </span>
                  <button
                    onClick={() => onRemove(org.id)}
                    className="text-[#00897b]/50 hover:text-red-500 transition-colors shrink-0"
                    title="Remove secondary organization"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <select
              value={pickedOrgId}
              onChange={(e) => setPickedOrgId(e.target.value)}
              className="flex-1 min-w-0 text-[12px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30"
            >
              <option value="">Add secondary organization…</option>
              {availableOrgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!pickedOrgId) return;
                onAdd(pickedOrgId);
                setPickedOrgId("");
              }}
              disabled={!pickedOrgId}
              className="px-3 py-1.5 rounded-lg bg-[#00b8a9] text-white text-[11px] font-semibold disabled:opacity-40 hover:bg-[#00a398] transition-colors shrink-0"
            >
              Save
            </button>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-2 leading-relaxed">
            Scoped narrowly: <span className="font-medium text-slate-500">{getUserFullName(user)}</span>{" "}
            can take a survey on behalf of the selected organization and nothing else. This overrides domain
            matching for survey responses only — the account&rsquo;s registered organization does not change.
          </p>
        </div>

        {/* Per-user audit trail */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <History size={11} />
            Association History
          </p>
          {userAudit.length === 0 ? (
            <p className="text-[11.5px] text-slate-400 italic">No association changes recorded.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {userAudit.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── User row ────────────────────────────────────────────────────────────

function UserRow({
  user,
  audit,
  expanded,
  onToggle,
  onAdd,
  onRemove,
}: {
  user: PlatformUser;
  audit: OrgAssociationAuditEntry[];
  expanded: boolean;
  onToggle: () => void;
  onAdd: (orgId: string) => void;
  onRemove: (orgId: string) => void;
}) {
  const primaryOrg = getOrgById(user.primaryOrgId);
  const secondaryOrgs = user.secondaryOrgIds.map((id) => getOrgById(id)).filter(Boolean) as NonNullable<
    ReturnType<typeof getOrgById>
  >[];

  return (
    <div className="border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-4 px-5 py-3">
        <div className="flex-1 min-w-0 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-slate-600">{initials(user)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 truncate">{getUserFullName(user)}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <div className="hidden md:block w-44 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-700 truncate">
            <Building2 size={11} className="text-slate-400 shrink-0" />
            <span className="truncate">{primaryOrg?.name ?? "—"}</span>
          </span>
        </div>

        <div className="w-64 shrink-0">
          {secondaryOrgs.length === 0 ? (
            <span className="text-[11px] text-slate-300 italic">None</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {secondaryOrgs.map((org) => (
                <span
                  key={org.id}
                  className="inline-flex items-center gap-1 text-[10.5px] font-medium px-1.5 py-0.5 rounded-full bg-[#e8f5f3] text-[#00897b] border border-[#00b8a9]/25"
                >
                  <Link2 size={8} />
                  {org.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block w-24 shrink-0 text-[11px] text-slate-400">
          {formatDate(user.registeredDate)}
        </div>

        <button
          onClick={onToggle}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-[#00b8a9]/40 hover:text-[#00897b] transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          Manage
        </button>
      </div>

      {expanded && <ManagePanel user={user} audit={audit} onAdd={onAdd} onRemove={onRemove} />}
    </div>
  );
}

// ─── Global audit trail ─────────────────────────────────────────────────────

function GlobalAuditTrail({ audit, users }: { audit: OrgAssociationAuditEntry[]; users: PlatformUser[] }) {
  const sorted = [...audit].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">Full Audit Trail</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Every secondary-organization grant and removal, platform-wide.</p>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {sorted.length} event{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
        {sorted.map((entry) => {
          const user = users.find((u) => u.id === entry.userId);
          const org = getOrgById(entry.orgId);
          const primaryOrg = user ? getOrgById(user.primaryOrgId) : undefined;
          const added = entry.action === "added";
          return (
            <div key={entry.id} className="flex items-start gap-3 px-5 py-3">
              <div
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                  added ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                }`}
              >
                {added ? <Plus size={13} strokeWidth={2.5} /> : <MinusCircle size={13} strokeWidth={2.5} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-slate-700 leading-snug">
                  <span className="font-semibold text-slate-900">{entry.adminName}</span>{" "}
                  {added ? "added" : "removed"} <span className="font-semibold text-slate-900">{org?.name}</span> as
                  a secondary organization for{" "}
                  <span className="font-semibold text-slate-900">{user ? getUserFullName(user) : "—"}</span>
                  {primaryOrg && <span className="text-slate-400"> (primary: {primaryOrg.name})</span>}
                </p>
                {entry.note && <p className="text-[11px] text-slate-400 italic mt-0.5">{entry.note}</p>}
              </div>
              <span className="text-[10.5px] text-slate-400 shrink-0 mt-0.5">{formatDate(entry.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type FilterKey = "all" | "multi-org";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>(PLATFORM_USERS);
  const [audit, setAudit] = useState<OrgAssociationAuditEntry[]>(ORG_ASSOCIATION_AUDIT);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function logAudit(userId: string, orgId: string, action: "added" | "removed") {
    setAudit((prev) => [
      {
        id: `audit-local-${prev.length + 1}-${userId}-${orgId}`,
        timestamp: new Date().toISOString(),
        adminName: CURRENT_ADMIN,
        userId,
        orgId,
        action,
      },
      ...prev,
    ]);
  }

  function handleAdd(userId: string, orgId: string) {
    const user = users.find((u) => u.id === userId);
    const org = getOrgById(orgId);
    if (!user || !org) return;
    if (user.secondaryOrgIds.includes(orgId) || user.primaryOrgId === orgId) {
      showToast("This user is already associated with that organization.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, secondaryOrgIds: [...u.secondaryOrgIds, orgId] } : u))
    );
    logAudit(userId, orgId, "added");
    showToast(`${org.name} added as a secondary organization for ${getUserFullName(user)}.`);
  }

  function handleRemove(userId: string, orgId: string) {
    const user = users.find((u) => u.id === userId);
    const org = getOrgById(orgId);
    if (!user || !org) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, secondaryOrgIds: u.secondaryOrgIds.filter((id) => id !== orgId) } : u
      )
    );
    logAudit(userId, orgId, "removed");
    showToast(`${org.name} removed as a secondary organization for ${getUserFullName(user)}.`);
  }

  const multiOrgUsers = users.filter((u) => u.secondaryOrgIds.length > 0);
  const totalGrants = users.reduce((sum, u) => sum + u.secondaryOrgIds.length, 0);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesFilter = filter === "all" || u.secondaryOrgIds.length > 0;
      if (!matchesFilter) return false;
      if (!q) return true;
      const primaryOrg = getOrgById(u.primaryOrgId);
      const secondaryNames = u.secondaryOrgIds.map((id) => getOrgById(id)?.name.toLowerCase() ?? "");
      return (
        getUserFullName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        primaryOrg?.name.toLowerCase().includes(q) ||
        secondaryNames.some((n) => n.includes(q))
      );
    });
  }, [users, search, filter]);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-[#0f1923] text-white px-4 py-2.5 rounded-xl shadow-xl border border-white/10 text-[13px] font-medium">
          <CheckCircle2 size={14} className="text-[#00b8a9]" />
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users2 size={18} className="text-[#00897b]" />
            Users
          </h2>
          <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
            Associate a registered user with a second, already-registered organization so they can respond to a
            survey on that organization&rsquo;s behalf. Every user keeps one primary organization — this grants a
            narrow, survey-response-only exception on top of it.
          </p>
        </div>
      </div>

      {/* Why-this-exists callout */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Info size={13} className="text-blue-400 mt-0.5 shrink-0" />
        <p className="text-[11.5px] text-blue-800 leading-relaxed">
          Domain matching normally routes a contact to the organization their email domain already maps to, no
          matter which organization they were invited as. A secondary-organization association overrides that for
          survey responses only, without changing the user&rsquo;s registered account.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users2, label: "Total Users", value: users.length, color: "text-slate-600", bg: "bg-slate-100" },
          {
            icon: Link2,
            label: "Multi-Org Users",
            value: multiOrgUsers.length,
            color: "text-[#00897b]",
            bg: "bg-[#00b8a9]/10",
          },
          {
            icon: Building2,
            label: "Active Secondary-Org Grants",
            value: totalGrants,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            icon: History,
            label: "Audit Events",
            value: audit.length,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: "all", label: "All Users", count: users.length },
            { key: "multi-org", label: "Multi-Org Users", count: multiOrgUsers.length },
          ] as { key: FilterKey; label: string; count: number }[]
        ).map(({ key, label, count }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150 ${
                active
                  ? "bg-[#0f1923] border-[#0f1923] text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {label}
              <span className={`text-[10.5px] px-1 rounded ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}

        <div className="ml-auto relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search users or organizations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 w-64 rounded-lg bg-white border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition-all duration-150"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">User</div>
          <div className="hidden md:block w-44 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
            Primary Org
          </div>
          <div className="w-64 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
            Secondary Orgs
          </div>
          <div className="hidden lg:block w-24 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
            Registered
          </div>
          <div className="w-[92px] shrink-0" />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle size={20} className="text-slate-200 mb-2" />
            <p className="text-[13px] text-slate-500">No users match your filter.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              audit={audit}
              expanded={expandedUserId === user.id}
              onToggle={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
              onAdd={(orgId) => handleAdd(user.id, orgId)}
              onRemove={(orgId) => handleRemove(user.id, orgId)}
            />
          ))
        )}
      </div>

      <p className="text-center text-[11.5px] text-slate-400">
        {filteredUsers.length} of {users.length} users shown
      </p>

      {/* Global audit trail (collapsible) */}
      <div>
        <button
          onClick={() => setShowAudit((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors mb-2"
        >
          {showAudit ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showAudit ? "Hide" : "View"} full audit trail
        </button>
        {showAudit && <GlobalAuditTrail audit={audit} users={users} />}
      </div>
    </div>
  );
}
