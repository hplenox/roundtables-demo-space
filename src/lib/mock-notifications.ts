import type { Notification } from "@/types/notification";

// Reference: today = 2026-06-11. Survey deadline = June 18, 2026.
// 7-day reminders fire today (Jun 11 = Jun 18 - 7 days).

export const MOCK_NOTIFICATIONS: Notification[] = [

  // ── Survey Host (Client) ─────────────────────────────────────────────────
  // Notifications visible to the LP client administering their survey.

  {
    id: "host-01",
    role: "host",
    type: "csv_approved",
    title: "Contacts List CSV Approved Successfully",
    description:
      "Your contacts list for the Q1 2026 DEI Survey has been reviewed and approved by the Lenox Park team. 27 contacts have been imported and are ready for invitation.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-06-11T09:15:00Z",
    metadata: { csvCount: 27 },
  },
  {
    id: "host-02",
    role: "host",
    type: "invitations_sent",
    title: "Invitations Sent Successfully for Q1 2026 DEI Survey",
    description:
      "27 invitation emails have been successfully delivered to your invited organizations. You can monitor responses from your survey dashboard.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-06-11T09:20:00Z",
    metadata: { csvCount: 27 },
  },
  {
    id: "host-03",
    role: "host",
    type: "email_bounce",
    title: "3 Emails Bounced from Invitations",
    description:
      "3 invitation emails could not be delivered. Please review and update the bounced addresses so affected organizations can receive their survey link.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-06-11T09:22:00Z",
    priority: "high",
    metadata: { bouncedCount: 3 },
  },
  {
    id: "host-04",
    role: "host",
    type: "survey_submitted",
    title: "Survey Submitted by Marcus Johnson",
    description:
      "Marcus Johnson at Carlyle Group has completed and submitted their survey. Their submission brings total participation to 14 of 27 organizations.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-06-10T14:30:00Z",
    metadata: {
      managerName: "Marcus Johnson",
      orgName: "Carlyle Group",
      submitted: 14,
      total: 27,
    },
  },
  {
    id: "host-05",
    role: "host",
    type: "weekly_update",
    title: "Weekly Update: Q1 2026 DEI Survey — Week of Jun 2–8",
    description:
      "Your survey received 14 of 27 submissions so far with 10 days left till the end of the survey for the week of Jun 2 to Jun 8.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: true,
    timestamp: "2026-06-08T08:00:00Z",
    metadata: {
      submitted: 14,
      total: 27,
      daysRemaining: 10,
      weekStart: "Jun 2, 2026",
      weekEnd: "Jun 8, 2026",
    },
  },

  // ── Survey Taker (Manager) ────────────────────────────────────────────────
  // Notifications visible to GP organizations completing the survey.

  {
    id: "mgr-01",
    role: "manager",
    type: "survey_started",
    title: "Survey Started on May 15, 2026",
    description:
      "The Q1 2026 DEI Survey is now open. You have been invited to complete your organization's submission. The deadline to respond is June 18, 2026.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: true,
    timestamp: "2026-05-15T08:00:00Z",
    metadata: {
      surveyStartDate: "May 15, 2026",
      deadline: "June 18, 2026",
    },
  },
  {
    id: "mgr-02",
    role: "manager",
    type: "survey_reminder",
    title: "Reminder: Survey Is About to Close",
    description:
      "The Q1 2026 DEI Survey closes in 7 days on June 18, 2026. You haven't completed your survey yet — please complete it before the deadline.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-06-11T08:00:00Z",
    priority: "high",
    metadata: {
      daysRemaining: 7,
      deadline: "June 18, 2026",
    },
  },

  // ── LPS Admin ─────────────────────────────────────────────────────────────
  // Internal notifications for Lenox Park platform administrators.

  {
    id: "adm-01",
    role: "admin",
    type: "csv_review",
    title: "Contacts List CSV Uploaded — Please Review",
    description:
      "Lenox Park Solutions has uploaded their contacts list CSV for the Q1 2026 DEI Survey. Review and approve before invitations can be dispatched to GPs.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-06-11T09:10:00Z",
    priority: "high",
    metadata: {
      clientName: "Lenox Park Solutions",
      csvCount: 27,
    },
  },
  {
    id: "adm-02",
    role: "admin",
    type: "email_bounce",
    title: "3 Emails Bounced for Lenox Park Solutions' Survey",
    description:
      "3 invitation emails bounced and could not be delivered for Lenox Park Solutions' Q1 2026 DEI Survey. Review the affected addresses in the contacts panel.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-06-11T09:22:00Z",
    priority: "high",
    metadata: {
      clientName: "Lenox Park Solutions",
      bouncedCount: 3,
    },
  },
  {
    id: "adm-03",
    role: "admin",
    type: "survey_submitted",
    title: "Blackstone Submitted Their Survey for Lenox Park Solutions",
    description:
      "Jessica Torres at Blackstone Group LP has completed their survey submission for Lenox Park Solutions' Q1 2026 DEI Survey.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-06-10T14:30:00Z",
    metadata: {
      managerName: "Jessica Torres",
      orgName: "Blackstone Group LP",
      clientName: "Lenox Park Solutions",
    },
  },
  {
    id: "adm-04",
    role: "admin",
    type: "survey_reminder",
    title: "Reminder: Lenox Park Solutions' Survey Is About to End",
    description:
      "Lenox Park Solutions' Q1 2026 DEI Survey is about to end on June 18, 2026 — 7 days from today. 13 organizations have yet to respond.",
    surveyName: "Q1 2026 DEI Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-06-11T08:00:00Z",
    priority: "high",
    metadata: {
      clientName: "Lenox Park Solutions",
      daysRemaining: 7,
      deadline: "June 18, 2026",
    },
  },
];

export function getNotifications(): Notification[] {
  return MOCK_NOTIFICATIONS;
}

export function getUnreadCount(): number {
  return MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
}
