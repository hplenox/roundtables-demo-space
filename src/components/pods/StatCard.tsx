import Link from "next/link";
import { ArrowRight } from "lucide-react";

type StatColor = "green" | "amber" | "blue" | "violet" | "navy" | "slate";

const COLOR_TEXT: Record<StatColor, string> = {
  green: "text-emerald-600",
  amber: "text-amber-600",
  blue: "text-[#0052c2]",
  violet: "text-violet-600",
  navy: "text-slate-900",
  slate: "text-slate-700",
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "slate",
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  color?: StatColor;
  href?: string;
}) {
  const body = (
    <div className="h-full bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} className={`shrink-0 ${COLOR_TEXT[color]}`} />
          <span className="text-[13px] font-medium text-slate-600 truncate">{label}</span>
        </div>
        {href && <ArrowRight size={14} className="shrink-0 text-slate-300" />}
      </div>
      <p className={`text-[28px] font-bold leading-none ${COLOR_TEXT[color]}`}>{value}</p>
      {hint && <p className="text-[11.5px] text-slate-400 mt-2">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
