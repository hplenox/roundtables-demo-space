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
// Default demo persona is Sandra Kim at Aduro Advisors — the McKnight
// Foundation scenario from the requirements doc ("fund administrators serve
// as the contact for the managers they support... Aduro Advisors responds
// for Blue Bear, Cherryrock, and others"), since it's the richest case (one
// user, several orgs). The CalPERS and MACP scenarios are seeded below too
// (getMySurveyOrgs filters each assignment down to whichever orgs the
// current user is actually authorized for) — switch CURRENT_TEST_USER_ID to
// "puser-01" (David Chen / KKR & Co. → Arctos Partners), "puser-02" (Priya
// Nair / RBC GAM → BlueBay), "puser-03" (Marcus Webb / BlackRock → GIP), or
// "puser-04" (Elaine Roth / SSGA → State Street Bank) to demo those instead.

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
  {
    // CalPERS scenario: three unrelated parent firms each responding for a
    // subsidiary, all invited into the same cycle. A single assignment with
    // all six orgs works because getMySurveyOrgs filters it down to
    // whichever orgs the CURRENT user is authorized for — Priya Nair only
    // ever sees her two lines here, never BlackRock's or SSGA's.
    id: "mysurvey-calpers-2026",
    name: "2026 Emerging Manager DEI Survey",
    hostOrg: "CalPERS",
    year: 2026,
    targetCloseDate: "2026-10-31",
    surveyStatus: "active",
    orgContexts: [
      { orgId: "porg-rbc-gam", status: "in_progress", progress: 55 },
      { orgId: "porg-bluebay", status: "not_started" },
      { orgId: "porg-blackrock", status: "submitted", submittedDate: "2026-08-22" },
      { orgId: "porg-gip", status: "not_started" },
      { orgId: "porg-ssga", status: "in_progress", progress: 70 },
      { orgId: "porg-ss-bank", status: "not_started" },
    ],
  },
  {
    // MACP scenario: KKR's own response already goes in under KKR (that part
    // always worked) — Arctos is the org that used to have no way to get a
    // response at all before this feature.
    id: "mysurvey-macp-2026",
    name: "2026 MACP Manager Diversity Survey",
    hostOrg: "MACP",
    year: 2026,
    targetCloseDate: "2026-11-15",
    surveyStatus: "active",
    orgContexts: [
      { orgId: "porg-kkr", status: "submitted", submittedDate: "2026-08-18" },
      { orgId: "porg-arctos", status: "not_started" },
    ],
  },
];

export function getCurrentTestUser() {
  return PLATFORM_USERS.find((u) => u.id === CURRENT_TEST_USER_ID)!;
}

/**
 * Orgs this user can currently answer this survey on behalf of. When
 * `authorizedOrgIds` is passed, orgs the user isn't (or is no longer)
 * associated with are filtered out — so revoking a secondary-org grant in
 * the admin tool immediately hides that org's line here, and granting one
 * reveals it, without needing to touch this survey's own seed data.
 */
export function getMySurveyOrgs(assignment: MySurveyAssignment, authorizedOrgIds?: Set<string>) {
  return assignment.orgContexts
    .filter((ctx) => !authorizedOrgIds || authorizedOrgIds.has(ctx.orgId))
    .map((ctx) => ({ ctx, org: getOrgById(ctx.orgId) }))
    .filter((row): row is { ctx: MySurveyOrgContext; org: NonNullable<ReturnType<typeof getOrgById>> } => !!row.org);
}
