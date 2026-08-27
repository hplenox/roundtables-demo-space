"use client";

import { useState } from "react";
import {
  Building2, ChevronDown, Check, ArrowRight, CheckCircle2, Clock, Circle, Info, ClipboardList,
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

// ─── Status presentation ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<SurveyOrgStatus, { label: string; dot: string; cls: string; icon: typeof Circle }> = {
  not_started: { label: "Not started", dot: "bg-slate-300", cls: "bg-slate-100 text-slate-500 border-slate-200", icon: Circle },
  in_progress: { label: "In progress", dot: "bg-amber-400", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  submitted: { label: "Submitted", dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

function OrgStatusPill({ ctx }: { ctx: MySurveyOrgContext }) {
  const cfg = STATUS_CONFIG[ctx.status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${cfg.cls}`}>
      <Icon size={10} />
      {cfg.label}
      {ctx.status === "in_progress" && typeof ctx.progress === "number" ? ` · ${ctx.progress}%` : ""}
      {ctx.status === "submitted" && ctx.submittedDate ? ` · ${formatDate(ctx.submittedDate)}` : ""}
    </span>
  );
}

const SURVEY_STATUS_CLS: Record<MySurveyAssignment["surveyStatus"], string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
};

// ─── Org switcher (the multi-org selection dropdown, lives on the card — not the sidebar) ──

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
        className="h-8 flex items-center gap-2 pl-3 pr-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors text-[12.5px] font-semibold text-slate-800"
      >
        <Building2 size={12} className="text-slate-400 shrink-0" />
        <span className="truncate max-w-[180px]">{selected.org.name}</span>
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

// ─── Survey card ─────────────────────────────────────────────────────────

function ctaLabel(ctx: MySurveyOrgContext, orgName: string) {
  if (ctx.status === "submitted") return "View submission";
  if (ctx.status === "in_progress") return `Resume as ${orgName}`;
  return `Start as ${orgName}`;
}

function SurveyCard({
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
    <div className="px-5 py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[11px] font-bold">
          {assignment.year}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-semibold text-slate-900">{assignment.name}</p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${SURVEY_STATUS_CLS[assignment.surveyStatus]}`}
            >
              {assignment.surveyStatus === "active" ? "Active" : assignment.surveyStatus === "upcoming" ? "Upcoming" : "Closed"}
            </span>
          </div>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Hosted by {assignment.hostOrg} · Due {formatDate(assignment.targetCloseDate)}
          </p>

          {/* Org indication + selection */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {multiOrg ? (
              <OrgSwitcher options={rows} selectedOrgId={selectedOrgId} onSelect={setSelectedOrgId} />
            ) : (
              <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-[12.5px] font-medium text-slate-600">
                <Building2 size={12} className="text-slate-400" />
                {rows[0].org.name}
              </span>
            )}
            <OrgStatusPill ctx={active.ctx} />
          </div>

          {/* At-a-glance status across every affiliated org invited into this survey */}
          {multiOrg && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {rows.map(({ org, ctx }) => {
                const cfg = STATUS_CONFIG[ctx.status];
                const isSelected = org.id === selectedOrgId;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10.5px] font-medium border transition-colors ${
                      isSelected
                        ? "border-[#00b8a9] bg-[#00b8a9]/10 text-[#00897b]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    {org.name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-3.5">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onContinue(assignment, active.org.name)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-semibold hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {ctaLabel(active.ctx, active.org.name)}
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
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

          {/* Identity / affiliation strip */}
          <div className="mt-5 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <div className="shrink-0 w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">
              {currentUser.firstName[0]}
              {currentUser.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-slate-800">{getUserFullName(currentUser)}</p>
              <p className="text-[11.5px] text-slate-500 mt-0.5">
                Primary: <span className="font-medium text-slate-700">{primaryOrg?.name}</span>
                {secondaryOrgs.length > 0 && (
                  <>
                    {" "}
                    · Also authorized for:{" "}
                    <span className="font-medium text-slate-700">
                      {secondaryOrgs.map((o) => o.name).join(", ")}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
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
              <SurveyCard key={assignment.id} assignment={assignment} onContinue={handleContinue} />
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
