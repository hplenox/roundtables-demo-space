"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  ClipboardList,
  Building2,
  Users,
  UserCog,
  ChevronLeft,
  LayoutDashboard,
  HelpCircle,
  HeadphonesIcon,
  Sparkles,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};

const TOP_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "My Surveys", href: "/my-surveys", icon: ClipboardList },
  { label: "My Organization", href: "/organization", icon: Building2 },
  { label: "PODs", href: "/pods", icon: Users },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: "Survey Admin", href: "/surveys", icon: LayoutDashboard },
  { label: "Administrator", href: "/admin", icon: UserCog },
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
  const { label, href, icon: Icon } = item;
  return (
    <li>
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`
          relative flex items-center gap-3 px-2.5 py-2 rounded-lg
          text-[13px] font-medium whitespace-nowrap
          transition-all duration-150
          ${active ? "bg-[#00b8a9]/15 text-[#00b8a9]" : "text-white/65 hover:text-white hover:bg-white/[0.06]"}
        `}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#00b8a9]" />
        )}
        <Icon
          size={16}
          className="shrink-0"
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

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {/* Top items */}
        <ul className="space-y-0.5 px-2">
          {TOP_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavLink key={item.href} item={item} collapsed={collapsed} active={active} />
            );
          })}
        </ul>

        {/* Divider */}
        <div className="mx-3 my-3 border-t border-white/[0.08]" />

        {/* Admin items */}
        <ul className="space-y-0.5 px-2">
          {ADMIN_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavLink key={item.href} item={item} collapsed={collapsed} active={active} />
            );
          })}
        </ul>
      </nav>

      {/* Bottom: Help + What's Coming */}
      <div className="border-t border-white/[0.06] py-3 px-2 space-y-0.5">
        <Link
          href="/help"
          title={collapsed ? "Help Center" : undefined}
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-150 whitespace-nowrap"
        >
          <HelpCircle size={16} className="shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Help Center</span>}
        </Link>
        <Link
          href="/support"
          title={collapsed ? "Contact Support" : undefined}
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-150 whitespace-nowrap"
        >
          <HeadphonesIcon size={16} className="shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Contact Support</span>}
        </Link>

        {/* What's Coming — subtle teaser */}
        {!collapsed && (
          <div className="pt-2 px-1">
            <Link
              href="/roadmap"
              className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-[#00b8a9] transition-colors duration-150 group"
            >
              <Sparkles size={11} className="shrink-0 group-hover:text-[#00b8a9]" />
              <span>What&rsquo;s coming</span>
            </Link>
          </div>
        )}
        {collapsed && (
          <Link
            href="/roadmap"
            title="What's coming"
            className="flex items-center justify-center w-full py-2 text-white/20 hover:text-[#00b8a9] transition-colors duration-150"
          >
            <Sparkles size={13} />
          </Link>
        )}
      </div>
    </aside>
  );
}
