"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, DollarSign, Calendar, TrendingUp, Award } from "lucide-react";
import { getOrgById } from "@/lib/mock-data";
import { getBadgesForOrg } from "@/lib/mock-badges";

// Demo: show Blackstone as "My Organization" (GP perspective)
const MY_ORG_ID = "org-blackstone";

const SUB_TABS = [
  { key: "overview",      label: "Overview",      href: "" },
  { key: "org-structure", label: "Org Structure", href: "/org-structure" },
];

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const org = getOrgById(MY_ORG_ID);
  const earnedBadges = getBadgesForOrg(MY_ORG_ID);

  if (!org) return null;

  const activeSub = pathname.includes("/org-structure") ? "org-structure" : "overview";
  const totalBadgesEarned = earnedBadges.length;

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header band */}
      <div className="bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start gap-4">
            {/* Org avatar */}
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#0f1923] flex items-center justify-center shadow-sm">
              <Building2 size={22} className="text-[#00b8a9]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{org.name}</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00b8a9]/10 border border-[#00b8a9]/25 text-[#00897b] text-[11px] font-semibold">
                  {org.type} — {org.assetClass}
                </span>
                {totalBadgesEarned > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                    <Award size={11} />
                    {totalBadgesEarned} Badge{totalBadgesEarned !== 1 ? "s" : ""} Earned
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-slate-500 text-xs">
                  <MapPin size={11} /> {org.headquarters}
                </span>
                <span className="flex items-center gap-1 text-slate-500 text-xs">
                  <DollarSign size={11} /> {org.aum} AUM
                </span>
                <span className="flex items-center gap-1 text-slate-500 text-xs">
                  <Calendar size={11} /> Founded {org.founded}
                </span>
                {org.lpiScore && (
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <TrendingUp size={11} /> LPI Score {org.lpiScore}/10
                  </span>
                )}
              </div>
            </div>

            {/* LPI Score chip */}
            {org.lpiScore && (
              <div className="shrink-0 text-right">
                <div className="inline-flex flex-col items-center px-4 py-2.5 rounded-xl bg-[#0f1923]">
                  <span className="text-[10px] text-white/40 font-semibold tracking-wide uppercase mb-0.5">
                    LPI Score
                  </span>
                  <span className="text-2xl font-bold text-[#00b8a9]">{org.lpiScore}</span>
                  <span className="text-[10px] text-white/30">{org.lpiVersion}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-0 mt-5 border-t border-slate-100">
            {SUB_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`/organization${tab.href}`}
                className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-150 ${
                  activeSub === tab.key
                    ? "border-[#00b8a9] text-[#00897b]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">{children}</div>
    </div>
  );
}
