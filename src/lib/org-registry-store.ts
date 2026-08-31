// ─── Organization creation (mock flow) ─────────────────────────────────────
//
// Requirement: a Super Admin should be able to create a brand-new
// organization from the Organizations list, and get back a special org code
// generated for it on the spot — the code a survey host would use to invite
// this org into a cycle. There's no backend, so this persists to
// localStorage the same way org-association-store.ts does, and merges with
// the static PLATFORM_ORGS / ORG_REGISTRY at read time so a newly-created
// org shows up everywhere an org can be picked (Users tab "Add organization"
// dropdown, Organizations list, org detail page) without touching the seed
// data.

import { useSyncExternalStore } from "react";
import { PlatformOrg, PLATFORM_ORGS } from "./mock-org-associations";
import { ORG_REGISTRY } from "./mock-organizations";

const STORAGE_KEY = "rt_custom_orgs_v1";

export interface CustomOrgRecord {
  org: PlatformOrg;
  orgCode: string;
  displayId: number;
  createdAt: string;
  /**
   * A tax ID (EIN) or other unique identifier tying this org to a specific
   * legal entity — used to match survey submissions and contacts correctly
   * even when domains or contact emails vary across the org's staff.
   */
  uniqueId: string;
}

/** Every domain known to be registered to any org, mapped to that org's name — used to flag a duplicate before it's created. */
export function getKnownDomainOwners(customOrgs: CustomOrgRecord[]): Map<string, string> {
  const map = new Map<string, string>();
  PLATFORM_ORGS.forEach((o) => {
    (o.domains && o.domains.length > 0 ? o.domains : [o.domain]).forEach((d) => {
      if (d) map.set(d.toLowerCase(), o.name);
    });
  });
  customOrgs.forEach((r) => {
    const domains = r.org.domains && r.org.domains.length > 0 ? r.org.domains : [r.org.domain];
    domains.forEach((d) => {
      if (d) map.set(d.toLowerCase(), r.org.name);
    });
  });
  return map;
}

// Custom orgs get IDs after every seeded org, so they never collide with a
// PLATFORM_ORGS displayId (4000 + i + 1, i up to PLATFORM_ORGS.length - 1).
const BASE_DISPLAY_ID = 4000 + PLATFORM_ORGS.length + 1;

let cachedRaw: string | null = null;
let cachedRecords: CustomOrgRecord[] = [];
const listeners = new Set<() => void>();

function parseRecords(raw: string | null): CustomOrgRecord[] {
  try {
    return raw ? (JSON.parse(raw) as CustomOrgRecord[]) : [];
  } catch {
    return [];
  }
}

function getSnapshot(): CustomOrgRecord[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedRecords = parseRecords(raw);
  }
  return cachedRecords;
}

function getServerSnapshot(): CustomOrgRecord[] {
  return [];
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) callback();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

/** Every org created through the mock "Create Organization" flow. */
export function useCustomOrgRecords(): CustomOrgRecord[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** PLATFORM_ORGS plus any custom-created orgs — use this wherever a full org list is needed. */
export function useAllOrgs(): PlatformOrg[] {
  const custom = useCustomOrgRecords();
  return [...PLATFORM_ORGS, ...custom.map((c) => c.org)];
}

function generateOrgCode(existing: Set<string>): string {
  let code: string;
  do {
    code = String(Math.floor(10000 + Math.random() * 90000));
  } while (existing.has(code));
  return code;
}

function persistRecords(records: CustomOrgRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  cachedRaw = null;
  listeners.forEach((cb) => cb());
}

/** Creates a new org with a freshly-generated org code and persists it. Returns the new record. */
export function createOrganization(
  name: string,
  domains: string[],
  type: PlatformOrg["type"],
  uniqueId: string
): CustomOrgRecord {
  const existing = getSnapshot();
  const usedCodes = new Set([
    ...ORG_REGISTRY.map((r) => r.orgCode).filter((c): c is string => !!c),
    ...existing.map((r) => r.orgCode),
  ]);
  const id = `porg-custom-${Date.now()}`;
  const cleanDomains = domains.map((d) => d.trim()).filter(Boolean);
  const record: CustomOrgRecord = {
    org: { id, name, domain: cleanDomains[0] ?? "", domains: cleanDomains, type },
    orgCode: generateOrgCode(usedCodes),
    displayId: BASE_DISPLAY_ID + existing.length,
    createdAt: new Date().toISOString(),
    uniqueId,
  };
  persistRecords([...existing, record]);
  return record;
}

export function getCustomOrgRecord(orgId: string): CustomOrgRecord | undefined {
  return getSnapshot().find((r) => r.org.id === orgId);
}
