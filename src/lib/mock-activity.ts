export type ActivityType =
  | "registered"
  | "survey_started"
  | "accessed"
  | "forwarded"
  | "submitted"
  | "invitation_sent"
  | "invitation_opened";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  surveyId: string;
  timestamp: string;
  actorName?: string;
  orgName?: string;
  action: string;
  metadata?: {
    forwardedTo?: string;
    count?: number;
  };
}

export interface ActivitySubscriber {
  id: string;
  name: string;
  email: string;
  frequency: "Daily" | "Weekly" | "Real-time";
  enabled: boolean;
}

// ─── Survey: 2026 DEI — Lenox Park Solutions ──────────────────────────────────
//
// Organizations in this survey and their statuses:
//   Blackstone Group         — submitted  Mar 10  (Michael Davis)
//   KKR & Co.                — submitted  Mar 18  (Jennifer Walsh → forwarded to Sarah Chen)
//   Bain Capital             — submitted  Mar 1   (Thomas Grant)
//   Apollo Global Management — in_progress 64%    (Robert Kim, last activity Feb 22)
//   The Carlyle Group        — in_progress 41%    (Amanda Torres, last activity Mar 5)
//   Warburg Pincus           — in_progress 22%    (Lisa Park, last activity Feb 15)
//   TPG Capital              — not_started        (Chris Lee, opened email only)
//   Vista Equity Partners    — not_started        (Nicole Brown, no activity)
//
// All 30 entries are sorted newest → oldest (page default is newest-first).

export const SURVEY_ACTIVITY: ActivityEntry[] = [

  // ── March 2026 ───────────────────────────────────────────────────────────────

  {
    id: "act-01",
    type: "submitted",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-03-18T11:45:00Z",
    actorName: "Jennifer Walsh",
    orgName: "KKR & Co.",
    action: "submitted their survey",
  },
  {
    id: "act-02",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-03-15T10:00:00Z",
    actorName: "Sarah Chen",
    orgName: "KKR & Co.",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-03",
    type: "submitted",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-03-10T15:30:00Z",
    actorName: "Michael Davis",
    orgName: "Blackstone Group",
    action: "submitted their survey",
  },
  {
    id: "act-04",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-03-08T14:00:00Z",
    actorName: "Michael Davis",
    orgName: "Blackstone Group",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-05",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-03-05T11:15:00Z",
    actorName: "Amanda Torres",
    orgName: "The Carlyle Group",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-06",
    type: "registered",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-03-03T09:30:00Z",
    actorName: "Sarah Chen",
    orgName: "KKR & Co.",
    action: "registered for their account",
  },
  {
    id: "act-07",
    type: "forwarded",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-03-03T09:00:00Z",
    actorName: "Jennifer Walsh",
    orgName: "KKR & Co.",
    action: "forwarded the survey to Sarah Chen",
    metadata: { forwardedTo: "Sarah Chen" },
  },
  {
    id: "act-08",
    type: "submitted",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-03-01T10:30:00Z",
    actorName: "Thomas Grant",
    orgName: "Bain Capital",
    action: "submitted their survey",
  },

  // ── February 2026 ─────────────────────────────────────────────────────────

  {
    id: "act-09",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-28T14:20:00Z",
    actorName: "Amanda Torres",
    orgName: "The Carlyle Group",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-10",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-24T11:00:00Z",
    actorName: "Jennifer Walsh",
    orgName: "KKR & Co.",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-11",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-22T13:40:00Z",
    actorName: "Robert Kim",
    orgName: "Apollo Global Management",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-12",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-22T09:15:00Z",
    actorName: "Thomas Grant",
    orgName: "Bain Capital",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-13",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-20T15:00:00Z",
    actorName: "Amanda Torres",
    orgName: "The Carlyle Group",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-14",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-20T11:30:00Z",
    actorName: "Robert Kim",
    orgName: "Apollo Global Management",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-15",
    type: "registered",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-18T10:00:00Z",
    actorName: "Robert Kim",
    orgName: "Apollo Global Management",
    action: "registered for their account",
  },
  {
    id: "act-16",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-18T14:00:00Z",
    actorName: "Jennifer Walsh",
    orgName: "KKR & Co.",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-17",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-15T14:30:00Z",
    actorName: "Lisa Park",
    orgName: "Warburg Pincus",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-18",
    type: "invitation_opened",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-15T09:00:00Z",
    actorName: "Robert Kim",
    orgName: "Apollo Global Management",
    action: "opened their invitation email",
  },
  {
    id: "act-19",
    type: "invitation_opened",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-14T16:30:00Z",
    actorName: "Lisa Park",
    orgName: "Warburg Pincus",
    action: "opened their invitation email",
  },
  {
    id: "act-20",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-14T11:00:00Z",
    actorName: "Thomas Grant",
    orgName: "Bain Capital",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-21",
    type: "invitation_opened",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-12T14:20:00Z",
    actorName: "Amanda Torres",
    orgName: "The Carlyle Group",
    action: "opened their invitation email",
  },
  {
    id: "act-22",
    type: "accessed",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-12T09:45:00Z",
    actorName: "Michael Davis",
    orgName: "Blackstone Group",
    action: "accessed and interacted with the survey",
  },
  {
    id: "act-23",
    type: "invitation_opened",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-11T14:00:00Z",
    actorName: "Chris Lee",
    orgName: "TPG Capital",
    action: "opened their invitation email",
  },
  {
    id: "act-24",
    type: "registered",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-10T10:30:00Z",
    actorName: "Thomas Grant",
    orgName: "Bain Capital",
    action: "registered for their account",
  },
  {
    id: "act-25",
    type: "invitation_opened",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-10T11:00:00Z",
    actorName: "Jennifer Walsh",
    orgName: "KKR & Co.",
    action: "opened their invitation email",
  },
  {
    id: "act-26",
    type: "invitation_opened",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-10T10:00:00Z",
    actorName: "Thomas Grant",
    orgName: "Bain Capital",
    action: "opened their invitation email",
  },
  {
    id: "act-27",
    type: "registered",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-09T09:00:00Z",
    actorName: "Michael Davis",
    orgName: "Blackstone Group",
    action: "registered for their account",
  },
  {
    id: "act-28",
    type: "invitation_opened",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-09T08:30:00Z",
    actorName: "Michael Davis",
    orgName: "Blackstone Group",
    action: "opened their invitation email",
  },
  {
    id: "act-29",
    type: "invitation_sent",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-08T09:15:00Z",
    action: "47 invitation emails sent to all invited organizations",
    metadata: { count: 47 },
  },
  {
    id: "act-30",
    type: "survey_started",
    surveyId: "survey-2026-dei-lenox",
    timestamp: "2026-02-08T08:00:00Z",
    action: "Survey launched and opened for responses",
  },
];

export const ACTIVITY_SUBSCRIBERS: ActivitySubscriber[] = [
  {
    id: "sub-01",
    name: "Heran Patel",
    email: "heran.patel@lenoxparkinc.com",
    frequency: "Daily",
    enabled: true,
  },
];

export function getActivityBySurvey(surveyId: string): ActivityEntry[] {
  return SURVEY_ACTIVITY.filter((e) => e.surveyId === surveyId);
}
