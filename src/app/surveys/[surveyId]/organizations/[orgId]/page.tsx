"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrgById, getSurveyById, getCustomAssetClassesBySurveyId } from "@/lib/mock-data";
import type { InvitedOrg } from "@/types/survey";
import {
  ChevronRight,
  FileText,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Upload,
  BellRing,
  Tag,
  X,
  Send,
  CheckCircle,
  Edit2,
  Pencil,
  StickyNote,
  BadgeCheck,
  Lock,
  Layers,
} from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  submitted:   { label: "Submitted",   badge: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: CheckCircle2 },
  in_progress: { label: "In Progress", badge: "bg-amber-50 border-amber-200 text-amber-700",       icon: Clock },
  not_started: { label: "Not Started", badge: "bg-slate-50 border-slate-200 text-slate-500",       icon: AlertCircle },
};

const MANUAL_STATUSES = ["No information", "Pending review", "Approved", "Flagged", "Admin complete"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildEmailBody(org: InvitedOrg): string {
  return `Dear ${org.contactName},

We hope this message finds you well. We're reaching out because ${org.name}'s survey response is currently at ${org.progress}% completion, and we'd love to see you cross the finish line.

Your organization's participation is essential to our DEI benchmarking initiative. Completing the survey ensures ${org.name} is fully represented in this year's LPI results and enables a richer, more accurate picture of diversity, equity, and inclusion across the industry.

Please log in at your earliest convenience to complete the remaining sections. If you have any questions or run into any issues, our team is here to help.

Thank you for your continued partnership.

Warm regards,
Survey Administration Team`;
}

function getDemoContributors(org: InvitedOrg) {
  const base = [{ name: org.contactName, email: org.contactEmail, title: org.contactTitle, completed: org.status === "submitted" }];
  if (org.status === "submitted") {
    const domain = org.contactEmail.split("@")[1] ?? "firm.com";
    base.push(
      { name: "Sarah Mitchell",  email: `s.mitchell@${domain}`,  title: "Head of Human Resources", completed: true },
      { name: "James Okonkwo",   email: `j.okonkwo@${domain}`,   title: "DEI Program Manager",     completed: false },
    );
  }
  return base;
}

// ─── Transparency table ───────────────────────────────────────────────────────

const TRANSPARENCY_ROWS = [
  { key: "workforce" as const,  label: "Total Full-Time Employees" },
  { key: "leadership" as const, label: "Senior Leadership" },
  { key: "ownership" as const,  label: "Ownership" },
];

// Demo transparency %: ownership always 100, others derived heuristically
const TRANSPARENCY_DEMO: Record<string, number> = {
  workforce: 81,
  leadership: 96,
  ownership: 100,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NudgeModal({ org, onClose }: { org: InvitedOrg; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5f3] flex items-center justify-center">
              <Mail size={15} className="text-[#3147af]" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800">Send Nudge Reminder</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{org.contactName} · {org.progress}% complete</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        {sent ? (
          <div className="flex flex-col items-center py-14 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <p className="text-[14px] font-semibold text-slate-800">Nudge Sent!</p>
            <p className="text-[12px] text-slate-400 text-center max-w-xs">
              A reminder has been queued for {org.contactName} at {org.contactEmail}.
            </p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 space-y-2">
              <div className="flex items-center gap-3 text-[12px]">
                <span className="w-12 text-slate-400 shrink-0">To</span>
                <span className="text-slate-700">{org.contactEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <span className="w-12 text-slate-400 shrink-0">Subject</span>
                <span className="text-slate-700">Action Required: Complete Your DEI Survey Submission</span>
              </div>
            </div>
            <div className="px-5 py-4 max-h-52 overflow-y-auto">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <pre className="text-[11.5px] text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">{buildEmailBody(org)}</pre>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-2 text-center italic">For demo purposes only — no actual email will be sent.</p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
              <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={() => { setSent(true); setTimeout(onClose, 2000); }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
              >
                <Send size={12} /> Send Nudge
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">{children}</p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrgDetailPage() {
  const { surveyId, orgId } = useParams<{ surveyId: string; orgId: string }>();
  const org = getOrgById(orgId);
  const survey = getSurveyById(surveyId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state
  const [showNudge, setShowNudge]           = useState(false);
  const [adminComplete, setAdminComplete]   = useState(false);
  const [manualStatus, setManualStatus]     = useState("No information");
  const [mappedAssetClass, setMappedAssetClass] = useState(org?.customAssetClass ?? "");
  const [orgCode, setOrgCode]               = useState("ORG-" + (orgId?.slice(-4).toUpperCase() ?? "0000"));
  const [editingCode, setEditingCode]       = useState(false);
  const [notes, setNotes]                   = useState("");
  const [editingNotes, setEditingNotes]     = useState(false);
  const [documents, setDocuments]           = useState<string[]>([]);
  const [labels, setLabels]                 = useState<string[]>([]);
  const [labelInput, setLabelInput]         = useState("");

  if (!org || !survey) {
    return <div className="text-slate-500 text-sm py-10 text-center">Organization not found.</div>;
  }

  const st = STATUS_CONFIG[org.status];
  const StatusIcon = st.icon;
  const contributors = getDemoContributors(org);
  const hasReport   = org.status === "submitted" && org.lpiScore !== null && org.benchmarks !== null;
  const hasStaff    = org.status === "submitted" && org.genderDemographics !== null && org.racialDemographics !== null;
  const dims = org.lpiSubComponents?.dimensions;

  // Fake file upload handler
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setDocuments((prev) => [...prev, file.name]);
    e.target.value = "";
  }

  function addLabel(e: React.KeyboardEvent) {
    if (e.key === "Enter" && labelInput.trim()) {
      setLabels((prev) => [...prev, labelInput.trim()]);
      setLabelInput("");
    }
  }

  const lpiPrime = org.lpiScore !== null ? (org.lpiScore * 0.249).toFixed(3) : null;
  const lpiOwnership = dims ? dims[0].ownership.rawScore.toFixed(3) : null;

  return (
    <>
      {showNudge && <NudgeModal org={org} onClose={() => setShowNudge(false)} />}

      <div className="space-y-4">
        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-[11.5px]">
          <Link href="/surveys" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0f1923] text-[#4361ee] hover:bg-[#1a2d3d] transition-colors font-semibold text-[10.5px] tracking-wide">
            <LayoutDashboard size={10} strokeWidth={2} />
            Survey Admin
          </Link>
          <ChevronRight size={12} className="text-slate-300 shrink-0" />
          <Link href={`/surveys/${surveyId}`} className="text-slate-500 hover:text-slate-800 transition-colors font-medium truncate max-w-[160px]">
            {survey.year} {survey.name}
          </Link>
          <ChevronRight size={12} className="text-slate-300 shrink-0" />
          <Link href={`/surveys/${surveyId}/organizations`} className="text-slate-500 hover:text-slate-800 transition-colors font-medium">
            Invited Organizations
          </Link>
          <ChevronRight size={12} className="text-slate-300 shrink-0" />
          <span className="text-slate-800 font-semibold truncate max-w-[140px]">{org.name}</span>
        </nav>

        {/* ── Org header card ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-[#4361ee] via-[#4361ee]/60 to-transparent" />
          <div className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0f1923] flex items-center justify-center shrink-0">
                <span className="text-[15px] font-black text-[#4361ee]">{org.name.substring(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[19px] font-bold text-slate-900 leading-tight">{org.name}</h2>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{org.type}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${st.badge}`}>
                    <StatusIcon size={10} />
                    {adminComplete ? "Admin Complete" : st.label}
                  </span>
                  {adminComplete && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#4361ee]/10 border border-[#4361ee]/30 text-[#3147af]">
                      <ShieldCheck size={10} />
                      Admin Complete
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 mt-1 text-[12px] text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={10} />{org.location}</span>
                  <span>·</span><span>{org.assetClass}</span>
                  <span>·</span><span>{org.aum} AUM</span>
                  <span>·</span>
                  <span className="font-medium text-slate-500">Code: </span>
                  {editingCode ? (
                    <input
                      autoFocus
                      value={orgCode}
                      onChange={(e) => setOrgCode(e.target.value)}
                      onBlur={() => setEditingCode(false)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingCode(false)}
                      className="w-24 text-[12px] border-b border-[#4361ee] outline-none bg-transparent text-slate-700"
                    />
                  ) : (
                    <button onClick={() => setEditingCode(true)} className="flex items-center gap-1 text-slate-600 hover:text-[#3147af] transition-colors font-mono">
                      {orgCode} <Edit2 size={10} className="opacity-40" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Inline survey context */}
            <div className="shrink-0 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-right">
              <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Survey</p>
              <p className="text-[12.5px] font-semibold text-slate-800 mt-0.5">{survey.year} {survey.name}</p>
              {org.submissionDate && <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Submitted {org.submissionDate}</p>}
              {!org.submissionDate && <p className="text-[11px] text-slate-400 mt-0.5">Not yet submitted</p>}
            </div>
          </div>
        </div>

        {/* ── Main two-column layout ───────────────────────────────── */}
        <div className="flex gap-4 items-start">

          {/* ── LEFT COLUMN ──────────────────────────────────────── */}
          <div className="flex-[3] min-w-0 space-y-4">

            {/* LPI strip + Transparency table */}
            {org.lpiScore !== null && org.lpiSubComponents && dims && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {/* LPI scores inline strip */}
                <div className="flex items-center gap-6 px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">LPI Score</span>
                    <span className={`text-[15px] font-bold tabular-nums ${org.lpiScore >= 8 ? "text-emerald-600" : org.lpiScore >= 6.5 ? "text-amber-600" : "text-red-500"}`}>
                      {org.lpiScore}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">LPI × Prime</span>
                    <span className="text-[15px] font-bold text-slate-700 tabular-nums">{lpiPrime}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">LPI × Ownership</span>
                    <span className="text-[15px] font-bold text-slate-700 tabular-nums">{lpiOwnership}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Version</span>
                    <span className="text-[11px] font-semibold text-slate-600">{org.lpiVersion}</span>
                  </div>
                </div>

                {/* Transparency table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Gender</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Race / Ethnicity</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Transparency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {TRANSPARENCY_ROWS.map(({ key, label }) => {
                        const gScore = dims[0][key].rawScore;
                        const rScore = dims[1][key].rawScore;
                        const total  = gScore + rScore;
                        const tPct   = TRANSPARENCY_DEMO[key];
                        const isLow  = tPct < 90;
                        return (
                          <tr key={key} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-700">{label}</td>
                            <td className="text-center px-4 py-3 text-indigo-600 font-mono tabular-nums">{gScore.toFixed(3)}</td>
                            <td className="text-center px-4 py-3 text-amber-700 font-mono tabular-nums">{rScore.toFixed(3)}</td>
                            <td className="text-center px-4 py-3 text-slate-700 font-mono tabular-nums font-semibold">{total.toFixed(3)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[11.5px] tabular-nums ${isLow ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                                {tPct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contact info + Survey context */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <SectionLabel>Organization & Contact</SectionLabel>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  { label: "Primary Contact",  value: org.contactName },
                  { label: "Email",            value: <a href={`mailto:${org.contactEmail}`} className="text-[#3147af] hover:underline">{org.contactEmail}</a> },
                  { label: "Title",            value: org.contactTitle },
                  { label: "Organization Type",value: org.type },
                  { label: "Asset Class",      value: org.assetClass },
                  { label: "Strategy",         value: org.strategyFocus.join(", ") },
                  { label: "AUM",              value: org.aum },
                  { label: "Headquarters",     value: org.headquarters },
                  { label: "Founded",          value: org.founded },
                  { label: "Privacy Level",    value: survey.privacyLevel },
                  { label: "Invited Date",     value: org.invitedDate },
                  { label: "Survey Host",      value: survey.hostOrg },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10.5px] text-slate-400 font-medium mb-0.5">{label}</p>
                    <p className="text-[12.5px] text-slate-800 font-medium leading-snug">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Status + Notes side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <SectionLabel>Manual Status</SectionLabel>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value)}
                  className="w-full text-[12.5px] text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 transition-colors bg-white"
                >
                  {MANUAL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <SectionLabel>Notes</SectionLabel>
                  <button
                    onClick={() => setEditingNotes(!editingNotes)}
                    className="text-[10.5px] text-[#3147af] hover:underline flex items-center gap-1"
                  >
                    <Pencil size={10} />
                    {editingNotes ? "Done" : "Edit"}
                  </button>
                </div>
                {editingNotes ? (
                  <textarea
                    autoFocus
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this organization..."
                    rows={3}
                    className="w-full text-[12px] text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 transition-colors resize-none placeholder:text-slate-300"
                  />
                ) : (
                  <p className="text-[12.5px] text-slate-500 leading-relaxed min-h-[48px]">
                    {notes || <span className="text-slate-300 italic">No information</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Documents</SectionLabel>
                <span className="text-[10.5px] text-slate-400">{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
              </div>
              {documents.length === 0 ? (
                <p className="text-[12px] text-slate-400 italic mb-3">No documents found</p>
              ) : (
                <ul className="space-y-1.5 mb-3">
                  {documents.map((doc, i) => (
                    <li key={i} className="flex items-center gap-2 text-[12px] text-slate-700">
                      <FileText size={12} className="text-slate-400 shrink-0" />
                      {doc}
                      <button onClick={() => setDocuments((prev) => prev.filter((_, j) => j !== i))} className="ml-auto text-slate-300 hover:text-red-500 transition-colors">
                        <X size={11} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 rounded-lg px-3 py-2 w-full justify-center hover:border-slate-400 transition-colors"
              >
                <Upload size={13} />
                Upload document
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
          <div className="flex-[2] min-w-0 space-y-4">

            {/* Quick stats strip */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <SectionLabel>Survey Progress</SectionLabel>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500">Completion</span>
                  <span className={`text-[13px] font-bold tabular-nums ${org.progress === 100 ? "text-emerald-600" : org.progress > 0 ? "text-amber-600" : "text-slate-400"}`}>{org.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${org.progress}%`, backgroundColor: org.progress === 100 ? "#4361ee" : "#fbbf24" }} />
                </div>
              </div>
              {[
                { label: "Invited",        value: org.invitedDate },
                { label: "Last Activity",  value: org.lastActivity ?? "—" },
                { label: "Submitted",      value: org.submissionDate ?? "—" },
                ...(org.lpiScore !== null ? [{ label: "LPI Score", value: `${org.lpiScore} / 10` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{label}</span>
                  <span className="text-[12px] font-semibold text-slate-700">{value}</span>
                </div>
              ))}
            </div>

            {/* Actions panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <SectionLabel>Admin Actions</SectionLabel>
              <div className="space-y-2">
                {/* Nudge — only for non-submitted */}
                {org.status !== "submitted" && (
                  <button
                    onClick={() => setShowNudge(true)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors text-[12.5px] font-semibold"
                  >
                    <BellRing size={14} className="text-amber-600 shrink-0" />
                    Send Nudge Reminder
                  </button>
                )}

                {/* Admin complete toggle */}
                <button
                  onClick={() => setAdminComplete(!adminComplete)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-[12.5px] font-semibold transition-all ${
                    adminComplete
                      ? "bg-[#4361ee]/10 border-[#4361ee]/30 text-[#3147af]"
                      : "bg-[#0f1923] border-[#0f1923] text-white hover:bg-[#1a2d3d]"
                  }`}
                >
                  <ShieldCheck size={14} className="shrink-0" />
                  {adminComplete ? "Undo Admin Complete" : "Mark as Admin Complete"}
                </button>

                {/* Change Status */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[11.5px] text-slate-500 shrink-0">Status</span>
                    <select
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value)}
                      className="flex-1 text-[12px] font-medium text-slate-700 bg-transparent focus:outline-none"
                    >
                      {MANUAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Asset class mapping */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <Layers size={13} className="text-slate-400 shrink-0" />
                    <span className="text-[11.5px] text-slate-500 shrink-0">Custom Asset Class</span>
                    <select
                      value={mappedAssetClass}
                      onChange={(e) => setMappedAssetClass(e.target.value)}
                      className="flex-1 text-[12px] font-medium text-slate-700 bg-transparent focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {getCustomAssetClassesBySurveyId(surveyId).map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Edit org code */}
                <button
                  onClick={() => setEditingCode(true)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-[12.5px] font-medium"
                >
                  <Edit2 size={14} className="text-slate-400 shrink-0" />
                  Edit Org Code
                  <span className="ml-auto text-[11px] font-mono text-slate-400">{orgCode}</span>
                </button>

                {/* Update notes */}
                <button
                  onClick={() => setEditingNotes(true)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-[12.5px] font-medium"
                >
                  <StickyNote size={14} className="text-slate-400 shrink-0" />
                  Update Notes
                  {notes && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4361ee]" />}
                </button>

                {/* Upload document */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-[12.5px] font-medium"
                >
                  <Upload size={14} className="text-slate-400 shrink-0" />
                  Upload Document
                  {documents.length > 0 && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{documents.length}</span>
                  )}
                </button>

                {/* Send nudge (also available for submitted to re-engage) */}
                {org.status === "submitted" && (
                  <button
                    onClick={() => setShowNudge(true)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-[12.5px] font-medium"
                  >
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    Send Email to Contact
                  </button>
                )}
              </div>
            </div>

            {/* Reports panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <SectionLabel>Dashboards</SectionLabel>
              <div className="space-y-2">
                {/* Organization Dashboard */}
                {hasReport ? (
                  <Link
                    href={`/surveys/${surveyId}/organizations/${orgId}/report`}
                    className="group flex items-center gap-3 px-3.5 py-3 rounded-lg border border-[#4361ee]/25 bg-[#4361ee]/5 hover:bg-[#4361ee]/10 hover:border-[#4361ee]/40 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#4361ee]/15 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-[#3147af]" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-slate-800">Organization Dashboard</p>
                      <p className="text-[11px] text-slate-400">LPI, benchmarks & overview</p>
                    </div>
                    <ChevronRight size={13} className="text-slate-300 group-hover:text-[#4361ee] shrink-0 transition-colors" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Lock size={13} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[12.5px] font-semibold text-slate-600">Organization Dashboard</p>
                      <p className="text-[11px] text-slate-400">Available after submission</p>
                    </div>
                  </div>
                )}

                {/* Investment Staff Committee */}
                {hasStaff ? (
                  <Link
                    href={`/surveys/${surveyId}/organizations/${orgId}/staff-report`}
                    className="group flex items-center gap-3 px-3.5 py-3 rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100/60 hover:border-violet-300 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-violet-600" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-slate-800">Investment Staff Committee</p>
                      <p className="text-[11px] text-slate-400">Race & gender by tier</p>
                    </div>
                    <ChevronRight size={13} className="text-slate-300 group-hover:text-violet-500 shrink-0 transition-colors" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Lock size={13} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[12.5px] font-semibold text-slate-600">Investment Staff Committee</p>
                      <p className="text-[11px] text-slate-400">Available after submission</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contributors */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Contributors</SectionLabel>
                <span className="text-[10.5px] text-slate-400">{contributors.length}</span>
              </div>
              <div className="space-y-2.5">
                {contributors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-slate-500">{c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12px] font-semibold text-slate-700 truncate">{c.name}</p>
                        {c.completed && <BadgeCheck size={12} className="text-emerald-500 shrink-0" />}
                      </div>
                      <p className="text-[10.5px] text-slate-400 truncate">{c.email}</p>
                    </div>
                    <a href={`mailto:${c.email}`} className="text-slate-300 hover:text-[#3147af] transition-colors shrink-0">
                      <Mail size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Labels */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>Labels</SectionLabel>
                <span className="text-[10.5px] text-slate-400">{labels.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {labels.map((l, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4361ee]/10 text-[#3147af] border border-[#4361ee]/20 text-[11px] font-medium">
                    <Tag size={9} />
                    {l}
                    <button onClick={() => setLabels((prev) => prev.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors">
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add label, press Enter"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={addLabel}
                className="w-full text-[11.5px] text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-400 transition-colors placeholder:text-slate-300"
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
