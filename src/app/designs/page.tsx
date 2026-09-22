import Link from "next/link";
import { Palette, ArrowUpRight, Building2 } from "lucide-react";

type DesignStatus = "prototype" | "concept";

const STATUS_CONFIG: Record<DesignStatus, { label: string; className: string }> = {
  prototype: { label: "Clickable Prototype", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  concept: { label: "Concept — Not Yet Built", className: "bg-slate-100 text-slate-500 border-slate-200" },
};

const DESIGNS: {
  key: string;
  title: string;
  description: string;
  icon: typeof Building2;
  status: DesignStatus;
  href: string;
}[] = [
  {
    key: "registration-flow",
    title: "Survey Invitation Registration",
    description:
      "The multi-step flow a contact walks through after clicking a survey invitation link — personal info, email verification, and (the redesigned step) intelligently matching the contact to their organization instead of defaulting people toward creating a duplicate one.",
    icon: Building2,
    status: "prototype",
    href: "/designs/registration-flow",
  },
];

export default function DesignsPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#4361ee]/10 flex items-center justify-center">
          <Palette size={18} className="text-[#4361ee]" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Designs</h1>
      </div>
      <p className="text-[15px] text-slate-500 max-w-2xl mb-8">
        Working-session home for UX redesigns that aren&rsquo;t part of the production app yet. Each entry below is a
        clickable, interactive mockup meant for review and discussion — not wired up to real data or backend logic.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DESIGNS.map((d) => {
          const Icon = d.icon;
          const status = STATUS_CONFIG[d.status];
          return (
            <Link
              key={d.key}
              href={d.href}
              className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:border-[#4361ee]/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" strokeWidth={1.75} />
                </div>
                <span className={`shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full border ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-1.5">
                  {d.title}
                  <ArrowUpRight
                    size={15}
                    className="text-slate-300 group-hover:text-[#4361ee] transition-colors duration-150"
                  />
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{d.description}</p>
              </div>
            </Link>
          );
        })}

        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 p-5 text-center text-slate-400">
          <span className="text-[13px] font-medium">More design explorations land here</span>
          <span className="text-[12px]">Ask in #product-design to have one added.</span>
        </div>
      </div>
    </div>
  );
}
