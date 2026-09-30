// ─── Survey creation draft store (mock flow) ────────────────────────────────
//
// Powers /surveys/new/*, a TurboTax-style hub-and-spoke replacement for the
// old linear "Create Request" wizard. There's no backend, so — same pattern
// as org-registry-store.ts — drafts persist to localStorage (autosaved on
// every change, unlike the old flow's "Auto-save is disabled" warning) and a
// submitted survey is appended to a small overlay list that merges with
// MOCK_SURVEYS at read time, so a filed draft actually shows up back on the
// Survey Dashboard.
//
// Drafts are stored as a keyed collection with an `activeId` pointer rather
// than a single blob, because the Client CRM's onboarding tab owns a draft
// *per survey cycle* (see DraftCycleContext). An admin can have one cycle's
// draft parked mid-build while starting an unrelated ad-hoc one, and the
// onboarding tab needs to read a specific cycle's draft without disturbing
// whatever the creation flow currently has open.
//
// A cycle-bound draft also outlives submission: it stays in the collection as
// the editable source of truth for its linked Survey until that survey
// launches, which is what closes the loop on onboarding step 1.

import { useSyncExternalStore } from "react";
import { Survey } from "@/types/survey";
import {
  CustomQuestion,
  CustomSection,
  DraftBasics,
  DraftCycleContext,
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

const DRAFTS_KEY = "rt_survey_drafts_v2";
/** Pre-multi-draft key — migrated into the collection on first read. */
const LEGACY_DRAFT_KEY = "rt_survey_draft_v1";
const SUBMITTED_KEY = SUBMITTED_SURVEYS_KEY;

interface DraftCollection {
  /** The draft the /surveys/new flow currently has open. */
  activeId: string | null;
  drafts: SurveyDraft[];
}

const EMPTY_COLLECTION: DraftCollection = { activeId: null, drafts: [] };

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

function newDraft(
  context: DraftCycleContext | null = null,
  basicsPrefill: Partial<DraftBasics> = {}
): SurveyDraft {
  const now = new Date().toISOString();
  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
    context,
    lifecycle: "configuring",
    surveyId: null,
    submittedAt: null,
    approvedAt: null,
    lockedAt: null,
    basics: { ...defaultBasics(), ...basicsPrefill },
    lpiSettings: defaultLpiSettings(),
    practices: defaultPractices(),
    standardQuestions: defaultStandardQuestions(),
    customSections: [],
    touched: {},
  };
}

let cachedRaw: string | null = null;
let cachedCollection: DraftCollection = EMPTY_COLLECTION;
const listeners = new Set<() => void>();

// A draft saved before the question set changed still carries the old keys.
// Rebuild the toggle maps from the current config — keeping any answer the
// admin already gave — so counts like "3 of 37 enabled" can't drift and stale
// keys don't linger in "Enable All". Also backfills the fields added when
// drafts gained a cycle context and a lifecycle.
function reconcile(draft: SurveyDraft): SurveyDraft {
  const lpiSettings: LpiSettingsState = {};
  LPI_SETTINGS_CONFIG.forEach((row) => {
    const prev = draft.lpiSettings?.[row.key];
    const options: Record<string, boolean> = {};
    row.options.forEach((opt) => {
      options[opt.key] = prev?.options?.[opt.key] ?? opt.defaultChecked;
    });
    lpiSettings[row.key] = { enabled: prev?.enabled ?? row.defaultEnabled, options };
  });

  const practices: PracticesState = {};
  PRACTICES_CONFIG.forEach((category) => {
    category.questions.forEach((q) => {
      practices[q.key] = { enabled: draft.practices?.[q.key]?.enabled ?? q.defaultEnabled };
    });
  });

  const standardQuestions: StandardQuestionsState = {};
  STANDARD_QUESTIONS_CONFIG.forEach((q) => {
    const prev = draft.standardQuestions?.[q.key];
    standardQuestions[q.key] = {
      enabled: prev?.enabled ?? q.defaultEnabled,
      text: prev?.text ?? q.defaultText,
    };
  });

  return {
    ...draft,
    context: draft.context ?? null,
    lifecycle: draft.lifecycle ?? "configuring",
    surveyId: draft.surveyId ?? null,
    submittedAt: draft.submittedAt ?? null,
    approvedAt: draft.approvedAt ?? null,
    lockedAt: draft.lockedAt ?? null,
    customSections: draft.customSections ?? [],
    touched: draft.touched ?? {},
    lpiSettings,
    practices,
    standardQuestions,
  };
}

function parseCollection(raw: string | null): DraftCollection {
  if (!raw) return EMPTY_COLLECTION;
  try {
    const parsed = JSON.parse(raw) as DraftCollection;
    if (!parsed || !Array.isArray(parsed.drafts)) return EMPTY_COLLECTION;
    return { activeId: parsed.activeId ?? null, drafts: parsed.drafts.map(reconcile) };
  } catch {
    return EMPTY_COLLECTION;
  }
}

let migrated = false;

/** One-time lift of the old single-draft key into the collection. */
function migrateLegacy(): void {
  const legacy = window.localStorage.getItem(LEGACY_DRAFT_KEY);
  if (!legacy) return;
  window.localStorage.removeItem(LEGACY_DRAFT_KEY);
  try {
    const draft = reconcile(JSON.parse(legacy) as SurveyDraft);
    const existing = parseCollection(window.localStorage.getItem(DRAFTS_KEY));
    write({ activeId: draft.id, drafts: [...existing.drafts, draft] });
  } catch {
    // Unparseable legacy draft — dropping it is the right call.
  }
}

function getCollection(): DraftCollection {
  if (typeof window === "undefined") return EMPTY_COLLECTION;
  if (!migrated) {
    migrated = true;
    migrateLegacy();
  }
  const raw = window.localStorage.getItem(DRAFTS_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedCollection = parseCollection(raw);
  }
  return cachedCollection;
}

function write(next: DraftCollection): void {
  window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
  cachedRaw = null;
  listeners.forEach((cb) => cb());
}

function getActiveSnapshot(): SurveyDraft | null {
  const { activeId, drafts } = getCollection();
  if (!activeId) return null;
  return drafts.find((d) => d.id === activeId) ?? null;
}

function nullSnapshot(): null {
  return null;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  function onStorage(e: StorageEvent) {
    if (e.key === DRAFTS_KEY || e.key === SUBMITTED_KEY) callback();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

// ── Reads ──────────────────────────────────────────────────────────────────

/** The draft the creation flow currently has open, or null if there is none. */
export function useDraft(): SurveyDraft | null {
  return useSyncExternalStore(subscribe, getActiveSnapshot, nullSnapshot);
}

export function getDraft(): SurveyDraft | null {
  return getActiveSnapshot();
}

export function getCycleDraft(cycleId: string): SurveyDraft | null {
  return getCollection().drafts.find((d) => d.context?.cycleId === cycleId) ?? null;
}

/** The draft owned by a client CRM survey cycle, at any point in its lifecycle. */
export function useCycleDraft(cycleId: string | null): SurveyDraft | null {
  return useSyncExternalStore(
    subscribe,
    () => (cycleId ? getCycleDraft(cycleId) : null),
    nullSnapshot
  );
}

/** A locked draft's question set is frozen — its survey has already launched. */
export function isDraftEditable(draft: SurveyDraft): boolean {
  return draft.lifecycle !== "locked";
}

// ── Writes ─────────────────────────────────────────────────────────────────

/** Returns the active draft, creating an unbound one if the flow was opened cold. */
export function ensureDraft(): SurveyDraft {
  const existing = getActiveSnapshot();
  if (existing) return existing;
  const draft = newDraft();
  const { drafts } = getCollection();
  write({ activeId: draft.id, drafts: [...drafts, draft] });
  return draft;
}

/**
 * Entry point for onboarding step 1: opens the cycle's draft in the creation
 * flow, creating it (prefilled from the client record) the first time. Always
 * resolves to the same draft for a given cycle, so the step is a closed loop
 * rather than a button that spawns a new survey on every click.
 */
export function beginCycleDraft(
  context: DraftCycleContext,
  basicsPrefill: Partial<DraftBasics> = {}
): SurveyDraft {
  const { drafts } = getCollection();
  const existing = drafts.find((d) => d.context?.cycleId === context.cycleId);
  if (existing) {
    // Refresh the context in case the client or cycle was renamed since.
    const next = { ...existing, context };
    write({ activeId: next.id, drafts: drafts.map((d) => (d.id === next.id ? next : d)) });
    return next;
  }
  const draft = newDraft(context, basicsPrefill);
  write({ activeId: draft.id, drafts: [...drafts, draft] });
  return draft;
}

/**
 * Entry point for the Survey Dashboard's "New Survey" button. Resumes the
 * unfinished ad-hoc draft if there is one, but never adopts a draft that
 * belongs to a client's onboarding cycle — those are reachable only from the
 * CRM, so starting a survey here can't silently hijack a client's buildout.
 */
export function beginAdHocDraft(): SurveyDraft {
  const { drafts } = getCollection();
  const existing = drafts.find((d) => !d.context && d.lifecycle === "configuring");
  if (existing) {
    write({ activeId: existing.id, drafts });
    return existing;
  }
  const draft = newDraft();
  write({ activeId: draft.id, drafts: [...drafts, draft] });
  return draft;
}

/** The resumable ad-hoc draft, for the dashboard's "continue where you left off" card. */
export function useAdHocDraft(): SurveyDraft | null {
  return useSyncExternalStore(
    subscribe,
    () => getCollection().drafts.find((d) => !d.context && d.lifecycle === "configuring") ?? null,
    nullSnapshot
  );
}

export function setActiveDraft(draftId: string | null): void {
  const { drafts } = getCollection();
  write({ activeId: draftId, drafts });
}

function updateDraft(draftId: string, updater: (draft: SurveyDraft) => SurveyDraft): void {
  const { activeId, drafts } = getCollection();
  const target = drafts.find((d) => d.id === draftId);
  if (!target) return;
  const next = { ...updater(target), updatedAt: new Date().toISOString() };
  write({ activeId, drafts: drafts.map((d) => (d.id === draftId ? next : d)) });
}

/** Edits the active draft. A no-op once its survey has launched. */
function saveDraft(updater: (draft: SurveyDraft) => SurveyDraft): void {
  const current = getActiveSnapshot() ?? ensureDraft();
  if (!isDraftEditable(current)) return;
  updateDraft(current.id, updater);
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

/** Drops a draft entirely. For a submitted cycle draft this also unfiles its survey. */
export function discardDraftById(draftId: string): void {
  const { activeId, drafts } = getCollection();
  const target = drafts.find((d) => d.id === draftId);
  if (target?.surveyId) unfileSurvey(target.surveyId);
  write({
    activeId: activeId === draftId ? null : activeId,
    drafts: drafts.filter((d) => d.id !== draftId),
  });
}

/** Discards whatever the creation flow currently has open. */
export function discardDraft(): void {
  const active = getActiveSnapshot();
  if (active) discardDraftById(active.id);
}

// ── Section status / progress ───────────────────────────────────────────────

function basicsRequiredFields(): (keyof DraftBasics)[] {
  return ["organization", "requestType", "name", "startDate", "dueDate", "primaryContact", "contactEmail", "technicalSupport"];
}

function basicsComplete(basics: DraftBasics): boolean {
  return basicsRequiredFields().every((field) => basics[field].trim().length > 0);
}

// A new draft pre-selects an organization, so "has any value" would report a
// brand-new survey as already in progress. Progress means the admin changed
// something, not that a default is sitting there.
function basicsAnyFilled(basics: DraftBasics): boolean {
  const defaults = defaultBasics();
  return basicsRequiredFields().some((field) => basics[field].trim() !== defaults[field].trim());
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

export interface SectionProgress {
  completed: number;
  total: number;
  remaining: number;
  percent: number;
}

function progressOver(draft: SurveyDraft, sections: SectionKey[]): SectionProgress {
  const total = sections.length;
  const completed = sections.filter((s) => computeSectionStatus(draft, s) === "complete").length;
  return {
    completed,
    total,
    remaining: total - completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

/**
 * Progress across every section the hub stacks, so the header count and bar
 * line up with the numbered steps on screen — including the optional one,
 * which previously could never move the bar.
 */
export function computeOverallProgress(draft: SurveyDraft): SectionProgress {
  return progressOver(draft, SECTION_ORDER);
}

/**
 * Progress across only the sections that gate submission. This is a smaller
 * set than the steps on screen, since Custom Questions never blocks filing,
 * so the "Review & submit" countdown must use this rather than the overall.
 */
export function computeRequiredProgress(draft: SurveyDraft): SectionProgress {
  return progressOver(draft, REQUIRED_SECTIONS);
}

export function isReadyToSubmit(draft: SurveyDraft): boolean {
  return REQUIRED_SECTIONS.every((s) => computeSectionStatus(draft, s) === "complete");
}

/** Headline counts for the survey summary shown on the CRM onboarding tab. */
export function draftContentSummary(draft: SurveyDraft): {
  lpiGroups: number;
  practices: number;
  standardQuestions: number;
  customSections: number;
  customQuestions: number;
} {
  return {
    lpiGroups: Object.values(draft.lpiSettings).filter((r) => r.enabled).length,
    practices: Object.values(draft.practices).filter((p) => p.enabled).length,
    standardQuestions: Object.values(draft.standardQuestions).filter((q) => q.enabled).length,
    customSections: draft.customSections.length,
    customQuestions: draft.customSections.reduce((sum, s) => sum + s.questions.length, 0),
  };
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

function writeSubmitted(surveys: Survey[]): void {
  window.localStorage.setItem(SUBMITTED_KEY, JSON.stringify(surveys));
  cachedSubmittedRaw = null;
  listeners.forEach((cb) => cb());
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

/** The Survey record a draft describes — recomputed on every save so an edit to a linked draft can't leave the dashboard stale. */
function surveyFromDraft(draft: SurveyDraft, id: string, previous?: Survey): Survey {
  const { basics } = draft;
  const year =
    (basics.startDate ? new Date(basics.startDate).getFullYear() : NaN) || previous?.year || new Date().getFullYear();
  return {
    ...(previous ?? {
      status: "upcoming" as const,
      assetClasses: [],
      privacyLevel: "No information" as const,
      totalInvited: 0,
      submitted: 0,
      inProgress: 0,
      notStarted: 0,
      lastSubmission: null,
      daysRemaining: null,
      weeklyReportUrl: "#",
    }),
    id,
    name: basics.name || basics.requestType || "New Survey",
    year,
    hostOrg: basics.organization,
    hostContact: basics.primaryContact,
    startDate: basics.startDate ? formatDisplayDate(basics.startDate) : "TBD",
    targetCloseDate: basics.dueDate ? formatDisplayDate(basics.dueDate) : "TBD",
  };
}

function unfileSurvey(surveyId: string): void {
  const existing = getSubmittedSnapshot();
  if (!existing.some((s) => s.id === surveyId)) return;
  writeSubmitted(existing.filter((s) => s.id !== surveyId));
}

/**
 * Files the draft as a real Survey.
 *
 * An ad-hoc draft is consumed — it disappears once filed, same as before. A
 * cycle-bound draft instead moves to `submitted` and stays put: the CRM's
 * onboarding step keeps showing it, and the admin can keep editing the
 * question set (re-filing through `saveLinkedSurvey`) right up until launch.
 */
export function submitDraft(draft: SurveyDraft): string {
  const id = draft.surveyId ?? `survey-custom-${Date.now()}`;
  const existing = getSubmittedSnapshot();
  const previous = existing.find((s) => s.id === id);
  const survey = surveyFromDraft(draft, id, previous);
  writeSubmitted(previous ? existing.map((s) => (s.id === id ? survey : s)) : [...existing, survey]);

  if (draft.context) {
    updateDraft(draft.id, (d) => ({
      ...d,
      lifecycle: d.lifecycle === "locked" ? "locked" : "submitted",
      surveyId: id,
      submittedAt: d.submittedAt ?? new Date().toISOString(),
    }));
  } else {
    discardDraftById(draft.id);
  }
  return id;
}

/** Pushes edits from an already-filed cycle draft back onto its Survey record. */
export function saveLinkedSurvey(draft: SurveyDraft): string | null {
  if (!draft.surveyId) return null;
  return submitDraft(draft);
}

/**
 * Records the client's sign-off on the question set, which is what completes
 * onboarding step 1. Deliberately does *not* freeze the draft — the survey
 * stays editable right up until the cycle launches, so a late correction
 * doesn't require unwinding the whole step.
 */
export function approveDraftQuestions(draftId: string): void {
  updateDraft(draftId, (d) => (d.approvedAt ? d : { ...d, approvedAt: new Date().toISOString() }));
}

/** Pulls sign-off back so the question set can be reworked before launch. */
export function reopenDraftQuestions(draftId: string): void {
  updateDraft(draftId, (d) => (d.approvedAt ? { ...d, approvedAt: null } : d));
}

/**
 * Freezes the question set because the cycle launched, and flips the linked
 * Survey to active on the dashboard. After this the CRM shows the survey
 * read-only and the creation flow refuses edits (see `saveDraft`).
 */
export function lockDraft(draftId: string): void {
  const draft = getCollection().drafts.find((d) => d.id === draftId);
  if (!draft || draft.lifecycle === "locked") return;
  // Make sure the dashboard reflects the final state before it's frozen.
  const surveyId = draft.surveyId ?? submitDraft(draft);
  const existing = getSubmittedSnapshot();
  writeSubmitted(existing.map((s) => (s.id === surveyId ? { ...s, status: "active" } : s)));
  updateDraft(draftId, (d) => ({
    ...d,
    lifecycle: "locked",
    surveyId,
    approvedAt: d.approvedAt ?? new Date().toISOString(),
    lockedAt: new Date().toISOString(),
  }));
}
