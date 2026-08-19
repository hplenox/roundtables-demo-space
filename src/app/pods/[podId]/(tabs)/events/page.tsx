"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Clock, Video, MapPin, Phone, FileText } from "lucide-react";
import { usePodCtx } from "../../pod-context";
import { CURRENT_USER, isUpcoming, fmtEventDate } from "@/lib/mock-pods";
import { AvatarStack } from "@/components/pods/PodAvatar";
import AddEventModal from "@/components/pods/AddEventModal";

const LOCATION_ICON = { zoom: Video, in_person: MapPin, phone: Phone };

export default function PodEventsPage() {
  const { pod, rsvpToEvent, addEvent, addEventInvitees } = usePodCtx();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [showAdd, setShowAdd] = useState(false);

  const events = pod.events
    .filter((e) => (tab === "upcoming" ? isUpcoming(e.dateISO) : !isUpcoming(e.dateISO)))
    .sort((a, b) => (tab === "upcoming" ? a.dateISO.localeCompare(b.dateISO) : b.dateISO.localeCompare(a.dateISO)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
          <button onClick={() => setTab("upcoming")} className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${tab === "upcoming" ? "bg-[#0f1923] text-white" : "text-slate-500 hover:text-slate-700"}`}>Upcoming</button>
          <button onClick={() => setTab("past")} className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${tab === "past" ? "bg-[#0f1923] text-white" : "text-slate-500 hover:text-slate-700"}`}>Past</button>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00b8a9] text-white text-[12.5px] font-semibold hover:bg-[#00a89a] transition-colors"
        >
          <Plus size={14} /> Add event
        </button>
      </div>

      <div className="space-y-3">
        {events.map((event) => {
          const { month, day } = fmtEventDate(event.dateISO);
          const myStatus = event.invitees.find((i) => i.email === CURRENT_USER.email)?.status ?? "no_response";
          const LocationIcon = LOCATION_ICON[event.location.type];
          return (
            <div key={event.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center leading-none">
                  <span className="text-[9px] font-bold text-[#00897b]">{month}</span>
                  <span className="text-[15px] font-bold text-slate-800">{day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/pods/${pod.id}/events/${event.id}`} className="text-[14.5px] font-bold text-slate-900 hover:text-[#00897b] transition-colors">
                    {event.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-[11.5px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><Clock size={11} /> {fmtEventDate(event.dateISO).full} · {event.startTime} – {event.endTime} ET</span>
                    <span className="flex items-center gap-1"><LocationIcon size={11} /> {event.location.type === "zoom" ? "Zoom" : event.location.type === "phone" ? "Phone" : "In person"}</span>
                    <span className="flex items-center gap-1"><FileText size={11} /> {event.documents.length > 0 ? `${event.documents.length} document${event.documents.length > 1 ? "s" : ""}` : "No documents yet"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <AvatarStack names={event.invitees.map((i) => i.name)} />
                    <span className="text-[11.5px] text-slate-400">{event.invitees.length} invited</span>
                  </div>
                </div>
              </div>
              {tab === "upcoming" && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  {(["attending", "declined", "maybe"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => rsvpToEvent(event.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
                        myStatus === s
                          ? s === "attending" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : s === "declined" ? "bg-rose-50 border-rose-300 text-rose-700" : "bg-amber-50 border-amber-300 text-amber-700"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {s === "attending" ? "Yes" : s === "declined" ? "No" : "Maybe"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <p className="text-[13px] text-slate-400">No {tab} events.</p>
          </div>
        )}
      </div>

      {showAdd && (
        <AddEventModal
          members={pod.members}
          onClose={() => setShowAdd(false)}
          onSubmit={(input, inviteeEmails) => {
            const eventId = addEvent(input);
            if (eventId && inviteeEmails.length) {
              const entries = pod.members.filter((m) => inviteeEmails.includes(m.email)).map((m) => ({ name: m.name, email: m.email }));
              addEventInvitees(eventId, entries);
            }
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
