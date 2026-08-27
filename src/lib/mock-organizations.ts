// ─── Organizations registry (Admin > Organizations) ────────────────────────
//
// The platform's registered-organization list, matching the real
// RoundTables admin's Organizations tab (ID / Name / Org Code / LPI Score /
// Last Updated / Total Users / Status). Built on top of the same
// PLATFORM_ORGS used everywhere else in Multi-Org Support, so this tab and
// the Users / Response Review / Contacts Management tabs are all describing
// the same underlying organizations.

import { PLATFORM_ORGS, PLATFORM_USERS } from "./mock-org-associations";

export interface OrgRegistryMeta {
  orgId: string;
  /** organization_codes.code most commonly used to invite this org — null when none has been assigned. */
  orgCode: string | null;
  lpiScore: number | null;
  lastUpdated: string;
  status: "Active" | "Archived";
}

export const ORG_REGISTRY_META: OrgRegistryMeta[] = [
  { orgId: "porg-rbc-gam", orgCode: "55932", lpiScore: 1.24, lastUpdated: "2026-08-24", status: "Active" },
  { orgId: "porg-bluebay", orgCode: "40381", lpiScore: null, lastUpdated: "2026-08-19", status: "Active" },
  { orgId: "porg-blackrock", orgCode: "70214", lpiScore: 2.18, lastUpdated: "2026-08-24", status: "Active" },
  { orgId: "porg-gip", orgCode: null, lpiScore: null, lastUpdated: "2026-08-14", status: "Active" },
  { orgId: "porg-ssga", orgCode: "62187", lpiScore: 1.905, lastUpdated: "2026-08-24", status: "Active" },
  { orgId: "porg-ss-bank", orgCode: "55210", lpiScore: null, lastUpdated: "2026-08-15", status: "Active" },
  { orgId: "porg-aduro", orgCode: "38820", lpiScore: null, lastUpdated: "2026-08-27", status: "Active" },
  { orgId: "porg-bluebear", orgCode: null, lpiScore: null, lastUpdated: "2026-08-11", status: "Active" },
  { orgId: "porg-cherryrock", orgCode: "61684", lpiScore: null, lastUpdated: "2026-08-19", status: "Active" },
  { orgId: "porg-meritage", orgCode: null, lpiScore: null, lastUpdated: "2026-08-19", status: "Active" },
  { orgId: "porg-kkr", orgCode: "48802", lpiScore: 3.42, lastUpdated: "2026-08-25", status: "Active" },
  { orgId: "porg-arctos", orgCode: "91207", lpiScore: null, lastUpdated: "2026-08-26", status: "Active" },
  { orgId: "porg-apollo", orgCode: "20933", lpiScore: 2.76, lastUpdated: "2026-08-22", status: "Active" },
  { orgId: "porg-carlyle", orgCode: "44018", lpiScore: 3.11, lastUpdated: "2026-08-20", status: "Active" },
  { orgId: "porg-bain", orgCode: "33456", lpiScore: 2.005, lastUpdated: "2026-08-13", status: "Active" },
  { orgId: "porg-vista", orgCode: "58291", lpiScore: 1.68, lastUpdated: "2026-08-24", status: "Active" },
];

export interface OrgRegistryRow {
  displayId: number;
  orgId: string;
  name: string;
  orgCode: string | null;
  lpiScore: number | null;
  lastUpdated: string;
  totalUsers: number;
  status: "Active" | "Archived";
}

export const ORG_REGISTRY: OrgRegistryRow[] = PLATFORM_ORGS.map((org, i) => {
  const meta = ORG_REGISTRY_META.find((m) => m.orgId === org.id);
  return {
    displayId: 4000 + i + 1,
    orgId: org.id,
    name: org.name,
    orgCode: meta?.orgCode ?? null,
    lpiScore: meta?.lpiScore ?? null,
    lastUpdated: meta?.lastUpdated ?? org.domain, // never hit in practice — every org has meta above
    totalUsers: PLATFORM_USERS.filter((u) => u.primaryOrgId === org.id).length,
    status: meta?.status ?? "Active",
  };
});
