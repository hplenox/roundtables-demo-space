"use client";

import {
  Calendar,
  Globe,
  ArrowLeftRight,
  Server,
  Users,
  BarChart3,
  Smartphone,
  Webhook,
  BrainCircuit,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";

type Status = "building" | "planned" | "exploring";

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  building: {
    label: "In Development",
    color: "text-[#3147af]",
    bg: "bg-[#4361ee]/10",
    dot: "bg-[#4361ee]",
  },
  planned: {
    label: "Planned",
    color: "text-violet-700",
    bg: "bg-violet-50",
    dot: "bg-violet-500",
  },
  exploring: {
    label: "Exploring",
    color: "text-slate-500",
    bg: "bg-slate-100",
    dot: "bg-slate-400",
  },
};

const FEATURES = [
  {
    icon: Calendar,
    name: "Calendar",
    quarter: "Q3 2026",
    status: "building" as Status,
    description:
      "A unified calendar view of all your survey milestones, deadlines, submission windows, and automated reminder schedules — so nothing slips through.",
    highlights: ["Deadline tracking", "Automated reminders", "iCal export"],
  },
  {
    icon: Globe,
    name: "Community",
    quarter: "Q3 2026",
    status: "building" as Status,
    description:
      "A private network for survey hosts and participants to share benchmarks, discuss best practices, and collaborate across roundtables.",
    highlights: ["Peer benchmarking", "Discussion threads", "Resource library"],
  },
  {
    icon: ArrowLeftRight,
    name: "Exchange",
    quarter: "Q4 2026",
    status: "planned" as Status,
    description:
      "Securely exchange survey data and aggregated reports with partner organizations and LPs under your own privacy and disclosure rules.",
    highlights: ["Controlled data sharing", "Partner access tiers", "Audit trail"],
  },
  {
    icon: Server,
    name: "Self-Hosted Surveys",
    quarter: "Q4 2026",
    status: "planned" as Status,
    description:
      "Deploy the survey infrastructure entirely within your own environment. Full control over data residency, compliance, and access — no external dependencies.",
    highlights: ["On-premise deployment", "Custom data residency", "SSO integration"],
  },
  {
    icon: BarChart3,
    name: "Advanced Analytics",
    quarter: "Q1 2027",
    status: "planned" as Status,
    description:
      "Deep-dive analytics with cohort comparisons, longitudinal trend tracking, and custom dashboards built on your survey data over time.",
    highlights: ["Year-over-year trends", "Cohort analysis", "Custom dashboards"],
  },
  {
    icon: BrainCircuit,
    name: "AI-Powered Insights",
    quarter: "Q1 2027",
    status: "planned" as Status,
    description:
      "Automatic narrative summaries, anomaly detection on submissions, and smart nudges that surface which organizations need attention before deadlines hit.",
    highlights: ["Narrative summaries", "Anomaly detection", "Smart nudges"],
  },
  {
    icon: Webhook,
    name: "API & Webhooks",
    quarter: "Q2 2027",
    status: "exploring" as Status,
    description:
      "Programmatic access to your survey data and real-time event webhooks so you can pipe results into your own BI tools, CRMs, or reporting pipelines.",
    highlights: ["REST API", "Real-time webhooks", "SDK support"],
  },
  {
    icon: Smartphone,
    name: "Mobile App",
    quarter: "2027",
    status: "exploring" as Status,
    description:
      "Native iOS and Android apps so survey hosts can monitor progress, approve submissions, and send reminders from anywhere.",
    highlights: ["Push notifications", "Offline mode", "Biometric auth"],
  },
];

export default function RoadmapPage() {
  const building = FEATURES.filter((f) => f.status === "building");
  const planned = FEATURES.filter((f) => f.status === "planned");
  const exploring = FEATURES.filter((f) => f.status === "exploring");

  return (
    <div className="min-h-full bg-slate-50">
      {/* Hero */}
      <div className="bg-[#0f1923] px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={13} className="text-[#4361ee]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#4361ee]">
              Product Roadmap
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-white leading-tight">
            What&rsquo;s coming to Roundtables
          </h1>
          <p className="mt-3 text-[14px] text-white/50 max-w-xl leading-relaxed">
            We&rsquo;re building the most complete survey intelligence platform for institutional investors.
            Here&rsquo;s a look at what&rsquo;s on the horizon.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex items-center gap-6">
            {[
              { icon: Zap, label: "In development", value: building.length, color: "text-[#4361ee]" },
              { icon: Clock, label: "Planned", value: planned.length, color: "text-violet-400" },
              { icon: Sparkles, label: "Exploring", value: exploring.length, color: "text-slate-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon size={14} className={color} />
                <span className="text-[13px] font-semibold text-white">{value}</span>
                <span className="text-[12px] text-white/40">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-10">
        {(
          [
            { status: "building" as Status, items: building },
            { status: "planned" as Status, items: planned },
            { status: "exploring" as Status, items: exploring },
          ] as const
        ).map(({ status, items }) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={status} className="mb-10">
              {/* Section header */}
              <div className="flex items-center gap-2.5 mb-4">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className={`text-[11px] font-bold tracking-widest uppercase ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className="text-[11px] text-slate-400">— {items.length} feature{items.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.name}
                      className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-150"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#4361ee]/10 transition-colors">
                          <Icon size={17} className="text-slate-500 group-hover:text-[#4361ee] transition-colors" strokeWidth={1.75} />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
                            <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 mb-1.5">
                        <h3 className="text-[14px] font-semibold text-slate-900">{feature.name}</h3>
                        <span className="text-[11px] text-slate-400 font-medium">{feature.quarter}</span>
                      </div>
                      <p className="text-[12.5px] text-slate-500 leading-relaxed mb-3">
                        {feature.description}
                      </p>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1.5">
                        {feature.highlights.map((h) => (
                          <span
                            key={h}
                            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200/80"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer CTA */}
        <div className="mt-4 rounded-2xl bg-[#0f1923] px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-white">Have a feature request?</p>
            <p className="text-[12px] text-white/40 mt-0.5">We prioritize based on customer feedback.</p>
          </div>
          <a
            href="/support"
            className="shrink-0 px-4 py-2 rounded-lg bg-[#4361ee] text-white text-[12.5px] font-semibold hover:bg-[#3d58d9] transition-colors"
          >
            Share feedback
          </a>
        </div>
      </div>
    </div>
  );
}
