import { Info } from "lucide-react";
import { BLACKSTONE_ORG_HIERARCHY, totalStaff } from "@/lib/mock-org-hierarchy";
import OrgChartTree from "@/components/organization/OrgChartTree";

export default function OrgStructurePage() {
  const grandTotal = totalStaff(BLACKSTONE_ORG_HIERARCHY);
  const unitCount = BLACKSTONE_ORG_HIERARCHY.children?.length ?? 0;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Headcount", value: grandTotal.toLocaleString() },
          { label: "Business Units", value: String(unitCount) },
          { label: "Structure", value: "3-tier hierarchy" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-semibold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-900">Organization Chart</h2>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info size={11} />
            Bar length shows relative headcount
          </span>
        </div>
        <OrgChartTree root={BLACKSTONE_ORG_HIERARCHY} />
      </section>
    </>
  );
}
