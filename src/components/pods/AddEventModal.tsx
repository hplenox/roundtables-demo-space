"use client";

import { useState } from "react";
import { X, Video, MapPin, Phone } from "lucide-react";
import type { EventLocationType, PodMember } from "@/types/pod";
import type { NewEventInput } from "@/lib/mock-pods";

const LOCATION_OPTIONS: { type: EventLocationType; icon: typeof Video; label: string }[] = [
  { type: "zoom", icon: Video, label: "Zoom" },
  { type: "in_person", icon: MapPin, label: "In person" },
  { type: "phone", icon: Phone, label: "Phone" },
];

export default function AddEventModal({
  members,
  onClose,
  onSubmit,
}: {
  members: PodMember[];
  onClose: () => void;
  onSubmit: (input: NewEventInput, inviteeEmails: string[]) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-08-12");
  const [start, setStart] = useState("10:00 AM");
  const [end, setEnd] = useState("11:00 AM");
  const [locationType, setLocationType] = useState<EventLocationType>("zoom");
  const [locationDetail, setLocationDetail] = useState("us02web.zoom.us");
  const [agenda, setAgenda] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  function toggleInvitee(email: string) {
    setSelectedEmails((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]));
  }

  function handleCreate() {
    onSubmit(
      { title: title.trim() || "Untitled event", dateISO: date, startTime: start, endTime: end, location: { type: locationType, detail: locationDetail }, agenda: agenda.trim() || undefined },
      selectedEmails
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] px-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add an event</h2>
            <p className="text-[12.5px] text-slate-400 mt-0.5">Step {step} of 2 — {step === 1 ? "when and where" : "invitees"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          <>
            <div className="px-6 pt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Event name</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 vendor review"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30 focus:border-[#0066f3]"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Start</label>
                  <input value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-500 mb-1.5">End</label>
                  <input value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Where</label>
                <div className="flex items-center gap-2">
                  {LOCATION_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = locationType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        onClick={() => setLocationType(opt.type)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-semibold border-2 transition-colors ${
                          active ? "border-[#0066f3] bg-[#0066f3]/5 text-[#0052c2]" : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <Icon size={13} /> {opt.label}
                      </button>
                    );
                  })}
                </div>
                <input
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder={locationType === "zoom" ? "Zoom link" : locationType === "phone" ? "Dial-in number" : "Address"}
                  className="w-full mt-2 px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30 focus:border-[#0066f3]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Agenda or notes — <span className="font-normal text-slate-400">optional</span></label>
                <textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="What will you cover?"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] resize-none focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30 focus:border-[#0066f3]"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-6 py-5 mt-2">
              <p className="text-[11.5px] text-slate-400">Invitees can RSVP from the POD or by email.</p>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="text-[13px] font-medium text-slate-500 hover:text-slate-700 px-3 py-2">Cancel</button>
                <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg bg-[#0066f3] text-white text-[13px] font-semibold hover:bg-[#0052c2] transition-colors">Continue</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pt-5">
              <p className="text-[12px] font-medium text-slate-500 mb-2">Invite POD members</p>
              <div className="max-h-64 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2">
                {members.map((m) => (
                  <label key={m.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={selectedEmails.includes(m.email)} onChange={() => toggleInvitee(m.email)} className="accent-[#0066f3]" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-slate-800 truncate">{m.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">{selectedEmails.length} selected</p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-5 mt-2">
              <button onClick={() => setStep(1)} className="text-[13px] font-medium text-slate-500 hover:text-slate-700 px-3 py-2">Back</button>
              <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#0066f3] text-white text-[13px] font-semibold hover:bg-[#0052c2] transition-colors">Create event</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
