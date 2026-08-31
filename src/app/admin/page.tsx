import Link from "next/link";
import {
  Award, ArrowRight, Building2, Users, TrendingUp,
  ShieldCheck, BarChart3, CheckCircle2, LayoutDashboard, Users2,
} from "lucide-react";
import { BADGE_TYPES, ORG_BADGES, getAllBadgeAwardees } from "@/lib/mock-badges";
import { MOCK_ORGS, MOCK_SURVEYS } from "@/lib/mock-data";
import { PLATFORM_USERS } from "@/lib/mock-org-associations";
import { MiniBadgeIcon } from "@/components/BadgeCard";

export default function AdminPage() {
  const awardees = getAllBadgeAwardees();
  const uniqueOrgsWithBadges = [...new Set(ORG_BADGES.map((ob) => ob.orgId))].length;
  const totalOrgs = MOCK_ORGS.length;
  const activeSurveys = MOCK_SURVEYS.filter((s) => s.status === "active").length;
  const multiOrgUsers = PLATFORM_USERS.filter((u) => u.organizationIds.length > 1).length;

  // Badge type breakdown
  const categoryCount = BADGE_TYPES.reduce<Record<string, number>>((acc, bt) => {
    acc[bt.category] = (acc[bt.category] || 0) + ORG_BADGES.filter((ob) => ob.badgeId === bt.id).length;
    return acc;
  }, {});

  const categoryColors: Record<string, string> = {
    "Gender Diversity": "#818cf8",
    "Racial Diversity": "#34d399",
    "Improvement":      "#fb923c",
    "Excellence":       "#fbbf24",
  };

  const categoryBgs: Record<string, string> = {
    "Gender Diversity": "rgba(99,102,241,0.12)",
    "Racial Diversity": "rgba(16,185,129,0.12)",
    "Improvement":      "rgba(249,115,22,0.12)",
    "Excellence":       "rgba(217,119,6,0.12)",
  };

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: Award,
            label: "Total Badges Awarded",
            value: ORG_BADGES.length,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            icon: Building2,
            label: "Orgs Recognized",
            value: uniqueOrgsWithBadges,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            icon: Users,
            label: "Total Organizations",
            value: totalOrgs,
            color: "text-[#00897b]",
            bg: "bg-[#00b8a9]/10",
          },
          {
            icon: TrendingUp,
            label: "Active Surveys",
            value: activeSurveys,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Two-col layout */}
      <div className="grid grid-cols-3 gap-5">

        {/* Badge category breakdown */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Badge Categories</h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribution of badges by category</p>
            </div>
            <Link
              href="/admin/badges"
              className="flex items-center gap-1 text-[#00b8a9] text-xs font-semibold hover:underline"
            >
              Manage <ArrowRight size={11} />
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {(["Gender Diversity", "Racial Diversity", "Improvement", "Excellence"] as const).map((cat) => {
              const count = categoryCount[cat] || 0;
              const total = ORG_BADGES.length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const color = categoryColors[cat];
              const typesInCat = BADGE_TYPES.filter((bt) => bt.category === cat);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex gap-1">
                        {typesInCat.map((bt) => (
                          <MiniBadgeIcon key={bt.id} badge={bt} size={20} />
                        ))}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{cat}</span>
                    </div>
                    <span className="text-xs text-slate-500">{count} awarded</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-[#00b8a9]/5 border border-slate-100 hover:border-[#00b8a9]/30 transition-colors group"
              >
                <Users2 size={14} className="text-[#00897b]" />
                <span className="text-[12px] font-medium text-slate-700 group-hover:text-[#00897b]">
                  Users {multiOrgUsers > 0 && <span className="text-slate-400">· {multiOrgUsers} multi-org</span>}
                </span>
                <ArrowRight size={11} className="ml-auto text-slate-300 group-hover:text-[#00b8a9]" />
              </Link>
              <Link
                href="/"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-[#00b8a9]/5 border border-slate-100 hover:border-[#00b8a9]/30 transition-colors group"
              >
                <LayoutDashboard size={14} className="text-slate-500" />
                <span className="text-[12px] font-medium text-slate-700 group-hover:text-[#00897b]">
                  Dashboard
                </span>
                <ArrowRight size={11} className="ml-auto text-slate-300 group-hover:text-[#00b8a9]" />
              </Link>
              <Link
                href="/surveys"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-[#00b8a9]/5 border border-slate-100 hover:border-[#00b8a9]/30 transition-colors group"
              >
                <BarChart3 size={14} className="text-[#00b8a9]" />
                <span className="text-[12px] font-medium text-slate-700 group-hover:text-[#00897b]">
                  Survey Admin
                </span>
                <ArrowRight size={11} className="ml-auto text-slate-300 group-hover:text-[#00b8a9]" />
              </Link>
              <Link
                href="/organization"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-[#00b8a9]/5 border border-slate-100 hover:border-[#00b8a9]/30 transition-colors group"
              >
                <Building2 size={14} className="text-violet-500" />
                <span className="text-[12px] font-medium text-slate-700 group-hover:text-[#00897b]">
                  My Organization
                </span>
                <ArrowRight size={11} className="ml-auto text-slate-300 group-hover:text-[#00b8a9]" />
              </Link>
            </div>
          </div>

          {/* Permission notice */}
          <div className="rounded-xl bg-[#0f1923] p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={13} className="text-[#00b8a9]" />
              <p className="text-[11px] font-bold text-[#00b8a9] tracking-wide uppercase">Admin Access</p>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              You have full administrator privileges for Lenox Park Solutions. Badge assignments are recorded against the active survey cohort.
            </p>
          </div>
        </div>
      </div>

      {/* Recent badge awards */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent Badge Awards</h2>
            <p className="text-xs text-slate-400 mt-0.5">All badge assignments for the 2025 cohort</p>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {awardees.slice(0, 2).map((award, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
              <MiniBadgeIcon badge={award.badge} size={34} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{award.badge.name}</p>
                <p className="text-xs text-slate-400">{award.badge.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-slate-700">{award.orgName}</p>
                <p className="text-[11px] text-slate-400">{award.awardedDate}</p>
              </div>
              <span
                className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: award.badge.categoryBg,
                  color: award.badge.categoryText,
                  border: `1px solid ${award.badge.categoryBorder}`,
                }}
              >
                {award.badge.category}
              </span>
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
