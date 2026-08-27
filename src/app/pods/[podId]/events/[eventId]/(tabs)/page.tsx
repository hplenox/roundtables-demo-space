"use client";

import { useParams } from "next/navigation";
import { usePodCtx } from "../../../pod-context";

export default function EventAboutPage() {
  const { eventId } = useParams<{ podId: string; eventId: string }>();
  const { pod } = usePodCtx();
  const event = pod.events.find((e) => e.id === eventId);
  if (!event) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <h2 className="text-[15px] font-bold text-slate-900 mb-3">About This Event</h2>
      <p className="text-[13px] text-slate-600 leading-relaxed">
        {event.agenda || "No description provided for this event."}
      </p>
    </div>
  );
}
