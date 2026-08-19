"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserCog, Award, LayoutDashboard, ChevronRight } from "lucide-react";

const TABS = [
  { key: "overview",     label: "Overview",           href: "/admin" },
  { key: "benchmark",    label: "Benchmark",           href: "/admin/benchmark" },
  { key: "badges",       label: "Badge Management",    href: "/admin/badges" },
  { key: "help-center",  label: "Help Center & AI",    href: "/admin/help-center" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const activeTab = (() => {
    if (pathname.startsWith("/admin/benchmark"))   return "benchmark";
    if (pathname.startsWith("/admin/badges"))      return "badges";
    if (pathname.startsWith("/admin/help-center")) return "help-center";
    return "overview";
  })();

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="h-[3px] bg-gradient-to-r from-[#4361ee] via-[#4361ee]/70 to-transparent" />

        <div className="max-w-6xl mx-auto px-6 pt-5 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11.5px] mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0f1923] text-[#4361ee] hover:bg-[#1a2d3d] transition-colors font-semibold text-[10.5px] tracking-wide"
            >
              <LayoutDashboard size={10} strokeWidth={2} />
              Home
            </Link>
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
            <span className="text-slate-700 font-medium">Administrator</span>
          </div>

          {/* Header row */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#0f1923] flex items-center justify-center shadow-sm">
                <UserCog size={16} className="text-[#4361ee]" />
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-slate-900 leading-tight">Administrator</h1>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Lenox Park Solutions, Inc. · Platform configuration and badge management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4361ee]/8 border border-[#4361ee]/25 text-[#3147af]">
              <Award size={13} strokeWidth={2} />
              <span className="text-[11.5px] font-semibold">Admin Access</span>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-end gap-0 -mb-px">
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`
                  px-5 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-150
                  ${activeTab === tab.key
                    ? "border-[#4361ee] text-[#3147af]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }
                `}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}
