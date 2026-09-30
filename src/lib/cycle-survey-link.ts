// ─── Client cycle ⇄ survey draft bridge ────────────────────────────────────
//
// Onboarding step 1 ("Survey Question Buildout") in the Client CRM hands off
// to the survey creation flow at /surveys/new/*. This module owns the mapping
// between a client's survey cycle and the draft that flow edits: what the
// draft's context looks like, and what the Survey Basics section should
// already be filled in with so the admin never retypes what the CRM knows.

import type { Client, ClientSurveyCycle, OnboardingStepStatus } from "@/types/client";
import type { DraftBasics, DraftCycleContext, DraftLifecycle, SurveyDraft } from "@/types/survey-draft";
import { REQUEST_TYPES } from "@/lib/survey-draft-config";

/** Support address every LPS-hosted survey routes technical questions to. */
const LPS_TECHNICAL_SUPPORT = "support@lenoxpark.com";

export function cycleLabel(cycle: ClientSurveyCycle): string {
  return `${cycle.name} '${String(cycle.year).slice(2)}`;
}

export function onboardingHref(clientId: string): string {
  return `/client-crm/${clientId}/onboarding`;
}

export function buildCycleContext(client: Client, cycle: ClientSurveyCycle): DraftCycleContext {
  return {
    clientId: client.id,
    clientName: client.name,
    cycleId: cycle.id,
    cycleLabel: cycleLabel(cycle),
    returnTo: onboardingHref(client.id),
  };
}

/**
 * The cycle's request type, matched against the creation flow's fixed list.
 * Cycle names in the CRM are the shorter marketing form ("Diversity, Equity,
 * & Inclusion"), so a prefix match is what lines them up with the survey
 * flow's option values ("Diversity, Equity, & Inclusion+").
 */
function matchRequestType(cycleName: string): string {
  const exact = REQUEST_TYPES.find((t) => t === cycleName);
  if (exact) return exact;
  return REQUEST_TYPES.find((t) => t.startsWith(cycleName) || cycleName.startsWith(t)) ?? "";
}

export function buildBasicsPrefill(client: Client, cycle: ClientSurveyCycle): Partial<DraftBasics> {
  const dates = cycle.keyDates;
  const requestType = matchRequestType(cycle.name);
  return {
    // Clients outside the flow's canned host list still prefill by name — the
    // Basics select widens to include whatever the draft already holds.
    organization: client.name,
    requestType,
    name: `${cycle.year} ${cycle.name} + ${client.name}`,
    startDate: dates.launchDate ?? cycle.startDate ?? "",
    dueDate: dates.endDate ?? dates.targetCloseDate ?? "",
    primaryContact: client.primaryContactName,
    contactEmail: client.primaryContactEmail,
    technicalSupport: LPS_TECHNICAL_SUPPORT,
  };
}

/**
 * Step 1's status is derived from the draft rather than read off the stored
 * step, so it survives a page reload (the draft is persisted; client state is
 * not) and can never disagree with what the survey panel is showing.
 */
export function stepStatusForDraft(draft: SurveyDraft): OnboardingStepStatus {
  if (draft.lifecycle === "configuring") return "in_progress";
  if (draft.lifecycle === "locked" || draft.approvedAt) return "approved";
  return "submitted";
}

/**
 * The state the survey panel renders. Distinct from DraftLifecycle because
 * "filed but signed off" and "filed, still under review" look and behave
 * differently even though both are editable.
 */
export type SurveyPanelState = "configuring" | "review" | "approved" | "locked";

export function panelStateForDraft(draft: SurveyDraft): SurveyPanelState {
  if (draft.lifecycle === "locked") return "locked";
  if (draft.lifecycle === "configuring") return "configuring";
  return draft.approvedAt ? "approved" : "review";
}

export const PANEL_STATE_CONFIG: Record<
  SurveyPanelState,
  { label: string; badge: string; blurb: string }
> = {
  configuring: {
    label: "Draft — In Configuration",
    badge: "bg-blue-50 border-blue-200 text-blue-700",
    blurb: "Still being built. No survey record exists on the dashboard yet.",
  },
  review: {
    label: "Draft Survey — Pending Approval",
    badge: "bg-amber-50 border-amber-200 text-amber-700",
    blurb: "The survey is created and linked to this cycle. Confirm the question set with the client to finish this step.",
  },
  approved: {
    label: "Approved — Editable Until Launch",
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blurb: "The client has signed off. You can still revise the question set right up until the cycle launches.",
  },
  locked: {
    label: "Launched — Locked",
    badge: "bg-slate-100 border-slate-200 text-slate-600",
    blurb: "This survey has launched, so its question set is locked. Changes now require a new cycle.",
  },
};

/** Kept for the creation flow's read-only banner, which only cares about launch. */
export const LIFECYCLE_CONFIG: Record<DraftLifecycle, { blurb: string }> = {
  configuring: { blurb: PANEL_STATE_CONFIG.configuring.blurb },
  submitted: { blurb: PANEL_STATE_CONFIG.review.blurb },
  locked: { blurb: PANEL_STATE_CONFIG.locked.blurb },
};

/** Whether the cycle has moved past onboarding, which is what freezes step 1. */
export function cycleHasLaunched(cycle: ClientSurveyCycle): boolean {
  return cycle.status !== "onboarding";
}

export function draftBelongsToCycle(draft: SurveyDraft | null, cycleId: string): boolean {
  return !!draft && draft.context?.cycleId === cycleId;
}
