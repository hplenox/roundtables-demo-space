// ─── Survey-taker side of Multi-Org Support (Phase I) ──────────────────────
//
// Once a Super Admin associates a user with secondary organizations
// (src/lib/mock-org-associations.ts), the survey-taking contact needs a way
// to pick which organization they're answering FOR on a given survey. This
// models that: each survey a user is invited to lists the orgs (from their
// own primary + secondary set) that need a response on that survey, each
// tracked independently so a parent organization's contact can't
// accidentally cross-file one subsidiary's data under another's.
//
// Demo persona: Sandra Kim at Aduro Advisors — the McKnight Foundation
// scenario from the requirements doc ("fund administrators serve as the
// contact for the managers they support... Aduro Advisors responds for
// Blue Bear, Cherryrock, and others").

import { getOrgById, PLATFORM_USERS } from "./mock-org-associations";

export const CURRENT_TEST_USER_ID = "puser-05";

export type SurveyOrgStatus = "not_started" | "in_progress" | "submitted";

export interface MySurveyOrgContext {
  /** References a PlatformOrg id (from the user's own primary or secondary set). */
  orgId: string;
  status: SurveyOrgStatus;
  progress?: number;
  submittedDate?: string | null;
}

export interface MySurveyAssignment {
  id: string;
  name: string;
  hostOrg: string;
  year: number;
  targetCloseDate: string;
  surveyStatus: "active" | "upcoming" | "closed";
  /** Orgs invited into this survey that this user can answer on behalf of. */
  orgContexts: MySurveyOrgContext[];
}

export const MY_SURVEY_ASSIGNMENTS: MySurveyAssignment[] = [
  {
    id: "mysurvey-mcknight-2026",
    name: "2026 Manager Diversity & Data Survey",
    hostOrg: "McKnight Foundation",
    year: 2026,
    targetCloseDate: "2026-09-30",
    surveyStatus: "active",
    orgContexts: [
      { orgId: "porg-aduro", status: "in_progress", progress: 40 },
      { orgId: "porg-bluebear", status: "not_started" },
      { orgId: "porg-cherryrock", status: "submitted", submittedDate: "2026-08-20" },
      { orgId: "porg-meritage", status: "not_started" },
    ],
  },
  {
    id: "mysurvey-ilpa-2026",
    name: "2026 ESG & Diversity Reporting",
    hostOrg: "ILPA",
    year: 2026,
    targetCloseDate: "2026-10-15",
    surveyStatus: "active",
    orgContexts: [{ orgId: "porg-aduro", status: "not_started" }],
  },
  {
    id: "mysurvey-lenox-2025",
    name: "2025 DEI Benchmark Survey",
    hostOrg: "Lenox Park Solutions",
    year: 2025,
    targetCloseDate: "2025-11-30",
    surveyStatus: "closed",
    orgContexts: [{ orgId: "porg-aduro", status: "submitted", submittedDate: "2025-11-18" }],
  },
];

export function getCurrentTestUser() {
  return PLATFORM_USERS.find((u) => u.id === CURRENT_TEST_USER_ID)!;
}

export function getMySurveyOrgs(assignment: MySurveyAssignment) {
  return assignment.orgContexts
    .map((ctx) => ({ ctx, org: getOrgById(ctx.orgId) }))
    .filter((row): row is { ctx: MySurveyOrgContext; org: NonNullable<ReturnType<typeof getOrgById>> } => !!row.org);
}
