"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  Contact,
  ArrowLeftRight,
  Building2,
  Wallet,
  Calendar,
  Share2,
  Shield,
  Handshake,
  Settings,
  MessageSquare,
  ChevronLeft,
  Sparkles,
  ListChecks,
} from "lucide-react";
import { getClientById } from "@/lib/mock-clients";

// Same demo persona the onboarding page and Home dashboard greet by name —
// see src/app/onboarding/page.tsx.
const MY_CLIENT_ID = "client-lenox";

// Computed fresh on every render (not baked into a module-level constant)
// so it reflects onboarding steps the client has submitted this session —
// see submitOnboardingStepAsClient in mock-clients.ts, which writes those
// submissions into the shared store rather than local-only state.
function myPendingOnboardingCount(): number {
  const client = getClientById(MY_CLIENT_ID);
  if (!client) return 0;
  return client.surveys.reduce((sum, cycle) => sum + cycle.onboarding.filter((s) => s.status !== "approved").length, 0);
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  disabled?: boolean;
  badge?: number;
};

const BASE_TOP_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Onboarding", href: "/onboarding", icon: ClipboardList },
  { label: "Surveys", href: "/my-surveys", icon: Layers },
  { label: "PODs", href: "/pods", icon: Contact },
  { label: "Exchange", href: "/roadmap", icon: ArrowLeftRight, disabled: true },
];

const ORG_ITEMS: NavItem[] = [
  { label: "My Organization", href: "/organization", icon: Building2 },
  { label: "My Portfolio", href: "/portfolio", icon: Wallet, disabled: true },
  { label: "Calendar", href: "/roadmap", icon: Calendar, disabled: true },
  { label: "Community", href: "/roadmap", icon: Share2, disabled: true },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: "Client CRM", href: "/client-crm", icon: Handshake },
  { label: "Survey Admin", href: "/surveys", icon: Layers },
  { label: "Administrator", href: "/admin", icon: Shield },
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
  const { label, href, icon: Icon, disabled, badge } = item;

  if (disabled) {
    return (
      <li>
        <span
          title={collapsed ? label : undefined}
          className="
            flex items-center gap-3 px-2.5 py-2 rounded-lg
            text-[13px] font-medium whitespace-nowrap
            text-white/25 cursor-default select-none
          "
        >
          <Icon size={16} className="shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>{label}</span>}
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`
          relative flex items-center gap-3 px-2.5 py-2 rounded-xl
          text-[13px] font-medium whitespace-nowrap
          transition-all duration-150
          ${active ? "bg-[#4361ee] text-white shadow-sm" : "text-white/80 hover:text-white hover:bg-white/[0.07]"}
        `}
      >
        <Icon size={16} className="shrink-0" strokeWidth={active ? 2 : 1.75} />
        {!collapsed && <span className="flex-1">{label}</span>}
        {!!badge && (
          <span
            className={`shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold ${
              collapsed ? "absolute -right-0.5 -top-0.5 w-4 h-4" : "w-5 h-5"
            } ${active ? "bg-white/25 text-white" : "bg-[#4361ee] text-white"}`}
          >
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item: NavItem) =>
    !item.disabled &&
    (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));

  const pendingOnboarding = myPendingOnboardingCount();
  const topItems = BASE_TOP_ITEMS.map((item) =>
    item.label === "Onboarding" ? { ...item, badge: pendingOnboarding } : item
  );

  return (
    <aside
      className={`
        relative flex flex-col shrink-0 h-screen overflow-hidden
        border-r border-white/[0.06]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[64px]" : "w-[228px]"}
      `}
      style={{
        backgroundColor: "#0a0e14",
        backgroundImage: `
          radial-gradient(circle at 15% 100%, rgba(0,184,169,0.28) 0%, transparent 55%),
          radial-gradient(circle at 100% 100%, rgba(67,97,238,0.30) 0%, transparent 55%),
          linear-gradient(180deg, #090c11 0%, #0a0e14 45%, #0c121a 100%)
        `,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="shrink-0">
          <path d="M13 2C13 7.5 9 11 4 11C4 5.5 8 2 13 2Z" fill="#2dd4bf" />
          <path d="M24 13C18.5 13 15 9 15 4C20.5 4 24 8 24 13Z" fill="#3b82f6" />
          <path d="M13 24C13 18.5 17 15 22 15C22 20.5 18 24 13 24Z" fill="#818cf8" />
          <path d="M2 13C7.5 13 11 17 11 22C5.5 22 2 18 2 13Z" fill="#22d3ee" />
          <circle cx="13" cy="13" r="3" fill="#0a0e14" />
        </svg>
        {!collapsed && (
          <span className="text-white font-semibold text-[15px] tracking-[0.15em] whitespace-nowrap">
            ROUNDTABLES
          </span>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto shrink-0 text-white/40 hover:text-white/80 transition-colors duration-150"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute -right-3 top-[26px] z-10 w-6 h-6 rounded-full bg-[#0a0e14] border border-white/[0.12] flex items-center justify-center text-white/40 hover:text-white/80 transition-colors duration-150"
        >
          <ChevronLeft size={12} className="rotate-180" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {topItems.map((item) => (
            <NavLink key={item.label} item={item} collapsed={collapsed} active={isActive(item)} />
          ))}
        </ul>

        <div className="mx-3 my-3 border-t border-white/[0.08]" />

        <ul className="space-y-0.5 px-2">
          {ORG_ITEMS.map((item) => (
            <NavLink key={item.label} item={item} collapsed={collapsed} active={isActive(item)} />
          ))}
        </ul>

        <div className="mx-3 my-3 border-t border-white/[0.08]" />

        <ul className="space-y-0.5 px-2">
          {ADMIN_ITEMS.map((item) => (
            <NavLink key={item.label} item={item} collapsed={collapsed} active={isActive(item)} />
          ))}
          <li>
            <Link
              href="/roadmap"
              title={collapsed ? "What's Coming" : undefined}
              className={`
                relative flex items-center gap-3 px-2.5 py-2 rounded-xl
                text-[13px] font-medium whitespace-nowrap transition-all duration-150
                ${pathname === "/roadmap" ? "bg-[#4361ee] text-white shadow-sm" : "text-white/40 hover:text-white/80 hover:bg-white/[0.07]"}
              `}
            >
              <Sparkles size={15} className="shrink-0" strokeWidth={1.75} />
              {!collapsed && <span>What&rsquo;s Coming</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom: Help + Support */}
      <div className="px-2.5 pb-4 pt-3 space-y-2">
        <Link
          href="/requirements"
          title={collapsed ? "Requirements" : undefined}
          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-150 ${
            pathname.startsWith("/requirements") ? "bg-[#4361ee] text-white shadow-sm" : "text-white/70 hover:text-white hover:bg-white/[0.07]"
          }`}
        >
          <ListChecks size={16} className="shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Requirements</span>}
        </Link>
        <Link
          href="/help"
          title={collapsed ? "Help Center" : undefined}
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/[0.07] transition-all duration-150 whitespace-nowrap"
        >
          <Settings size={16} className="shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Help Center</span>}
        </Link>
        <Link
          href="/support"
          title={collapsed ? "Contact Support" : undefined}
          className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#3fae4a] hover:bg-[#379a41] text-white text-[13px] font-semibold transition-colors duration-150 whitespace-nowrap"
        >
          <MessageSquare size={16} className="shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Contact Support</span>}
        </Link>
      </div>
    </aside>
  );
}
