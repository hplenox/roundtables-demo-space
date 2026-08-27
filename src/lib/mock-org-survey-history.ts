// ─── Org survey history & pre-fill source selection ────────────────────────
//
// An organization's past survey responses are what get pulled forward to
// pre-populate its next survey — the exact mechanism the Response Review
// tab exists to police ("this data will be available for prepopulation
// into all the other upcoming KKR requests"). This is the other side of
// that: from an org's own detail page, an admin can see its full survey
// history and choose which past response should seed the next one, rather
// than the platform silently picking the most recent submission regardless
// of whether it was actually complete.

export type SurveyHistoryStatus = "submitted" | "in_progress";

export interface OrgSurveyHistoryEntry {
  id: string;
  orgId: string;
  surveyName: string;
  hostOrg: string;
  year: number;
  submittedDate: string;
  status: SurveyHistoryStatus;
  summary: string;
}

export const ORG_SURVEY_HISTORY: OrgSurveyHistoryEntry[] = [
  // ── RBC Global Asset Management ──
  {
    id: "hist-rbc-01",
    orgId: "porg-rbc-gam",
    surveyName: "2026 Emerging Manager DEI Survey",
    hostOrg: "CalPERS",
    year: 2026,
    submittedDate: "2026-08-24",
    status: "in_progress",
    summary: "Workforce and leadership diversity figures — still in progress.",
  },
  {
    id: "hist-rbc-02",
    orgId: "porg-rbc-gam",
    surveyName: "2025 Emerging Manager DEI Survey",
    hostOrg: "CalPERS",
    year: 2025,
    submittedDate: "2025-09-20",
    status: "submitted",
    summary: "Full ownership, leadership, and workforce diversity data.",
  },
  {
    id: "hist-rbc-03",
    orgId: "porg-rbc-gam",
    surveyName: "2024 Institutional LP Diversity Survey",
    hostOrg: "ILPA",
    year: 2024,
    submittedDate: "2024-10-05",
    status: "submitted",
    summary: "ESG and diversity reporting baseline.",
  },

  // ── BlueBay Asset Management (filed via RBC GAM's secondary-org association) ──
  {
    id: "hist-bluebay-01",
    orgId: "porg-bluebay",
    surveyName: "2026 Emerging Manager DEI Survey",
    hostOrg: "CalPERS",
    year: 2026,
    submittedDate: "2026-08-14",
    status: "submitted",
    summary: "Filed by Priya Nair (RBC Global Asset Management) on BlueBay's behalf.",
  },
  {
    id: "hist-bluebay-02",
    orgId: "porg-bluebay",
    surveyName: "2025 Emerging Manager DEI Survey",
    hostOrg: "CalPERS",
    year: 2025,
    submittedDate: "2025-09-05",
    status: "submitted",
    summary: "Prior cycle, also filed via RBC Global Asset Management.",
  },

  // ── BlackRock ──
  {
    id: "hist-blackrock-01",
    orgId: "porg-blackrock",
    surveyName: "2026 Emerging Manager DEI Survey",
    hostOrg: "CalPERS",
    year: 2026,
    submittedDate: "2026-08-24",
    status: "in_progress",
    summary: "Workforce and leadership diversity figures — still in progress.",
  },
  {
    id: "hist-blackrock-02",
    orgId: "porg-blackrock",
    surveyName: "2024 ESG & Diversity Reporting",
    hostOrg: "ILPA",
    year: 2024,
    submittedDate: "2024-10-01",
    status: "submitted",
    summary: "ESG and diversity reporting baseline.",
  },
  {
    id: "hist-blackrock-03",
    orgId: "porg-blackrock",
    surveyName: "Diversity, Equity, & Inclusion",
    hostOrg: "Lenox Park Solutions, Inc.",
    year: 2023,
    submittedDate: "2023-11-15",
    status: "submitted",
    summary: "Full submission across ownership, leadership, and workforce diversity.",
  },
];

/** An org's survey history, newest first. */
export function getSurveyHistoryForOrg(orgId: string): OrgSurveyHistoryEntry[] {
  return ORG_SURVEY_HISTORY.filter((h) => h.orgId === orgId).sort(
    (a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
  );
}

/** Default pre-fill source: the most recent *completed* survey — never an in-progress one. */
export function getDefaultPrefillSourceId(orgId: string): string | null {
  const history = getSurveyHistoryForOrg(orgId);
  return history.find((h) => h.status === "submitted")?.id ?? history[0]?.id ?? null;
}
