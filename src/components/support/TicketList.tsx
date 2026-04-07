"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { SupportTicket, TicketType, TicketStatus, TicketPriority } from "@/types/support";

const STATUS_STYLES: Record<TicketStatus, string> = {
  "New":               "bg-violet-50 text-violet-700 border border-violet-200",
  "In Review":         "bg-amber-50 text-amber-700 border border-amber-200",
  "Awaiting Response": "bg-blue-50 text-blue-700 border border-blue-200",
  "Resolved":          "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const PRIORITY_DOTS: Record<TicketPriority, string> = {
  High:   "bg-red-500",
  Medium: "bg-amber-400",
  Low:    "bg-slate-300",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_FILTERS: Array<TicketType | "All"> = ["All", "Permissions", "Access", "Survey Help", "Data", "Other"];
const STATUS_FILTERS: Array<TicketStatus | "All"> = ["All", "New", "In Review", "Awaiting Response", "Resolved"];

interface TicketListProps {
  tickets: SupportTicket[];
  selectedId: string | null;
  onSelect: (ticket: SupportTicket) => void;
}

export default function TicketList({ tickets, selectedId, onSelect }: TicketListProps) {
  const [typeFilter, setTypeFilter]     = useState<TicketType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All");
  const [searchQuery, setSearchQuery]   = useState("");

  const filtered = tickets.filter((t) => {
    const matchType   = typeFilter === "All" || t.type === typeFilter;
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      t.subject.toLowerCase().includes(q) ||
      t.requesterName.toLowerCase().includes(q) ||
      t.requesterOrg.toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#00b8a9] transition-colors"
          />
        </div>
      </div>

      {/* Type filters */}
      <div className="px-3 py-2 flex flex-wrap gap-1 border-b border-slate-100">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium transition-colors
              ${typeFilter === f
                ? "bg-[#0f1923] text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="px-3 py-2 flex flex-wrap gap-1 border-b border-slate-100">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium transition-colors
              ${statusFilter === f
                ? "bg-[#0f1923] text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Ticket rows */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[12px] text-slate-400">
            No tickets match your filters.
          </div>
        ) : (
          filtered.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelect(ticket)}
              className={`w-full text-left px-3 py-3 border-b border-slate-50 transition-colors hover:bg-slate-50
                ${selectedId === ticket.id
                  ? "bg-[#00b8a9]/[0.06] border-l-2 border-l-[#00b8a9]"
                  : "border-l-2 border-l-transparent"
                }`}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <div className={`shrink-0 mt-1.5 w-2 h-2 rounded-full ${PRIORITY_DOTS[ticket.priority]}`} />
                <p className="text-[12.5px] font-medium text-slate-800 leading-snug line-clamp-2 flex-1">
                  {ticket.subject}
                </p>
              </div>
              <div className="flex items-center justify-between pl-4">
                <div>
                  <p className="text-[11px] text-slate-500">{ticket.requesterName}</p>
                  <p className="text-[10.5px] text-slate-400">{ticket.requesterOrg}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLES[ticket.status]}`}>
                    {ticket.status}
                  </span>
                  <span className="text-[10px] text-slate-400">{timeAgo(ticket.updatedAt)}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-slate-100 text-[10.5px] text-slate-400 text-center">
        {filtered.length} of {tickets.length} tickets
      </div>
    </div>
  );
}
