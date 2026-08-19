import Link from "next/link";
import {
  LayoutDashboard, ClipboardList, Layers, Contact, ArrowLeftRight, Building2, Wallet,
  Calendar, Share2, Handshake, Shield, ArrowUpRight, CheckCircle2, Circle, Clock, Sparkles,
} from "lucide-react";

type AreaStatus = "documented" | "undocumented" | "planned";

type Area = {
  key: string;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
  status: AreaStatus;
  href?: string;
  requirementCount?: number;
  phaseCount?: number;
};

const AREAS: Area[] = [
  {
    key: "pods",
    label: "PODs",
    description: "Member-run workspaces for a community, a vendor list, or a live deal — discussion, events, files, and curated records.",
    icon: Contact,
    status: "documented",
    href: "/requirements/pods",
    requirementCount: 21,
    phaseCount: 7,
  },
  {
    key: "home",
    label: "Home",
    description: "Personal dashboard surfacing what needs attention across onboarding, surveys, and PODs.",
    icon: LayoutDashboard,
    status: "undocumented",
  },
  {
    key: "onboarding",
    label: "Onboarding",
    description: "Step-by-step data collection flow LPs complete before a survey cycle opens.",
    icon: ClipboardList,
    status: "undocumented",
  },
  {
    key: "surveys",
    label: "Surveys",
    description: "DEI survey cycles members complete and track over time.",
    icon: Layers,
    status: "undocumented",
  },
  {
    key: "organization",
    label: "My Organization",
    description: "Org hierarchy, roles, and structure management for a member firm.",
    icon: Building2,
    status: "undocumented",
  },
  {
    key: "client-crm",
    label: "Client CRM",
    description: "Internal CRM for managing LP/GP client relationships and their onboarding.",
    icon: Handshake,
    status: "undocumented",
  },
  {
    key: "survey-admin",
    label: "Survey Admin",
    description: "Admin tooling for configuring and monitoring survey cycles.",
    icon: Layers,
    status: "undocumented",
  },
  {
    key: "administrator",
    label: "Administrator",
    description: "Platform-wide admin controls.",
    icon: Shield,
    status: "undocumented",
  },
  {
    key: "exchange",
    label: "Exchange",
    description: "A cross-POD marketplace to trade intros, deal flow, or vendor recommendations.",
    icon: ArrowLeftRight,
    status: "planned",
  },
  {
    key: "portfolio",
    label: "My Portfolio",
    description: "A member's holdings and positions in one place.",
    icon: Wallet,
    status: "planned",
  },
  {
    key: "calendar",
    label: "Calendar",
    description: "One calendar view across every POD's events.",
    icon: Calendar,
    status: "planned",
  },
  {
    key: "community",
    label: "Community",
    description: "An org-wide feed surfacing highlights across all the PODs a member belongs to.",
    icon: Share2,
    status: "planned",
  },
];

const STATUS_META: Record<AreaStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  documented: { label: "Documented", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  undocumented: { label: "Not yet documented", icon: Circle, className: "bg-slate-50 text-slate-500 border-slate-200" },
  planned: { label: "Planned", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
};

function AreaCard({ area }: { area: Area }) {
  const Icon = area.icon;
  const meta = STATUS_META[area.status];
  const StatusIcon = meta.icon;

  const inner = (
    <div
      className={`h-full bg-white rounded-2xl border p-5 shadow-sm transition-all ${
        area.status === "documented"
          ? "border-slate-200 hover:border-[#4361ee]/40 hover:shadow-md"
          : "border-slate-200 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
          <Icon size={18} />
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${meta.className}`}>
          <StatusIcon size={11} />
          {meta.label}
        </span>
      </div>
      <h3 className="text-[15px] font-bold text-slate-900">{area.label}</h3>
      <p className="text-[12.5px] text-slate-500 leading-snug mt-1">{area.description}</p>
      {area.status === "documented" ? (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11.5px] text-slate-400">{area.requirementCount} requirements · {area.phaseCount} phases</span>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#3650d4]">
            View requirements
            <ArrowUpRight size={12} />
          </span>
        </div>
      ) : (
        <p className="text-[11.5px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
          {area.status === "planned" ? "Not yet built — a roadmap item." : "Built, but requirements haven't been written up yet."}
        </p>
      )}
    </div>
  );

  if (area.href) {
    return <Link href={area.href}>{inner}</Link>;
  }
  return <div className="cursor-default">{inner}</div>;
}

export default function RequirementsPortalPage() {
  const documented = AREAS.filter((a) => a.status === "documented");
  const rest = AREAS.filter((a) => a.status !== "documented");

  return (
    <div className="min-h-full bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-7">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4361ee]/10 text-[#3650d4] text-[10.5px] font-bold uppercase tracking-wide">
            <Sparkles size={11} />
            Product
          </span>
        </div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Requirements</h1>
        <p className="text-[13px] text-slate-500 mt-1 max-w-2xl">
          One place to see what&rsquo;s been scoped and designed across Roundtables, broken out by product area.
          Pick an area below to see its requirements broken into bite-sized pieces, grouped by phase, each
          linked to the working design.
        </p>

        {documented.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide mb-3">Documented</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documented.map((area) => (
                <AreaCard key={area.key} area={area} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide mb-3">Everything else</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((area) => (
              <AreaCard key={area.key} area={area} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
