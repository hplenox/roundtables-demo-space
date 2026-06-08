import { Building2, MapPin, DollarSign, Calendar, TrendingUp, Award } from "lucide-react";
import { getOrgById } from "@/lib/mock-data";
import { getBadgesForOrg, BADGE_TYPES } from "@/lib/mock-badges";
import { MiniBadgeIcon } from "@/components/BadgeCard";

// Demo: show Blackstone as "My Organization" (GP perspective)
const MY_ORG_ID = "org-blackstone";

export default function MyOrganizationPage() {
  const org = getOrgById(MY_ORG_ID);
  const earnedBadges = getBadgesForOrg(MY_ORG_ID);

  if (!org) return null;

  const totalBadgesAvailable = BADGE_TYPES.length;
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
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* Recognition badges — condensed */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award size={14} className="text-amber-500" />
              Recognition Badges
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              {totalBadgesEarned} of {totalBadgesAvailable} earned
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            {BADGE_TYPES.map((badge) => {
              const earned = earnedBadges.find((b) => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-1.5 transition-all ${
                    earned ? "opacity-100" : "opacity-25 grayscale"
                  }`}
                >
                  <MiniBadgeIcon badge={badge} size={42} />
                  <p className="text-[10px] font-semibold text-slate-700 text-center max-w-[68px] leading-tight">
                    {badge.name}
                  </p>
                  <span className="text-[9px] text-slate-400">
                    {earned ? earned.awardedDate : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Org quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Asset Class", value: org.assetClass },
            { label: "Strategy Focus", value: org.strategyFocus.slice(0, 2).join(", ") },
            { label: "Survey Status", value: org.status === "submitted" ? "Submitted" : org.status === "in_progress" ? "In Progress" : "Not Started" },
            { label: "Survey Progress", value: `${org.progress}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        {/* LPI sub-components summary */}
        {org.lpiSubComponents && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">LPI Sub-Component Scores</h3>
            <div className="space-y-4">
              {org.lpiSubComponents.dimensions.map((dim) => (
                <div key={dim.dimension}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: dim.color }}
                    />
                    <span className="text-xs font-semibold text-slate-700">{dim.dimension} Dimension</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Ownership", metric: dim.ownership },
                      { label: "Leadership", metric: dim.leadership },
                      { label: "Workforce", metric: dim.workforce },
                    ].map(({ label, metric }) => {
                      const pct = Math.round((metric.rawScore / metric.maxScore) * 100);
                      return (
                        <div key={label} className="bg-slate-50 rounded-lg p-3">
                          <p className="text-[11px] text-slate-400 mb-1">{label}</p>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: dim.color }}
                            />
                          </div>
                          <p className="text-[11px] font-semibold text-slate-700">
                            {metric.rawScore.toFixed(2)} / {metric.maxScore.toFixed(2)}
                            {metric.percentile !== null && (
                              <span className="text-slate-400 font-normal ml-1">· P{metric.percentile}</span>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
