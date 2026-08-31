"use client";

import { useState } from "react";
import { Building2, ArrowRight, CheckCircle2, ClipboardList, User } from "lucide-react";
import {
  MY_SURVEY_ASSIGNMENTS,
  CURRENT_TEST_USER_ID,
  MySurveyAssignment,
  MySurveyOrgContext,
  SurveyOrgStatus,
  getCurrentTestUser,
  getMySurveyOrgs,
} from "@/lib/mock-my-surveys";
import { getOrgById, getUserFullName, PlatformOrg } from "@/lib/mock-org-associations";
import { useEffectiveUser } from "@/lib/org-association-store";

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

function ctaLabel(ctx: MySurveyOrgContext, orgName: string) {
  if (ctx.status === "submitted") return "View submission";
  if (ctx.status === "in_progress") return `Resume as ${orgName}`;
  return `Start as ${orgName}`;
}

// ─── Survey line — one row per (survey, organization) pair, never a switcher ──

interface SurveyLine {
  assignment: MySurveyAssignment;
  org: PlatformOrg;
  ctx: MySurveyOrgContext;
}

function SurveyLineRow({
  line,
  onContinue,
}: {
  line: SurveyLine;
  onContinue: (assignment: MySurveyAssignment, orgName: string) => void;
}) {
  const { assignment, org, ctx } = line;
  const disabled = assignment.surveyStatus === "closed" && ctx.status !== "submitted";

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
      {/* Year badge */}
      <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[11px] font-bold">
        {assignment.year}
      </div>

      {/* Survey + the single org this line is for */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13.5px] font-semibold text-slate-900 truncate" title={assignment.name}>
            {assignment.name}
          </p>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${SURVEY_STATUS_CLS[assignment.surveyStatus]}`}
          >
            {assignment.surveyStatus === "active" ? "Active" : assignment.surveyStatus === "upcoming" ? "Upcoming" : "Closed"}
          </span>
        </div>
        <p className="text-[11.5px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
          <Building2 size={11} className="text-slate-300 shrink-0" />
          <span className="font-medium text-slate-500 shrink-0">{org.name}</span>
          <span className="truncate">
            · Hosted by {assignment.hostOrg} · Due {formatDate(assignment.targetCloseDate)}
          </span>
        </p>
      </div>

      {/* This org's own status — independent of every other org's line */}
      <div className="hidden sm:block shrink-0 w-44 overflow-hidden">
        <StatusText ctx={ctx} />
      </div>

      {/* CTA */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onContinue(assignment, org.name)}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1923] text-white text-[11.5px] font-semibold hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
      >
        {ctaLabel(ctx, org.name)}
        <ArrowRight size={11} />
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MySurveysPage() {
  // Reads through localStorage (see org-association-store) so a secondary-org
  // grant made in /admin/users is reflected here on arrival, without needing
  // a shared backend — falls back to the static seed if nothing's persisted.
  const currentUser = useEffectiveUser(CURRENT_TEST_USER_ID) ?? getCurrentTestUser();

  const myOrgs = currentUser.organizationIds.map((id) => getOrgById(id)).filter(Boolean) as PlatformOrg[];
  const authorizedOrgIds = new Set(currentUser.organizationIds);
  const [toast, setToast] = useState<string | null>(null);

  // Flattened: every survey this user (or an org they're authorized for) is
  // invited into becomes its own line, one per organization — a parent
  // organization's contact sees every subsidiary's obligation individually,
  // never bundled behind a single switcher.
  const lines: SurveyLine[] = MY_SURVEY_ASSIGNMENTS.flatMap((assignment) =>
    getMySurveyOrgs(assignment, authorizedOrgIds).map(({ org, ctx }) => ({ assignment, org, ctx }))
  );
  // Not MY_SURVEY_ASSIGNMENTS.length — that array also seeds scenarios for
  // other demo personas (e.g. CalPERS, MACP) that contribute zero lines here.
  const surveyCount = new Set(lines.map((line) => line.assignment.id)).size;

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
            Every survey response you&rsquo;re responsible for — one line per organization, including any
            subsidiary or fund you&rsquo;re authorized to answer on behalf of.
          </p>
          <p className="text-[12px] text-slate-400 mt-2.5 flex items-center gap-1.5 flex-wrap">
            <User size={12} className="text-slate-300 shrink-0" />
            Signed in as <span className="font-medium text-slate-600">{getUserFullName(currentUser)}</span> —
            organizations:{" "}
            <span className="font-medium text-slate-600">{myOrgs.map((o) => o.name).join(", ")}</span>
          </p>
        </div>
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <ClipboardList size={16} className="text-slate-400" />
              </div>
              <p className="text-[13px] font-medium text-slate-600">No surveys yet</p>
              <p className="text-[12px] text-slate-400 mt-1">Your assigned surveys will appear here once invited.</p>
            </div>
          ) : (
            lines.map((line) => (
              <SurveyLineRow key={`${line.assignment.id}-${line.org.id}`} line={line} onContinue={handleContinue} />
            ))
          )}
        </div>

        <p className="text-center text-[11.5px] text-slate-400 mt-4">
          {lines.length} organization response{lines.length !== 1 ? "s" : ""} across {surveyCount}{" "}
          survey{surveyCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
