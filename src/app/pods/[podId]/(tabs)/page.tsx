"use client";

import Link from "next/link";
import { FileText, UserPlus2, CalendarClock, Clock, Video, MapPin, Phone, Moon } from "lucide-react";
import { usePodCtx } from "../pod-context";
import { getEventById, CURRENT_USER, fmtEventDate } from "@/lib/mock-pods";
import { RSVP_STYLE } from "@/components/pods/kindStyles";
import PodAvatar, { AvatarStack } from "@/components/pods/PodAvatar";

const LOCATION_ICON = { zoom: Video, in_person: MapPin, phone: Phone };

export default function PodActivityPage() {
  const { pod, rsvpToEvent } = usePodCtx();

  if (pod.activity.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
        <Moon size={22} className="text-slate-300 mx-auto mb-3" />
        <p className="text-[13.5px] font-semibold text-slate-600">It&rsquo;s quiet in here.</p>
        <p className="text-[12.5px] text-slate-400 mt-1">{pod.isDormant ? `Dormant for ${pod.dormantLabel}.` : "Nothing has happened yet — post an update or schedule an event to get started."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pod.activity.map((item) => {
        if (item.type === "event") {
          const event = getEventById(pod.id, item.eventId);
          if (!event) return null;
          const { month, day } = fmtEventDate(event.dateISO);
          const myStatus = event.invitees.find((i) => i.email === CURRENT_USER.email)?.status ?? "no_response";
          const LocationIcon = LOCATION_ICON[event.location.type];
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10.5px] font-semibold">
                  <CalendarClock size={11} />
                  Upcoming event
                </span>
                <span className="text-[11px] text-slate-400">Created {event.createdDateLabel} by {event.createdBy}</span>
              </div>
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
                    <span className="flex items-center gap-1"><Clock size={11} /> {event.startTime} – {event.endTime} ET</span>
                    <span className="flex items-center gap-1"><LocationIcon size={11} /> {event.location.type === "zoom" ? "Zoom" : event.location.type === "phone" ? "Phone" : "In person"}</span>
                    {event.documents.length > 0 && <span className="flex items-center gap-1"><FileText size={11} /> {event.documents.length} document{event.documents.length > 1 ? "s" : ""}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <AvatarStack names={event.invitees.map((i) => i.name)} />
                    <span className="text-[11.5px] text-slate-400">{event.invitees.filter((i) => i.status === "attending").length} of {event.invitees.length} attending</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {myStatus === "no_response" ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => rsvpToEvent(event.id, "attending")} className="px-2.5 py-1.5 rounded-lg bg-[#00b8a9] text-white text-[11.5px] font-semibold hover:bg-[#00a89a] transition-colors">Yes</button>
                      <button onClick={() => rsvpToEvent(event.id, "declined")} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[11.5px] font-semibold hover:bg-slate-50 transition-colors">No</button>
                      <button onClick={() => rsvpToEvent(event.id, "maybe")} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[11.5px] font-semibold hover:bg-slate-50 transition-colors">Maybe</button>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold border ${RSVP_STYLE[myStatus]}`}>
                      {myStatus === "attending" ? "Attending" : myStatus === "declined" ? "Declined" : "Maybe"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (item.type === "file_share") {
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 shadow-sm flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-slate-700">
                  <span className="font-semibold text-slate-900">{item.sharedBy}</span> shared{" "}
                  <span className="font-semibold text-slate-900">{item.fileName}</span>
                </p>
                {item.eventTitle && <p className="text-[11.5px] text-slate-400 mt-0.5">to {item.eventTitle} · shared with POD</p>}
              </div>
              <span className="shrink-0 text-[11px] text-slate-400">{item.timestamp}</span>
            </div>
          );
        }

        return (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 shadow-sm flex items-start gap-3">
            <div className="shrink-0">
              <PodAvatar name={item.memberName} size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-slate-700 flex items-center gap-1.5">
                <UserPlus2 size={12} className="text-emerald-500" />
                <span>New member joined — <span className="font-semibold text-slate-900">{item.memberName}</span></span>
              </p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">{item.memberEmail} · {item.memberOrg}</p>
            </div>
            <span className="shrink-0 text-[11px] text-slate-400">{item.timestamp}</span>
          </div>
        );
      })}
    </div>
  );
}
