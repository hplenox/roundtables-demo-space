// ─── Contacts Management: org-code / registered-org integrity ─────────────
//
// Two distinct drift patterns surfaced in the same incident thread:
//
// 1. Stale org-code label. An org code (organization_codes) caches a static
//    `organization_name` at creation time. If the code's *matched* org
//    changes later (or was matched to the wrong org and then corrected),
//    that cached label goes stale — e.g. code 91207 still displayed
//    "TOTAL OFFICE SOLUTIONS, LLP" even though it correctly resolves to
//    Arctos Partners underneath. Cosmetic, but confusing and worth fixing.
//
// 2. Registered-org mismatch. A contact is invited under an org code that
//    resolves to org X, but ends up registered under a *different* org Y
//    (domain matching, a manager registering under an incomplete/different
//    name, manual error). This is the more serious case — it's the same
//    root cause as the domain-matching problem Multi-Org Support exists to
//    override, just caught earlier, before a survey response gets filed
//    under the wrong org at all.
//
// Design choice (per the open question on real-time vs. scheduled
// detection): both. Real-time hooks flag a mismatch the moment a contact is
// created, approved, or reassigned; a daily scheduled scan catches anything
// those hooks miss (bulk imports, backfills, org-code edits made after the
// fact). Every flag below carries which of the two caught it.

import { getOrgById, PLATFORM_ORGS } from "./mock-org-associations";

export type DetectionSource = "real-time" | "scheduled-scan";
export type FlagStatus = "open" | "resolved" | "dismissed";

export interface OrgCode {
  id: string;
  code: string;
  /** organization_codes.organization_name — a cached label, can go stale. */
  staticName: string;
  /** The org this code actually resolves to. */
  matchedOrgId: string;
  hostOrg: string;
}

export interface IntegrityContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  orgCodeId: string;
  /** The org this contact's account is actually registered under — may drift from orgCode.matchedOrgId. */
  registeredOrgId: string;
  registeredDate: string;
}

export interface MismatchFlag {
  id: string;
  contactId: string;
  detectedVia: DetectionSource;
  detectedAt: string;
  status: FlagStatus;
}

export interface StaleNameFlag {
  id: string;
  orgCodeId: string;
  detectedVia: DetectionSource;
  detectedAt: string;
  status: FlagStatus;
}

export type IntegrityAction = "reassigned-contact" | "repointed-code" | "renamed-code" | "dismissed";

export interface IntegrityAuditEntry {
  id: string;
  timestamp: string;
  adminName: string;
  flagId: string;
  flagKind: "mismatch" | "stale-name";
  action: IntegrityAction;
  reason: string;
}

export const ORG_CODES: OrgCode[] = [
  {
    id: "code-91207",
    code: "91207",
    staticName: "TOTAL OFFICE SOLUTIONS, LLP",
    matchedOrgId: "porg-arctos",
    hostOrg: "MACP",
  },
  {
    id: "code-40381",
    code: "40381",
    staticName: "BlueBay Asset Management",
    matchedOrgId: "porg-bluebay",
    hostOrg: "CalPERS",
  },
  {
    id: "code-55210",
    code: "55210",
    staticName: "State Street Bank",
    matchedOrgId: "porg-ss-bank",
    hostOrg: "CalPERS",
  },
];

export const INTEGRITY_CONTACTS: IntegrityContact[] = [
  {
    id: "icontact-01",
    firstName: "Ian",
    lastName: "Reyes",
    email: "ir@arctospartners.com",
    orgCodeId: "code-91207",
    registeredOrgId: "porg-arctos", // matches the code's matched org — only the code's cached label is wrong
    registeredDate: "2026-08-10",
  },
  {
    id: "icontact-02",
    firstName: "Grace",
    lastName: "Holloway",
    email: "gholloway@rbcgam.com",
    orgCodeId: "code-40381", // invited under a code that resolves to BlueBay Asset Management
    registeredOrgId: "porg-rbc-gam", // but registered under RBC GAM, BlueBay's parent — a real mismatch
    registeredDate: "2026-08-22",
  },
  {
    id: "icontact-03",
    firstName: "Daniel",
    lastName: "Okafor",
    email: "dokafor@ssga.com",
    orgCodeId: "code-55210", // invited under a code that resolves to State Street Bank
    registeredOrgId: "porg-ssga", // registered under SSGA instead — already caught and resolved
    registeredDate: "2026-07-30",
  },
  {
    id: "icontact-04",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@rbcgam.com",
    orgCodeId: "code-40381",
    registeredOrgId: "porg-bluebay", // matches — clean, for contrast
    registeredDate: "2026-06-17",
  },
];

export const MISMATCH_FLAGS: MismatchFlag[] = [
  {
    id: "mismatch-01",
    contactId: "icontact-02",
    detectedVia: "real-time",
    detectedAt: "2026-08-22T15:40:00Z",
    status: "open",
  },
  {
    id: "mismatch-02",
    contactId: "icontact-03",
    detectedVia: "scheduled-scan",
    detectedAt: "2026-08-01T06:00:00Z",
    status: "resolved",
  },
];

export const STALE_NAME_FLAGS: StaleNameFlag[] = [
  {
    id: "stale-01",
    orgCodeId: "code-91207",
    detectedVia: "scheduled-scan",
    detectedAt: "2026-08-26T06:00:00Z",
    status: "open",
  },
];

export const INTEGRITY_AUDIT: IntegrityAuditEntry[] = [
  {
    id: "iaudit-01",
    timestamp: "2026-08-02T11:15:00Z",
    adminName: "Lamia Hemayet",
    flagId: "mismatch-02",
    flagKind: "mismatch",
    action: "reassigned-contact",
    reason:
      "Daniel Okafor's own org is SSGA — he was invited under the State Street Bank code by mistake. Reassigned his account to SSGA; State Street Bank still needs its own contact invited separately.",
  },
];

export function getContactById(id: string): IntegrityContact | undefined {
  return INTEGRITY_CONTACTS.find((c) => c.id === id);
}

export function getOrgCodeById(id: string): OrgCode | undefined {
  return ORG_CODES.find((c) => c.id === id);
}

export function getContactFullName(c: IntegrityContact): string {
  return `${c.firstName} ${c.lastName}`;
}

/** True when the org code's cached label no longer matches its resolved org's real name. */
export function isStaleName(orgCode: OrgCode): boolean {
  const resolvedName = getOrgById(orgCode.matchedOrgId)?.name;
  return !!resolvedName && resolvedName !== orgCode.staticName;
}

export const ALL_ORGS = PLATFORM_ORGS;
