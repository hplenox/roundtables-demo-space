"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { UserPlus, Send } from "lucide-react";
import { usePodCtx } from "../../../../pod-context";
import { CURRENT_USER } from "@/lib/mock-pods";
import PodAvatar from "@/components/pods/PodAvatar";
import type { EventRsvpStatus } from "@/types/pod";

const RSVP_LABEL: Record<EventRsvpStatus, string> = { attending: "Attending", declined: "Declined", maybe: "Maybe", no_response: "RSVP" };

export default function EventInviteesPage() {
  const { eventId } = useParams<{ podId: string; eventId: string }>();
  const { pod, addEventInvitees } = usePodCtx();
  const [inviteInput, setInviteInput] = useState("");

  const event = pod.events.find((e) => e.id === eventId);
  if (!event) return null;

  function handleAddInvitee() {
    const emails = inviteInput.split(",").map((e) => e.trim()).filter(Boolean);
    if (!emails.length) return;
    addEventInvitees(event!.id, emails.map((email) => ({ name: email.split("@")[0], email })));
    setInviteInput("");
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13.5px] font-bold text-slate-800">Invitees <span className="font-normal text-slate-400">{event.invitees.filter((i) => i.status === "attending").length} of {event.invitees.length} attending</span></h2>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <input
          value={inviteInput}
          onChange={(e) => setInviteInput(e.target.value)}
          placeholder="Add invitees by name or email — POD members auto-suggest"
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30"
          onKeyDown={(e) => e.key === "Enter" && handleAddInvitee()}
        />
        <button className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-[12.5px] font-semibold hover:border-slate-300 transition-colors">CSV</button>
        <button onClick={handleAddInvitee} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#4361ee] text-white text-[12.5px] font-semibold hover:bg-[#3650d4] transition-colors">
          <UserPlus size={14} /> Add
        </button>
      </div>
      <div className="space-y-1">
        {event.invitees.map((inv) => (
          <div key={inv.email} className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-lg hover:bg-slate-50/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <PodAvatar name={inv.name} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                  {inv.name}
                  {inv.isHost && <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">Host</span>}
                </p>
                <p className="text-[11.5px] text-slate-400 truncate">{inv.email}</p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <span className={`text-[12px] font-medium ${inv.status === "no_response" ? "text-slate-400" : "text-slate-600"}`}>
                {inv.status === "no_response" ? "No response" : RSVP_LABEL[inv.status]}
              </span>
              {inv.status === "no_response" && inv.email !== CURRENT_USER.email && (
                <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#3650d4] hover:underline">
                  <Send size={11} /> Remind
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
