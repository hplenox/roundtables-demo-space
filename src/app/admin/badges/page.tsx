"use client";

import { useState, useMemo } from "react";
import {
  Award, Search, Plus, X, ChevronDown, ChevronUp,
  Building2, CheckCircle2, Info, Calculator, GitCommitHorizontal,
} from "lucide-react";
import {
  BADGE_TYPES,
  ORG_BADGES,
  BadgeType,
  OrgBadge,
  BADGE_CALCULATIONS,
  BadgeCalculationSpec,
} from "@/lib/mock-badges";
import { MOCK_ORGS } from "@/lib/mock-data";
import BadgeCard, { MiniBadgeIcon } from "@/components/BadgeCard";

type LocalOrgBadge = OrgBadge & { isLocal?: boolean };

function CalcPanel({ calc, badge }: { calc: BadgeCalculationSpec; badge: BadgeType }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/80">
        <Calculator size={11} className="text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          Calculation Criteria
        </span>
        {calc.multiYearRequired && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <GitCommitHorizontal size={9} />
            Multi-year required ({calc.minYearsRequired}+ yrs)
          </span>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Eligible pool + award count */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Eligible Pool
            </p>
            <p className="text-[11px] text-slate-700 leading-snug">{calc.eligiblePool}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Award Count
            </p>
            <p className="text-[11px] text-slate-700 leading-snug">{calc.awardCount}</p>
          </div>
        </div>

        {/* Formula steps */}
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Formula
          </p>
          <div className="space-y-2">
            {calc.formulaSteps.map((step, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span
                  className="shrink-0 mt-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{
                    background: badge.categoryBg,
                    color: badge.categoryText,
                    border: `1px solid ${badge.categoryBorder}`,
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 mb-0.5">{step.label}</p>
                  <code className="block text-[10px] font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 leading-relaxed break-all whitespace-pre-wrap">
                    {step.formula}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data required + Thresholds */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Data Required
            </p>
            <ul className="space-y-1">
              {calc.dataRequired.map((d, i) => (
                <li key={i} className="flex items-start gap-1 text-[10px] text-slate-600 leading-snug">
                  <span className="text-emerald-500 mt-px shrink-0">✓</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Thresholds
            </p>
            <ul className="space-y-1">
              {calc.thresholds.map((t, i) => (
                <li key={i} className="text-[10px] text-slate-600 leading-snug">
                  <span className="font-semibold text-slate-500">{t.label}: </span>
                  {t.value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tie-breaker */}
        {calc.tieBreaker && (
          <div className="flex items-start gap-1.5 text-[10px] text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
            <Info size={10} className="text-blue-400 mt-px shrink-0" />
            <span>
              <span className="font-semibold text-slate-600">Tie-breaker: </span>
              {calc.tieBreaker}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BadgeManagementPage() {
  const [orgBadges, setOrgBadges] = useState<LocalOrgBadge[]>(
    ORG_BADGES.map((ob) => ({ ...ob, isLocal: false }))
  );
  const [search, setSearch] = useState("");
  const [expandedBadge, setExpandedBadge] = useState<string | null>(null);
  const [assigningBadge, setAssigningBadge] = useState<string | null>(null);
  const [assignOrgId, setAssignOrgId] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [toast, setToast] = useState<string | null>(null);

  const categories = ["All", "Gender Diversity", "Racial Diversity", "Improvement", "Excellence"];

  const filteredBadges = useMemo(() => {
    return BADGE_TYPES.filter((bt) => {
      const matchesSearch =
        bt.name.toLowerCase().includes(search.toLowerCase()) ||
        bt.description.toLowerCase().includes(search.toLowerCase()) ||
        bt.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || bt.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  function getAwardeesForBadge(badgeId: string) {
    return orgBadges.filter((ob) => ob.badgeId === badgeId);
  }

  function assignBadge(badgeId: string, orgId: string) {
    if (!orgId) return;
    const already = orgBadges.some((ob) => ob.badgeId === badgeId && ob.orgId === orgId);
    if (already) {
      showToast("This organization already has this badge.");
      return;
    }
    const org = MOCK_ORGS.find((o) => o.id === orgId);
    if (!org) return;
    setOrgBadges((prev) => [
      ...prev,
      {
        orgId,
        orgName: org.name,
        badgeId,
        awardedDate: "Apr 2026",
        surveyId: "survey-2026-dei-lenox",
        isLocal: true,
      },
    ]);
    setAssigningBadge(null);
    setAssignOrgId("");
    showToast(`Badge assigned to ${org.name}`);
  }

  function revokeBadge(badgeId: string, orgId: string) {
    setOrgBadges((prev) =>
      prev.filter((ob) => !(ob.badgeId === badgeId && ob.orgId === orgId))
    );
    showToast("Badge revoked.");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const categoryColors: Record<string, string> = {
    "Gender Diversity": "#818cf8",
    "Racial Diversity": "#34d399",
    "Improvement":      "#fb923c",
    "Excellence":       "#fbbf24",
  };

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-[#0f1923] text-white px-4 py-2.5 rounded-xl shadow-xl border border-white/10 text-[13px] font-medium">
          <CheckCircle2 size={14} className="text-[#00b8a9]" />
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            Badge Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            View all badge types, their criteria, and which organizations have earned them. Assign or revoke badges per cohort year.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Info size={11} />
            {orgBadges.length} total assignments
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search badges…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30 focus:border-[#00b8a9]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
                activeCategory === cat
                  ? "bg-[#0f1923] text-white border-[#0f1923]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
              style={
                activeCategory === cat && cat !== "All"
                  ? { background: categoryColors[cat] + "22", color: categoryColors[cat], borderColor: categoryColors[cat] + "55" }
                  : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBadges.map((badge) => {
          const awardees = getAwardeesForBadge(badge.id);
          const isExpanded = expandedBadge === badge.id;
          const isAssigning = assigningBadge === badge.id;
          const orgsNotYetAwarded = MOCK_ORGS.filter(
            (o) => !awardees.some((a) => a.orgId === o.id)
          );

          return (
            <div
              key={badge.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              {/* Badge card header */}
              <div className="flex gap-4 p-4">
                {/* Mini badge preview */}
                <div className="shrink-0">
                  <MiniBadgeIcon badge={badge} size={52} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1"
                        style={{
                          background: badge.categoryBg,
                          color: badge.categoryText,
                          border: `1px solid ${badge.categoryBorder}`,
                        }}
                      >
                        {badge.category}
                      </span>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{badge.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{badge.description}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {awardees.length} org{awardees.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Awardee pills */}
                  {awardees.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {awardees.map((a) => (
                        <span
                          key={a.orgId}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          <CheckCircle2 size={9} />
                          {a.orgName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions bar */}
              <div className="flex items-center gap-2 px-4 pb-3 pt-0">
                <button
                  onClick={() => setExpandedBadge(isExpanded ? null : badge.id)}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {isExpanded ? "Hide" : "Details & preview"}
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAssigningBadge(isAssigning ? null : badge.id);
                      setAssignOrgId("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00b8a9]/10 text-[#00897b] border border-[#00b8a9]/25 text-[11px] font-semibold hover:bg-[#00b8a9]/20 transition-colors"
                  >
                    <Plus size={11} />
                    Assign org
                  </button>
                </div>
              </div>

              {/* Assign panel */}
              {isAssigning && (
                <div className="mx-4 mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-600 mb-2">Assign badge to organization</p>
                  <div className="flex gap-2">
                    <select
                      value={assignOrgId}
                      onChange={(e) => setAssignOrgId(e.target.value)}
                      className="flex-1 text-[12px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30"
                    >
                      <option value="">Select organization…</option>
                      {orgsNotYetAwarded.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.assetClass})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignBadge(badge.id, assignOrgId)}
                      disabled={!assignOrgId}
                      className="px-3 py-1.5 rounded-lg bg-[#00b8a9] text-white text-[11px] font-semibold disabled:opacity-40 hover:bg-[#00a398] transition-colors"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => setAssigningBadge(null)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 text-[11px] transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Expanded: full details */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                  {/* Calculation criteria */}
                  {BADGE_CALCULATIONS[badge.id] && (
                    <div className="px-4 pt-4 pb-2">
                      <CalcPanel calc={BADGE_CALCULATIONS[badge.id]} badge={badge} />
                    </div>
                  )}

                  {/* Full badge card preview */}
                  <div className="p-4">
                    <div className="max-w-[240px] mx-auto">
                      <BadgeCard badge={badge} />
                    </div>
                  </div>

                  {/* Current awardees management */}
                  {awardees.length > 0 && (
                    <div className="px-4 pb-4">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Current Awardees
                      </p>
                      <div className="space-y-1.5">
                        {awardees.map((a) => (
                          <div
                            key={a.orgId}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-slate-200"
                          >
                            <Building2 size={13} className="text-slate-400" />
                            <span className="text-[12px] font-medium text-slate-700 flex-1">
                              {a.orgName}
                            </span>
                            {a.isLocal && (
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                                New
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">{a.awardedDate}</span>
                            <button
                              onClick={() => revokeBadge(badge.id, a.orgId)}
                              className="text-slate-300 hover:text-red-400 transition-colors"
                              title="Revoke badge"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Award size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No badges match your search.</p>
        </div>
      )}
    </div>
  );
}
