"use client";

import Link from "next/link";
import { ChevronDown, Users, Building2, ArrowUpRight, User } from "lucide-react";
import { OrgUnit, totalStaff } from "@/lib/mock-org-hierarchy";
import { getOrgById, getContactsBySurveyId } from "@/lib/mock-data";
import { Contact } from "@/types/survey";

interface LevelGroup {
  parent: OrgUnit | null;
  units: OrgUnit[];
}

/** Groups nodes by depth so every level of the hierarchy can render as its own row. */
function buildLevels(root: OrgUnit): LevelGroup[][] {
  const levels: LevelGroup[][] = [[{ parent: null, units: [root] }]];
  let parents = [root];

  while (true) {
    const groups = parents
      .filter((p) => p.children?.length)
      .map((p) => ({ parent: p, units: p.children! }));
    if (!groups.length) break;
    levels.push(groups);
    parents = groups.flatMap((g) => g.units);
  }

  return levels;
}

function StaffBar({ pct, dark }: { pct: number; dark?: boolean }) {
  return (
    <div className={`h-1.5 w-full rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-slate-100"}`}>
      <div
        className="h-full rounded-full bg-[#00b8a9] transition-all duration-500"
        style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
      />
    </div>
  );
}

function RootCard({ unit }: { unit: OrgUnit }) {
  const total = totalStaff(unit);
  return (
    <div className="shrink-0 w-[220px] bg-[#0f1923] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Building2 size={15} className="text-[#00b8a9]" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-white leading-tight truncate">{unit.name}</p>
          <p className="text-[10px] text-white/40">Parent Organization</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <span className="flex items-center gap-1 text-[11.5px] font-semibold text-white/80">
          <Users size={10} className="text-white/40" />
          {total.toLocaleString()} total
        </span>
      </div>
      <StaffBar pct={100} dark />
    </div>
  );
}

function UnitCard({
  unit,
  value,
  pct,
  contacts,
  reportHref,
}: {
  unit: OrgUnit;
  value: number;
  pct: number;
  contacts?: Contact[];
  reportHref?: string;
}) {
  return (
    <div className={`shrink-0 bg-white rounded-xl border border-slate-200 p-3 ${contacts ? "w-[212px]" : "w-[176px]"}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="shrink-0 w-7 h-7 rounded-lg bg-[#0f1923] flex items-center justify-center">
          <Building2 size={12} className="text-[#00b8a9]" />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-slate-900 leading-tight truncate">{unit.name}</p>
          {unit.head && <p className="text-[10px] text-slate-400 truncate">{unit.head}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1 mb-1 text-[11px] font-semibold text-slate-600">
        <Users size={10} className="text-slate-400" />
        {value.toLocaleString()}
      </div>
      <StaffBar pct={pct} />

      {contacts && contacts.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 min-w-0">
              <User size={10} className="text-slate-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-700 truncate leading-tight">
                  {c.firstName} {c.lastName}
                </p>
                <p className="text-[9.5px] text-slate-400 truncate leading-tight">{c.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {reportHref && (
        <Link
          href={reportHref}
          className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-[#00b8a9]/10 text-[#00897b] text-[11px] font-semibold hover:bg-[#00b8a9]/20 transition-colors"
        >
          View Report
          <ArrowUpRight size={11} />
        </Link>
      )}
    </div>
  );
}

export default function OrgChartTree({ root }: { root: OrgUnit }) {
  const levels = buildLevels(root);
  const surveyId = getOrgById(root.id)?.surveyId;
  const contacts = surveyId ? getContactsBySurveyId(surveyId) : [];

  return (
    <div className="space-y-4">
      {levels.map((groups, levelIdx) => {
        if (levelIdx === 0) {
          return (
            <div key={levelIdx} className="flex justify-center">
              <RootCard unit={root} />
            </div>
          );
        }

        // Business units (level 1) are each their own reportable organization:
        // show who works within them and a way to open their report view.
        const isBusinessUnitRow = levelIdx === 1;

        const allUnits = groups.flatMap((g) => g.units);
        const values = allUnits.map((u) => (u.children?.length ? totalStaff(u) : u.staffCount));
        const maxVal = Math.max(1, ...values);
        const showGroupLabels = groups.length > 1;

        return (
          <div key={levelIdx}>
            <div className="flex justify-center mb-3">
              <ChevronDown size={14} className="text-slate-300" />
            </div>
            <div className="w-full overflow-x-auto pb-1">
              <div className="flex items-start justify-center gap-6 min-w-max px-1">
                {groups.map((group, gi) => (
                  <div key={gi} className="flex flex-col gap-1.5">
                    {showGroupLabels && (
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide pl-1">
                        {group.parent!.name}
                      </p>
                    )}
                    <div className="flex items-start gap-3">
                      {group.units.map((u) => {
                        const value = u.children?.length ? totalStaff(u) : u.staffCount;
                        const pct = (value / maxVal) * 100;
                        const unitContacts = isBusinessUnitRow
                          ? contacts.filter((c) => c.orgId === u.id)
                          : undefined;
                        const reportHref =
                          isBusinessUnitRow && surveyId ? `/surveys/${surveyId}/organizations/${u.id}/report` : undefined;
                        return (
                          <UnitCard
                            key={u.id}
                            unit={u}
                            value={value}
                            pct={pct}
                            contacts={unitContacts}
                            reportHref={reportHref}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
