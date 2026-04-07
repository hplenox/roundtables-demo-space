export type NotificationType =
  | "submission"
  | "reminder"
  | "forward"
  | "progress"
  | "closed"
  | "incomplete"
  | "inactive";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  surveyName: string;
  surveyId: string;
  read: boolean;
  timestamp: string; // ISO date string
  priority?: "high" | "normal";
  metadata?: {
    orgName?: string;
    managerName?: string;
    fromManager?: string;
    toManager?: string;
    toOrg?: string;
    daysRemaining?: number;
    submitted?: number;
    total?: number;
    percentage?: number;
    transparencyScore?: number;
    inactiveCount?: number;
    orgCount?: number;
    daysSinceLaunch?: number;
  };
}
