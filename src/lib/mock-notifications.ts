import type { Notification } from "@/types/notification";

// Today = 2026-04-07
export const MOCK_NOTIFICATIONS: Notification[] = [
  // --- TODAY ---
  {
    id: "notif-01",
    type: "incomplete",
    title: "Low transparency score detected",
    description:
      "Bridgewater Associates submitted the survey but received a transparency score of 42/100 — below the 60-point threshold. Consider reaching out for clarification.",
    surveyName: "Q1 2026 ESG Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-04-07T09:42:00Z",
    priority: "high",
    metadata: {
      orgName: "Bridgewater Associates",
      transparencyScore: 42,
    },
  },
  {
    id: "notif-02",
    type: "reminder",
    title: "Survey closes in 24 hours",
    description:
      "8 organizations still haven't responded. The survey closes tomorrow at 11:59 PM ET. Send a final nudge to maximize participation.",
    surveyName: "Q1 2026 ESG Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-04-07T08:00:00Z",
    priority: "high",
    metadata: {
      daysRemaining: 1,
    },
  },
  {
    id: "notif-03",
    type: "inactive",
    title: "14 participants haven't started — 32 days since launch",
    description:
      "14 participants across 6 organizations have not opened the survey since it launched on March 6. Early outreach typically recovers 40% of stalled respondents.",
    surveyName: "Q1 2026 ESG Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-04-07T07:00:00Z",
    priority: "high",
    metadata: {
      inactiveCount: 14,
      orgCount: 6,
      daysSinceLaunch: 32,
    },
  },
  {
    id: "notif-04",
    type: "progress",
    title: "Daily progress digest — Day 32",
    description:
      "18 of 27 organizations have submitted (67%). 5 are in progress and 4 haven't started. You're on track to close with at least 70% participation.",
    surveyName: "Q1 2026 ESG Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-04-07T06:00:00Z",
    metadata: {
      submitted: 18,
      total: 27,
      percentage: 67,
    },
  },
  // --- YESTERDAY ---
  {
    id: "notif-05",
    type: "submission",
    title: "Michael Chen submitted on behalf of KKR & Co.",
    description:
      "KKR & Co. completed the survey with a transparency score of 88/100. Their submission brings total participation to 18 of 27 organizations.",
    surveyName: "Q1 2026 ESG Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-04-06T14:23:00Z",
    metadata: {
      orgName: "KKR & Co.",
      managerName: "Michael Chen",
      transparencyScore: 88,
    },
  },
  {
    id: "notif-06",
    type: "progress",
    title: "Daily progress digest — Day 31",
    description:
      "15 of 27 organizations have submitted (56%). Up from 12 yesterday — strong momentum heading into the final stretch.",
    surveyName: "Q1 2026 ESG Survey",
    surveyId: "survey-001",
    read: true,
    timestamp: "2026-04-06T06:00:00Z",
    metadata: {
      submitted: 15,
      total: 27,
      percentage: 56,
    },
  },
  // --- 2 DAYS AGO ---
  {
    id: "notif-07",
    type: "forward",
    title: "Survey forwarded to a new respondent",
    description:
      "Sarah Williams at Apollo Global Management forwarded the survey to David Park, their new Head of ESG. David has been added as a co-respondent.",
    surveyName: "Q1 2026 ESG Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-04-05T11:15:00Z",
    metadata: {
      fromManager: "Sarah Williams",
      toManager: "David Park",
      toOrg: "Apollo Global Management",
    },
  },
  // --- 4 DAYS AGO ---
  {
    id: "notif-08",
    type: "reminder",
    title: "Survey closes in 3 days",
    description:
      "11 organizations haven't submitted yet. Automated reminders have been sent; manual outreach is recommended for high-priority accounts.",
    surveyName: "Q1 2026 ESG Survey",
    surveyId: "survey-001",
    read: false,
    timestamp: "2026-04-03T08:00:00Z",
    metadata: {
      daysRemaining: 3,
    },
  },
  // --- 1 WEEK AGO ---
  {
    id: "notif-09",
    type: "reminder",
    title: "Survey closes in 7 days",
    description:
      "15 organizations have yet to respond. The survey closes on April 8. Outreach at this stage significantly improves final participation rates.",
    surveyName: "Q1 2026 ESG Survey",
    surveyId: "survey-001",
    read: true,
    timestamp: "2026-03-31T08:00:00Z",
    metadata: {
      daysRemaining: 7,
    },
  },
  {
    id: "notif-10",
    type: "submission",
    title: "Jessica Torres submitted on behalf of Blackstone",
    description:
      "Blackstone Group LP completed the Annual DE&I Assessment with a transparency score of 94/100 — among the highest recorded this cycle.",
    surveyName: "Annual DE&I Assessment 2025",
    surveyId: "survey-002",
    read: true,
    timestamp: "2026-03-29T16:40:00Z",
    metadata: {
      orgName: "Blackstone Group LP",
      managerName: "Jessica Torres",
      transparencyScore: 94,
    },
  },
  {
    id: "notif-11",
    type: "closed",
    title: "Annual DE&I Assessment 2025 has closed",
    description:
      "The survey officially closed with 23 of 25 organizations submitting (92% participation). A full summary report is available for download.",
    surveyName: "Annual DE&I Assessment 2025",
    surveyId: "survey-002",
    read: true,
    timestamp: "2026-03-28T23:59:00Z",
  },
];

export function getNotifications(): Notification[] {
  return MOCK_NOTIFICATIONS;
}

export function getUnreadCount(): number {
  return MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
}
