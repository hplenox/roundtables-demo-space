"use client";

import React from "react";
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
  LayoutDashboard,
  LifeBuoy,
  Bell,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  muted?: boolean;
  accent?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "My Workspace",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "My Surveys", href: "/my-surveys", icon: ClipboardList },
      { label: "My Organization", href: "/organization", icon: Building2 },
      { label: "Portfolio", href: "/portfolio", icon: Briefcase },
      { label: "Calendar", href: "/calendar", icon: Calendar, muted: true },
      { label: "Community", href: "/community", icon: Globe, muted: true },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Survey Admin", href: "/surveys", icon: LayoutDashboard },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Support", href: "/support", icon: LifeBuoy },
      { label: "PODs", href: "/pods", icon: Users },
      { label: "Exchange", href: "/exchange", icon: ArrowLeftRight, muted: true },
      { label: "Administrator", href: "/admin", icon: UserCog },
    ],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Help Center", href: "/help", icon: HelpCircle },
];

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const { label, href, icon: Icon, muted } = item;
  return (
    <li>
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`
          relative flex items-center gap-3 px-2.5 py-2 rounded-lg
          text-[13px] font-medium whitespace-nowrap
          transition-all duration-150
          ${
            active
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
}

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

      {/* Sectioned nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.label} className={si > 0 ? "mt-4" : ""}>
            {/* Section label */}
            {!collapsed && (
              <p className="px-4 mb-1 text-[10px] font-semibold tracking-widest uppercase text-white/25 whitespace-nowrap">
                {section.label}
              </p>
            )}
            {collapsed && si > 0 && (
              <div className="mx-3 mb-2 border-t border-white/[0.08]" />
            )}
            <ul className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <NavLink
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    active={active}
                  />
                );
              })}
            </ul>
          </div>
        ))}
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
                  ${
                    accent
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
