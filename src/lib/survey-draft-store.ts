// ─── Survey creation draft store (mock flow) ────────────────────────────────
//
// Powers /surveys/new/*, a TurboTax-style hub-and-spoke replacement for the
// old linear "Create Request" wizard. There's no backend, so — same pattern
// as org-registry-store.ts — the in-progress draft persists to localStorage
// (autosaved on every change, unlike the old flow's "Auto-save is disabled"
// warning) and a submitted survey is appended to a small overlay list that
// merges with MOCK_SURVEYS at read time, so a filed draft actually shows up
// back on the Survey Dashboard.

import { useSyncExternalStore } from "react";
import { Survey } from "@/types/survey";
import {
  CustomQuestion,
  CustomSection,
  DraftBasics,
  LpiSettingsState,
  PracticesState,
  SectionKey,
  SectionStatus,
  StandardQuestionsState,
  SurveyDraft,
} from "@/types/survey-draft";
import { MOCK_SURVEYS } from "@/lib/mock-data";
import { LPI_SETTINGS_CONFIG, PRACTICES_CONFIG, STANDARD_QUESTIONS_CONFIG } from "@/lib/survey-draft-config";
import { SUBMITTED_SURVEYS_KEY } from "@/lib/survey-draft-keys";

const DRAFT_KEY = "rt_survey_draft_v1";
const SUBMITTED_KEY = SUBMITTED_SURVEYS_KEY;

export const SECTION_ORDER: SectionKey[] = [
  "basics",
  "lpi-settings",
  "practices",
  "standard-questions",
  "custom-questions",
];

/** Custom Questions is the only optional section — it never blocks submission. */
export const REQUIRED_SECTIONS: SectionKey[] = ["basics", "lpi-settings", "practices", "standard-questions"];

function defaultBasics(): DraftBasics {
  return {
    organization: "Lenox Park Solutions, Inc.",
    requestType: "",
    name: "",
    startDate: "",
    dueDate: "",
    primaryContact: "",
    contactEmail: "",
    technicalSupport: "",
  };
}

function defaultLpiSettings(): LpiSettingsState {
  const state: LpiSettingsState = {};
  LPI_SETTINGS_CONFIG.forEach((row) => {
    const options: Record<string, boolean> = {};
    row.options.forEach((opt) => (options[opt.key] = opt.defaultChecked));
    state[row.key] = { enabled: row.defaultEnabled, options };
  });
  return state;
}

function defaultPractices(): PracticesState {
  const state: PracticesState = {};
  PRACTICES_CONFIG.forEach((category) => {
    category.questions.forEach((q) => {
      state[q.key] = { enabled: q.defaultEnabled };
    });
  });
  return state;
}

function defaultStandardQuestions(): StandardQuestionsState {
  const state: StandardQuestionsState = {};
  STANDARD_QUESTIONS_CONFIG.forEach((q) => {
    state[q.key] = { enabled: q.defaultEnabled, text: q.defaultText };
  });
  return state;
}

function newDraft(): SurveyDraft {
  const now = new Date().toISOString();
  return {
    id: `draft-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    basics: defaultBasics(),
    lpiSettings: defaultLpiSettings(),
    practices: defaultPractices(),
    standardQuestions: defaultStandardQuestions(),
    customSections: [],
    touched: {},
  };
}

let cachedRaw: string | null = null;
let cachedDraft: SurveyDraft | null = null;
const listeners = new Set<() => void>();

function parseDraft(raw: string | null): SurveyDraft | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SurveyDraft;
  } catch {
    return null;
  }
}

function getSnapshot(): SurveyDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedDraft = parseDraft(raw);
  }
  return cachedDraft;
}

function getServerSnapshot(): SurveyDraft | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  function onStorage(e: StorageEvent) {
    if (e.key === DRAFT_KEY || e.key === SUBMITTED_KEY) callback();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function persistDraft(draft: SurveyDraft | null) {
  if (draft) {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } else {
    window.localStorage.removeItem(DRAFT_KEY);
  }
  cachedRaw = null;
  listeners.forEach((cb) => cb());
}

/** The in-progress draft, or null if none exists / it was submitted or discarded. */
export function useDraft(): SurveyDraft | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Returns the current draft, creating one if none exists yet. */
export function ensureDraft(): SurveyDraft {
  const existing = getSnapshot();
  if (existing) return existing;
  const draft = newDraft();
  persistDraft(draft);
  return draft;
}

export function getDraft(): SurveyDraft | null {
  return getSnapshot();
}

function saveDraft(updater: (draft: SurveyDraft) => SurveyDraft): void {
  const current = getSnapshot() ?? newDraft();
  const next = { ...updater(current), updatedAt: new Date().toISOString() };
  persistDraft(next);
}

export function updateBasics(patch: Partial<DraftBasics>): void {
  saveDraft((draft) => ({
    ...draft,
    basics: { ...draft.basics, ...patch },
    touched: { ...draft.touched, basics: true },
  }));
}

export function updateLpiRow(rowKey: string, patch: { enabled?: boolean; options?: Record<string, boolean> }): void {
  saveDraft((draft) => {
    const row = draft.lpiSettings[rowKey];
    return {
      ...draft,
      lpiSettings: {
        ...draft.lpiSettings,
        [rowKey]: {
          enabled: patch.enabled ?? row.enabled,
          options: { ...row.options, ...(patch.options ?? {}) },
        },
      },
      touched: { ...draft.touched, "lpi-settings": true },
    };
  });
}

export function updatePracticeQuestion(questionKey: string, enabled: boolean): void {
  saveDraft((draft) => ({
    ...draft,
    practices: { ...draft.practices, [questionKey]: { enabled } },
    touched: { ...draft.touched, practices: true },
  }));
}

export function setAllPractices(enabled: boolean): void {
  saveDraft((draft) => {
    const practices: PracticesState = {};
    Object.keys(draft.practices).forEach((key) => (practices[key] = { enabled }));
    return { ...draft, practices, touched: { ...draft.touched, practices: true } };
  });
}

export function updateStandardQuestion(key: string, patch: { enabled?: boolean; text?: string }): void {
  saveDraft((draft) => {
    const q = draft.standardQuestions[key];
    return {
      ...draft,
      standardQuestions: {
        ...draft.standardQuestions,
        [key]: { enabled: patch.enabled ?? q.enabled, text: patch.text ?? q.text },
      },
      touched: { ...draft.touched, "standard-questions": true },
    };
  });
}

export function setAllStandardQuestions(enabled: boolean): void {
  saveDraft((draft) => {
    const standardQuestions: StandardQuestionsState = {};
    Object.entries(draft.standardQuestions).forEach(([key, q]) => (standardQuestions[key] = { ...q, enabled }));
    return { ...draft, standardQuestions, touched: { ...draft.touched, "standard-questions": true } };
  });
}

export function addCustomSection(): void {
  saveDraft((draft) => {
    const section: CustomSection = {
      id: `custom-section-${Date.now()}`,
      name: "",
      description: "",
      questions: [],
    };
    return {
      ...draft,
      customSections: [...draft.customSections, section],
      touched: { ...draft.touched, "custom-questions": true },
    };
  });
}

export function updateCustomSection(sectionId: string, patch: Partial<Pick<CustomSection, "name" | "description">>): void {
  saveDraft((draft) => ({
    ...draft,
    customSections: draft.customSections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    touched: { ...draft.touched, "custom-questions": true },
  }));
}

export function removeCustomSection(sectionId: string): void {
  saveDraft((draft) => ({
    ...draft,
    customSections: draft.customSections.filter((s) => s.id !== sectionId),
    touched: { ...draft.touched, "custom-questions": true },
  }));
}

export function addCustomQuestion(sectionId: string, type: CustomQuestion["type"]): void {
  saveDraft((draft) => ({
    ...draft,
    customSections: draft.customSections.map((s) => {
      if (s.id !== sectionId) return s;
      const question: CustomQuestion = {
        id: `custom-question-${Date.now()}-${s.questions.length}`,
        label: "",
        type,
        options: type === "select" || type === "multi-select" ? [""] : undefined,
      };
      return { ...s, questions: [...s.questions, question] };
    }),
    touched: { ...draft.touched, "custom-questions": true },
  }));
}

export function updateCustomQuestion(sectionId: string, questionId: string, patch: Partial<CustomQuestion>): void {
  saveDraft((draft) => ({
    ...draft,
    customSections: draft.customSections.map((s) =>
      s.id !== sectionId
        ? s
        : { ...s, questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)) }
    ),
    touched: { ...draft.touched, "custom-questions": true },
  }));
}

export function removeCustomQuestion(sectionId: string, questionId: string): void {
  saveDraft((draft) => ({
    ...draft,
    customSections: draft.customSections.map((s) =>
      s.id !== sectionId ? s : { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
    ),
    touched: { ...draft.touched, "custom-questions": true },
  }));
}

export function markTouched(section: SectionKey): void {
  saveDraft((draft) => ({ ...draft, touched: { ...draft.touched, [section]: true } }));
}

export function discardDraft(): void {
  persistDraft(null);
}

// ── Section status / progress ───────────────────────────────────────────────

function basicsRequiredFields(): (keyof DraftBasics)[] {
  return ["organization", "requestType", "name", "startDate", "dueDate", "primaryContact", "contactEmail", "technicalSupport"];
}

function basicsComplete(basics: DraftBasics): boolean {
  return basicsRequiredFields().every((field) => basics[field].trim().length > 0);
}

function basicsAnyFilled(basics: DraftBasics): boolean {
  return basicsRequiredFields().some((field) => basics[field].trim().length > 0);
}

export function computeSectionStatus(draft: SurveyDraft, section: SectionKey): SectionStatus {
  if (section === "basics") {
    if (basicsComplete(draft.basics)) return "complete";
    if (basicsAnyFilled(draft.basics)) return "in-progress";
    return "not-started";
  }
  // LPI Settings, Practices, and Standard Questions ship with sensible
  // defaults — visiting and reviewing the section is what "completes" it.
  if (draft.touched[section]) return "complete";
  return "not-started";
}

export function sectionProgressLabel(draft: SurveyDraft, section: SectionKey): string {
  if (section === "basics") {
    const fields = basicsRequiredFields();
    const filled = fields.filter((f) => draft.basics[f].trim().length > 0).length;
    return `${filled} of ${fields.length} fields`;
  }
  if (section === "lpi-settings") {
    const enabled = Object.values(draft.lpiSettings).filter((r) => r.enabled).length;
    return `${enabled} of ${LPI_SETTINGS_CONFIG.length} data groups enabled`;
  }
  if (section === "practices") {
    const enabled = Object.values(draft.practices).filter((p) => p.enabled).length;
    const total = Object.keys(draft.practices).length;
    return `${enabled} of ${total} questions enabled`;
  }
  if (section === "standard-questions") {
    const enabled = Object.values(draft.standardQuestions).filter((q) => q.enabled).length;
    const total = Object.keys(draft.standardQuestions).length;
    return `${enabled} of ${total} enabled`;
  }
  const count = draft.customSections.length;
  return count === 0 ? "None added" : `${count} custom section${count === 1 ? "" : "s"}`;
}

export function computeOverallProgress(draft: SurveyDraft): { completed: number; total: number; percent: number } {
  const total = REQUIRED_SECTIONS.length;
  const completed = REQUIRED_SECTIONS.filter((s) => computeSectionStatus(draft, s) === "complete").length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function isReadyToSubmit(draft: SurveyDraft): boolean {
  return REQUIRED_SECTIONS.every((s) => computeSectionStatus(draft, s) === "complete");
}

// ── Submission → merges into the Survey Dashboard list ─────────────────────

function parseSubmitted(raw: string | null): Survey[] {
  try {
    return raw ? (JSON.parse(raw) as Survey[]) : [];
  } catch {
    return [];
  }
}

const EMPTY_SURVEYS: Survey[] = [];
let cachedSubmittedRaw: string | null = null;
let cachedSubmitted: Survey[] = EMPTY_SURVEYS;

function getSubmittedSnapshot(): Survey[] {
  if (typeof window === "undefined") return EMPTY_SURVEYS;
  const raw = window.localStorage.getItem(SUBMITTED_KEY);
  if (raw !== cachedSubmittedRaw) {
    cachedSubmittedRaw = raw;
    cachedSubmitted = parseSubmitted(raw);
  }
  return cachedSubmitted;
}

function getSubmittedServerSnapshot(): Survey[] {
  return EMPTY_SURVEYS;
}

export function useCustomSurveys(): Survey[] {
  return useSyncExternalStore(subscribe, getSubmittedSnapshot, getSubmittedServerSnapshot);
}

export function useAllSurveys(): Survey[] {
  const custom = useCustomSurveys();
  return [...MOCK_SURVEYS, ...custom];
}

/** Formats a yyyy-mm-dd <input type="date"> value as "Feb 1, 2026", matching the rest of the dashboard's date display. */
function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Files the draft: appends it to the dashboard's survey list and clears the draft. Returns the new survey's id. */
export function submitDraft(draft: SurveyDraft): string {
  const { basics } = draft;
  const year = basics.startDate ? new Date(basics.startDate).getFullYear() || new Date().getFullYear() : new Date().getFullYear();
  const id = `survey-custom-${Date.now()}`;
  const survey: Survey = {
    id,
    name: basics.requestType || basics.name || "New Survey",
    year,
    hostOrg: basics.organization,
    hostContact: basics.primaryContact,
    startDate: basics.startDate ? formatDisplayDate(basics.startDate) : "TBD",
    targetCloseDate: basics.dueDate ? formatDisplayDate(basics.dueDate) : "TBD",
    status: "upcoming",
    assetClasses: [],
    privacyLevel: "No information",
    totalInvited: 0,
    submitted: 0,
    inProgress: 0,
    notStarted: 0,
    lastSubmission: null,
    daysRemaining: null,
    weeklyReportUrl: "#",
  };
  const existing = getSubmittedSnapshot();
  window.localStorage.setItem(SUBMITTED_KEY, JSON.stringify([...existing, survey]));
  persistDraft(null);
  return id;
}
