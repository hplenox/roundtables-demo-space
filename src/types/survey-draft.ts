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

export interface SurveyDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  basics: DraftBasics;
  lpiSettings: LpiSettingsState;
  practices: PracticesState;
  standardQuestions: StandardQuestionsState;
  customSections: CustomSection[];
  touched: Partial<Record<SectionKey, boolean>>;
}
