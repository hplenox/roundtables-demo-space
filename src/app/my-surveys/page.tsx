"use client";

import { useState } from "react";
import {
  Building2, ChevronDown, Check, ArrowRight, CheckCircle2, Info, ClipboardList, User,
} from "lucide-react";
import {
  MY_SURVEY_ASSIGNMENTS,
  MySurveyAssignment,
  MySurveyOrgContext,
  SurveyOrgStatus,
  getCurrentTestUser,
  getMySurveyOrgs,
} from "@/lib/mock-my-surveys";
import { getOrgById, getUserFullName, PlatformOrg } from "@/lib/mock-org-associations";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Status presentation (plain text + dot — no competing pill/border) ─────

const STATUS_CONFIG: Record<SurveyOrgStatus, { label: string; dot: string }> = {
  not_started: { label: "Not started", dot: "bg-slate-300" },
  in_progress: { label: "In progress", dot: "bg-amber-400" },
  submitted: { label: "Submitted", dot: "bg-emerald-500" },
};

function StatusText({ ctx }: { ctx: MySurveyOrgContext }) {
  const cfg = STATUS_CONFIG[ctx.status];
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 min-w-0">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <span className="truncate min-w-0">
        {cfg.label}
        {ctx.status === "in_progress" && typeof ctx.progress === "number" ? ` · ${ctx.progress}%` : ""}
        {ctx.status === "submitted" && ctx.submittedDate ? ` · ${formatDate(ctx.submittedDate)}` : ""}
      </span>
    </span>
  );
}

const SURVEY_STATUS_CLS: Record<MySurveyAssignment["surveyStatus"], string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
};

// ─── Org switcher — the multi-org selection control, lives on the row, not the sidebar ──

function OrgSwitcher({
  options,
  selectedOrgId,
  onSelect,
}: {
  options: { org: PlatformOrg; ctx: MySurveyOrgContext }[];
  selectedOrgId: string;
  onSelect: (orgId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedIdx = options.findIndex((o) => o.org.id === selectedOrgId);
  const selected = options[selectedIdx];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-8 flex items-center gap-1.5 pl-2.5 pr-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors text-[12.5px] font-semibold text-slate-800 w-full max-w-[220px]"
      >
        <Building2 size={12} className="text-slate-400 shrink-0" />
        <span className="truncate flex-1 text-left">{selected.org.name}</span>
        <span className="shrink-0 text-[10px] font-normal text-slate-400">
          {selectedIdx + 1}/{options.length}
        </span>
        <ChevronDown size={12} className={`shrink-0 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5">
            <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
              Answering as
            </p>
            <div className="max-h-64 overflow-y-auto">
              {options.map(({ org, ctx }) => {
                const cfg = STATUS_CONFIG[ctx.status];
                const isSelected = org.id === selectedOrgId;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                      onSelect(org.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      isSelected ? "bg-[#00b8a9]/[0.06]" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-medium text-slate-800 truncate">{org.name}</span>
                      <span className="block text-[10.5px] text-slate-400">{cfg.label}</span>
                    </span>
                    {isSelected && <Check size={13} className="text-[#00b8a9] shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="px-3 pt-2 mt-1 border-t border-slate-100 flex items-start gap-1.5">
              <Info size={11} className="text-slate-300 mt-0.5 shrink-0" />
              <p className="text-[10.5px] text-slate-400 leading-relaxed">
                Each organization&rsquo;s response is tracked independently — switching here never merges or
                overwrites another organization&rsquo;s data.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Survey row ──────────────────────────────────────────────────────────

function ctaLabel(ctx: MySurveyOrgContext, orgName: string) {
  if (ctx.status === "submitted") return "View submission";
  if (ctx.status === "in_progress") return `Resume as ${orgName}`;
  return `Start as ${orgName}`;
}

function SurveyRow({
  assignment,
  onContinue,
}: {
  assignment: MySurveyAssignment;
  onContinue: (assignment: MySurveyAssignment, orgName: string) => void;
}) {
  const rows = getMySurveyOrgs(assignment);
  const [selectedOrgId, setSelectedOrgId] = useState(rows[0].org.id);
  const active = rows.find((r) => r.org.id === selectedOrgId) ?? rows[0];
  const multiOrg = rows.length > 1;
  const disabled = assignment.surveyStatus === "closed" && active.ctx.status !== "submitted";

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
      {/* Year badge */}
      <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[11px] font-bold">
        {assignment.year}
      </div>

      {/* Name + host */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13.5px] font-semibold text-slate-900 truncate" title={assignment.name}>{assignment.name}</p>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${SURVEY_STATUS_CLS[assignment.surveyStatus]}`}
          >
            {assignment.surveyStatus === "active" ? "Active" : assignment.surveyStatus === "upcoming" ? "Upcoming" : "Closed"}
          </span>
        </div>
        <p className="text-[11.5px] text-slate-400 truncate mt-0.5">
          {assignment.hostOrg} · Due {formatDate(assignment.targetCloseDate)}
        </p>
      </div>

      {/* Organization: dropdown when multiple orgs apply, plain text otherwise */}
      <div className="hidden md:block shrink-0 w-56">
        {multiOrg ? (
          <OrgSwitcher options={rows} selectedOrgId={selectedOrgId} onSelect={setSelectedOrgId} />
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-600 truncate">
            <Building2 size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{rows[0].org.name}</span>
          </span>
        )}
      </div>

      {/* Status for the currently-selected org */}
      <div className="hidden sm:block shrink-0 w-44 overflow-hidden">
        <StatusText ctx={active.ctx} />
      </div>

      {/* CTA */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onContinue(assignment, active.org.name)}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1923] text-white text-[11.5px] font-semibold hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
      >
        {ctaLabel(active.ctx, active.org.name)}
        <ArrowRight size={11} />
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MySurveysPage() {
  const currentUser = getCurrentTestUser();
  const primaryOrg = getOrgById(currentUser.primaryOrgId);
  const secondaryOrgs = currentUser.secondaryOrgIds.map((id) => getOrgById(id)).filter(Boolean) as PlatformOrg[];
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function handleContinue(assignment: MySurveyAssignment, orgName: string) {
    showToast(`Continuing "${assignment.name}" on behalf of ${orgName}. This response will be recorded under ${orgName} only.`);
  }

  return (
    <div className="min-h-full bg-slate-50">
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm flex items-start gap-2.5 bg-[#0f1923] text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 text-[12.5px] font-medium leading-snug">
          <CheckCircle2 size={14} className="text-[#00b8a9] shrink-0 mt-0.5" />
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-6">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-1.5">Surveys</p>
          <h1 className="text-[22px] font-semibold text-slate-900 leading-tight">My Surveys</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Surveys you&rsquo;ve been invited to respond to, across every organization you&rsquo;re authorized for.
          </p>
          <p className="text-[12px] text-slate-400 mt-2.5 flex items-center gap-1.5 flex-wrap">
            <User size={12} className="text-slate-300 shrink-0" />
            Signed in as <span className="font-medium text-slate-600">{getUserFullName(currentUser)}</span> — primary{" "}
            <span className="font-medium text-slate-600">{primaryOrg?.name}</span>
            {secondaryOrgs.length > 0 && (
              <>
                , also authorized for{" "}
                <span className="font-medium text-slate-600">{secondaryOrgs.map((o) => o.name).join(", ")}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {MY_SURVEY_ASSIGNMENTS.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <ClipboardList size={16} className="text-slate-400" />
              </div>
              <p className="text-[13px] font-medium text-slate-600">No surveys yet</p>
              <p className="text-[12px] text-slate-400 mt-1">Your assigned surveys will appear here once invited.</p>
            </div>
          ) : (
            MY_SURVEY_ASSIGNMENTS.map((assignment) => (
              <SurveyRow key={assignment.id} assignment={assignment} onContinue={handleContinue} />
            ))
          )}
        </div>

        <p className="text-center text-[11.5px] text-slate-400 mt-4">
          {MY_SURVEY_ASSIGNMENTS.length} survey{MY_SURVEY_ASSIGNMENTS.length !== 1 ? "s" : ""} ·{" "}
          {MY_SURVEY_ASSIGNMENTS.reduce((sum, a) => sum + a.orgContexts.length, 0)} organization responses to manage
        </p>
      </div>
    </div>
  );
}
