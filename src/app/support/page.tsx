"use client";

import { useState } from "react";
import { Inbox, BookOpen, FileText, LifeBuoy } from "lucide-react";
import type { SupportTicket, TicketStatus } from "@/types/support";
import { MOCK_TICKETS } from "@/lib/mock-support-data";
import TicketList from "@/components/support/TicketList";
import TicketDetail from "@/components/support/TicketDetail";
import WalkthroughGuide from "@/components/support/WalkthroughGuide";
import TemplatesPanel from "@/components/support/TemplatesPanel";

type Tab = "inbox" | "walkthrough" | "templates";

const TAB_CONFIG: Array<{ key: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { key: "inbox",       label: "Inbox",      icon: Inbox },
  { key: "walkthrough", label: "Walkthrough", icon: BookOpen },
  { key: "templates",   label: "Templates",  icon: FileText },
];

export default function SupportPage() {
  const [activeTab, setActiveTab]   = useState<Tab>("inbox");
  const [tickets, setTickets]       = useState<SupportTicket[]>(MOCK_TICKETS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_TICKETS[0]?.id ?? null);

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null;

  function handleStatusChange(id: string, newStatus: TicketStatus) {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
    );
  }

  const newCount            = tickets.filter((t) => t.status === "New").length;
  const awaitingCount       = tickets.filter((t) => t.status === "Awaiting Response").length;
  const resolvedCount       = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <div className="min-h-full bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-6 pt-7 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center">
                <LifeBuoy size={17} className="text-[#00b8a9]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Admin</p>
                <h1 className="text-[20px] font-bold text-slate-900 leading-tight">Support Hub</h1>
              </div>
            </div>
            {/* Stat pills */}
            <div className="flex items-center gap-2 pt-1">
              <span className="flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                {newCount} New
              </span>
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {awaitingCount} Awaiting Response
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {resolvedCount} Resolved
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all
                  ${activeTab === key
                    ? "border-[#00b8a9] text-[#00897b]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                <Icon size={14} />
                {label}
                {key === "inbox" && (
                  <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-full
                    ${activeTab === key ? "bg-[#00b8a9]/15 text-[#00897b]" : "bg-slate-100 text-slate-400"}`}>
                    {tickets.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-[1280px] mx-auto px-6 py-5">
        {activeTab === "inbox" && (
          <div className="grid grid-cols-[320px_1fr] gap-4" style={{ height: "calc(100vh - 192px)" }}>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
              <TicketList
                tickets={tickets}
                selectedId={selectedId}
                onSelect={(t) => setSelectedId(t.id)}
              />
            </div>
            <TicketDetail
              ticket={selectedTicket}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {activeTab === "walkthrough" && <WalkthroughGuide />}
        {activeTab === "templates"   && <TemplatesPanel />}
      </div>
    </div>
  );
}
