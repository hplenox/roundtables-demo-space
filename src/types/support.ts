export type TicketType = "Permissions" | "Access" | "Survey Help" | "Data" | "Other";
export type TicketStatus = "New" | "In Review" | "Awaiting Response" | "Resolved";
export type TicketPriority = "High" | "Medium" | "Low";
export type MessageAuthorRole = "requester" | "admin" | "system";
export type TemplateCategory =
  | "Permissions & Access"
  | "Survey Completion"
  | "Data & Benchmarks"
  | "Status Updates";

export interface TicketMessage {
  id: string;
  author: string;
  role: MessageAuthorRole;
  body: string;
  timestamp: string;       // ISO string
  isInternalNote: boolean; // true = amber bubble, admin-only
}

export interface SupportTicket {
  id: string;              // e.g. "TKT-0001"
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  requesterName: string;
  requesterEmail: string;
  requesterOrg: string;
  requesterOrgType: "GP" | "LP";
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  surveyId: string | null;
  messages: TicketMessage[];
  tags: string[];
}

export interface QuickReplyTemplate {
  id: string;
  category: TemplateCategory;
  title: string;
  preview: string;  // ~1 sentence shown on card
  body: string;     // Full text with {{placeholders}}
}

export interface WalkthroughStep {
  stepNumber: number; // 1–6
  title: string;
  subtitle: string;
  guidanceText: string;
  visualType:
    | "survey-locator"
    | "lpi-explainer"
    | "ownership-form"
    | "leadership-form"
    | "workforce-form"
    | "upload-submit";
}
