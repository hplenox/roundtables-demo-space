"use client";

import { useMemo, useRef, useState } from "react";
import {
  Search, X, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  SlidersHorizontal, Flag, RotateCcw, Trash2, ArrowRight, History, Info,
} from "lucide-react";
import {
  ORG_RESPONSES,
  RESPONSE_AUDIT,
  OrgResponseRecord,
  ResponseAuditEntry,
  ResponseAuditAction,
  isCrossOrgSubmission,
  getSubmitterHomeOrgName,
  getSubmitterName,
} from "@/lib/mock-response-review";
import { PLATFORM_ORGS, getOrgById } from "@/lib/mock-org-associations";

const CURRENT_ADMIN = "You (Super Admin)";

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
        <div className="absolute z-20 mt-1 min-w-[260px] bg-white rounded-md border border-gray-200 shadow-lg py-1 max-h-64 overflow-y-auto">
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

// ─── Status presentation ────────────────────────────────────────────────────

function LifecycleBadge({ record }: { record: OrgResponseRecord }) {
  if (record.lifecycle === "deleted") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-red-50 text-red-600 border-red-200">
        Deleted
      </span>
    );
  }
  if (record.lifecycle === "reopened") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-50 text-blue-600 border-blue-200">
        Reopened
      </span>
    );
  }
  if (record.flagged) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
        <Flag size={9} /> Flagged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
      Active
    </span>
  );
}

// ─── Delete confirmation modal (deliberately high-friction) ────────────────

function DeleteModal({
  record,
  onCancel,
  onConfirm,
}: {
  record: OrgResponseRecord;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const org = getOrgById(record.orgId);
  const canConfirm = reason.trim().length >= 10 && acknowledged;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div
        className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
          <div className="shrink-0 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 size={14} className="text-red-500" />
          </div>
          <div>
            <h2 className="font-serif text-[16px] font-bold text-gray-900">Delete Response</h2>
            <p className="text-[11.5px] text-gray-500 mt-0.5">
              {record.surveyName} — filed under <span className="font-semibold text-gray-700">{org?.name}</span>
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-[12px] text-gray-500 leading-relaxed bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5">
            This platform has never deleted response data before. This removes it from{" "}
            <span className="font-semibold text-gray-700">{org?.name}</span>&rsquo;s active record and from
            pre-filling {record.prefillsInto.length > 0 ? "its upcoming surveys" : "future surveys"} — the record is
            kept (marked deleted) and fully logged in the audit trail, and can be restored later if needed.
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Reason for deletion (required)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Contact submitted their own organization's figures under the wrong org context..."
              className="w-full text-[12.5px] border border-gray-300 rounded-md px-2.5 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400 resize-none"
            />
          </div>

          <label className="flex items-start gap-2 text-[11.5px] text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 accent-blue-600"
            />
            I understand this action is recorded in the audit trail under my name and this data will no longer be
            available to pre-fill future surveys.
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={!canConfirm}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-[12px] font-semibold disabled:opacity-40 disabled:pointer-events-none hover:bg-red-700 transition-colors"
          >
            Delete response
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Response row (expandable) ──────────────────────────────────────────────

function AuditRow({ entry }: { entry: ResponseAuditEntry }) {
  const ACTION_CFG: Record<ResponseAuditAction, { label: string; cls: string }> = {
    flagged: { label: "flagged", cls: "bg-amber-50 text-amber-600" },
    unflagged: { label: "cleared the flag on", cls: "bg-gray-100 text-gray-500" },
    deleted: { label: "deleted", cls: "bg-red-50 text-red-500" },
    restored: { label: "restored", cls: "bg-emerald-50 text-emerald-600" },
    reopened: { label: "reopened", cls: "bg-blue-50 text-blue-600" },
  };
  const cfg = ACTION_CFG[entry.action];
  return (
    <div className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${cfg.cls}`}>
        <History size={10} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] text-gray-600 leading-snug">
          <span className="font-semibold text-gray-900">{entry.adminName}</span> {cfg.label} this response
        </p>
        <p className="text-[11px] text-gray-400 italic mt-0.5">{entry.reason}</p>
        <p className="text-[10.5px] text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
      </div>
    </div>
  );
}

function ResponseDetail({
  record,
  audit,
  onFlag,
  onUnflag,
  onReopen,
  onDelete,
  onRestore,
}: {
  record: OrgResponseRecord;
  audit: ResponseAuditEntry[];
  onFlag: (reason: string) => void;
  onUnflag: () => void;
  onReopen: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const [flagReason, setFlagReason] = useState("");
  const org = getOrgById(record.orgId);
  const homeOrgName = getSubmitterHomeOrgName(record);
  const crossOrg = isCrossOrgSubmission(record);
  const recordAudit = audit.filter((a) => a.responseId === record.id);

  return (
    <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Left: context + pre-fill impact */}
        <div className="space-y-3">
          <div className="bg-white rounded-md border border-gray-200 p-3.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Submission Context</p>
            <div className="space-y-1.5 text-[12px] text-gray-600">
              <p>
                Filed under <span className="font-semibold text-gray-900">{org?.name}</span> by{" "}
                <span className="font-semibold text-gray-900">{getSubmitterName(record)}</span>
              </p>
              {crossOrg && (
                <p className="flex items-start gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                  <Info size={12} className="shrink-0 mt-0.5" />
                  <span>
                    This contact&rsquo;s own organization is <span className="font-semibold">{homeOrgName}</span> —
                    filed via a secondary-org association, not their home org.
                  </span>
                </p>
              )}
              <p className="text-gray-400">Submitted {formatDate(record.submittedDate)}</p>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-3.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Downstream Pre-fill Impact
            </p>
            {record.prefillsInto.length === 0 ? (
              <p className="text-[11.5px] text-gray-400 italic">
                No upcoming surveys currently scheduled to pre-fill from this response.
              </p>
            ) : (
              <div className="space-y-1.5">
                {record.prefillsInto.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-violet-50 border border-violet-100">
                    <ArrowRight size={11} className="text-violet-400 shrink-0" />
                    <span className="text-[12px] text-violet-800 flex-1 min-w-0 truncate">
                      <span className="font-semibold">{t.surveyName}</span> · {t.hostOrg}
                    </span>
                    <span className="text-[10.5px] text-violet-400 shrink-0">{formatDate(t.targetDate)}</span>
                  </div>
                ))}
              </div>
            )}
            {record.lifecycle === "active" && record.prefillsInto.length > 0 && (
              <p className="text-[10.5px] text-gray-400 mt-2 leading-relaxed">
                If this data is wrong, it will carry forward into every survey listed above until it&rsquo;s
                corrected, reopened, or deleted.
              </p>
            )}
          </div>
        </div>

        {/* Right: actions + audit */}
        <div className="space-y-3">
          <div className="bg-white rounded-md border border-gray-200 p-3.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Review Actions</p>

            {record.lifecycle === "deleted" ? (
              <button
                onClick={onRestore}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-[11.5px] font-semibold hover:bg-emerald-700 transition-colors"
              >
                <RotateCcw size={12} /> Restore response
              </button>
            ) : (
              <div className="space-y-2.5">
                {!record.flagged ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      placeholder="Reason to flag for review…"
                      className="flex-1 min-w-0 text-[12px] border border-gray-300 rounded-md px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                    />
                    <button
                      onClick={() => {
                        if (!flagReason.trim()) return;
                        onFlag(flagReason.trim());
                        setFlagReason("");
                      }}
                      disabled={!flagReason.trim()}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 text-white text-[11.5px] font-semibold disabled:opacity-40 hover:bg-amber-600 transition-colors"
                    >
                      <Flag size={11} /> Flag
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-amber-50 border border-amber-200">
                    <span className="text-[11px] text-amber-700">Flagged for review</span>
                    <button
                      onClick={onUnflag}
                      className="text-[11px] font-semibold text-amber-700 hover:underline"
                    >
                      Clear flag
                    </button>
                  </div>
                )}

                <button
                  onClick={onReopen}
                  disabled={record.lifecycle === "reopened"}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-[11.5px] font-semibold disabled:opacity-40 disabled:pointer-events-none hover:bg-blue-100 transition-colors"
                >
                  <RotateCcw size={12} /> {record.lifecycle === "reopened" ? "Reopened for resubmission" : "Reopen for resubmission"}
                </button>

                <button
                  onClick={onDelete}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 bg-white text-red-600 text-[11.5px] font-semibold hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={12} /> Delete response
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-3.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <History size={11} /> Review History
            </p>
            {recordAudit.length === 0 ? (
              <p className="text-[11.5px] text-gray-400 italic">No review actions recorded.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recordAudit.map((entry) => (
                  <AuditRow key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResponseRow({
  record,
  audit,
  expanded,
  onToggle,
  onFlag,
  onUnflag,
  onReopen,
  onDelete,
  onRestore,
}: {
  record: OrgResponseRecord;
  audit: ResponseAuditEntry[];
  expanded: boolean;
  onToggle: () => void;
  onFlag: (reason: string) => void;
  onUnflag: () => void;
  onReopen: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const org = getOrgById(record.orgId);
  const crossOrg = isCrossOrgSubmission(record);

  return (
    <div>
      <div
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50/70 transition-colors text-[13px] cursor-pointer"
      >
        <div className="flex-1 min-w-[140px]">
          <p className="text-blue-600 font-medium truncate" title={record.surveyName}>{record.surveyName}</p>
          <p className="text-[10.5px] text-gray-400 truncate">{record.hostOrg} · {record.year}</p>
        </div>
        <div className="w-32 shrink-0 text-gray-700 truncate" title={org?.name}>{org?.name ?? "—"}</div>
        <div className="w-36 shrink-0 truncate">
          <span className="text-gray-700">{getSubmitterName(record)}</span>
          {crossOrg && <span className="block text-[10px] text-amber-600">via secondary org</span>}
        </div>
        <div className="w-20 shrink-0 text-gray-400">{formatDate(record.submittedDate)}</div>
        <div className="w-24 shrink-0"><LifecycleBadge record={record} /></div>
        <div className="w-20 shrink-0 text-gray-500 text-[11.5px]">
          {record.prefillsInto.length > 0 ? `${record.prefillsInto.length} upcoming` : "—"}
        </div>
        <div className="w-5 shrink-0 flex justify-end text-gray-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <ResponseDetail
          record={record}
          audit={audit}
          onFlag={onFlag}
          onUnflag={onUnflag}
          onReopen={onReopen}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      )}
    </div>
  );
}

// ─── Right rail ──────────────────────────────────────────────────────────

function SnapshotCard({
  total,
  crossOrg,
  flagged,
  deleted,
}: {
  total: number;
  crossOrg: number;
  flagged: number;
  deleted: number;
}) {
  const rows = [
    { label: "Total Responses", value: total },
    { label: "Cross-Org Submissions", value: crossOrg },
    { label: "Flagged for Review", value: flagged },
    { label: "Deleted", value: deleted },
  ];
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-serif text-[15px] font-bold text-blue-600 mb-1">Response Snapshot</h3>
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

function RecentActionsCard({ audit, onViewAll }: { audit: ResponseAuditEntry[]; onViewAll: () => void }) {
  const recent = [...audit].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  const ACTION_LABEL: Record<ResponseAuditAction, string> = {
    flagged: "Flagged",
    unflagged: "Cleared flag on",
    deleted: "Deleted",
    restored: "Restored",
    reopened: "Reopened",
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-serif text-[14px] font-bold text-blue-600">Recent Review Actions</h3>
      </div>
      <div className="px-4 divide-y divide-gray-50">
        {recent.map((entry) => {
          const record = ORG_RESPONSES.find((r) => r.id === entry.responseId);
          return (
            <div key={entry.id} className="py-2.5">
              <p className="text-[11.5px] text-gray-600 leading-snug">
                <span className="font-semibold text-gray-900">{ACTION_LABEL[entry.action]}</span>{" "}
                {record?.surveyName ?? "a response"}
              </p>
              <p className="text-[10.5px] text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
            </div>
          );
        })}
        {recent.length === 0 && <p className="text-[11.5px] text-gray-400 italic py-2.5">No review actions yet.</p>}
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

function AuditTrailModal({ audit, onClose }: { audit: ResponseAuditEntry[]; onClose: () => void }) {
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
            <p className="text-[11.5px] text-gray-400 mt-0.5">Every flag, reopen, delete, and restore, platform-wide.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto divide-y divide-gray-50 flex-1">
          {visible.map((entry) => {
            const record = ORG_RESPONSES.find((r) => r.id === entry.responseId);
            const org = record ? getOrgById(record.orgId) : undefined;
            return (
              <div key={entry.id} className="flex items-start gap-3 px-5 py-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center mt-0.5 text-gray-500">
                  <History size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] text-gray-700 leading-snug">
                    <span className="font-semibold text-gray-900">{entry.adminName}</span> {entry.action}{" "}
                    <span className="font-semibold text-gray-900">{record?.surveyName ?? "a response"}</span>
                    {org && <span className="text-gray-400"> (filed under {org.name})</span>}
                  </p>
                  <p className="text-[11px] text-gray-400 italic mt-0.5">{entry.reason}</p>
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

type StatusFilter = "all" | "flagged" | "cross-org" | "deleted";

export default function AdminResponsesPage() {
  const [responses, setResponses] = useState<OrgResponseRecord[]>(ORG_RESPONSES);
  const [audit, setAudit] = useState<ResponseAuditEntry[]>(RESPONSE_AUDIT);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [orgFilter, setOrgFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function logAudit(responseId: string, action: ResponseAuditAction, reason: string) {
    setAudit((prev) => [
      {
        id: `resp-audit-local-${prev.length + 1}-${responseId}`,
        timestamp: new Date().toISOString(),
        adminName: CURRENT_ADMIN,
        responseId,
        action,
        reason,
      },
      ...prev,
    ]);
  }

  function updateResponse(id: string, patch: Partial<OrgResponseRecord>) {
    setResponses((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleFlag(id: string, reason: string) {
    updateResponse(id, { flagged: true, flagReason: reason });
    logAudit(id, "flagged", reason);
    showToast("Response flagged for review.");
  }

  function handleUnflag(id: string) {
    updateResponse(id, { flagged: false, flagReason: undefined });
    logAudit(id, "unflagged", "Reviewed and cleared — no issue found.");
    showToast("Flag cleared.");
  }

  function handleReopen(id: string) {
    updateResponse(id, { lifecycle: "reopened" });
    logAudit(id, "reopened", "Reopened the survey for this organization to resubmit.");
    showToast("Response reopened for resubmission.");
  }

  function handleDeleteConfirm(reason: string) {
    if (!deleteTargetId) return;
    updateResponse(deleteTargetId, { lifecycle: "deleted", flagged: false });
    logAudit(deleteTargetId, "deleted", reason);
    showToast("Response deleted. It no longer pre-fills future surveys and can be restored from the audit trail.");
    setDeleteTargetId(null);
    setExpandedId(null);
  }

  function handleRestore(id: string) {
    updateResponse(id, { lifecycle: "active" });
    logAudit(id, "restored", "Restored after review.");
    showToast("Response restored.");
  }

  const filteredResponses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return responses.filter((r) => {
      if (statusFilter === "flagged" && !r.flagged) return false;
      if (statusFilter === "cross-org" && !isCrossOrgSubmission(r)) return false;
      if (statusFilter === "deleted" && r.lifecycle !== "deleted") return false;
      if (statusFilter !== "deleted" && statusFilter !== "all" && r.lifecycle === "deleted") return false;
      if (orgFilter && r.orgId !== orgFilter) return false;
      if (!q) return true;
      const org = getOrgById(r.orgId);
      return (
        r.surveyName.toLowerCase().includes(q) ||
        r.hostOrg.toLowerCase().includes(q) ||
        org?.name.toLowerCase().includes(q) ||
        getSubmitterName(r).toLowerCase().includes(q)
      );
    });
  }, [responses, search, statusFilter, orgFilter]);

  const hasActiveFilters = statusFilter !== "all" || orgFilter !== "" || search.trim() !== "";
  function clearFilters() {
    setStatusFilter("all");
    setOrgFilter("");
    setSearch("");
  }

  const activeResponses = responses.filter((r) => r.lifecycle !== "deleted");
  const crossOrgCount = activeResponses.filter(isCrossOrgSubmission).length;
  const flaggedCount = activeResponses.filter((r) => r.flagged).length;
  const deletedCount = responses.filter((r) => r.lifecycle === "deleted").length;

  const deleteTarget = responses.find((r) => r.id === deleteTargetId) ?? null;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm flex items-center gap-2.5 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-white/10 text-[13px] font-medium">
          <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
          {toast}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal record={deleteTarget} onCancel={() => setDeleteTargetId(null)} onConfirm={handleDeleteConfirm} />
      )}

      {/* Section header */}
      <div>
        <h2 className="font-serif text-[22px] font-bold text-gray-900">Response Review</h2>
        <p className="text-[13px] text-gray-500 mt-1 max-w-2xl leading-relaxed">
          Review historical responses filed under each organization — especially ones submitted via a
          secondary-org association. Old data pre-fills that org&rsquo;s upcoming surveys, so an invalid response
          needs to be caught and corrected before it carries forward, not just at the source.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
        {/* Main column */}
        <div className="min-w-0 bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="font-serif text-[15px] font-semibold text-gray-900">Responses</span>
            <span className="bg-gray-100 text-gray-600 text-[12px] font-semibold px-2 py-0.5 rounded">
              {activeResponses.length}
            </span>
          </div>

          {/* Filter row */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5 flex-wrap">
            <FilterDropdown
              label="Status"
              value={statusFilter}
              activeCount={statusFilter === "all" ? 0 : 1}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={[
                { value: "all", label: "All Responses" },
                { value: "cross-org", label: "Cross-Org Submissions" },
                { value: "flagged", label: "Flagged for Review" },
                { value: "deleted", label: "Deleted" },
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
              <X size={12} /> Clear
            </button>
            <div className="relative ml-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search survey, host, org, or contact…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-3 w-64 rounded-md bg-white border border-gray-300 text-[12.5px] text-gray-700 placeholder:text-gray-400 placeholder:italic focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50/60 text-[13px] font-semibold text-gray-900">
                <div className="flex-1 min-w-[140px]">Survey</div>
                <div className="w-32 shrink-0">Filed Under</div>
                <div className="w-36 shrink-0">Submitted By</div>
                <div className="w-20 shrink-0">Date</div>
                <div className="w-24 shrink-0">Status</div>
                <div className="w-20 shrink-0">Pre-fill</div>
                <div className="w-5 shrink-0" />
              </div>

              {filteredResponses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle size={20} className="text-gray-200 mb-2" />
                  <p className="text-[13px] text-gray-500">No responses match your filter.</p>
                </div>
              ) : (
                filteredResponses.map((record) => (
                  <ResponseRow
                    key={record.id}
                    record={record}
                    audit={audit}
                    expanded={expandedId === record.id}
                    onToggle={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    onFlag={(reason) => handleFlag(record.id, reason)}
                    onUnflag={() => handleUnflag(record.id)}
                    onReopen={() => handleReopen(record.id)}
                    onDelete={() => setDeleteTargetId(record.id)}
                    onRestore={() => handleRestore(record.id)}
                  />
                ))
              )}
            </div>
          </div>

          <p className="text-center text-[11.5px] text-gray-400 py-3">
            {filteredResponses.length} of {responses.length} responses shown
          </p>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <SnapshotCard
            total={activeResponses.length}
            crossOrg={crossOrgCount}
            flagged={flaggedCount}
            deleted={deletedCount}
          />
          <RecentActionsCard audit={audit} onViewAll={() => setAuditModalOpen(true)} />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setAuditModalOpen(true)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:underline transition-colors"
        >
          <History size={13} /> View full audit trail
        </button>
      </div>

      {auditModalOpen && <AuditTrailModal audit={audit} onClose={() => setAuditModalOpen(false)} />}
    </div>
  );
}
