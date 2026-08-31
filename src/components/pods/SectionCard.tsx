/**
 * White, rounded-xl card with an uppercase gray section header and a
 * bottom-border divider, matching the platform's survey dashboard cards
 * (e.g. "SURVEY DETAILS" / "RECENT ACTIVITY").
 */
export default function SectionCard({
  title,
  badge,
  action,
  children,
  className = "",
}: {
  title: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide truncate">{title}</h3>
          {badge && (
            <span className="shrink-0 text-[9.5px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
