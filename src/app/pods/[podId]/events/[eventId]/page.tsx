"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Video, MapPin, Phone, CalendarDays, Upload, UserPlus, Download, Send, ChevronDown, Check,
} from "lucide-react";
import { usePodCtx } from "../../pod-context";
import { CURRENT_USER } from "@/lib/mock-pods";
import { RSVP_STYLE } from "@/components/pods/kindStyles";
import PodAvatar from "@/components/pods/PodAvatar";
import type { EventRsvpStatus } from "@/types/pod";

const LOCATION_ICON = { zoom: Video, in_person: MapPin, phone: Phone };
const RSVP_LABEL: Record<EventRsvpStatus, string> = { attending: "Attending", declined: "Declined", maybe: "Maybe", no_response: "RSVP" };

export default function PodEventDetailPage() {
  const { eventId } = useParams<{ podId: string; eventId: string }>();
  const { pod, rsvpToEvent, addEventInvitees, uploadEventDocument } = usePodCtx();
  const [inviteInput, setInviteInput] = useState("");
  const [rsvpMenuOpen, setRsvpMenuOpen] = useState(false);
  const [visibility, setVisibility] = useState<"event" | "pod">("event");

  const event = pod.events.find((e) => e.id === eventId);
  if (!event) return <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-[13px] text-slate-400">Event not found.</div>;

  const LocationIcon = LOCATION_ICON[event.location.type];
  const myStatus = event.invitees.find((i) => i.email === CURRENT_USER.email)?.status ?? "no_response";
  const attendingCount = event.invitees.filter((i) => i.status === "attending").length;

  function handleAddInvitee() {
    const emails = inviteInput.split(",").map((e) => e.trim()).filter(Boolean);
    if (!emails.length) return;
    addEventInvitees(event!.id, emails.map((email) => ({ name: email.split("@")[0], email })));
    setInviteInput("");
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center gap-1.5 text-[11.5px] mb-4">
          <Link href="/pods" className="font-medium text-slate-500 hover:text-slate-700">My Community Pods</Link>
          <span className="text-slate-300">/</span>
          <Link href={`/pods/${pod.id}`} className="font-medium text-slate-500 hover:text-slate-700">{pod.name}</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-semibold truncate max-w-xs">{event.title}</span>
        </div>

        <Link href={`/pods/${pod.id}/events`} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft size={14} /> Back to {pod.name}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
      <div className="min-w-0 space-y-4">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center leading-none">
                <span className="text-[10px] font-bold text-[#3147af]">{event.dateISO.slice(5, 7) === "07" ? "JUL" : event.dateISO.slice(5, 7) === "08" ? "AUG" : event.dateISO.slice(5, 7)}</span>
                <span className="text-[19px] font-bold text-slate-800">{event.dateISO.slice(8, 10)}</span>
              </div>
              <div>
                <h1 className="text-[19px] font-bold text-slate-900">{event.title}</h1>
                <p className="text-[12.5px] text-slate-400 mt-0.5">{attendingCount} of {event.invitees.length} attending</p>
                <div className="flex items-center gap-3 mt-1.5 text-[12px] text-slate-500 flex-wrap">
                  <span>{event.startTime} – {event.endTime} {event.timezone === "Eastern Time" ? "ET" : event.timezone}</span>
                  <span className="flex items-center gap-1"><LocationIcon size={12} /> {event.location.type === "zoom" ? event.location.detail : event.location.detail}</span>
                  <span className="flex items-center gap-1 text-[#3147af] font-medium"><Download size={11} /> iCal</span>
                </div>
                {event.agenda && <p className="text-[12.5px] text-slate-500 mt-2 max-w-md">{event.agenda}</p>}
              </div>
            </div>

            <div className="relative shrink-0">
              <button
                onClick={() => setRsvpMenuOpen((o) => !o)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                  myStatus === "no_response" ? "bg-[#4361ee] text-white hover:bg-[#3d58d9]" : `border ${RSVP_STYLE[myStatus]}`
                }`}
              >
                {myStatus !== "no_response" && <Check size={13} />}
                {RSVP_LABEL[myStatus]}
                <ChevronDown size={13} />
              </button>
              {rsvpMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-10">
                  {(["attending", "maybe", "declined"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => { rsvpToEvent(event.id, s); setRsvpMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-[12.5px] text-slate-600 hover:bg-slate-50"
                    >
                      {RSVP_LABEL[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invitees */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13.5px] font-bold text-slate-800">Invitees <span className="font-normal text-slate-400">{attendingCount} of {event.invitees.length} attending</span></h2>
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
            <button onClick={handleAddInvitee} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#4361ee] text-white text-[12.5px] font-semibold hover:bg-[#3d58d9] transition-colors">
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
                    <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#3147af] hover:underline">
                      <Send size={11} /> Remind
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h2 className="text-[13.5px] font-bold text-slate-800">Documents <span className="font-normal text-slate-400">{event.documents.length}</span></h2>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <button onClick={() => setVisibility("event")} className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors ${visibility === "event" ? "bg-white shadow-sm text-slate-700" : "text-slate-400"}`}>Private to event</button>
              <button onClick={() => setVisibility("pod")} className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors ${visibility === "pod" ? "bg-white shadow-sm text-slate-700" : "text-slate-400"}`}>Shared with POD</button>
            </div>
            <button
              onClick={() => uploadEventDocument(event.id, "New Upload.pdf", visibility)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4361ee] text-white text-[12px] font-semibold hover:bg-[#3d58d9] transition-colors"
            >
              <Upload size={13} /> Upload
            </button>
          </div>
          <p className="text-[11.5px] text-slate-400 mb-3">
            {visibility === "event" ? "New uploads will be visible only to this event's invitees." : "New uploads will also appear in the POD's Files tab for all members."}
          </p>
          <div className="space-y-1">
            {event.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-slate-50/60">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-slate-700 truncate">{doc.name}</p>
                  <p className="text-[11px] text-slate-400">{doc.sizeLabel} · Shared by {doc.uploadedBy} · {doc.uploadedDate}</p>
                </div>
                <span className={`shrink-0 text-[10.5px] font-semibold px-2 py-0.5 rounded-full border ${doc.visibility === "pod" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                  {doc.visibility === "pod" ? "Shared with POD" : "Private to event"}
                </span>
              </div>
            ))}
            {event.documents.length === 0 && <p className="text-[12px] text-slate-400 px-2 py-3">No documents yet.</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-3">
            <h3 className="text-[12.5px] font-bold text-slate-800">Invitation emails</h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">Admin only</span>
          </div>
          <p className="text-[11.5px] text-slate-500 mb-2">Opened <span className="font-semibold text-slate-700">{event.invitees.filter((i) => i.status !== "no_response").length} of {event.invitees.length}</span></p>
          <div className="space-y-1.5">
            {event.invitees.map((inv) => (
              <div key={inv.email} className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
                <CalendarDays size={11} className={inv.status !== "no_response" ? "text-emerald-500" : "text-slate-300"} />
                <span className="truncate">{inv.name} · {inv.status !== "no_response" ? "opened" : "not opened"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-[12.5px] font-bold text-slate-800 mb-3">Host</h3>
          <div className="flex items-center gap-2.5">
            <PodAvatar name={event.createdBy} />
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-slate-800 truncate">{event.createdBy}</p>
              <p className="text-[11px] text-slate-400 truncate">Created {event.createdDateLabel}</p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
