"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  ClipboardList,
  Users,
  ArrowLeftRight,
  Building2,
  Briefcase,
  Calendar,
  Globe,
  UserCog,
  ChevronLeft,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Surveys", href: "/surveys", icon: ClipboardList },
  { label: "PODs", href: "/pods", icon: Users },
  { label: "Exchange", href: "/exchange", icon: ArrowLeftRight, muted: true },
  { label: "My Organization", href: "/organization", icon: Building2 },
  { label: "My Portfolio", href: "/portfolio", icon: Briefcase, muted: true },
  { label: "Calendar", href: "/calendar", icon: Calendar, muted: true },
  { label: "Community", href: "/community", icon: Globe, muted: true },
  { label: "Administrator", href: "/admin", icon: UserCog },
];

const BOTTOM_ITEMS = [
  { label: "Help Center", href: "/help", icon: HelpCircle },
  { label: "Contact Support", href: "/support", icon: MessageSquare, accent: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative flex flex-col shrink-0 h-screen
        bg-[#0f1923] border-r border-white/[0.06]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[64px]" : "w-[200px]"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.06]">
        {/* Icon mark */}
        <div className="shrink-0 w-7 h-7 rounded-lg bg-[#00b8a9] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="3" fill="white" />
            <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-[13px] tracking-tight leading-tight whitespace-nowrap">
            ROUNDTABLES DEMO
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-[52px] z-10
          w-6 h-6 rounded-full
          bg-[#0f1923] border border-white/[0.12]
          flex items-center justify-center
          text-white/40 hover:text-white/80
          transition-colors duration-150
        "
      >
        <ChevronLeft
          size={12}
          className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Main nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon, muted, accent }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`
                    relative flex items-center gap-3 px-2.5 py-2 rounded-lg
                    text-[13px] font-medium whitespace-nowrap
                    transition-all duration-150 group
                    ${active
                      ? "bg-[#00b8a9]/15 text-[#00b8a9]"
                      : muted
                        ? "text-white/30 hover:text-white/50 hover:bg-white/[0.04]"
                        : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                    }
                  `}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#00b8a9]" />
                  )}
                  <Icon
                    size={16}
                    className={`shrink-0 ${active ? "text-[#00b8a9]" : ""}`}
                    strokeWidth={active ? 2 : 1.75}
                  />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom items */}
      <div className="border-t border-white/[0.06] py-3 px-2">
        <ul className="space-y-0.5">
          {BOTTOM_ITEMS.map(({ label, href, icon: Icon, accent }) => (
            <li key={href}>
              <Link
                href={href}
                title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-3 px-2.5 py-2 rounded-lg
                  text-[13px] font-medium whitespace-nowrap
                  transition-all duration-150
                  ${accent
                    ? "bg-[#00b8a9] text-white hover:bg-[#00a99b]"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                  }
                `}
              >
                <Icon size={15} className="shrink-0" strokeWidth={1.75} />
                {!collapsed && <span>{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
