"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Upload } from "lucide-react";
import { usePodCtx } from "../../../../pod-context";

export default function EventDocumentsPage() {
  const { eventId } = useParams<{ podId: string; eventId: string }>();
  const { pod, uploadEventDocument } = usePodCtx();
  const [visibility, setVisibility] = useState<"event" | "pod">("event");

  const event = pod.events.find((e) => e.id === eventId);
  if (!event) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-[13.5px] font-bold text-slate-800">Documents <span className="font-normal text-slate-400">{event.documents.length}</span></h2>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
          <button onClick={() => setVisibility("event")} className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors ${visibility === "event" ? "bg-white shadow-sm text-slate-700" : "text-slate-400"}`}>Private to event</button>
          <button onClick={() => setVisibility("pod")} className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors ${visibility === "pod" ? "bg-white shadow-sm text-slate-700" : "text-slate-400"}`}>Shared with POD</button>
        </div>
        <button
          onClick={() => uploadEventDocument(event.id, "New Upload.pdf", visibility)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066f3] text-white text-[12px] font-semibold hover:bg-[#0052c2] transition-colors"
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
  );
}
