"use client";

import { useState } from "react";
import { Lock, LifeBuoy, ChevronDown } from "lucide-react";
import type { SupportTicket, TicketStatus, TicketPriority, TicketMessage } from "@/types/support";
import { MOCK_TEMPLATES } from "@/lib/mock-support-data";

const STATUS_STYLES: Record<TicketStatus, string> = {
  "New":               "bg-violet-50 text-violet-700 border border-violet-200",
  "In Review":         "bg-amber-50 text-amber-700 border border-amber-200",
  "Awaiting Response": "bg-blue-50 text-blue-700 border border-blue-200",
  "Resolved":          "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  High:   "bg-red-50 text-red-700 border border-red-200",
  Medium: "bg-amber-50 text-amber-600 border border-amber-200",
  Low:    "bg-slate-100 text-slate-500 border border-slate-200",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function MessageBubble({ message }: { message: TicketMessage }) {
  if (message.isInternalNote) {
    return (
      <div className="flex gap-3">
        <div className="shrink-0 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
          <Lock size={11} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10.5px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Internal Note
            </span>
            <span className="text-[10.5px] text-slate-400">{formatTime(message.timestamp)}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl rounded-tl-sm p-3">
            <p className="text-[12.5px] text-amber-900 leading-relaxed whitespace-pre-wrap">{message.body}</p>
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "admin") {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <div className="shrink-0 w-7 h-7 rounded-full bg-[#00b8a9] flex items-center justify-center text-[10px] font-bold text-white">
          EF
        </div>
        <div className="flex-1 flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10.5px] text-slate-400">{formatTime(message.timestamp)}</span>
            <span className="text-[11px] font-semibold text-slate-600">{message.author}</span>
          </div>
          <div className="bg-[#00b8a9]/[0.08] border border-[#00b8a9]/20 rounded-xl rounded-tr-sm p-3 max-w-[85%]">
            <p className="text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap">{message.body}</p>
          </div>
        </div>
      </div>
    );
  }

  // Requester
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
        {initials(message.author)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold text-slate-700">{message.author}</span>
          <span className="text-[10.5px] text-slate-400">{formatTime(message.timestamp)}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl rounded-tl-sm p-3 max-w-[85%]">
          <p className="text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap">{message.body}</p>
        </div>
      </div>
    </div>
  );
}

interface TicketDetailProps {
  ticket: SupportTicket | null;
  onStatusChange: (id: string, status: TicketStatus) => void;
}

export default function TicketDetail({ ticket, onStatusChange }: TicketDetailProps) {
  const [replyBody, setReplyBody]           = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-slate-200">
        <LifeBuoy size={28} className="text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-500">Select a ticket to view the conversation</p>
        <p className="text-xs text-slate-400 mt-1">Choose from the list on the left</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-slate-100">
        <div className="min-w-0 flex-1 mr-4">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400">{ticket.id}</span>
            <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[ticket.status]}`}>
              {ticket.status}
            </span>
            <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[ticket.priority]}`}>
              {ticket.priority} Priority
            </span>
            <span className="text-[10.5px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {ticket.type}
            </span>
          </div>
          <h2 className="text-[14.5px] font-semibold text-slate-900 leading-snug">{ticket.subject}</h2>
          <p className="text-[11.5px] text-slate-400 mt-0.5">
            {ticket.requesterName} · {ticket.requesterOrg} · {ticket.requesterEmail}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ticket.status !== "Resolved" && (
            <button
              onClick={() => onStatusChange(ticket.id, "Resolved")}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11.5px] font-semibold hover:bg-emerald-100 transition-colors"
            >
              Mark Resolved
            </button>
          )}
          {ticket.status === "Resolved" && (
            <button
              onClick={() => onStatusChange(ticket.id, "In Review")}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11.5px] font-semibold hover:bg-slate-200 transition-colors"
            >
              Reopen
            </button>
          )}
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[11.5px] font-medium hover:bg-slate-50 transition-colors">
            Escalate
          </button>
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {ticket.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Reply box */}
      <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
        {/* Mode toggle + template selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInternalNote(false)}
            className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-md transition-colors
              ${!isInternalNote ? "bg-[#0f1923] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
          >
            Reply
          </button>
          <button
            onClick={() => setIsInternalNote(true)}
            className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-md transition-colors
              ${isInternalNote ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
          >
            Internal Note
          </button>
          <div className="ml-auto relative">
            <select
              className="appearance-none pl-3 pr-7 py-1.5 text-[11.5px] bg-white border border-slate-200 rounded-lg text-slate-600 cursor-pointer focus:outline-none focus:border-[#00b8a9] transition-colors"
              defaultValue=""
              onChange={(e) => {
                const tmpl = MOCK_TEMPLATES.find((t) => t.id === e.target.value);
                if (tmpl) setReplyBody(tmpl.body);
                e.target.value = "";
              }}
            >
              <option value="" disabled>Use a template...</option>
              {MOCK_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <textarea
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          placeholder={isInternalNote ? "Add an internal note (only visible to admins)..." : "Write a reply to the customer..."}
          className={`w-full text-[12.5px] p-3 rounded-lg border resize-none h-24 outline-none transition-colors
            ${isInternalNote
              ? "bg-amber-50 border-amber-200 focus:border-amber-400 placeholder-amber-400"
              : "bg-white border-slate-200 focus:border-[#00b8a9]"
            }`}
        />

        <div className="flex items-center justify-between">
          <p className="text-[10.5px] text-slate-400">
            {isInternalNote ? "Visible to admins only" : "Reply sent as Esteban Fernandez · Lenox Park Solutions"}
          </p>
          <button
            disabled={!replyBody.trim()}
            onClick={() => setReplyBody("")}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-40
              ${isInternalNote
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "bg-[#0f1923] text-white hover:bg-slate-800"
              }`}
          >
            {isInternalNote ? "Add Note" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
