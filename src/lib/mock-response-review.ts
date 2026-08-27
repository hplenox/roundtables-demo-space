// ─── Response Review: managing invalid/corrupted responses under an org ────
//
// Multi-Org Support lets a user submit a response on behalf of a secondary
// organization — but that means a bad submission (wrong data, wrong org
// context, a contact confused about who they're answering for) now sits
// under that org's record and, per the incident below, gets pulled forward
// to PRE-FILL that org's next surveys. There has never been a way to review
// or remove a response once it's in, and deleting response data has never
// been done on this platform before — so this needs to be reviewable,
// reason-required, and fully audited, not a plain delete button.
//
// Modeled on the real incident: a KKR contact, invited as Arctos Partners
// for the Maryland survey, submitted a response filed under Arctos. Maryland
// only wanted Arctos data, and the contact's own organization is KKR — so
// before that response silently pre-fills MACP's next KKR/Arctos cycle (or
// Maryland's next cycle), someone needs to be able to see it, flag it, and
// either send it back for resubmission or remove it.

import { getOrgById, getUserFullName, PLATFORM_USERS } from "./mock-org-associations";

export type ResponseLifecycle = "active" | "reopened" | "deleted";

export interface PrefillTarget {
  surveyName: string;
  hostOrg: string;
  targetDate: string;
}

export interface OrgResponseRecord {
  id: string;
  surveyName: string;
  hostOrg: string;
  year: number;
  submittedDate: string;
  /** The org this response is filed under — may differ from the submitter's own primary org. */
  orgId: string;
  submittedByUserId: string;
  lifecycle: ResponseLifecycle;
  flagged: boolean;
  flagReason?: string;
  /** Upcoming surveys that would pre-fill from this response if left as-is. */
  prefillsInto: PrefillTarget[];
}

export type ResponseAuditAction = "flagged" | "unflagged" | "deleted" | "restored" | "reopened";

export interface ResponseAuditEntry {
  id: string;
  timestamp: string;
  adminName: string;
  responseId: string;
  action: ResponseAuditAction;
  reason: string;
}

export const ORG_RESPONSES: OrgResponseRecord[] = [
  {
    id: "resp-maryland-arctos-2026",
    surveyName: "2026 Maryland State Retirement Manager Survey",
    hostOrg: "Maryland State Retirement Agency",
    year: 2026,
    submittedDate: "2026-08-24",
    orgId: "porg-arctos",
    submittedByUserId: "puser-01", // David Chen — primary org KKR & Co.
    lifecycle: "active",
    flagged: true,
    flagReason:
      "Maryland confirmed they need Arctos data only, but the submitting contact's own organization is KKR & Co. Verify the submitted figures are Arctos-specific before this pre-fills the next KKR/Arctos cycle.",
    prefillsInto: [
      { surveyName: "2026 MACP Manager Diversity Survey", hostOrg: "MACP", targetDate: "2026-11-15" },
      { surveyName: "2027 Maryland State Retirement Manager Survey", hostOrg: "Maryland State Retirement Agency", targetDate: "2027-08-01" },
    ],
  },
  {
    id: "resp-mcknight-cherryrock-2026",
    surveyName: "2026 Manager Diversity & Data Survey",
    hostOrg: "McKnight Foundation",
    year: 2026,
    submittedDate: "2026-08-19",
    orgId: "porg-cherryrock",
    submittedByUserId: "puser-05", // Sandra Kim — primary org Aduro Advisors
    lifecycle: "active",
    flagged: false,
    prefillsInto: [
      { surveyName: "2027 Manager Diversity & Data Survey", hostOrg: "McKnight Foundation", targetDate: "2027-09-30" },
    ],
  },
  {
    id: "resp-calpers-bluebay-2026",
    surveyName: "2026 Emerging Manager DEI Survey",
    hostOrg: "CalPERS",
    year: 2026,
    submittedDate: "2026-08-14",
    orgId: "porg-bluebay",
    submittedByUserId: "puser-02", // Priya Nair — primary org RBC Global Asset Management
    lifecycle: "active",
    flagged: false,
    prefillsInto: [
      { surveyName: "2027 Emerging Manager DEI Survey", hostOrg: "CalPERS", targetDate: "2027-10-31" },
    ],
  },
  {
    id: "resp-gip-2025-corrupted",
    surveyName: "2025 DEI Benchmark Survey",
    hostOrg: "Lenox Park Solutions",
    year: 2025,
    submittedDate: "2025-11-10",
    orgId: "porg-gip",
    submittedByUserId: "puser-03", // Marcus Webb — primary org BlackRock
    lifecycle: "deleted",
    flagged: false,
    prefillsInto: [],
  },
];

export const RESPONSE_AUDIT: ResponseAuditEntry[] = [
  {
    id: "resp-audit-02",
    timestamp: "2026-08-25T09:10:00Z",
    adminName: "Esteban Fernandez",
    responseId: "resp-maryland-arctos-2026",
    action: "flagged",
    reason:
      "Escalated by Maryland — need to confirm the submitted figures are Arctos-specific, not KKR's own numbers, before this rolls forward into future cycles.",
  },
  {
    id: "resp-audit-01",
    timestamp: "2025-11-15T14:00:00Z",
    adminName: "Sarah Whitman",
    responseId: "resp-gip-2025-corrupted",
    action: "deleted",
    reason:
      "BlackRock contact submitted BlackRock's own workforce figures under Global Infrastructure Partners by mistake; GIP had already submitted separately for this cycle. Removed to stop the duplicate figures from pre-filling the 2026 cycle.",
  },
];

export function isCrossOrgSubmission(record: OrgResponseRecord): boolean {
  const submitter = PLATFORM_USERS.find((u) => u.id === record.submittedByUserId);
  return !!submitter && submitter.primaryOrgId !== record.orgId;
}

export function getSubmitterHomeOrgName(record: OrgResponseRecord): string | undefined {
  const submitter = PLATFORM_USERS.find((u) => u.id === record.submittedByUserId);
  return submitter ? getOrgById(submitter.primaryOrgId)?.name : undefined;
}

export function getSubmitterName(record: OrgResponseRecord): string {
  const submitter = PLATFORM_USERS.find((u) => u.id === record.submittedByUserId);
  return submitter ? getUserFullName(submitter) : "—";
}
