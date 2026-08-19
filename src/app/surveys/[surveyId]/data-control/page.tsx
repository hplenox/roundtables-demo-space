"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  BarChart3,
  Mail,
  X,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Send,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Info,
  TrendingDown,
} from "lucide-react";
import {
  getAuditsBySurveyId,
  generateReminderEmail,
  SubmissionAudit,
  DataFlag,
  AuditSeverity,
  FlagCategory,
} from "@/lib/mock-data-control";

const SCAN_STEPS = [
  "Initializing audit engine...",
  "Loading survey submissions...",
  "Scanning demographic data...",
  "Detecting gender outliers...",
  "Detecting racial anomalies...",
  "Cross-validating data integrity...",
  "Generating audit report...",
];

const CATEGORY_LABELS: Record<FlagCategory, string> = {
  completeness: "Completeness",
  gender_outlier: "Gender",
  racial_outlier: "Racial",
  data_inconsistency: "Inconsistency",
  no_submission: "No Submission",
  suspicious_pattern: "Suspicious",
  missing_demographics: "Missing Data",
};

const CATEGORY_ICONS: Record<FlagCategory, React.ElementType> = {
  completeness: AlertCircle,
  gender_outlier: Users,
  racial_outlier: BarChart3,
  data_inconsistency: TrendingDown,
  no_submission: Clock,
  suspicious_pattern: AlertTriangle,
  missing_demographics: Info,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeverityBadge({ severity, count }: { severity: AuditSeverity; count: number }) {
  const cfg = {
    critical: { cls: "bg-red-50 text-red-600 border-red-200", Icon: XCircle, label: "CRITICAL" },
    warning:  { cls: "bg-amber-50 text-amber-600 border-amber-200", Icon: AlertTriangle, label: "WARNING" },
    clean:    { cls: "bg-emerald-50 text-emerald-600 border-emerald-200", Icon: CheckCircle2, label: "CLEAN" },
  }[severity];
  const { cls, Icon, label } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      <Icon size={9} />
      {label}
      {count > 0 && ` · ${count}`}
    </span>
  );
}

function FlagRow({ flag }: { flag: DataFlag }) {
  const isCrit = flag.severity === "critical";
  const CategoryIcon = CATEGORY_ICONS[flag.category];
  return (
    <div className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-[12px] ${
      isCrit ? "bg-red-50/70 border border-red-100" : "bg-amber-50/60 border border-amber-100"
    }`}>
      {isCrit
        ? <XCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
        : <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-semibold ${isCrit ? "text-red-700" : "text-amber-700"}`}>
            {flag.title}
          </span>
          <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            isCrit ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"
          }`}>
            <CategoryIcon size={9} />
            {CATEGORY_LABELS[flag.category]}
          </span>
        </div>
        <p className={`mt-0.5 leading-relaxed ${isCrit ? "text-red-500" : "text-amber-600"}`}>
          {flag.detail}
        </p>
        {flag.metric && (
          <code className={`mt-1 inline-block text-[10.5px] font-mono px-1.5 py-0.5 rounded ${
            isCrit ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
          }`}>
            {flag.metric}
          </code>
        )}
      </div>
      {flag.threshold && (
        <span className="text-[10.5px] text-slate-400 shrink-0 whitespace-nowrap">{flag.threshold}</span>
      )}
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  if (score === 0) return (
    <div className="text-center w-14">
      <div className="text-[20px] font-bold text-slate-300">—</div>
      <div className="text-[10px] text-slate-400">Score</div>
    </div>
  );
  const color = score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-red-500";
  return (
    <div className="text-center w-14">
      <div className={`text-[22px] font-bold leading-none ${color}`}>{score}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">Quality</div>
    </div>
  );
}

// ─── Audit Card ───────────────────────────────────────────────────────────────

interface AuditCardProps {
  audit: SubmissionAudit;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleInclude: () => void;
  onSendReminder: () => void;
  reminderSent: boolean;
}

function AuditCard({ audit, isExpanded, onToggleExpand, onToggleInclude, onSendReminder, reminderSent }: AuditCardProps) {
  const critCount = audit.flags.filter((f) => f.severity === "critical").length;
  const warnCount = audit.flags.filter((f) => f.severity === "warning").length;
  const visibleFlags = isExpanded ? audit.flags : audit.flags.slice(0, 2);
  const extraFlags = audit.flags.length - 2;

  const borderColor =
    audit.overallSeverity === "critical" ? "#ef4444" :
    audit.overallSeverity === "warning"  ? "#f59e0b" : "#10b981";

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-opacity duration-200 ${
        !audit.includedInReport ? "opacity-55" : ""
      }`}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-start gap-4 px-5 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-bold text-slate-900">{audit.orgName}</span>
            <SeverityBadge severity={audit.overallSeverity} count={audit.flags.length} />
            {!audit.includedInReport && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full border border-slate-200 font-semibold tracking-wide">
                EXCLUDED
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-[12px] text-slate-400">
            <span>{audit.contactName}</span>
            <span className="text-slate-200">·</span>
            <span>{audit.contactEmail}</span>
            <span className="text-slate-200">·</span>
            <span>{audit.assetClass}</span>
            <span className="text-slate-200">·</span>
            <span className="font-medium text-slate-500">{audit.aum}</span>
          </div>
          <div className="mt-1 text-[11.5px]">
            {audit.status === "submitted" ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={10} />
                Submitted {audit.submittedDate} · 100% complete
              </span>
            ) : audit.status === "in_progress" ? (
              <span className="text-amber-500 flex items-center gap-1">
                <Clock size={10} />
                In progress · {audit.progress}% complete
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                Not started · Invited Feb 8, 2026
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ScoreGauge score={audit.scanScore} />
          <button
            onClick={onToggleInclude}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
              audit.includedInReport
                ? "bg-[#4361ee]/8 text-[#3147af] border-[#4361ee]/25 hover:bg-[#4361ee]/15"
                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {audit.includedInReport ? <Eye size={11} /> : <EyeOff size={11} />}
            {audit.includedInReport ? "In report" : "Excluded"}
          </button>
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Flags */}
      {audit.flags.length > 0 && (
        <div className="px-5 pb-3 space-y-1.5">
          {visibleFlags.map((flag) => <FlagRow key={flag.id} flag={flag} />)}
          {!isExpanded && extraFlags > 0 && (
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronDown size={10} />
              {extraFlags} more flag{extraFlags !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {audit.flags.length === 0 && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
            <CheckCircle2 size={13} />
            No issues detected — all data passes quality checks.
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/60 border-t border-slate-100">
        <button
          onClick={onSendReminder}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
            reminderSent
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default"
              : "bg-white text-slate-600 border-slate-200 hover:border-[#4361ee]/40 hover:text-[#3147af]"
          }`}
        >
          {reminderSent ? <CheckCircle2 size={11} /> : <Mail size={11} />}
          {reminderSent ? "Reminder sent" : "Send reminder"}
        </button>

        <button
          onClick={onToggleInclude}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors bg-white ${
            audit.includedInReport
              ? "text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
              : "text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
          }`}
        >
          {audit.includedInReport ? <EyeOff size={11} /> : <Eye size={11} />}
          {audit.includedInReport ? "Exclude from report" : "Include in report"}
        </button>

        <div className="ml-auto flex items-center gap-2 text-[11px]">
          {critCount > 0 && (
            <span className="text-red-400 flex items-center gap-0.5">
              <XCircle size={10} /> {critCount} critical
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-amber-400 flex items-center gap-0.5">
              <AlertTriangle size={10} /> {warnCount} warning{warnCount !== 1 ? "s" : ""}
            </span>
          )}
          {audit.flags.length === 0 && (
            <span className="text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 size={10} /> No issues
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Email Modal ──────────────────────────────────────────────────────────────

interface EmailModalProps {
  audit: SubmissionAudit;
  subject: string;
  body: string;
  onSend: () => void;
  onClose: () => void;
}

function EmailModal({ audit, subject, body, onSend, onClose }: EmailModalProps) {
  const [emailSubject, setEmailSubject] = useState(subject);
  const [emailBody, setEmailBody] = useState(body);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center">
              <Mail size={14} className="text-[#4361ee]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-900">Send Data Reminder</p>
              <p className="text-[11px] text-slate-400">{audit.orgName} · {audit.contactName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">To</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-600">
              <Mail size={11} className="text-slate-300" />
              {audit.contactName} &lt;{audit.contactEmail}&gt;
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Subject</label>
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[12px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee] transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Message</label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={16}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[12px] text-slate-700 font-mono leading-relaxed bg-white focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee] resize-none transition-colors"
            />
          </div>

          {audit.flags.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Issues Referenced ({audit.flags.length})
              </p>
              <div className="space-y-1">
                {audit.flags.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-[11px]">
                    {f.severity === "critical"
                      ? <XCircle size={10} className="text-red-400 shrink-0" />
                      : <AlertTriangle size={10} className="text-amber-400 shrink-0" />}
                    <span className={f.severity === "critical" ? "text-red-600" : "text-amber-600"}>
                      {f.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info size={10} />
            This reminder will be logged in the audit trail.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[12px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              className="px-4 py-2 rounded-lg text-[12px] font-medium bg-[#0f1923] text-white hover:bg-[#1a2d3d] transition-colors flex items-center gap-2"
            >
              <Send size={12} />
              Send Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterKey = "all" | "critical" | "warning" | "clean";

export default function DataControlPage() {
  const { surveyId } = useParams<{ surveyId: string }>();

  const [isScanning, setIsScanning] = useState(true);
  const [scanFading, setScanFading] = useState(false);
  const [scanStepIdx, setScanStepIdx] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  const surveyAudits = useMemo(() => getAuditsBySurveyId(surveyId), [surveyId]);

  const [audits, setAudits] = useState(() => surveyAudits.map((a) => ({ ...a })));
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState<{
    audit: SubmissionAudit;
    subject: string;
    body: string;
  } | null>(null);
  const [reminderSent, setReminderSent] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  // Reset local state when survey changes
  useEffect(() => {
    setAudits(getAuditsBySurveyId(surveyId).map((a) => ({ ...a })));
    setActiveFilter("all");
    setExpandedOrg(null);
    setReminderSent(new Set());
  }, [surveyId]);

  // Scan animation
  useEffect(() => {
    setIsScanning(true);
    setScanFading(false);
    setScanStepIdx(0);
    setScanProgress(0);

    const STEP_MS = 500;
    const TOTAL_MS = SCAN_STEPS.length * STEP_MS;

    const progressInterval = setInterval(() => {
      setScanProgress((p) => Math.min(p + (98 / (TOTAL_MS / 50)), 98));
    }, 50);

    const stepInterval = setInterval(() => {
      setScanStepIdx((i) => Math.min(i + 1, SCAN_STEPS.length - 1));
    }, STEP_MS);

    const doneTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setScanProgress(100);
      setTimeout(() => {
        setScanFading(true);
        setTimeout(() => setIsScanning(false), 450);
      }, 350);
    }, TOTAL_MS);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(doneTimeout);
    };
  }, [surveyId]);

  const stats = useMemo(() => ({
    total:    audits.length,
    critical: audits.filter((a) => a.overallSeverity === "critical").length,
    warning:  audits.filter((a) => a.overallSeverity === "warning").length,
    clean:    audits.filter((a) => a.overallSeverity === "clean").length,
    excluded: audits.filter((a) => !a.includedInReport).length,
  }), [audits]);

  const filteredAudits = useMemo(() => {
    if (activeFilter === "all") return audits;
    return audits.filter((a) => a.overallSeverity === activeFilter);
  }, [audits, activeFilter]);

  function toggleInclude(orgId: string) {
    setAudits((prev) =>
      prev.map((a) => (a.orgId === orgId ? { ...a, includedInReport: !a.includedInReport } : a))
    );
    const audit = audits.find((a) => a.orgId === orgId);
    if (audit) showToast(audit.includedInReport ? `${audit.orgName} excluded from report.` : `${audit.orgName} included in report.`);
  }

  function openEmailModal(audit: SubmissionAudit) {
    const { subject, body } = generateReminderEmail(audit);
    setEmailModal({ audit, subject, body });
  }

  function sendReminder(orgId: string) {
    setReminderSent((prev) => new Set([...prev, orgId]));
    setEmailModal(null);
    showToast("Reminder sent. Logged in the audit trail.");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  // ── Scan animation ──────────────────────────────────────────────────────────
  if (isScanning) {
    return (
      <div className={`transition-opacity duration-500 ${scanFading ? "opacity-0" : "opacity-100"}`}>
        <style>{`
          @keyframes scanGlass {
            0%   { transform: translate(0px,0px) rotate(0deg); }
            15%  { transform: translate(20px,-10px) rotate(22deg); }
            35%  { transform: translate(-14px, 14px) rotate(-18deg); }
            55%  { transform: translate(24px, 7px) rotate(28deg); }
            75%  { transform: translate(-20px,-12px) rotate(-22deg); }
            100% { transform: translate(0px,0px) rotate(0deg); }
          }
          @keyframes scanRing {
            0%   { transform: scale(1); opacity: 0.35; }
            60%  { transform: scale(1.8); opacity: 0; }
            100% { transform: scale(1.8); opacity: 0; }
          }
          @keyframes scanDot {
            0%, 100% { opacity: 0.25; }
            50%       { opacity: 1; }
          }
        `}</style>

        <div className="min-h-[500px] flex flex-col items-center justify-center py-20 select-none">
          <div className="relative mb-10 w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#4361ee]/25"
              style={{ animation: "scanRing 2.2s ease-out infinite" }} />
            <div className="absolute inset-0 rounded-full border border-[#4361ee]/15"
              style={{ animation: "scanRing 2.2s ease-out infinite 0.7s" }} />
            <div className="absolute inset-0 rounded-full border border-[#4361ee]/10"
              style={{ animation: "scanRing 2.2s ease-out infinite 1.4s" }} />
            <div className="relative z-10 w-20 h-20 rounded-full bg-[#0f1923] border-2 border-[#4361ee]/35 flex items-center justify-center shadow-xl">
              <div style={{ animation: "scanGlass 2.6s ease-in-out infinite" }}>
                <Search size={30} className="text-[#4361ee]" strokeWidth={2.2} />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Data Control</h2>
            <p className="text-[12.5px] text-slate-400 mt-1">
              Audit Engine · {surveyAudits.length} submission{surveyAudits.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="w-80 mb-5">
            <div className="flex justify-between text-[11px] text-slate-400 mb-2">
              <span>Scanning {surveyAudits.length} submissions</span>
              <span className="font-mono">{Math.round(scanProgress)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{ width: `${scanProgress}%`, background: "linear-gradient(90deg, #4361ee, #4361eecc)" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-[#4361ee]"
              style={{ animation: "scanDot 0.9s ease-in-out infinite" }}
            />
            <p className="text-[13px] font-semibold text-slate-700">{SCAN_STEPS[scanStepIdx]}</p>
          </div>

          <div className="flex gap-1.5 mt-6">
            {SCAN_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full transition-all duration-300"
                style={{
                  width: i <= scanStepIdx ? "28px" : "12px",
                  background: i <= scanStepIdx ? "#4361ee" : "#e2e8f0",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── No data for this survey ─────────────────────────────────────────────────
  if (audits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
          <Shield size={22} className="text-slate-300" />
        </div>
        <p className="text-[15px] font-semibold text-slate-700 mb-1">No audit data yet</p>
        <p className="text-sm text-slate-400 max-w-xs">
          Data Control will automatically scan submissions once managers begin responding to this survey.
        </p>
      </div>
    );
  }

  // ── Main content ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <style>{`
        @keyframes dcFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dc-fadein { animation: dcFadeIn 0.45s ease both; }
      `}</style>

      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-[#0f1923] text-white px-4 py-2.5 rounded-xl shadow-xl border border-white/10 text-[13px] font-medium">
          <CheckCircle2 size={14} className="text-[#4361ee]" />
          {toast}
        </div>
      )}

      {emailModal && (
        <EmailModal
          audit={emailModal.audit}
          subject={emailModal.subject}
          body={emailModal.body}
          onSend={() => sendReminder(emailModal.audit.orgId)}
          onClose={() => setEmailModal(null)}
        />
      )}

      {/* Header */}
      <div className="dc-fadein flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield size={18} className="text-[#4361ee]" />
            Data Control
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated audit engine scans every submission for demographic outliers, completeness gaps, and data anomalies — before reports are generated.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Clock size={10} />
            Scanned: just now
          </span>
          <button
            onClick={() => {
              setIsScanning(true);
              setScanFading(false);
              setScanStepIdx(0);
              setScanProgress(0);
            }}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3147af] bg-[#4361ee]/8 border border-[#4361ee]/25 px-3 py-1.5 rounded-lg hover:bg-[#4361ee]/15 transition-colors shadow-sm"
          >
            <RefreshCw size={11} />
            Re-scan
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="dc-fadein grid grid-cols-5 gap-3">
        {([
          { label: "Scanned",  value: stats.total,    color: "slate",   Icon: Search },
          { label: "Critical", value: stats.critical,  color: "red",     Icon: XCircle },
          { label: "Warnings", value: stats.warning,   color: "amber",   Icon: AlertTriangle },
          { label: "Clean",    value: stats.clean,     color: "emerald", Icon: CheckCircle2 },
          { label: "Excluded", value: stats.excluded,  color: "slate",   Icon: EyeOff },
        ] as const).map(({ label, value, color, Icon }) => (
          <div
            key={label}
            className={`bg-white rounded-xl border shadow-sm p-4 text-center ${
              color === "red"     ? "border-red-100"     :
              color === "amber"   ? "border-amber-100"   :
              color === "emerald" ? "border-emerald-100" :
              "border-slate-200"
            }`}
          >
            <Icon size={15} className={`mx-auto mb-1.5 ${
              color === "red"     ? "text-red-400"     :
              color === "amber"   ? "text-amber-400"   :
              color === "emerald" ? "text-emerald-400" :
              "text-slate-400"
            }`} />
            <p className={`text-[26px] font-bold leading-none ${
              color === "red"     ? "text-red-600"     :
              color === "amber"   ? "text-amber-600"   :
              color === "emerald" ? "text-emerald-600" :
              "text-slate-700"
            }`}>{value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="dc-fadein flex items-center gap-2 flex-wrap">
        <span className="text-[11.5px] text-slate-400 font-medium flex items-center gap-1.5 mr-1">
          <Filter size={11} />
          Filter:
        </span>
        {(["all", "critical", "warning", "clean"] as FilterKey[]).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
              activeFilter === f
                ? f === "critical" ? "bg-red-500 text-white border-red-500"
                  : f === "warning" ? "bg-amber-400 text-white border-amber-400"
                  : f === "clean"   ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-[#0f1923] text-white border-[#0f1923]"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {f === "all"      ? `All (${stats.total})`         :
             f === "critical" ? `Critical (${stats.critical})` :
             f === "warning"  ? `Warnings (${stats.warning})`  :
                                `Clean (${stats.clean})`}
          </button>
        ))}
        <div className="ml-auto text-[11.5px] text-slate-400">
          {filteredAudits.length} submission{filteredAudits.length !== 1 ? "s" : ""} shown
        </div>
      </div>

      {/* Audit cards */}
      <div className="dc-fadein space-y-3">
        {filteredAudits.map((audit) => (
          <AuditCard
            key={audit.orgId}
            audit={audit}
            isExpanded={expandedOrg === audit.orgId}
            onToggleExpand={() => setExpandedOrg(expandedOrg === audit.orgId ? null : audit.orgId)}
            onToggleInclude={() => toggleInclude(audit.orgId)}
            onSendReminder={() => openEmailModal(audit)}
            reminderSent={reminderSent.has(audit.orgId)}
          />
        ))}
        {filteredAudits.length === 0 && (
          <div className="text-center py-12">
            <Shield size={26} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No submissions match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
