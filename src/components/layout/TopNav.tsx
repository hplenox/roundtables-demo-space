"use client";

import { useState } from "react";
import { Bell, MessageSquare, ChevronDown, Search, Check } from "lucide-react";

const USER = {
  name: "Heran Patel",
  role: "Administrator",
  initials: "HP",
  org: "Lenox Park Solutions",
};

const NOTIFICATIONS = [
  { id: 1, text: "Survey response submitted by Blackstone GP", time: "2m ago", unread: true },
  { id: 2, text: "New POD member joined your roundtable", time: "1h ago", unread: true },
  { id: 3, text: "Weekly report is ready for download", time: "3h ago", unread: false },
];

export default function TopNav() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 bg-white border-b border-slate-200/80 z-20">
      {/* Left: Search */}
      <div className="flex items-center gap-2 w-72">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search surveys, organizations..."
            className="
              w-full h-8 pl-8 pr-3 rounded-lg
              bg-slate-100 border border-transparent
              text-[13px] text-slate-700 placeholder:text-slate-400
              focus:outline-none focus:bg-white focus:border-slate-300
              transition-all duration-150
            "
          />
        </div>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-1">
        {/* Chat icon */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <MessageSquare size={16} strokeWidth={1.75} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Bell size={16} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00b8a9] ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-10 z-20 w-80 rounded-xl bg-white shadow-xl border border-slate-200/80 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="text-[13px] font-semibold text-slate-800">Notifications</span>
                  <button className="text-[11px] text-[#00b8a9] font-medium hover:underline flex items-center gap-1">
                    <Check size={11} /> Mark all read
                  </button>
                </div>
                <ul>
                  {NOTIFICATIONS.map((n) => (
                    <li
                      key={n.id}
                      className={`px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${n.unread ? "bg-[#00b8a9]/[0.04]" : ""}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.unread && (
                          <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#00b8a9]" />
                        )}
                        <div className={n.unread ? "" : "pl-4"}>
                          <p className="text-[12.5px] text-slate-700 leading-snug">{n.text}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-2.5 border-t border-slate-100">
                  <button className="text-[12px] text-[#00b8a9] font-medium hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-[#0f1923] flex items-center justify-center shrink-0">
              <span className="text-[10.5px] font-semibold text-[#00b8a9] tracking-wide">
                {USER.initials}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[12.5px] font-semibold text-slate-800 leading-tight">{USER.name}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{USER.role}</p>
            </div>
            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`}
            />
          </button>

          {userOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-56 rounded-xl bg-white shadow-xl border border-slate-200/80 overflow-hidden">
                {/* User identity */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[12.5px] font-semibold text-slate-800">{USER.name}</p>
                  <p className="text-[11px] text-slate-400">{USER.org}</p>
                </div>
                {/* Menu items */}
                {[
                  { label: "Profile settings", href: "/profile" },
                  { label: "Organization settings", href: "/org-settings" },
                  { label: "Billing & plan", href: "/billing" },
                  { label: "Keyboard shortcuts", href: "#" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-2.5 text-[12.5px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="border-t border-slate-100">
                  <button className="w-full text-left px-4 py-2.5 text-[12.5px] text-red-500 hover:bg-red-50 transition-colors">
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
