// ─── Client CRM domain types ──────────────────────────────────────────────
// "Client" here is an LPS survey host (the LP/consultant relationship LPS
// manages directly) — distinct from `InvitedOrg`, which is a GP/manager
// invited to respond to a client's survey.

/** Client-level relationship status — coarser than any single survey cycle. */
export type ClientStatus =
  | "prospect"
  | "onboarding"
  | "survey_live"
  | "reporting"
  | "renewal_due"
  | "inactive";

export type ClientPriority = "strategic" | "standard" | "low_touch";

export type ChecklistItemKey =
  | "kickoff_call"
  | "key_dates"
  | "onboarding_email"
  | "question_buildout"
  | "contact_list_finalized"
  | "contact_list_scrubbed"
  | "email_template_sent"
  | "finalization_email";

export interface ChecklistItem {
  key: ChecklistItemKey;
  label: string;
  done: boolean;
  completedAt: string | null;
  completedBy: string | null;
}

export type OnboardingStepKey = "questions" | "contacts" | "finalization";
export type OnboardingStepStatus = "not_started" | "in_progress" | "submitted" | "approved";

export interface OnboardingStep {
  key: OnboardingStepKey;
  label: string;
  description: string;
  /** What the client is specifically being asked to do for this step — shown in full on the Onboarding tab. */
  requirements: string[];
  status: OnboardingStepStatus;
  updatedAt: string | null;
  /** Last time a request/reminder email was sent to the client for this step. */
  lastEmailSentAt: string | null;
}

/** All dates are "YYYY-MM-DD" strings so relative-urgency math is reliable. Scoped to a single survey cycle. */
export interface ClientKeyDates {
  kickoffCallDate: string | null;
  onboardingDate: string | null;
  launchDate: string | null;
  endDate: string | null;
  extensionDate: string | null;
  targetCloseDate: string | null;
  reportingDueDate: string | null;
}

/**
 * The lifecycle of a single survey cycle, per the LPS workflow: onboarding
 * begins the cycle, then the survey goes live, closes, moves into
 * reporting, and is completed once reporting is delivered.
 */
export type SurveyCycleStatus = "onboarding" | "live" | "closed" | "reporting" | "completed";

export interface ClientSurveyCycle {
  id: string;
  /** Links to a real Survey in mock-data.ts when this cycle also exists there; null for cycles only tracked at the CRM summary level. */
  surveyId: string | null;
  name: string;
  year: number;
  status: SurveyCycleStatus;
  totalInvited: number;
  submitted: number;
  startDate: string | null;
  closeDate: string | null;
  keyDates: ClientKeyDates;
  checklist: ChecklistItem[];
  onboarding: OnboardingStep[];
}

export interface Client {
  id: string;
  name: string;
  segment: string;
  priority: ClientPriority;
  status: ClientStatus;
  accountOwner: string;
  /** Date first contacted (prospects) or date the relationship began (clients). */
  clientSince: string | null;
  primaryContactName: string;
  primaryContactTitle: string;
  primaryContactEmail: string;
  surveys: ClientSurveyCycle[];
  notes?: string;
}
