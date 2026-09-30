// ─── Survey creation draft (mock flow) ──────────────────────────────────────
//
// Backs the "New Survey" hub-and-spoke flow at /surveys/new/*. Modeled on a
// TurboTax-style filing experience: a central checklist tracks each section's
// completion status so an admin can jump around and always see what's left,
// rather than being forced through a strict linear wizard.

export type SectionKey =
  | "basics"
  | "lpi-settings"
  | "practices"
  | "standard-questions"
  | "custom-questions";

export type SectionStatus = "not-started" | "in-progress" | "complete";

export interface DraftBasics {
  organization: string;
  requestType: string;
  name: string;
  startDate: string;
  dueDate: string;
  primaryContact: string;
  contactEmail: string;
  technicalSupport: string;
}

export interface LpiRowState {
  enabled: boolean;
  options: Record<string, boolean>;
}

export type LpiSettingsState = Record<string, LpiRowState>;

export interface PracticeQuestionState {
  enabled: boolean;
}

export type PracticesState = Record<string, PracticeQuestionState>;

export interface StandardQuestionState {
  enabled: boolean;
  text?: string;
}

export type StandardQuestionsState = Record<string, StandardQuestionState>;

export type CustomQuestionType = "text" | "formatted-text" | "number" | "select" | "multi-select";

export interface CustomQuestion {
  id: string;
  label: string;
  type: CustomQuestionType;
  options?: string[];
}

export interface CustomSection {
  id: string;
  name: string;
  description: string;
  questions: CustomQuestion[];
}

/**
 * Binds a draft to a single client CRM survey cycle, so the "Survey Build"
 * step of onboarding (src/app/client-crm/[clientId]/onboarding/page.tsx) has
 * exactly one draft it owns, can resume, and can hand back to.
 */
export interface DraftCycleContext {
  clientId: string;
  clientName: string;
  cycleId: string;
  /** Display label for the cycle, e.g. "Diversity, Equity, & Inclusion '26". */
  cycleLabel: string;
  /** Where the creation flow's Exit / Save links return to. */
  returnTo: string;
}

/**
 * Where a draft sits in the onboarding closed loop:
 *  - configuring: still being built; nothing exists on the Survey Dashboard yet
 *  - submitted:   a real Survey record exists and is linked to the cycle, but
 *                 it hasn't launched — the question set is still editable,
 *                 whether or not the client has signed off on it yet
 *  - locked:      the survey launched; the question set is read-only
 */
export type DraftLifecycle = "configuring" | "submitted" | "locked";

export interface SurveyDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Null for an ad-hoc draft started from the Survey Dashboard. */
  context: DraftCycleContext | null;
  lifecycle: DraftLifecycle;
  /** The Survey this draft filed, once submitted. */
  surveyId: string | null;
  submittedAt: string | null;
  /**
   * When the client signed off on the question set. This is what completes
   * onboarding step 1 — it does *not* freeze the survey, which stays editable
   * (and can be reopened) until the cycle launches.
   */
  approvedAt: string | null;
  lockedAt: string | null;
  basics: DraftBasics;
  lpiSettings: LpiSettingsState;
  practices: PracticesState;
  standardQuestions: StandardQuestionsState;
  customSections: CustomSection[];
  touched: Partial<Record<SectionKey, boolean>>;
}
