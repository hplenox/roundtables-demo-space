import type {
  Client,
  ClientKeyDates,
  ClientStatus,
  ClientPriority,
  ChecklistItem,
  ChecklistItemKey,
  OnboardingStep,
  OnboardingStepKey,
  OnboardingStepStatus,
  ClientSurveyCycle,
  SurveyCycleStatus,
} from "@/types/client";

// ─── Fixed "today" anchor ────────────────────────────────────────────────
// The whole demo lives on a fictional 2026 timeline, so urgency/overdue
// math is computed against a fixed anchor rather than the visitor's real
// wall-clock date — otherwise "overdue" badges would drift out of the
// story depending on when someone happens to load the demo.
export const TODAY_ISO = "2026-08-10";
export const TODAY = new Date(`${TODAY_ISO}T00:00:00`);

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntil(iso: string): number {
  const d = new Date(`${iso}T00:00:00`);
  return Math.round((d.getTime() - TODAY.getTime()) / 86_400_000);
}

// ─── Status / priority display config ───────────────────────────────────

export const STATUS_CONFIG: Record<ClientStatus, { label: string; dot: string; badge: string }> = {
  prospect:     { label: "Prospect",     dot: "bg-slate-400",   badge: "bg-slate-50 border-slate-200 text-slate-600" },
  onboarding:   { label: "Onboarding",   dot: "bg-blue-400",    badge: "bg-blue-50 border-blue-200 text-blue-700" },
  survey_live:  { label: "Survey Live",  dot: "bg-emerald-400", badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  reporting:    { label: "Reporting",    dot: "bg-violet-400",  badge: "bg-violet-50 border-violet-200 text-violet-700" },
  renewal_due:  { label: "Renewal Due",  dot: "bg-amber-400",   badge: "bg-amber-50 border-amber-200 text-amber-700" },
  inactive:     { label: "Inactive",     dot: "bg-slate-300",   badge: "bg-slate-100 border-slate-200 text-slate-400" },
};

export const PRIORITY_CONFIG: Record<ClientPriority, { label: string; badge: string }> = {
  strategic:  { label: "Strategic",  badge: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  standard:   { label: "Standard",   badge: "bg-slate-50 border-slate-200 text-slate-600" },
  low_touch:  { label: "Low-Touch",  badge: "bg-transparent border-slate-200 text-slate-400" },
};

/** The lifecycle a single survey cycle moves through: onboarding → live → closed → reporting → completed. */
export const CYCLE_STATUS_CONFIG: Record<SurveyCycleStatus, { label: string; dot: string; badge: string }> = {
  onboarding: { label: "Onboarding", dot: "bg-blue-400",    badge: "bg-blue-50 border-blue-200 text-blue-700" },
  live:       { label: "Live",       dot: "bg-emerald-400", badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  closed:     { label: "Closed",     dot: "bg-amber-400",   badge: "bg-amber-50 border-amber-200 text-amber-700" },
  reporting:  { label: "Reporting",  dot: "bg-violet-400",  badge: "bg-violet-50 border-violet-200 text-violet-700" },
  completed:  { label: "Completed", dot: "bg-slate-300",    badge: "bg-slate-100 border-slate-200 text-slate-400" },
};

export const CYCLE_STATUS_ORDER: SurveyCycleStatus[] = ["onboarding", "live", "closed", "reporting", "completed"];

/** How a cycle's lifecycle stage rolls up into the client's overall relationship status. */
export function clientStatusForCycleStatus(status: SurveyCycleStatus): ClientStatus {
  switch (status) {
    case "onboarding": return "onboarding";
    case "live":        return "survey_live";
    case "closed":      return "survey_live";
    case "reporting":   return "reporting";
    case "completed":   return "renewal_due";
  }
}

export const KEY_DATE_LABELS: Record<keyof ClientKeyDates, string> = {
  kickoffCallDate: "Kickoff Call",
  onboardingDate: "Onboarding",
  launchDate: "Survey Launch",
  endDate: "Survey End",
  extensionDate: "Extension Deadline",
  targetCloseDate: "Target Close",
  reportingDueDate: "Reporting Due",
};

export const CHECKLIST_TEMPLATE: { key: ChecklistItemKey; label: string }[] = [
  { key: "kickoff_call",            label: "Host Kick Off Call" },
  { key: "key_dates",               label: "Decide and Update All Key Client Survey Dates" },
  { key: "onboarding_email",        label: "Send Onboarding Email" },
  { key: "question_buildout",       label: "Finalize Survey Question Buildout" },
  { key: "contact_list_finalized",  label: "Finalize Contact List" },
  { key: "contact_list_scrubbed",   label: "Scrub Contact List" },
  { key: "email_template_sent",     label: "Send Email Template" },
  { key: "finalization_email",      label: "Send Onboarding Finalization Email (w/ Key Dates)" },
];

export const ONBOARDING_TEMPLATE: { key: OnboardingStep["key"]; label: string; description: string; requirements: string[] }[] = [
  {
    key: "questions",
    label: "Survey Question Selection",
    description: "Request the client to review last year's questions and survey layout, make any adjustments, and submit their final selection.",
    requirements: [
      "Review the prior year's question set and survey layout",
      "Flag any questions to add, remove, or revise for this cycle",
      "Confirm the final question selection with your LPS account owner",
    ],
  },
  {
    key: "contacts",
    label: "Contact List",
    description: "Request the client to review their current contact list pulled from the prior survey, make adjustments, and submit a final list.",
    requirements: [
      "Review the contact list carried over from the prior survey cycle",
      "Add, remove, or update contacts to reflect the current team",
      "Confirm each contact's name, title, and email are correct",
      "Submit the final contact list for this survey cycle",
    ],
  },
  {
    key: "finalization",
    label: "Onboarding Finalization Email",
    description: "Send the client a finalization email with onboarding info, key dates, and the manager outreach email template.",
    requirements: [
      "Review the recap of key dates for the upcoming cycle",
      "Download the onboarding instructions PDF",
      "Forward the included manager outreach template to your team",
    ],
  },
];

export function makeChecklist(doneKeys: ChecklistItemKey[], completedBy: string, datesByKey: Partial<Record<ChecklistItemKey, string>> = {}): ChecklistItem[] {
  return CHECKLIST_TEMPLATE.map((item) => {
    const done = doneKeys.includes(item.key);
    return {
      ...item,
      done,
      completedAt: done ? datesByKey[item.key] ?? null : null,
      completedBy: done ? completedBy : null,
    };
  });
}

/** All 8 items done as of `date` — for cycles that are already closed/completed, where the exact historical cadence doesn't matter. */
function fullChecklist(completedBy: string, date: string): ChecklistItem[] {
  return makeChecklist(
    CHECKLIST_TEMPLATE.map((c) => c.key),
    completedBy,
    Object.fromEntries(CHECKLIST_TEMPLATE.map((c) => [c.key, date])) as Record<ChecklistItemKey, string>
  );
}

export function makeOnboarding(
  statuses: Record<OnboardingStep["key"], OnboardingStep["status"]>,
  updatedAtByKey: Partial<Record<OnboardingStep["key"], string>> = {},
  lastEmailByKey: Partial<Record<OnboardingStep["key"], string>> = {}
): OnboardingStep[] {
  return ONBOARDING_TEMPLATE.map((step) => ({
    ...step,
    status: statuses[step.key],
    updatedAt: updatedAtByKey[step.key] ?? null,
    lastEmailSentAt: lastEmailByKey[step.key] ?? null,
  }));
}

/** All 3 steps approved as of `date`. */
function fullOnboarding(date: string): OnboardingStep[] {
  return makeOnboarding(
    { questions: "approved", contacts: "approved", finalization: "approved" },
    { questions: date, contacts: date, finalization: date },
    { questions: date, contacts: date, finalization: date }
  );
}

export function makeKeyDates(dates: Partial<ClientKeyDates>): ClientKeyDates {
  return {
    kickoffCallDate: null,
    onboardingDate: null,
    launchDate: null,
    endDate: null,
    extensionDate: null,
    targetCloseDate: null,
    reportingDueDate: null,
    ...dates,
  };
}

// ─── Clients ─────────────────────────────────────────────────────────────

export const MOCK_CLIENTS: Client[] = [
  {
    id: "client-lenox",
    name: "Lenox Park Solutions, Inc.",
    segment: "Institutional Limited Partner",
    priority: "strategic",
    status: "survey_live",
    accountOwner: "Jordan Kim",
    clientSince: "2024-11-02",
    primaryContactName: "Esteban Fernandez",
    primaryContactTitle: "Director of Impact & Sustainability",
    primaryContactEmail: "e.fernandez@lenoxparksolutions.com",
    surveys: [
      {
        id: "cyc-lenox-2025", surveyId: "survey-2025-dei-lenox", name: "Diversity, Equity, & Inclusion", year: 2025,
        status: "completed", totalInvited: 41, submitted: 38, startDate: "2025-02-05", closeDate: "2026-01-28",
        keyDates: makeKeyDates({
          kickoffCallDate: "2024-11-10", onboardingDate: "2024-12-05", launchDate: "2025-02-05",
          endDate: "2025-11-01", targetCloseDate: "2026-01-31", reportingDueDate: "2026-02-15",
        }),
        checklist: fullChecklist("Jordan Kim", "2024-12-05"),
        onboarding: fullOnboarding("2024-12-05"),
      },
      {
        id: "cyc-lenox-2026", surveyId: "survey-2026-dei-lenox", name: "Diversity, Equity, & Inclusion", year: 2026,
        status: "live", totalInvited: 47, submitted: 12, startDate: "2026-02-08", closeDate: null,
        keyDates: makeKeyDates({
          kickoffCallDate: "2025-12-08", onboardingDate: "2026-01-10", launchDate: "2026-02-08",
          endDate: "2026-10-01", targetCloseDate: "2027-02-01", reportingDueDate: "2027-03-15",
        }),
        checklist: makeChecklist(
          ["kickoff_call", "key_dates", "onboarding_email", "question_buildout", "contact_list_finalized", "contact_list_scrubbed", "email_template_sent", "finalization_email"],
          "Jordan Kim",
          {
            kickoff_call: "2025-12-08", key_dates: "2025-12-12", onboarding_email: "2025-12-15",
            question_buildout: "2026-01-05", contact_list_finalized: "2026-01-08", contact_list_scrubbed: "2026-01-09",
            email_template_sent: "2026-01-10", finalization_email: "2026-01-10",
          }
        ),
        onboarding: makeOnboarding(
          { questions: "approved", contacts: "approved", finalization: "approved" },
          { questions: "2026-01-05", contacts: "2026-01-09", finalization: "2026-01-10" },
          { questions: "2026-01-02", contacts: "2026-01-07", finalization: "2026-01-10" }
        ),
      },
    ],
  },
  {
    id: "client-hamilton",
    name: "Hamilton Lane Advisors",
    segment: "Private Markets Advisor",
    priority: "strategic",
    status: "onboarding",
    accountOwner: "Alicia Ramirez",
    clientSince: "2025-09-01",
    primaryContactName: "Patricia Moore",
    primaryContactTitle: "Chief Diversity Officer",
    primaryContactEmail: "p.moore@hamiltonlane.com",
    surveys: [
      {
        id: "cyc-hamilton-2026", surveyId: "survey-2026-dei-hamilton", name: "DEI Manager Assessment", year: 2026,
        status: "onboarding", totalInvited: 0, submitted: 0, startDate: null, closeDate: null,
        keyDates: makeKeyDates({
          kickoffCallDate: "2026-06-01", onboardingDate: "2026-07-15", launchDate: "2026-09-01",
          endDate: "2026-12-15", targetCloseDate: "2027-01-15", reportingDueDate: "2027-02-01",
        }),
        checklist: makeChecklist(
          ["kickoff_call", "key_dates", "onboarding_email", "question_buildout"],
          "Alicia Ramirez",
          { kickoff_call: "2026-06-01", key_dates: "2026-06-05", onboarding_email: "2026-06-08", question_buildout: "2026-07-10" }
        ),
        onboarding: makeOnboarding(
          { questions: "approved", contacts: "in_progress", finalization: "not_started" },
          { questions: "2026-07-10" },
          { questions: "2026-06-10", contacts: "2026-07-02" }
        ),
      },
    ],
  },
  {
    id: "client-calpers",
    name: "CalPERS",
    segment: "Public Pension Fund",
    priority: "strategic",
    status: "onboarding",
    accountOwner: "Derek Osei",
    clientSince: "2026-03-01",
    primaryContactName: "James Okonkwo",
    primaryContactTitle: "ESG Program Director",
    primaryContactEmail: "j.okonkwo@calpers.ca.gov",
    surveys: [
      {
        id: "cyc-calpers-2026", surveyId: "survey-2026-dei-calpers", name: "Emerging Manager DEI Survey", year: 2026,
        status: "onboarding", totalInvited: 62, submitted: 0, startDate: null, closeDate: null,
        keyDates: makeKeyDates({
          kickoffCallDate: "2026-07-01", onboardingDate: "2026-08-05", launchDate: "2026-09-15",
          endDate: "2027-01-15", targetCloseDate: "2027-03-01", reportingDueDate: "2027-04-01",
        }),
        checklist: makeChecklist(
          ["kickoff_call", "key_dates", "onboarding_email"],
          "Derek Osei",
          { kickoff_call: "2026-07-01", key_dates: "2026-07-03", onboarding_email: "2026-07-08" }
        ),
        onboarding: makeOnboarding(
          { questions: "in_progress", contacts: "not_started", finalization: "not_started" },
          {},
          { questions: "2026-07-20" }
        ),
      },
    ],
  },
  {
    id: "client-kkr",
    name: "KKR & Co.",
    segment: "Alternative Asset Manager",
    priority: "standard",
    status: "renewal_due",
    accountOwner: "Priya Anand",
    clientSince: "2024-01-15",
    primaryContactName: "Sarah Chen",
    primaryContactTitle: "Head of Talent & Culture",
    primaryContactEmail: "s.chen@kkr.com",
    notes: "Renewal conversation overdue — last survey closed Nov 2025 with no successor cycle scheduled.",
    surveys: [
      {
        id: "cyc-kkr-2025", surveyId: "survey-2025-dei-kkr", name: "Workforce Diversity Assessment", year: 2025,
        status: "completed", totalInvited: 88, submitted: 71, startDate: "2025-03-01", closeDate: "2025-11-29",
        keyDates: makeKeyDates({
          kickoffCallDate: "2025-01-10", onboardingDate: "2025-02-01", launchDate: "2025-03-01",
          endDate: "2025-11-15", targetCloseDate: "2025-12-01", reportingDueDate: "2026-01-05",
        }),
        checklist: fullChecklist("Priya Anand", "2025-02-01"),
        onboarding: fullOnboarding("2025-02-01"),
      },
    ],
  },
  {
    id: "client-meketa",
    name: "Meketa Investment Group",
    segment: "Investment Consultant",
    priority: "standard",
    status: "reporting",
    accountOwner: "Jordan Kim",
    clientSince: "2023-06-10",
    primaryContactName: "Rachel Nguyen",
    primaryContactTitle: "Director of Responsible Investing",
    primaryContactEmail: "r.nguyen@meketa.com",
    surveys: [
      {
        id: "cyc-meketa-2025", surveyId: null, name: "DEI Manager Assessment", year: 2025,
        status: "completed", totalInvited: 34, submitted: 29, startDate: "2025-03-01", closeDate: "2025-08-01",
        keyDates: makeKeyDates({
          kickoffCallDate: "2024-12-15", onboardingDate: "2025-01-20", launchDate: "2025-03-01",
          endDate: "2025-08-01", targetCloseDate: "2025-08-15", reportingDueDate: "2025-09-01",
        }),
        checklist: fullChecklist("Jordan Kim", "2025-01-20"),
        onboarding: fullOnboarding("2025-01-20"),
      },
      {
        id: "cyc-meketa-2026", surveyId: null, name: "DEI Manager Assessment", year: 2026,
        status: "reporting", totalInvited: 36, submitted: 33, startDate: "2026-03-01", closeDate: "2026-07-01",
        keyDates: makeKeyDates({
          kickoffCallDate: "2025-12-15", onboardingDate: "2026-01-20", launchDate: "2026-03-01",
          endDate: "2026-07-01", targetCloseDate: "2026-07-15", reportingDueDate: "2026-09-01",
        }),
        checklist: fullChecklist("Jordan Kim", "2026-01-20"),
        onboarding: fullOnboarding("2026-01-20"),
      },
    ],
  },
  {
    id: "client-aon",
    name: "Aon Investments USA",
    segment: "Investment Consultant",
    priority: "standard",
    status: "survey_live",
    accountOwner: "Priya Anand",
    clientSince: "2022-02-20",
    primaryContactName: "Marcus Webb",
    primaryContactTitle: "VP, DEI Strategy",
    primaryContactEmail: "m.webb@aon.com",
    surveys: [
      {
        id: "cyc-aon-2024", surveyId: null, name: "DEI Manager Assessment", year: 2024,
        status: "completed", totalInvited: 50, submitted: 44, startDate: "2024-04-01", closeDate: "2024-10-01",
        keyDates: makeKeyDates({
          kickoffCallDate: "2024-01-15", onboardingDate: "2024-02-15", launchDate: "2024-04-01",
          endDate: "2024-10-01", targetCloseDate: "2024-10-15", reportingDueDate: "2024-11-15",
        }),
        checklist: fullChecklist("Priya Anand", "2024-02-15"),
        onboarding: fullOnboarding("2024-02-15"),
      },
      {
        id: "cyc-aon-2025", surveyId: null, name: "DEI Manager Assessment", year: 2025,
        status: "completed", totalInvited: 55, submitted: 50, startDate: "2025-04-01", closeDate: "2025-10-15",
        keyDates: makeKeyDates({
          kickoffCallDate: "2025-01-15", onboardingDate: "2025-02-15", launchDate: "2025-04-01",
          endDate: "2025-10-15", targetCloseDate: "2025-11-01", reportingDueDate: "2025-12-01",
        }),
        checklist: fullChecklist("Priya Anand", "2025-02-15"),
        onboarding: fullOnboarding("2025-02-15"),
      },
      {
        id: "cyc-aon-2026", surveyId: null, name: "DEI Manager Assessment", year: 2026,
        status: "live", totalInvited: 58, submitted: 21, startDate: "2026-05-01", closeDate: null,
        keyDates: makeKeyDates({
          kickoffCallDate: "2026-03-10", onboardingDate: "2026-04-01", launchDate: "2026-05-01",
          endDate: "2026-10-15", targetCloseDate: "2026-11-01", reportingDueDate: "2026-12-01",
        }),
        checklist: makeChecklist(
          ["kickoff_call", "key_dates", "onboarding_email", "question_buildout", "contact_list_finalized", "contact_list_scrubbed", "email_template_sent", "finalization_email"],
          "Priya Anand",
          {
            kickoff_call: "2026-03-10", key_dates: "2026-03-14", onboarding_email: "2026-03-18",
            question_buildout: "2026-04-15", contact_list_finalized: "2026-04-20", contact_list_scrubbed: "2026-04-22",
            email_template_sent: "2026-04-28", finalization_email: "2026-04-30",
          }
        ),
        onboarding: makeOnboarding(
          { questions: "approved", contacts: "approved", finalization: "approved" },
          { questions: "2026-04-15", contacts: "2026-04-22", finalization: "2026-04-30" },
          { questions: "2026-04-01", contacts: "2026-04-16", finalization: "2026-04-30" }
        ),
      },
    ],
  },
  {
    id: "client-cambridge",
    name: "Cambridge Associates LLC",
    segment: "Investment Consultant",
    priority: "low_touch",
    status: "prospect",
    accountOwner: "Derek Osei",
    clientSince: "2026-07-20",
    primaryContactName: "Olivia Bennett",
    primaryContactTitle: "Senior Consultant, ESG",
    primaryContactEmail: "o.bennett@cambridgeassociates.com",
    notes: "Warm intro from a conference panel — budget tentatively confirmed for a 2027 cycle pending a discovery call.",
    surveys: [],
  },
  {
    id: "client-nepc",
    name: "NEPC LLC",
    segment: "Investment Consultant",
    priority: "low_touch",
    status: "inactive",
    accountOwner: "Alicia Ramirez",
    clientSince: "2021-05-01",
    primaryContactName: "Grace Liu",
    primaryContactTitle: "Former DEI Program Lead",
    primaryContactEmail: "g.liu@nepc.com",
    notes: "Primary contact may have left the firm — verify before re-engaging outreach.",
    surveys: [
      {
        id: "cyc-nepc-2022", surveyId: null, name: "Workforce Diversity Assessment", year: 2022,
        status: "completed", totalInvited: 29, submitted: 19, startDate: "2022-03-01", closeDate: "2022-09-01",
        keyDates: makeKeyDates({
          kickoffCallDate: "2021-12-10", onboardingDate: "2022-01-15", launchDate: "2022-03-01",
          endDate: "2022-09-01", targetCloseDate: "2022-09-15", reportingDueDate: "2022-10-01",
        }),
        checklist: fullChecklist("Alicia Ramirez", "2022-01-15"),
        onboarding: fullOnboarding("2022-01-15"),
      },
      {
        id: "cyc-nepc-2023", surveyId: null, name: "Workforce Diversity Assessment", year: 2023,
        status: "completed", totalInvited: 31, submitted: 22, startDate: "2023-03-01", closeDate: "2023-09-01",
        keyDates: makeKeyDates({
          kickoffCallDate: "2022-12-10", onboardingDate: "2023-01-15", launchDate: "2023-03-01",
          endDate: "2023-09-01", targetCloseDate: "2023-09-15", reportingDueDate: "2023-10-01",
        }),
        checklist: fullChecklist("Alicia Ramirez", "2023-01-15"),
        onboarding: fullOnboarding("2023-01-15"),
      },
    ],
  },
];

export function getAllClients(): Client[] {
  return MOCK_CLIENTS;
}

export function getClientById(id: string): Client | undefined {
  return MOCK_CLIENTS.find((c) => c.id === id);
}

/**
 * Writes an onboarding step status directly into the shared MOCK_CLIENTS
 * store (not just local component state) so it's visible from the Client
 * CRM the next time an admin loads that client — this is how a client
 * completing their own onboarding step becomes visible to LPS admins
 * without a real backend. Unlike the admin-side ClientProvider (which
 * intentionally keeps admin edits session-local), this is the one write
 * path that needs to persist across routes within the session.
 */
export function submitOnboardingStepAsClient(
  clientId: string,
  cycleId: string,
  stepKey: OnboardingStepKey,
  status: OnboardingStepStatus,
  timestamp: string
): Client | null {
  const idx = MOCK_CLIENTS.findIndex((c) => c.id === clientId);
  if (idx === -1) return null;

  const updated: Client = {
    ...MOCK_CLIENTS[idx],
    surveys: MOCK_CLIENTS[idx].surveys.map((s) =>
      s.id !== cycleId
        ? s
        : { ...s, onboarding: s.onboarding.map((o) => (o.key === stepKey ? { ...o, status, updatedAt: timestamp } : o)) }
    ),
  };
  MOCK_CLIENTS[idx] = updated;
  return updated;
}

// ─── Derived helpers ───────────────────────────────────────────────────────

/** The cycle currently moving through onboarding/live/closed/reporting — null once every cycle is completed (or there are none yet). */
export function getActiveCycle(client: Client): ClientSurveyCycle | null {
  const active = client.surveys.filter((s) => s.status !== "completed");
  if (active.length === 0) return null;
  return active.reduce((latest, c) => (c.year > latest.year ? c : latest), active[0]);
}

export function getMostRecentCompletedCycle(client: Client): ClientSurveyCycle | null {
  const completed = client.surveys.filter((s) => s.status === "completed");
  if (completed.length === 0) return null;
  return completed.reduce((latest, c) => (c.year > latest.year ? c : latest), completed[0]);
}

export function checklistProgress(cycle: ClientSurveyCycle | null): { done: number; total: number; pct: number } {
  if (!cycle) return { done: 0, total: 0, pct: 0 };
  const total = cycle.checklist.length;
  const done = cycle.checklist.filter((c) => c.done).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function onboardingProgress(cycle: ClientSurveyCycle | null): { done: number; total: number; pct: number } {
  if (!cycle) return { done: 0, total: 0, pct: 0 };
  const total = cycle.onboarding.length;
  const done = cycle.onboarding.filter((s) => s.status === "approved").length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export interface NextMilestone {
  key: keyof ClientKeyDates;
  label: string;
  date: string;
  days: number;
  overdue: boolean;
}

export function getNextMilestone(keyDates: ClientKeyDates): NextMilestone | null {
  const entries = Object.entries(keyDates) as [keyof ClientKeyDates, string | null][];
  const withDates = entries.filter(([, v]) => v !== null) as [keyof ClientKeyDates, string][];
  if (withDates.length === 0) return null;

  const withMeta = withDates.map(([key, date]) => ({
    key,
    date,
    label: KEY_DATE_LABELS[key],
    days: daysUntil(date),
  }));

  const future = withMeta.filter((m) => m.days >= 0).sort((a, b) => a.days - b.days);
  if (future.length > 0) return { ...future[0], overdue: false };

  const mostRecentPast = withMeta.sort((a, b) => b.days - a.days)[0];
  return { ...mostRecentPast, overdue: true };
}

/** Convenience wrapper for list-level views: the client's active cycle's next milestone, if any. */
export function getClientNextMilestone(client: Client): NextMilestone | null {
  const active = getActiveCycle(client);
  return active ? getNextMilestone(active.keyDates) : null;
}

export function responseRate(cycle: { totalInvited: number; submitted: number } | null | undefined): number | null {
  if (!cycle || cycle.totalInvited === 0) return null;
  return Math.round((cycle.submitted / cycle.totalInvited) * 100);
}
