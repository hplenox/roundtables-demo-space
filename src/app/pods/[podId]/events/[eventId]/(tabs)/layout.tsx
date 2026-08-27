"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Video, MapPin, Phone, Download, ChevronDown, Check, CalendarDays } from "lucide-react";
import { usePodCtx } from "../../../pod-context";
import { CURRENT_USER, fmtEventDate } from "@/lib/mock-pods";
import { RSVP_STYLE } from "@/components/pods/kindStyles";
import PodAvatar from "@/components/pods/PodAvatar";
import PodBreadcrumb from "@/components/pods/PodBreadcrumb";
import PodSubTabs from "@/components/pods/PodSubTabs";
import EventBanner from "@/components/pods/EventBanner";
import type { EventRsvpStatus } from "@/types/pod";

const LOCATION_ICON = { zoom: Video, in_person: MapPin, phone: Phone };
const RSVP_LABEL: Record<EventRsvpStatus, string> = { attending: "Attending", declined: "Declined", maybe: "Maybe", no_response: "RSVP" };

export default function EventTabsLayout({ children }: { children: React.ReactNode }) {
  const { podId, eventId } = useParams<{ podId: string; eventId: string }>();
  const pathname = usePathname();
  const { pod, rsvpToEvent } = usePodCtx();
  const [rsvpMenuOpen, setRsvpMenuOpen] = useState(false);

  const event = pod.events.find((e) => e.id === eventId);
  const baseHref = `/pods/${podId}/events/${eventId}`;
  const activeSub = pathname.endsWith("/invitees") ? "invitees" : pathname.endsWith("/documents") ? "documents" : "about";

  if (!event) {
    return (
      <div className="min-h-full bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg border border-dashed border-slate-200 p-10 text-center text-[13px] text-slate-400">Event not found.</div>
        </div>
      </div>
    );
  }

  const LocationIcon = LOCATION_ICON[event.location.type];
  const myStatus = event.invitees.find((i) => i.email === CURRENT_USER.email)?.status ?? "no_response";
  const attendingCount = event.invitees.filter((i) => i.status === "attending").length;
  const { full } = fmtEventDate(event.dateISO);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        <PodBreadcrumb
          items={[
            { label: "My PODs", href: "/pods" },
            { label: pod.name, href: `/pods/${podId}` },
            { label: "Events", href: `/pods/${podId}/events` },
            { label: event.title },
          ]}
        />

        <EventBanner />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900">{event.title}</h1>
            <p className="text-[12.5px] text-slate-400 mt-1">{attendingCount} of {event.invitees.length} attending</p>
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setRsvpMenuOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                myStatus === "no_response" ? "bg-[#4361ee] text-white hover:bg-[#3650d4]" : `border ${RSVP_STYLE[myStatus]}`
              }`}
            >
              {myStatus !== "no_response" && <Check size={13} />}
              {RSVP_LABEL[myStatus]}
              <ChevronDown size={13} />
            </button>
            {rsvpMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-lg border border-slate-200 shadow-lg py-1.5 z-10">
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

        <PodSubTabs
          activeKey={activeSub}
          tabs={[
            { key: "about", label: "About", href: baseHref },
            { key: "invitees", label: "Invitees", href: `${baseHref}/invitees` },
            { key: "documents", label: "Documents", href: `${baseHref}/documents` },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="min-w-0 space-y-4">{children}</div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <h3 className="text-[12.5px] font-bold text-slate-800 mb-3">Event Details</h3>
              <div className="flex items-center gap-2.5 mb-4">
                <PodAvatar name={event.createdBy} />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                    <span className="truncate">{event.createdBy}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10.5px] font-semibold">Host</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Created {event.createdDateLabel}</p>
                </div>
              </div>
              <div className="space-y-3 text-[12.5px] text-slate-600 pt-3 border-t border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">{full}</p>
                  <p className="text-slate-500">{event.startTime} – {event.endTime} {event.timezone === "Eastern Time" ? "ET" : event.timezone}</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <LocationIcon size={13} className="mt-0.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">{event.location.type === "zoom" ? "Virtual" : event.location.type === "phone" ? "Phone" : "In person"}</p>
                    <p className="text-slate-500">{event.location.detail}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[#3650d4] font-semibold">
                  <Download size={12} /> Download iCal
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[12.5px] font-bold text-slate-800">Invitees</h3>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">TOP 3</span>
                <Link href={`${baseHref}/invitees`} className="ml-auto text-[11.5px] font-semibold text-[#3650d4] hover:underline">See all</Link>
              </div>
              <div className="space-y-2.5">
                {event.invitees.slice(0, 3).map((inv) => (
                  <div key={inv.email} className="flex items-center gap-2.5">
                    <PodAvatar name={inv.name} />
                    <p className="text-[12.5px] font-semibold text-slate-800 truncate">{inv.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
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
          </div>
        </div>
      </div>
    </div>
  );
}
