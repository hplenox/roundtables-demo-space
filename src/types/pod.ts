export type PodKind = "community" | "vendor" | "deal";
export type PodRole = "admin" | "member" | "viewer";
export type PodJoinPolicy = "invite_only" | "request" | "open";

export interface PodMember {
  id: string;
  name: string;
  email: string;
  org: string;
  role: PodRole;
  lastActive: string;
}

export interface PodInvitation {
  id: string;
  email: string;
  role: PodRole;
  invitedBy: string;
  invitedDate: string;
  opened: boolean;
}

export type EventRsvpStatus = "attending" | "declined" | "maybe" | "no_response";

export interface PodEventInvitee {
  name: string;
  email: string;
  status: EventRsvpStatus;
  isHost?: boolean;
}

export interface PodEventDocument {
  id: string;
  name: string;
  sizeLabel: string;
  uploadedBy: string;
  uploadedDate: string;
  visibility: "event" | "pod";
}

export type EventLocationType = "zoom" | "in_person" | "phone";

export interface PodEvent {
  id: string;
  podId: string;
  title: string;
  dateISO: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: { type: EventLocationType; detail: string };
  agenda?: string;
  createdBy: string;
  createdDateLabel: string;
  invitees: PodEventInvitee[];
  documents: PodEventDocument[];
}

export interface PodRecordNote {
  id: string;
  author: string;
  authorTag?: string;
  dateLabel: string;
  body: string;
}

export type PodRecordConfirmation = "confirmed" | "sent" | "reviewing";

export interface PodRecord {
  id: string;
  podId: string;
  name: string;
  category: string;
  website?: string;
  addedByLabel: string;
  addedDateLabel: string;
  status: "listed" | "awaiting";
  confirmation: PodRecordConfirmation;
  confirmedDateLabel?: string;
  contactName?: string;
  contactEmail?: string;
  signal: { initials: string[]; text: string };
  aiSummary?: string;
  notes: PodRecordNote[];
}

export interface PodPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface PodPoll {
  question: string;
  options: PodPollOption[];
  votedCount: number;
  totalVoters: number;
  myVoteOptionId?: string;
  createdEventId?: string;
}

export interface PodDiscussionAttachment {
  name: string;
  sizeLabel: string;
  alsoInFiles?: boolean;
}

export interface PodDiscussionPost {
  id: string;
  podId: string;
  author: string;
  authorOrg: string;
  authorRole?: string;
  dateLabel: string;
  body: string;
  pinned?: boolean;
  isNew?: boolean;
  eventThreadTitle?: string;
  eventId?: string;
  attachment?: PodDiscussionAttachment;
  poll?: PodPoll;
  likes: number;
  liked?: boolean;
  replies: number;
}

export type PodFileSource = "event" | "discussion" | "pod";

export interface PodFile {
  id: string;
  podId: string;
  name: string;
  sizeLabel: string;
  uploadedBy: string;
  uploadedDateLabel: string;
  source: PodFileSource;
}

export type PodActivityItem =
  | { id: string; type: "event"; timestamp: string; eventId: string }
  | { id: string; type: "file_share"; timestamp: string; sharedBy: string; fileName: string; eventTitle?: string }
  | { id: string; type: "member_joined"; timestamp: string; memberName: string; memberEmail: string; memberOrg: string };

export interface Pod {
  id: string;
  name: string;
  kind: PodKind;
  category: string;
  description: string;
  hostedBy: string;
  administeredBy?: string;
  administeredByOrg?: string;
  createdBy?: string;
  createdByRole?: string;
  joinPolicy: PodJoinPolicy;
  members: PodMember[];
  pendingInvitations: PodInvitation[];
  events: PodEvent[];
  discussion: PodDiscussionPost[];
  records: PodRecord[];
  files: PodFile[];
  activity: PodActivityItem[];
  digestEnabled: boolean;
  isDormant?: boolean;
  dormantLabel?: string;
  lastActivityLabel: string;
  activityTrend: number[];
  weeklyInsight: string;
  pinned?: boolean;
}
