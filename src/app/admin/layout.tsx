"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

const TABS = [
  { key: "overview",     label: "Overview",           href: "/admin" },
  { key: "users",        label: "Users",               href: "/admin/users" },
  { key: "responses",    label: "Response Review",     href: "/admin/responses" },
  { key: "benchmark",    label: "Benchmark",           href: "/admin/benchmark" },
  { key: "badges",       label: "Badge Management",    href: "/admin/badges" },
  { key: "help-center",  label: "Help Center & AI",    href: "/admin/help-center" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const activeTab = (() => {
    if (pathname.startsWith("/admin/users"))       return "users";
    if (pathname.startsWith("/admin/responses"))   return "responses";
    if (pathname.startsWith("/admin/benchmark"))   return "benchmark";
    if (pathname.startsWith("/admin/badges"))      return "badges";
    if (pathname.startsWith("/admin/help-center")) return "help-center";
    return "overview";
  })();

  const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? "Administrator";

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 pt-5 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[13px] mb-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <LayoutGrid size={14} />
            </Link>
            <span className="text-gray-300">/</span>
            <Link href="/admin" className="text-blue-600 font-medium hover:underline">
              RoundTables Administrator
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500">{activeLabel}</span>
          </div>

          {/* Page title */}
          <h1 className="font-serif text-[26px] font-bold text-gray-900 mb-4">{activeLabel}</h1>

          {/* Tabs */}
          <div className="flex items-center gap-6 -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`pb-2.5 text-[13.5px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
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
