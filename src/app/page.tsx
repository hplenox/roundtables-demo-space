import Link from "next/link";
import { ArrowRight, Users, FileText, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { MOCK_SURVEYS } from "@/lib/mock-data";
import { ORG_BADGES, BADGE_TYPES } from "@/lib/mock-badges";
import { MiniBadgeIcon } from "@/components/BadgeCard";

export default function HomePage() {
  const activeSurveys = MOCK_SURVEYS.filter((s) => s.status === "active");
  const upcomingSurveys = MOCK_SURVEYS.filter((s) => s.status === "upcoming");

  const totalInvited = activeSurveys.reduce((sum, s) => sum + s.totalInvited, 0);
  const totalSubmitted = activeSurveys.reduce((sum, s) => sum + s.submitted, 0);
  const totalInProgress = activeSurveys.reduce((sum, s) => sum + s.inProgress, 0);
  const submissionRate = totalInvited > 0 ? Math.round((totalSubmitted / totalInvited) * 100) : 0;

  // Aggregate recent badge awards for the dashboard indicator
  const recentBadges = ORG_BADGES.slice(0, 2).map((ob) => ({
    ...ob,
    badge: BADGE_TYPES.find((bt) => bt.id === ob.badgeId)!,
  })).filter((ob) => ob.badge);


  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm p-7">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.04]">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            <circle cx="90" cy="90" r="80" stroke="#00b8a9" strokeWidth="1.5" />
            <circle cx="90" cy="90" r="55" stroke="#00b8a9" strokeWidth="1.5" />
            <circle cx="90" cy="90" r="30" stroke="#00b8a9" strokeWidth="1.5" />
            <circle cx="90" cy="90" r="10" fill="#00b8a9" />
          </svg>
        </div>
        {/* Teal accent bar */}
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00b8a9] rounded-l-2xl" />
        {/* Floating badge seals */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">
          {recentBadges.map((ob, i) => (
            <Link
              key={i}
              href="/organization"
              className="group flex flex-col items-center gap-1.5"
              title={ob.badge.name}
            >
              <div className="drop-shadow-lg group-hover:drop-shadow-xl group-hover:-translate-y-0.5 transition-all duration-200">
                <MiniBadgeIcon badge={ob.badge} size={58} />
              </div>
              <p className="text-[9px] font-semibold text-slate-400 text-center max-w-[72px] leading-tight group-hover:text-[#00897b] transition-colors">
                {ob.badge.name}
              </p>
            </Link>
          ))}
        </div>
        <div className="relative z-10 pl-2 pr-[160px]">
          <p className="text-[#00897b] text-xs font-semibold tracking-wide uppercase mb-1.5">
            Lenox Park Solutions, Inc.
          </p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Welcome back, Esteban</h1>
          <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
            Roundtables is the institutional standard for measuring and benchmarking
            DEI practices across LP–GP relationships — from survey administration
            to LPI scoring and portfolio-wide reporting.
          </p>

          <div className="grid grid-cols-4 gap-5 mt-6 pt-5 border-t border-slate-100">
            {[
              { value: activeSurveys.length, label: "Active Surveys" },
              { value: totalInvited, label: "GPs Invited" },
              { value: totalSubmitted, label: "Submitted", highlight: true },
              { value: `${submissionRate}%`, label: "Response Rate", highlight: true },
            ].map(({ value, label, highlight }) => (
              <div key={label}>
                <p className={`text-2xl font-bold ${highlight ? "text-[#00b8a9]" : "text-slate-800"}`}>
                  {value}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-5">

        {/* Survey admin panel */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Survey Administration</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage your active and upcoming surveys</p>
            </div>
            <Link
              href="/surveys"
              className="flex items-center gap-1 text-[#00b8a9] text-xs font-semibold hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="p-4 space-y-3">
            {activeSurveys.map((survey) => {
              const pct = Math.round((survey.submitted / survey.totalInvited) * 100);
              const notStartedPct = Math.round((survey.notStarted / survey.totalInvited) * 100);
              return (
                <Link
                  key={survey.id}
                  href={`/surveys/${survey.id}/organizations`}
                  className="block p-4 rounded-xl border border-slate-100 hover:border-[#00b8a9]/40 hover:bg-[#00b8a9]/[0.02] transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-[#00897b] transition-colors">
                        {survey.name} · {survey.year}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {survey.hostOrg} · Closes {survey.targetCloseDate}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-[#00b8a9] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <CheckCircle2 size={11} className="text-emerald-500" />
                      {survey.submitted} submitted
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock size={11} className="text-amber-500" />
                      {survey.inProgress} in progress
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <AlertCircle size={11} className="text-slate-300" />
                      {notStartedPct}% not started
                    </span>
                    <span className="ml-auto text-[11px] font-semibold text-[#00b8a9]">
                      {pct}% complete
                    </span>
                  </div>
                </Link>
              );
            })}

            {upcomingSurveys.map((survey) => (
              <div
                key={survey.id}
                className="p-4 rounded-xl border border-dashed border-slate-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {survey.name} · {survey.year}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {survey.hostOrg} · Opens {survey.startDate}
                    </p>
                  </div>
                  <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Upcoming
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {survey.totalInvited} GPs invited · Survey not yet open
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* How it works */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">How Roundtables Works</h2>
            <div className="space-y-4">
              {[
                {
                  icon: Users,
                  label: "LP Invites GPs",
                  desc: "Configure and send DEI surveys to your portfolio managers.",
                  color: "bg-violet-100 text-violet-600",
                },
                {
                  icon: FileText,
                  label: "GPs Complete Surveys",
                  desc: "GPs submit workforce, leadership, and ownership diversity data.",
                  color: "bg-[#00b8a9]/10 text-[#00897b]",
                },
                {
                  icon: TrendingUp,
                  label: "LP Gets Benchmarks",
                  desc: "Review LPI scores benchmarked across the full Roundtables universe.",
                  color: "bg-amber-100 text-amber-600",
                },
              ].map(({ icon: Icon, label, desc, color }, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`shrink-0 w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LPI callout */}
          <div className="rounded-xl bg-[#00b8a9]/[0.07] border border-[#00b8a9]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-[#00b8a9] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="2" fill="white" />
                  <circle cx="5" cy="5" r="4" stroke="white" strokeWidth="1" fill="none" />
                </svg>
              </div>
              <p className="text-xs font-bold text-[#00897b] tracking-wide">LPI SCORE</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The <span className="text-slate-800 font-semibold">LP Inclusion Index</span> is
              Roundtables&apos; proprietary 0–10 scoring framework measuring DEI performance
              across ownership, leadership, and workforce dimensions — benchmarked against
              312+ managers in the universe.
            </p>
            <Link
              href="/surveys"
              className="mt-3 inline-flex items-center gap-1 text-[#00897b] text-[11px] font-semibold hover:underline"
            >
              View survey reports <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
