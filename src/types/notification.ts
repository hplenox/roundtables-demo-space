export type NotificationRole = "host" | "manager" | "admin";

export type NotificationType =
  | "csv_approved"
  | "invitations_sent"
  | "email_bounce"
  | "survey_submitted"
  | "weekly_update"
  | "survey_started"
  | "survey_reminder"
  | "csv_review"
  | "closed";

export interface Notification {
  id: string;
  role: NotificationRole;
  type: NotificationType;
  title: string;
  description: string;
  surveyName: string;
  surveyId: string;
  read: boolean;
  timestamp: string;
  priority?: "high" | "normal";
  metadata?: {
    orgName?: string;
    managerName?: string;
    clientName?: string;
    csvCount?: number;
    bouncedCount?: number;
    submitted?: number;
    total?: number;
    daysRemaining?: number;
    deadline?: string;
    surveyStartDate?: string;
    weekStart?: string;
    weekEnd?: string;
  };
}
