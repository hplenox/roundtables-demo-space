"use client";

import { createContext, useContext, useRef, useState } from "react";
import type { Pod, EventRsvpStatus, PodRole, EventLocationType } from "@/types/pod";
import {
  rsvpToEvent as rsvpToEventMut,
  addEvent as addEventMut,
  addEventInvitees as addEventInviteesMut,
  uploadEventDocument as uploadEventDocumentMut,
  postDiscussion as postDiscussionMut,
  postPoll as postPollMut,
  addReply as addReplyMut,
  toggleLikePost as toggleLikePostMut,
  voteOnPoll as voteOnPollMut,
  createEventFromPoll as createEventFromPollMut,
  addRecord as addRecordMut,
  addRecordNote as addRecordNoteMut,
  withdrawRecord as withdrawRecordMut,
  resendRecord as resendRecordMut,
  inviteMembers as inviteMembersMut,
  revokeInvitation as revokeInvitationMut,
  updateMemberRole as updateMemberRoleMut,
  removeMember as removeMemberMut,
  uploadPodFile as uploadPodFileMut,
  toggleDigest as toggleDigestMut,
  togglePinPod as togglePinPodMut,
  type NewEventInput,
  type NewRecordInput,
  type InviteEntry,
} from "@/lib/mock-pods";

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "info" | "warning";
}

interface PodCtxValue {
  pod: Pod;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  rsvpToEvent: (eventId: string, status: EventRsvpStatus) => void;
  addEvent: (input: NewEventInput) => string | null;
  addEventInvitees: (eventId: string, entries: { name: string; email: string }[]) => void;
  uploadEventDocument: (eventId: string, name: string, visibility: "event" | "pod") => void;
  postDiscussion: (body: string, attachment?: { name: string; sizeLabel: string }) => void;
  postPoll: (body: string, question: string, optionLabels: string[]) => void;
  addReply: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  voteOnPoll: (postId: string, optionId: string) => void;
  createEventFromPoll: (postId: string) => string | null;
  addRecord: (input: NewRecordInput) => void;
  addRecordNote: (recordId: string, body: string) => void;
  withdrawRecord: (recordId: string) => void;
  resendRecord: (recordId: string) => void;
  inviteMembers: (entries: InviteEntry[]) => void;
  revokeInvitation: (invitationId: string) => void;
  remindInvitation: (email: string) => void;
  updateMemberRole: (memberId: string, role: PodRole) => void;
  removeMember: (memberId: string) => void;
  uploadPodFile: (name: string, sizeLabel: string) => void;
  toggleDigest: () => void;
  togglePin: () => void;
}

const PodCtx = createContext<PodCtxValue | null>(null);

export function PodProvider({ initialPod, children }: { initialPod: Pod; children: React.ReactNode }) {
  const [pod, setPod] = useState<Pod>(initialPod);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);

  function pushToast(message: string, tone: Toast["tone"] = "success") {
    const id = toastId.current++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3400);
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const value: PodCtxValue = {
    pod,
    toasts,
    dismissToast,

    rsvpToEvent(eventId, status) {
      const updated = rsvpToEventMut(pod.id, eventId, status);
      if (updated) {
        setPod(updated);
        pushToast(status === "attending" ? "You're marked attending." : status === "declined" ? "You declined this event." : "Marked as maybe.");
      }
    },

    addEvent(input) {
      const result = addEventMut(pod.id, input);
      if (!result) return null;
      setPod(result.pod);
      pushToast(`${input.title} was added to Events.`);
      return result.event.id;
    },

    addEventInvitees(eventId, entries) {
      const updated = addEventInviteesMut(pod.id, eventId, entries);
      if (updated) {
        setPod(updated);
        pushToast(`Invited ${entries.length} ${entries.length === 1 ? "person" : "people"}.`);
      }
    },

    uploadEventDocument(eventId, name, visibility) {
      const updated = uploadEventDocumentMut(pod.id, eventId, name, visibility);
      if (updated) {
        setPod(updated);
        pushToast(`${name} uploaded.`);
      }
    },

    postDiscussion(body, attachment) {
      const updated = postDiscussionMut(pod.id, body, attachment);
      if (updated) setPod(updated);
    },

    postPoll(body, question, optionLabels) {
      const updated = postPollMut(pod.id, body, question, optionLabels);
      if (updated) setPod(updated);
    },

    addReply(postId) {
      const updated = addReplyMut(pod.id, postId);
      if (updated) {
        setPod(updated);
        pushToast("Reply posted.");
      }
    },

    toggleLikePost(postId) {
      const updated = toggleLikePostMut(pod.id, postId);
      if (updated) setPod(updated);
    },

    voteOnPoll(postId, optionId) {
      const updated = voteOnPollMut(pod.id, postId, optionId);
      if (updated) setPod(updated);
    },

    createEventFromPoll(postId) {
      const result = createEventFromPollMut(pod.id, postId);
      if (!result) return null;
      setPod(result.pod);
      pushToast(`${result.event.title} was scheduled from the poll.`);
      return result.event.id;
    },

    addRecord(input) {
      const updated = addRecordMut(pod.id, input);
      if (updated) {
        setPod(updated);
        pushToast(pod.kind === "deal" ? "Deal sent to the sponsor for confirmation." : "Vendor sent to their administrator for confirmation.");
      }
    },

    addRecordNote(recordId, body) {
      const updated = addRecordNoteMut(pod.id, recordId, body);
      if (updated) setPod(updated);
    },

    withdrawRecord(recordId) {
      const updated = withdrawRecordMut(pod.id, recordId);
      if (updated) {
        setPod(updated);
        pushToast("Withdrawn.", "info");
      }
    },

    resendRecord(recordId) {
      const updated = resendRecordMut(pod.id, recordId);
      if (updated) {
        setPod(updated);
        pushToast("Resent for confirmation.");
      }
    },

    inviteMembers(entries) {
      const updated = inviteMembersMut(pod.id, entries);
      if (updated) {
        setPod(updated);
        pushToast(`Sent ${entries.length} invitation${entries.length === 1 ? "" : "s"}.`);
      }
    },

    revokeInvitation(invitationId) {
      const updated = revokeInvitationMut(pod.id, invitationId);
      if (updated) {
        setPod(updated);
        pushToast("Invitation revoked.", "info");
      }
    },

    remindInvitation(email) {
      pushToast(`Reminder sent to ${email}.`);
    },

    updateMemberRole(memberId, role) {
      const updated = updateMemberRoleMut(pod.id, memberId, role);
      if (updated) {
        setPod(updated);
        pushToast("Role updated.");
      }
    },

    removeMember(memberId) {
      const updated = removeMemberMut(pod.id, memberId);
      if (updated) {
        setPod(updated);
        pushToast("Member removed.", "info");
      }
    },

    uploadPodFile(name, sizeLabel) {
      const updated = uploadPodFileMut(pod.id, name, sizeLabel);
      if (updated) {
        setPod(updated);
        pushToast(`${name} uploaded.`);
      }
    },

    toggleDigest() {
      const updated = toggleDigestMut(pod.id);
      if (updated) setPod(updated);
    },

    togglePin() {
      const updated = togglePinPodMut(pod.id);
      if (updated) setPod(updated);
    },
  };

  return (
    <PodCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-[12.5px] ${
              t.tone === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : t.tone === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <p className="flex-1">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="shrink-0 opacity-60 hover:opacity-100">×</button>
          </div>
        ))}
      </div>
    </PodCtx.Provider>
  );
}

export function usePodCtx(): PodCtxValue {
  const ctx = useContext(PodCtx);
  if (!ctx) throw new Error("usePodCtx must be used within a PodProvider");
  return ctx;
}
