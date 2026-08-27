// ─── Shared, persisted state for Multi-Org Support associations ───────────
//
// admin/users/page.tsx (the Super Admin flow) and my-surveys/page.tsx (the
// resulting survey-taker capability) both need to agree on which secondary
// orgs a user currently holds. Without this, granting an association in the
// admin tool and checking the survey-taker view would be two independent
// hardcoded datasets that happen to start in sync — the actual causal
// chain the requirements doc describes ("Super Admin grants → user can now
// respond as that org") wouldn't be demonstrable across a page navigation.
//
// Persists overrides to localStorage (client-only demo persistence — there's
// no backend) via useSyncExternalStore, so a grant survives navigating from
// /admin/users to /my-surveys, and even syncs live across tabs.

import { useSyncExternalStore } from "react";
import { PLATFORM_USERS, PlatformUser } from "./mock-org-associations";

const STORAGE_KEY = "rt_secondary_org_overrides_v1";

type Overrides = Record<string, string[]>;

let cachedRaw: string | null = null;
let cachedUsers: PlatformUser[] = PLATFORM_USERS;
const listeners = new Set<() => void>();

function parseOverrides(raw: string | null): Overrides {
  try {
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function computeUsers(overrides: Overrides): PlatformUser[] {
  return PLATFORM_USERS.map((u) => (overrides[u.id] ? { ...u, secondaryOrgIds: overrides[u.id] } : u));
}

/** Cached so repeated calls return the same reference when nothing changed (required by useSyncExternalStore). */
function getSnapshot(): PlatformUser[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUsers = computeUsers(parseOverrides(raw));
  }
  return cachedUsers;
}

function getServerSnapshot(): PlatformUser[] {
  return PLATFORM_USERS;
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

/** All platform users with any locally-persisted secondary-org grants/removals applied. */
export function useEffectiveUsers(): PlatformUser[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useEffectiveUser(userId: string): PlatformUser | undefined {
  return useEffectiveUsers().find((u) => u.id === userId);
}

export function persistSecondaryOrgIds(userId: string, secondaryOrgIds: string[]) {
  if (typeof window === "undefined") return;
  try {
    const overrides = parseOverrides(window.localStorage.getItem(STORAGE_KEY));
    overrides[userId] = secondaryOrgIds;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Storage unavailable (private browsing, quota) — the session still
    // works, it just won't survive navigation. Not worth surfacing to the user.
    return;
  }
  // The native `storage` event only fires in OTHER tabs/windows, never the
  // one that made the write — notify same-tab subscribers directly so this
  // page's own UI (and any other mounted consumer) re-renders immediately.
  cachedRaw = null;
  listeners.forEach((cb) => cb());
}
