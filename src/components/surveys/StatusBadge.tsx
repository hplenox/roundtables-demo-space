import { CheckCircle2, Circle, PenLine } from "lucide-react";
import { SectionStatus } from "@/types/survey-draft";

const META: Record<SectionStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  complete: { label: "Complete", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "in-progress": { label: "In progress", icon: PenLine, className: "bg-amber-50 text-amber-700 border-amber-200" },
  "not-started": { label: "Not started", icon: Circle, className: "bg-slate-50 text-slate-500 border-slate-200" },
};

export default function StatusBadge({ status }: { status: SectionStatus }) {
  const { label, icon: Icon, className } = META[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${className}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}
