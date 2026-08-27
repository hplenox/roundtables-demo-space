"use client";

import { useMemo, useRef, useState } from "react";
import {
  Search, Plus, X, ChevronDown, ChevronUp, ShieldCheck,
  History, CheckCircle2, AlertTriangle, SlidersHorizontal, MinusCircle,
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
import { useEffectiveUsers, persistSecondaryOrgIds } from "@/lib/org-association-store";

const CURRENT_ADMIN = "You (Super Admin)";

// Stable display ID, independent of filtering/sorting order.
const DISPLAY_ID = new Map(PLATFORM_USERS.map((u, i) => [u.id, 1000 + i + 1]));

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Filter dropdown (Status / Organization) ───────────────────────────────

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  activeCount,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  activeCount: number;
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
        <div className="absolute z-20 mt-1 min-w-[240px] bg-white rounded-md border border-gray-200 shadow-lg py-1 max-h-64 overflow-y-auto">
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

// ─── Per-user audit trail row ───────────────────────────────────────────────

function AuditRow({ entry }: { entry: OrgAssociationAuditEntry }) {
  const org = getOrgById(entry.orgId);
  const added = entry.action === "added";
  return (
    <div className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
      <div
        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
          added ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"
        }`}
      >
        {added ? <Plus size={10} strokeWidth={2.5} /> : <MinusCircle size={10} strokeWidth={2.5} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] text-gray-600 leading-snug">
          <span className="font-semibold text-gray-900">{entry.adminName}</span>{" "}
          {added ? "added" : "removed"} <span className="font-semibold text-gray-900">{org?.name ?? entry.orgId}</span>{" "}
          as a secondary organization
        </p>
        {entry.note && <p className="text-[11px] text-gray-400 italic mt-0.5">{entry.note}</p>}
        <p className="text-[10.5px] text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
      </div>
    </div>
  );
}

// ─── Manage panel (expanded row) ────────────────────────────────────────────

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
    <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-4">
      <div className="flex items-center gap-2 text-[12.5px] text-gray-600 mb-3">
        <ShieldCheck size={13} className="text-gray-400" />
        Primary organization: <span className="font-semibold text-gray-900">{primaryOrg?.name ?? "—"}</span>
        <span className="text-gray-400">({primaryOrg?.domain})</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Secondary orgs + add control */}
        <div className="bg-white rounded-md border border-gray-200 p-3.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Secondary Organizations
          </p>

          {secondaryOrgs.length === 0 ? (
            <p className="text-[11.5px] text-gray-400 italic mb-3">None associated yet.</p>
          ) : (
            <div className="space-y-1.5 mb-3">
              {secondaryOrgs.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-blue-50 border border-blue-100"
                >
                  <span className="text-[12px] font-medium text-blue-700 flex-1 truncate">{org.name}</span>
                  <span className="text-[9.5px] font-semibold text-blue-500 bg-white px-1.5 py-0.5 rounded-full shrink-0">
                    Survey response only
                  </span>
                  <button
                    onClick={() => onRemove(org.id)}
                    className="text-blue-400 hover:text-red-500 transition-colors shrink-0"
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
              className="flex-1 min-w-0 text-[12px] border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
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
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-[11px] font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors shrink-0"
            >
              Save
            </button>
          </div>
          <p className="text-[10.5px] text-gray-400 mt-2 leading-relaxed">
            Scoped narrowly: <span className="font-medium text-gray-500">{getUserFullName(user)}</span>{" "}
            can take a survey on behalf of the selected organization and nothing else. This overrides domain
            matching for survey responses only — the account&rsquo;s registered organization does not change.
          </p>
        </div>

        {/* Per-user audit trail */}
        <div className="bg-white rounded-md border border-gray-200 p-3.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <History size={11} />
            Association History
          </p>
          {userAudit.length === 0 ? (
            <p className="text-[11.5px] text-gray-400 italic">No association changes recorded.</p>
          ) : (
            <div className="divide-y divide-gray-100">
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
  showSecondaryColumn,
  expanded,
  onToggle,
  onAdd,
  onRemove,
}: {
  user: PlatformUser;
  audit: OrgAssociationAuditEntry[];
  showSecondaryColumn: boolean;
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
    <div>
      <div
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50/70 transition-colors text-[13px] cursor-pointer"
      >
        <div className="w-11 shrink-0 text-gray-400 tabular-nums">{DISPLAY_ID.get(user.id)}</div>
        <div className="flex-1 min-w-[110px]">
          <span className="text-blue-600 font-medium truncate block hover:underline">{getUserFullName(user)}</span>
        </div>
        <div className="w-40 shrink-0 text-gray-600 truncate" title={user.email}>{user.email}</div>
        <div className="w-40 shrink-0 text-blue-600 truncate" title={primaryOrg?.name}>{primaryOrg?.name ?? "—"}</div>
        <div className="w-40 shrink-0">
          {showSecondaryColumn ? (
            secondaryOrgs.length === 0 ? (
              <span className="text-[11px] text-gray-300 italic">None</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {secondaryOrgs.map((org) => (
                  <span
                    key={org.id}
                    className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {org.name}
                  </span>
                ))}
              </div>
            )
          ) : (
            <span className="text-gray-400">{formatDate(user.registeredDate)}</span>
          )}
        </div>
        <div className="w-5 shrink-0 flex justify-end text-gray-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && <ManagePanel user={user} audit={audit} onAdd={onAdd} onRemove={onRemove} />}
    </div>
  );
}

// ─── Right rail ──────────────────────────────────────────────────────────

function SnapshotCard({
  totalUsers,
  multiOrgUsers,
  totalGrants,
  auditCount,
}: {
  totalUsers: number;
  multiOrgUsers: number;
  totalGrants: number;
  auditCount: number;
}) {
  const rows = [
    { label: "Total Users", value: totalUsers },
    { label: "Multi-Org Users", value: multiOrgUsers },
    { label: "Active Secondary-Org Grants", value: totalGrants },
    { label: "Audit Events", value: auditCount },
  ];
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-serif text-[15px] font-bold text-blue-600 mb-1">Multi-Org Snapshot</h3>
      <span className="inline-block text-[11px] font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 mb-3">
        This Cycle
      </span>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-[12.5px]">
            <span className="text-gray-600">{row.label}</span>
            <span className="bg-blue-50 text-blue-700 font-semibold rounded px-2 py-0.5 text-[12px]">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentAssociationsCard({
  audit,
  users,
  onViewAll,
}: {
  audit: OrgAssociationAuditEntry[];
  users: PlatformUser[];
  onViewAll: () => void;
}) {
  const recent = [...audit].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-serif text-[14px] font-bold text-blue-600">Recent Associations</h3>
      </div>
      <div className="px-4 divide-y divide-gray-50">
        {recent.map((entry) => {
          const user = users.find((u) => u.id === entry.userId);
          const org = getOrgById(entry.orgId);
          const added = entry.action === "added";
          return (
            <div key={entry.id} className="py-2.5">
              <p className="text-[11.5px] text-gray-600 leading-snug">
                <span className={`font-semibold ${added ? "text-blue-600" : "text-red-500"}`}>
                  {added ? "Added" : "Removed"}
                </span>{" "}
                <span className="font-semibold text-gray-900">{org?.name}</span> for{" "}
                <span className="font-semibold text-gray-900">{user ? getUserFullName(user) : "—"}</span>
              </p>
              <p className="text-[10.5px] text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
            </div>
          );
        })}
      </div>
      <button
        onClick={onViewAll}
        className="w-full text-center text-[12px] font-medium text-blue-600 hover:underline py-2.5 border-t border-gray-100"
      >
        View full audit trail
      </button>
    </div>
  );
}

// ─── Full audit trail modal (lazy-loads more entries as the user scrolls) ──

const AUDIT_PAGE_SIZE = 8;

function AuditTrailModal({
  audit,
  users,
  onClose,
}: {
  audit: OrgAssociationAuditEntry[];
  users: PlatformUser[];
  onClose: () => void;
}) {
  const sorted = useMemo(
    () => [...audit].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [audit]
  );
  const [visibleCount, setVisibleCount] = useState(AUDIT_PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const visible = sorted.slice(0, visibleCount);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setVisibleCount((c) => Math.min(c + AUDIT_PAGE_SIZE, sorted.length));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-serif text-[17px] font-bold text-gray-900">Full Audit Trail</h2>
            <p className="text-[11.5px] text-gray-400 mt-0.5">
              Every secondary-organization grant and removal, platform-wide.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto divide-y divide-gray-50 flex-1">
          {visible.map((entry) => {
            const user = users.find((u) => u.id === entry.userId);
            const org = getOrgById(entry.orgId);
            const primaryOrg = user ? getOrgById(user.primaryOrgId) : undefined;
            const added = entry.action === "added";
            return (
              <div key={entry.id} className="flex items-start gap-3 px-5 py-3">
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                    added ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"
                  }`}
                >
                  {added ? <Plus size={13} strokeWidth={2.5} /> : <MinusCircle size={13} strokeWidth={2.5} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] text-gray-700 leading-snug">
                    <span className="font-semibold text-gray-900">{entry.adminName}</span>{" "}
                    {added ? "added" : "removed"} <span className="font-semibold text-gray-900">{org?.name}</span> as
                    a secondary organization for{" "}
                    <span className="font-semibold text-gray-900">{user ? getUserFullName(user) : "—"}</span>
                    {primaryOrg && <span className="text-gray-400"> (primary: {primaryOrg.name})</span>}
                  </p>
                  {entry.note && <p className="text-[11px] text-gray-400 italic mt-0.5">{entry.note}</p>}
                </div>
                <span className="text-[10.5px] text-gray-400 shrink-0 mt-0.5">{formatDate(entry.timestamp)}</span>
              </div>
            );
          })}
          <div className="py-4 text-center text-[11px] text-gray-400">
            {visibleCount < sorted.length ? "Loading more…" : "— End of audit trail —"}
          </div>
        </div>

        <div className="px-5 py-2.5 border-t border-gray-100 text-[11px] text-gray-400 shrink-0">
          Showing {visible.length} of {sorted.length} events
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "multi-org";

export default function AdminUsersPage() {
  // Reads through localStorage (see org-association-store) so a grant made
  // here is still in effect after navigating to /my-surveys, and re-renders
  // this page automatically the moment handleAdd/handleRemove persist a change.
  const users = useEffectiveUsers();
  const [audit, setAudit] = useState<OrgAssociationAuditEntry[]>(ORG_ASSOCIATION_AUDIT);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [orgFilter, setOrgFilter] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
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
    const nextSecondaryOrgIds = [...user.secondaryOrgIds, orgId];
    persistSecondaryOrgIds(userId, nextSecondaryOrgIds);
    logAudit(userId, orgId, "added");
    showToast(`${org.name} added as a secondary organization for ${getUserFullName(user)}.`);
  }

  function handleRemove(userId: string, orgId: string) {
    const user = users.find((u) => u.id === userId);
    const org = getOrgById(orgId);
    if (!user || !org) return;
    const nextSecondaryOrgIds = user.secondaryOrgIds.filter((id) => id !== orgId);
    persistSecondaryOrgIds(userId, nextSecondaryOrgIds);
    logAudit(userId, orgId, "removed");
    showToast(`${org.name} removed as a secondary organization for ${getUserFullName(user)}.`);
  }

  const multiOrgUsers = users.filter((u) => u.secondaryOrgIds.length > 0);
  const totalGrants = users.reduce((sum, u) => sum + u.secondaryOrgIds.length, 0);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter === "multi-org" && u.secondaryOrgIds.length === 0) return false;
      if (orgFilter && u.primaryOrgId !== orgFilter && !u.secondaryOrgIds.includes(orgFilter)) return false;
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
  }, [users, search, statusFilter, orgFilter]);

  const hasActiveFilters = statusFilter !== "all" || orgFilter !== "" || search.trim() !== "";

  function clearFilters() {
    setStatusFilter("all");
    setOrgFilter("");
    setSearch("");
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-white/10 text-[13px] font-medium">
          <CheckCircle2 size={14} className="text-blue-400" />
          {toast}
        </div>
      )}

      {/* Section header */}
      <div>
        <h2 className="font-serif text-[22px] font-bold text-gray-900">All Users</h2>
        <p className="text-[13px] text-gray-500 mt-1 max-w-2xl leading-relaxed">
          Associate a registered user with a second, already-registered organization so they can respond to a
          survey on that organization&rsquo;s behalf — scoped to survey responses only, without changing the
          user&rsquo;s registered account or overriding domain matching anywhere else.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
        {/* Main column */}
        <div className="min-w-0 bg-white rounded-lg border border-gray-200">
          {/* Card title row */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="font-serif text-[15px] font-semibold text-gray-900">Users</span>
            <span className="bg-gray-100 text-gray-600 text-[12px] font-semibold px-2 py-0.5 rounded">
              {users.length}
            </span>
          </div>

          {/* Filter row */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5 flex-wrap">
            <FilterDropdown
              label="Status"
              value={statusFilter}
              activeCount={statusFilter === "multi-org" ? 1 : 0}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={[
                { value: "all", label: "All Users" },
                { value: "multi-org", label: "Multi-Org Users Only" },
              ]}
            />
            <FilterDropdown
              label="Organization"
              value={orgFilter}
              activeCount={orgFilter ? 1 : 0}
              onChange={setOrgFilter}
              options={[
                { value: "", label: "All Organizations" },
                ...PLATFORM_ORGS.map((o) => ({ value: o.id, label: o.name })),
              ]}
            />
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-[12.5px] font-medium text-gray-400 disabled:opacity-50 disabled:pointer-events-none hover:border-gray-300 hover:text-gray-600 transition-colors"
            >
              <X size={12} />
              Clear
            </button>

            <div className="relative ml-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search users or organizations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-3 w-64 rounded-md bg-white border border-gray-300 text-[12.5px] text-gray-700 placeholder:text-gray-400 placeholder:italic focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
              />
            </div>
          </div>

          {/* Table — Secondary Orgs replaces Registered (rather than adding a column) so
              the row never grows wider than the card, and desktop never needs to scroll. */}
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              {/* Table header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50/60 text-[13px] font-semibold text-gray-900">
                <div className="w-11 shrink-0">ID</div>
                <div className="flex-1 min-w-[110px]">Name</div>
                <div className="w-40 shrink-0">Email</div>
                <div className="w-40 shrink-0">Organization</div>
                <div className="w-40 shrink-0">{statusFilter === "multi-org" ? "Secondary Orgs" : "Registered"}</div>
                <div className="w-5 shrink-0" />
              </div>

              {/* Rows */}
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle size={20} className="text-gray-200 mb-2" />
                  <p className="text-[13px] text-gray-500">No users match your filter.</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    audit={audit}
                    showSecondaryColumn={statusFilter === "multi-org"}
                    expanded={expandedUserId === user.id}
                    onToggle={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                    onAdd={(orgId) => handleAdd(user.id, orgId)}
                    onRemove={(orgId) => handleRemove(user.id, orgId)}
                  />
                ))
              )}
            </div>
          </div>

          <p className="text-center text-[11.5px] text-gray-400 py-3">
            {filteredUsers.length} of {users.length} users shown
          </p>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <SnapshotCard
            totalUsers={users.length}
            multiOrgUsers={multiOrgUsers.length}
            totalGrants={totalGrants}
            auditCount={audit.length}
          />
          <RecentAssociationsCard audit={audit} users={users} onViewAll={() => setAuditModalOpen(true)} />
        </div>
      </div>

      {/* Full audit trail entry point (opens modal) */}
      <div className="flex justify-center">
        <button
          onClick={() => setAuditModalOpen(true)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:underline transition-colors"
        >
          <History size={13} />
          View full audit trail
        </button>
      </div>

      {auditModalOpen && (
        <AuditTrailModal audit={audit} users={users} onClose={() => setAuditModalOpen(false)} />
      )}
    </div>
  );
}
