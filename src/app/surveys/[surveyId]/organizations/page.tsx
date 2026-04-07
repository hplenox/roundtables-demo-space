"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getOrgsBySurveyId } from "@/lib/mock-data";
import { InvitedOrg } from "@/types/survey";
import { ArrowRight, Search, SlidersHorizontal, Mail, X, Send, CheckCircle, BellRing } from "lucide-react";

type StatusFilter = "all" | "submitted" | "in_progress" | "not_started";

const STATUS_CONFIG = {
  submitted:   { label: "Submitted",   dot: "bg-emerald-400", text: "text-emerald-700", badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  in_progress: { label: "In Progress", dot: "bg-amber-400",   text: "text-amber-700",   badge: "bg-amber-50 border-amber-200 text-amber-700" },
  not_started: { label: "Not Started", dot: "bg-slate-300",   text: "text-slate-500",   badge: "bg-slate-50 border-slate-200 text-slate-500" },
};

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2.5 w-36">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: value === 100 ? "#00b8a9" : value > 0 ? "#fbbf24" : "transparent",
          }}
        />
      </div>
      <span className="text-[11.5px] text-slate-500 tabular-nums w-8 text-right">{value}%</span>
    </div>
  );
}

function LpiScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[12px] text-slate-300">—</span>;
  const color = score >= 8 ? "text-emerald-600" : score >= 6.5 ? "text-amber-600" : "text-red-600";
  return (
    <span className={`text-[13px] font-semibold tabular-nums ${color}`}>{score}</span>
  );
}

function buildEmailBody(org: InvitedOrg): string {
  return `Dear ${org.contactName},

We hope this message finds you well. We're reaching out because ${org.name}'s survey response is currently at ${org.progress}% completion, and we'd love to see you cross the finish line.

Your organization's participation is essential to our DEI benchmarking initiative. Completing the survey ensures ${org.name} is fully represented in this year's LPI results and enables a richer, more accurate picture of diversity, equity, and inclusion across the industry.

Please log in at your earliest convenience to complete the remaining sections. If you have any questions or run into any issues, our team is here to help.

Thank you for your continued partnership.

Warm regards,
Survey Administration Team`;
}

function NudgeEmailModal({
  orgs,
  onClose,
}: {
  orgs: InvitedOrg[];
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const isBulk = orgs.length > 1;
  const single = orgs[0];

  const subject = "Action Required: Complete Your DEI Survey Submission";

  const bulkBodyPreview = `Dear [Contact Name],

We hope this message finds you well. We're reaching out because [Organization Name]'s survey response is currently at [X]% completion, and we'd love to see you cross the finish line.

Your organization's participation is essential to our DEI benchmarking initiative. Completing the survey ensures your firm is fully represented in this year's LPI results and enables a richer, more accurate picture of diversity, equity, and inclusion across the industry.

Please log in at your earliest convenience to complete the remaining sections. If you have any questions or run into any issues, our team is here to help.

Thank you for your continued partnership.

Warm regards,
Survey Administration Team`;

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5f3] flex items-center justify-center shrink-0">
              <Mail size={15} className="text-[#00897b]" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800">
                {isBulk ? `Nudge ${orgs.length} Organizations` : "Send Nudge Reminder"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBulk
                  ? `${orgs.length} contacts · all under 80% completion`
                  : `${single.contactName} · ${single.progress}% complete`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <p className="text-[14px] font-semibold text-slate-800">
              {isBulk ? `${orgs.length} Nudges Queued!` : "Nudge Sent!"}
            </p>
            <p className="text-[12px] text-slate-400 text-center max-w-xs">
              {isBulk
                ? `Personalized reminders have been queued for all ${orgs.length} organizations.`
                : `A reminder has been queued for ${single.contactName} at ${single.contactEmail}.`}
            </p>
          </div>
        ) : (
          <>
            {/* Email meta fields */}
            <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide w-14 shrink-0 mt-0.5">To</span>
                {isBulk ? (
                  <div className="flex flex-wrap gap-1">
                    {orgs.slice(0, 4).map((o) => (
                      <span
                        key={o.id}
                        className="text-[11px] bg-white border border-slate-200 rounded-md px-2 py-0.5 text-slate-600"
                      >
                        {o.contactEmail}
                      </span>
                    ))}
                    {orgs.length > 4 && (
                      <span className="text-[11px] bg-white border border-slate-200 rounded-md px-2 py-0.5 text-slate-500 italic">
                        +{orgs.length - 4} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[12px] text-slate-700">{single.contactEmail}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide w-14 shrink-0">Subject</span>
                <span className="text-[12px] text-slate-700">{subject}</span>
              </div>
            </div>

            {/* Email body */}
            <div className="px-5 py-4 max-h-64 overflow-y-auto">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <pre className="text-[11.5px] text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                  {isBulk ? bulkBodyPreview : buildEmailBody(single)}
                </pre>
              </div>
              {isBulk && (
                <p className="text-[10.5px] text-slate-400 mt-2 text-center italic">
                  Preview shown with placeholders — each email will be personalized per organization.
                </p>
              )}
              {!isBulk && (
                <p className="text-[10.5px] text-slate-400 mt-2 text-center italic">
                  For demo purposes only — no actual email will be sent.
                </p>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
              >
                <Send size={12} />
                {isBulk ? `Send ${orgs.length} Nudges` : "Send Nudge"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OrgRow({
  org,
  surveyId,
  onNudge,
}: {
  org: InvitedOrg;
  surveyId: string;
  onNudge: (org: InvitedOrg) => void;
}) {
  const st = STATUS_CONFIG[org.status];
  const canNudge = org.progress < 80;

  return (
    <div className="group relative border-b border-slate-50 last:border-0">
      <Link
        href={`/surveys/${surveyId}/organizations/${org.id}`}
        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
      >
        {/* Org name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-slate-600">
                {org.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <p className="text-[13px] font-semibold text-slate-800 group-hover:text-[#00897b] transition-colors truncate">
              {org.name}
            </p>
            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              {org.type}
            </span>
          </div>
          <p className="text-[11.5px] text-slate-400 ml-8 truncate">
            {org.contactName} · {org.assetClass} · {org.location}
          </p>
        </div>

        {/* AUM */}
        <div className="hidden xl:block w-16 text-right">
          <p className="text-[12.5px] font-medium text-slate-700">{org.aum}</p>
          <p className="text-[10.5px] text-slate-400">AUM</p>
        </div>

        {/* LPI Score */}
        <div className="hidden lg:block w-16 text-center">
          <LpiScore score={org.lpiScore} />
          {org.lpiScore !== null && <p className="text-[10px] text-slate-400">LPI Score</p>}
        </div>

        {/* Progress */}
        <div className="hidden sm:block">
          <ProgressCell value={org.progress} />
        </div>

        {/* Status badge */}
        <div className="w-24 text-right">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${st.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>

        {/* Last activity */}
        <div className="hidden lg:block w-24 text-right">
          <p className="text-[11.5px] text-slate-400">{org.lastActivity ?? "No activity"}</p>
        </div>

        {/* Nudge icon placeholder (keeps layout stable) */}
        <div className="w-6 shrink-0" />

        {/* Arrow */}
        <ArrowRight
          size={14}
          className="shrink-0 text-slate-300 group-hover:text-[#00b8a9] group-hover:translate-x-0.5 transition-all"
        />
      </Link>

      {/* Nudge button — absolutely positioned over the placeholder to avoid nesting button in <a> */}
      {canNudge && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center">
          <button
            onClick={() => onNudge(org)}
            title={`Send nudge to ${org.contactName} (${org.progress}% complete)`}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-[#00897b] hover:bg-[#e8f5f3] transition-all"
          >
            <Mail size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrganizationsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const searchParams = useSearchParams();
  const allOrgs = getOrgsBySurveyId(surveyId);

  const initialStatus = searchParams.get("status") as StatusFilter | null;
  const [filter, setFilter] = useState<StatusFilter>(
    initialStatus && ["submitted", "in_progress", "not_started"].includes(initialStatus)
      ? initialStatus
      : "all"
  );
  const [search, setSearch] = useState("");

  // Sync if the URL param changes (e.g., back/forward navigation)
  useEffect(() => {
    const s = searchParams.get("status") as StatusFilter | null;
    if (s && ["submitted", "in_progress", "not_started"].includes(s)) {
      setFilter(s);
    } else {
      setFilter("all");
    }
  }, [searchParams]);
  const [nudgeOrgs, setNudgeOrgs] = useState<InvitedOrg[] | null>(null);

  const filtered = allOrgs.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch =
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.contactName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const nudgeable = filtered.filter((o) => o.progress < 80);

  const counts = {
    all: allOrgs.length,
    submitted: allOrgs.filter((o) => o.status === "submitted").length,
    in_progress: allOrgs.filter((o) => o.status === "in_progress").length,
    not_started: allOrgs.filter((o) => o.status === "not_started").length,
  };

  return (
    <div className="space-y-4">
      {/* Summary chips + actions */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "submitted", "in_progress", "not_started"] as StatusFilter[]).map((key) => {
          const isAll = key === "all";
          const cfg = isAll ? null : STATUS_CONFIG[key as keyof typeof STATUS_CONFIG];
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
                border transition-all duration-150
                ${active
                  ? "bg-[#0f1923] border-[#0f1923] text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
              {isAll ? "All Organizations" : cfg!.label}
              <span className={`text-[10.5px] px-1 rounded ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                {counts[key]}
              </span>
            </button>
          );
        })}

        {/* Search */}
        <div className="ml-auto relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              h-8 pl-8 pr-3 w-52 rounded-lg
              bg-white border border-slate-200
              text-[12.5px] text-slate-700 placeholder:text-slate-400
              focus:outline-none focus:border-slate-300
              transition-all duration-150
            "
          />
        </div>

        <button className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 text-[12px]">
          <SlidersHorizontal size={13} />
          Sort
        </button>

        {/* Nudge All */}
        {nudgeable.length > 0 && (
          <button
            onClick={() => setNudgeOrgs(nudgeable)}
            className="h-8 px-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 flex items-center gap-1.5 text-[12px] font-medium transition-colors"
          >
            <BellRing size={13} />
            Nudge All
            <span className="text-[10.5px] px-1 rounded bg-amber-100 text-amber-600">
              {nudgeable.length}
            </span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Column headers */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Organization</div>
          <div className="hidden xl:block w-16 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">AUM</div>
          <div className="hidden lg:block w-16 text-center text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">LPI</div>
          <div className="hidden sm:block w-36 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Progress</div>
          <div className="w-24 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
          <div className="hidden lg:block w-24 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Last Activity</div>
          <div className="w-6 shrink-0" />
          <div className="w-4" />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[13px] text-slate-500">No organizations match your filter.</p>
          </div>
        ) : (
          filtered.map((org) => (
            <OrgRow
              key={org.id}
              org={org}
              surveyId={surveyId}
              onNudge={(o) => setNudgeOrgs([o])}
            />
          ))
        )}
      </div>

      <p className="text-center text-[11.5px] text-slate-400">
        {filtered.length} of {allOrgs.length} organizations shown
      </p>

      {/* Nudge modal */}
      {nudgeOrgs && (
        <NudgeEmailModal
          orgs={nudgeOrgs}
          onClose={() => setNudgeOrgs(null)}
        />
      )}
    </div>
  );
}
