import Link from "next/link";

export interface PodSubTab {
  key: string;
  label: string;
  href: string;
}

/**
 * Plain-text, blue-underline sub-tab bar. Shared by the POD detail tabs
 * (Activity / Discussion / Events / Members / Files) and the Event detail
 * tabs (About / Invitees / Documents) so both surfaces match exactly.
 */
export default function PodSubTabs({ tabs, activeKey }: { tabs: PodSubTab[]; activeKey: string }) {
  return (
    <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`shrink-0 pb-2.5 -mb-px text-[13px] font-medium border-b-2 transition-colors ${
            activeKey === tab.key
              ? "border-[#4361ee] text-[#3650d4]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
