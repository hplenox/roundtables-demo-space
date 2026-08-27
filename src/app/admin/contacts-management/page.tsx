"use client";

import { useMemo, useRef, useState } from "react";
import {
  X, ChevronDown, ChevronUp, CheckCircle2, History, Info, Zap, Calendar,
  AlertTriangle, Pencil, ArrowRightLeft, UserCog, XCircle,
} from "lucide-react";
import {
  ORG_CODES,
  INTEGRITY_CONTACTS,
  MISMATCH_FLAGS,
  STALE_NAME_FLAGS,
  INTEGRITY_AUDIT,
  OrgCode,
  IntegrityContact,
  MismatchFlag,
  StaleNameFlag,
  IntegrityAuditEntry,
  IntegrityAction,
  DetectionSource,
  FlagStatus,
  getContactFullName,
} from "@/lib/mock-contacts-management";
import { getOrgById } from "@/lib/mock-org-associations";

const CURRENT_ADMIN = "You (Super Admin)";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DetectionBadge({ source }: { source: DetectionSource }) {
  if (source === "real-time") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5">
        <Zap size={9} /> Real-time
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-1.5 py-0.5">
      <Calendar size={9} /> Daily scan
    </span>
  );
}

function StatusBadge({ status }: { status: FlagStatus }) {
  const cfg: Record<FlagStatus, string> = {
    open: "bg-amber-50 text-amber-700 border-amber-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dismissed: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const label: Record<FlagStatus, string> = { open: "Open", resolved: "Resolved", dismissed: "Dismissed" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg[status]}`}>
      {label[status]}
    </span>
  );
}

// ─── Detection method explainer (answers real-time vs. scheduled) ──────────

function DetectionMethodCard({ lastScan }: { lastScan: string }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-3">
      <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
      <div className="text-[12px] text-blue-900 leading-relaxed">
        <span className="font-semibold">Two detection paths, running together:</span> real-time hooks flag a
        mismatch the moment a contact is created, approved, or reassigned; a daily scheduled scan (last run{" "}
        {formatDate(lastScan)}) re-checks every contact and org code to catch anything the hooks miss — bulk
        imports, backfills, or an org code&rsquo;s matched org changing after the fact.
      </div>
    </div>
  );
}

// ─── Stale org-code name section ────────────────────────────────────────────

function StaleNameRow({
  flag,
  orgCode,
  expanded,
  onToggle,
  onFix,
  onDismiss,
  audit,
}: {
  flag: StaleNameFlag;
  orgCode: OrgCode;
  expanded: boolean;
  onToggle: () => void;
  onFix: () => void;
  onDismiss: (reason: string) => void;
  audit: IntegrityAuditEntry[];
}) {
  const [dismissReason, setDismissReason] = useState("");
  const matchedOrg = getOrgById(orgCode.matchedOrgId);
  const flagAudit = audit.filter((a) => a.flagId === flag.id);

  return (
    <div>
      <div
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50/70 transition-colors text-[13px] cursor-pointer"
      >
        <div className="w-20 shrink-0 text-gray-600 tabular-nums">{orgCode.code}</div>
        <div className="flex-1 min-w-[130px] text-amber-700 truncate" title={orgCode.staticName}>
          {orgCode.staticName}
        </div>
        <div className="flex-1 min-w-[130px] text-blue-600 font-medium truncate" title={matchedOrg?.name}>
          {matchedOrg?.name ?? "—"}
        </div>
        <div className="w-28 shrink-0"><DetectionBadge source={flag.detectedVia} /></div>
        <div className="w-20 shrink-0"><StatusBadge status={flag.status} /></div>
        <div className="w-5 shrink-0 flex justify-end text-gray-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-md border border-gray-200 p-3.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Label Drift</p>
              <div className="space-y-1.5 text-[12px]">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-amber-50 border border-amber-200">
                  <span className="text-gray-500">Cached label</span>
                  <span className="font-semibold text-amber-700">{orgCode.staticName}</span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-blue-50 border border-blue-100">
                  <span className="text-gray-500">Resolves to</span>
                  <span className="font-semibold text-blue-700">{matchedOrg?.name}</span>
                </div>
              </div>
              {flag.status === "open" && (
                <button
                  onClick={onFix}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-[11.5px] font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Pencil size={11} /> Update cached name to &ldquo;{matchedOrg?.name}&rdquo;
                </button>
              )}
              {flag.status === "open" && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={dismissReason}
                    onChange={(e) => setDismissReason(e.target.value)}
                    placeholder="Reason to dismiss (e.g. intentional)…"
                    className="flex-1 min-w-0 text-[11.5px] border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                  />
                  <button
                    onClick={() => {
                      if (!dismissReason.trim()) return;
                      onDismiss(dismissReason.trim());
                      setDismissReason("");
                    }}
                    disabled={!dismissReason.trim()}
                    className="shrink-0 px-3 py-1.5 rounded-md border border-gray-200 text-gray-500 text-[11.5px] font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-3.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <History size={11} /> History
              </p>
              {flagAudit.length === 0 ? (
                <p className="text-[11.5px] text-gray-400 italic">No actions recorded.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {flagAudit.map((entry) => (
                    <div key={entry.id} className="py-2 first:pt-0 last:pb-0">
                      <p className="text-[11.5px] text-gray-600 leading-snug">
                        <span className="font-semibold text-gray-900">{entry.adminName}</span> {entry.action}
                      </p>
                      <p className="text-[11px] text-gray-400 italic mt-0.5">{entry.reason}</p>
                      <p className="text-[10.5px] text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Registered-org mismatch section ───────────────────────────────────────

function MismatchRow({
  flag,
  contact,
  orgCode,
  expanded,
  onToggle,
  onReassignContact,
  onRepointCode,
  onDismiss,
  audit,
}: {
  flag: MismatchFlag;
  contact: IntegrityContact;
  orgCode: OrgCode;
  expanded: boolean;
  onToggle: () => void;
  onReassignContact: (reason: string) => void;
  onRepointCode: (reason: string) => void;
  onDismiss: (reason: string) => void;
  audit: IntegrityAuditEntry[];
}) {
  const [reason, setReason] = useState("");
  const matchedOrg = getOrgById(orgCode.matchedOrgId);
  const registeredOrg = getOrgById(contact.registeredOrgId);
  const flagAudit = audit.filter((a) => a.flagId === flag.id);

  return (
    <div>
      <div
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50/70 transition-colors text-[13px] cursor-pointer"
      >
        <div className="flex-1 min-w-[130px]">
          <p className="text-gray-800 font-medium truncate">{getContactFullName(contact)}</p>
          <p className="text-[10.5px] text-gray-400 truncate">{contact.email}</p>
        </div>
        <div className="w-36 shrink-0 truncate" title={matchedOrg?.name}>
          <span className="text-[10px] text-gray-400 block">Invited as</span>
          <span className="text-blue-600 font-medium">{matchedOrg?.name}</span>
        </div>
        <div className="w-36 shrink-0 truncate" title={registeredOrg?.name}>
          <span className="text-[10px] text-gray-400 block">Registered under</span>
          <span className="text-red-600 font-medium">{registeredOrg?.name}</span>
        </div>
        <div className="w-28 shrink-0"><DetectionBadge source={flag.detectedVia} /></div>
        <div className="w-20 shrink-0"><StatusBadge status={flag.status} /></div>
        <div className="w-5 shrink-0 flex justify-end text-gray-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-md border border-gray-200 p-3.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Registration Mismatch
              </p>
              <div className="space-y-1.5 text-[12px] mb-3">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-blue-50 border border-blue-100">
                  <span className="text-gray-500">Org code {orgCode.code} resolves to</span>
                  <span className="font-semibold text-blue-700">{matchedOrg?.name}</span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-red-50 border border-red-200">
                  <span className="text-gray-500">Contact is registered under</span>
                  <span className="font-semibold text-red-700">{registeredOrg?.name}</span>
                </div>
              </div>

              {flag.status === "open" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for resolution (required)…"
                    className="w-full text-[11.5px] border border-gray-300 rounded-md px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                  />
                  <button
                    onClick={() => reason.trim() && onReassignContact(reason.trim())}
                    disabled={!reason.trim()}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-[11.5px] font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors"
                  >
                    <UserCog size={11} /> Reassign contact to {matchedOrg?.name}
                  </button>
                  <button
                    onClick={() => reason.trim() && onRepointCode(reason.trim())}
                    disabled={!reason.trim()}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-[11.5px] font-semibold disabled:opacity-40 hover:bg-blue-100 transition-colors"
                  >
                    <ArrowRightLeft size={11} /> Repoint code {orgCode.code} to {registeredOrg?.name}
                  </button>
                  <button
                    onClick={() => reason.trim() && onDismiss(reason.trim())}
                    disabled={!reason.trim()}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-gray-500 text-[11.5px] font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <XCircle size={11} /> Dismiss — not an issue
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-3.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <History size={11} /> History
              </p>
              {flagAudit.length === 0 ? (
                <p className="text-[11.5px] text-gray-400 italic">No actions recorded.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {flagAudit.map((entry) => (
                    <div key={entry.id} className="py-2 first:pt-0 last:pb-0">
                      <p className="text-[11.5px] text-gray-600 leading-snug">
                        <span className="font-semibold text-gray-900">{entry.adminName}</span> {entry.action}
                      </p>
                      <p className="text-[11px] text-gray-400 italic mt-0.5">{entry.reason}</p>
                      <p className="text-[10.5px] text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Right rail ──────────────────────────────────────────────────────────

function SnapshotCard({
  openMismatches,
  openStaleNames,
  resolvedThisCycle,
  totalCodes,
}: {
  openMismatches: number;
  openStaleNames: number;
  resolvedThisCycle: number;
  totalCodes: number;
}) {
  const rows = [
    { label: "Org Codes Tracked", value: totalCodes },
    { label: "Open Registration Mismatches", value: openMismatches },
    { label: "Open Stale Names", value: openStaleNames },
    { label: "Resolved This Cycle", value: resolvedThisCycle },
  ];
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-serif text-[15px] font-bold text-blue-600 mb-1">Integrity Snapshot</h3>
      <span className="inline-block text-[11px] font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 mb-3">
        This Cycle
      </span>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-[12.5px]">
            <span className="text-gray-600">{row.label}</span>
            <span className="bg-blue-50 text-blue-700 font-semibold rounded px-2 py-0.5 text-[12px]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActionsCard({ audit, onViewAll }: { audit: IntegrityAuditEntry[]; onViewAll: () => void }) {
  const recent = [...audit].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-serif text-[14px] font-bold text-blue-600">Recent Actions</h3>
      </div>
      <div className="px-4 divide-y divide-gray-50">
        {recent.length === 0 && <p className="text-[11.5px] text-gray-400 italic py-2.5">No actions yet.</p>}
        {recent.map((entry) => (
          <div key={entry.id} className="py-2.5">
            <p className="text-[11.5px] text-gray-600 leading-snug">
              <span className="font-semibold text-gray-900">{entry.adminName}</span> {entry.action}
            </p>
            <p className="text-[10.5px] text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
          </div>
        ))}
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

// ─── Full audit trail modal ──────────────────────────────────────────────

const AUDIT_PAGE_SIZE = 8;

function AuditTrailModal({ audit, onClose }: { audit: IntegrityAuditEntry[]; onClose: () => void }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-serif text-[17px] font-bold text-gray-900">Full Audit Trail</h2>
            <p className="text-[11.5px] text-gray-400 mt-0.5">Every fix, reassignment, repoint, and dismissal, platform-wide.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>
        <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto divide-y divide-gray-50 flex-1">
          {visible.map((entry) => (
            <div key={entry.id} className="px-5 py-3">
              <p className="text-[12.5px] text-gray-700 leading-snug">
                <span className="font-semibold text-gray-900">{entry.adminName}</span> {entry.action}
              </p>
              <p className="text-[11px] text-gray-400 italic mt-0.5">{entry.reason}</p>
              <p className="text-[10.5px] text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
            </div>
          ))}
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

export default function AdminContactsManagementPage() {
  const [staleFlags, setStaleFlags] = useState<StaleNameFlag[]>(STALE_NAME_FLAGS);
  const [mismatchFlags, setMismatchFlags] = useState<MismatchFlag[]>(MISMATCH_FLAGS);
  const [orgCodes, setOrgCodes] = useState<OrgCode[]>(ORG_CODES);
  const [contacts, setContacts] = useState<IntegrityContact[]>(INTEGRITY_CONTACTS);
  const [audit, setAudit] = useState<IntegrityAuditEntry[]>(INTEGRITY_AUDIT);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function logAudit(flagId: string, flagKind: "mismatch" | "stale-name", action: IntegrityAction, reason: string) {
    setAudit((prev) => [
      {
        id: `iaudit-local-${prev.length + 1}-${flagId}`,
        timestamp: new Date().toISOString(),
        adminName: CURRENT_ADMIN,
        flagId,
        flagKind,
        action,
        reason,
      },
      ...prev,
    ]);
  }

  function handleFixName(flag: StaleNameFlag) {
    const code = orgCodes.find((c) => c.id === flag.orgCodeId);
    const matchedOrgName = code ? getOrgById(code.matchedOrgId)?.name : undefined;
    if (!code || !matchedOrgName) return;
    setOrgCodes((prev) => prev.map((c) => (c.id === code.id ? { ...c, staticName: matchedOrgName } : c)));
    setStaleFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, status: "resolved" } : f)));
    logAudit(flag.id, "stale-name", "renamed-code", `Updated cached label for code ${code.code} to "${matchedOrgName}".`);
    showToast(`Org code ${code.code} renamed to "${matchedOrgName}".`);
  }

  function handleDismissStale(flag: StaleNameFlag, reason: string) {
    setStaleFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, status: "dismissed" } : f)));
    logAudit(flag.id, "stale-name", "dismissed", reason);
    showToast("Flag dismissed.");
  }

  function handleReassignContact(flag: MismatchFlag, reason: string) {
    const contact = contacts.find((c) => c.id === flag.contactId);
    const code = contact ? orgCodes.find((oc) => oc.id === contact.orgCodeId) : undefined;
    if (!contact || !code) return;
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, registeredOrgId: code.matchedOrgId } : c)));
    setMismatchFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, status: "resolved" } : f)));
    logAudit(flag.id, "mismatch", "reassigned-contact", reason);
    showToast(`${getContactFullName(contact)} reassigned to match code ${code.code}.`);
  }

  function handleRepointCode(flag: MismatchFlag, reason: string) {
    const contact = contacts.find((c) => c.id === flag.contactId);
    const code = contact ? orgCodes.find((oc) => oc.id === contact.orgCodeId) : undefined;
    if (!contact || !code) return;
    setOrgCodes((prev) => prev.map((c) => (c.id === code.id ? { ...c, matchedOrgId: contact.registeredOrgId } : c)));
    setMismatchFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, status: "resolved" } : f)));
    logAudit(flag.id, "mismatch", "repointed-code", reason);
    showToast(`Code ${code.code} repointed to match ${getContactFullName(contact)}'s registration.`);
  }

  function handleDismissMismatch(flag: MismatchFlag, reason: string) {
    setMismatchFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, status: "dismissed" } : f)));
    logAudit(flag.id, "mismatch", "dismissed", reason);
    showToast("Flag dismissed.");
  }

  const openStaleFlags = staleFlags.filter((f) => f.status === "open");
  const openMismatchFlags = mismatchFlags.filter((f) => f.status === "open");
  const resolvedThisCycle =
    staleFlags.filter((f) => f.status === "resolved").length + mismatchFlags.filter((f) => f.status === "resolved").length;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm flex items-center gap-2.5 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-white/10 text-[13px] font-medium">
          <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
          {toast}
        </div>
      )}

      <div>
        <h2 className="font-serif text-[22px] font-bold text-gray-900">Contacts Management</h2>
        <p className="text-[13px] text-gray-500 mt-1 max-w-2xl leading-relaxed">
          Catches drift between what a contact was invited as and where they actually end up — before it reaches a
          survey response. Two patterns tracked: an org code&rsquo;s cached name going stale, and a contact
          registering under a different organization than their invite code resolves to.
        </p>
      </div>

      <DetectionMethodCard lastScan="2026-08-27T06:00:00Z" />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          {/* Registration mismatches */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-500" />
              <span className="font-serif text-[15px] font-semibold text-gray-900">Registered-Org Mismatches</span>
              <span className="bg-gray-100 text-gray-600 text-[12px] font-semibold px-2 py-0.5 rounded">
                {openMismatchFlags.length} open
              </span>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50/60 text-[13px] font-semibold text-gray-900">
                  <div className="flex-1 min-w-[130px]">Contact</div>
                  <div className="w-36 shrink-0">Invited As</div>
                  <div className="w-36 shrink-0">Registered Under</div>
                  <div className="w-28 shrink-0">Detected</div>
                  <div className="w-20 shrink-0">Status</div>
                  <div className="w-5 shrink-0" />
                </div>
                {mismatchFlags.length === 0 ? (
                  <p className="text-[12.5px] text-gray-400 italic px-4 py-6 text-center">No mismatches tracked.</p>
                ) : (
                  mismatchFlags.map((flag) => {
                    const contact = contacts.find((c) => c.id === flag.contactId);
                    if (!contact) return null;
                    const code = orgCodes.find((c) => c.id === contact.orgCodeId);
                    if (!code) return null;
                    return (
                      <MismatchRow
                        key={flag.id}
                        flag={flag}
                        contact={contact}
                        orgCode={code}
                        expanded={expandedId === flag.id}
                        onToggle={() => setExpandedId(expandedId === flag.id ? null : flag.id)}
                        onReassignContact={(reason) => handleReassignContact(flag, reason)}
                        onRepointCode={(reason) => handleRepointCode(flag, reason)}
                        onDismiss={(reason) => handleDismissMismatch(flag, reason)}
                        audit={audit}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Stale org-code names */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Pencil size={13} className="text-amber-500" />
              <span className="font-serif text-[15px] font-semibold text-gray-900">Stale Org-Code Names</span>
              <span className="bg-gray-100 text-gray-600 text-[12px] font-semibold px-2 py-0.5 rounded">
                {openStaleFlags.length} open
              </span>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50/60 text-[13px] font-semibold text-gray-900">
                  <div className="w-20 shrink-0">Code</div>
                  <div className="flex-1 min-w-[130px]">Cached Name</div>
                  <div className="flex-1 min-w-[130px]">Matched Org</div>
                  <div className="w-28 shrink-0">Detected</div>
                  <div className="w-20 shrink-0">Status</div>
                  <div className="w-5 shrink-0" />
                </div>
                {staleFlags.length === 0 ? (
                  <p className="text-[12.5px] text-gray-400 italic px-4 py-6 text-center">No stale names tracked.</p>
                ) : (
                  staleFlags.map((flag) => {
                    const code = orgCodes.find((c) => c.id === flag.orgCodeId);
                    if (!code) return null;
                    return (
                      <StaleNameRow
                        key={flag.id}
                        flag={flag}
                        orgCode={code}
                        expanded={expandedId === flag.id}
                        onToggle={() => setExpandedId(expandedId === flag.id ? null : flag.id)}
                        onFix={() => handleFixName(flag)}
                        onDismiss={(reason) => handleDismissStale(flag, reason)}
                        audit={audit}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SnapshotCard
            openMismatches={openMismatchFlags.length}
            openStaleNames={openStaleFlags.length}
            resolvedThisCycle={resolvedThisCycle}
            totalCodes={orgCodes.length}
          />
          <RecentActionsCard audit={audit} onViewAll={() => setAuditModalOpen(true)} />
        </div>
      </div>

      {auditModalOpen && <AuditTrailModal audit={audit} onClose={() => setAuditModalOpen(false)} />}
    </div>
  );
}
