"use client";

import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  UserPlus, Pin, Sparkles, Users, Calendar, FileText, Mail, CheckCircle2, Clock, MessageSquare,
} from "lucide-react";
import { getPodById, CURRENT_USER, POD_KIND_LABEL, POD_KIND_RECORD_LABEL } from "@/lib/mock-pods";
import { KIND_STYLE } from "@/components/pods/kindStyles";
import PodAvatar from "@/components/pods/PodAvatar";
import InviteMembersModal from "@/components/pods/InviteMembersModal";
import PodBreadcrumb from "@/components/pods/PodBreadcrumb";
import PodInfoTags from "@/components/pods/PodInfoTags";
import PodSubTabs from "@/components/pods/PodSubTabs";
import StatCard from "@/components/pods/StatCard";
import SectionCard from "@/components/pods/SectionCard";
import { usePodCtx } from "../pod-context";

export default function PodTabsLayout({ children }: { children: React.ReactNode }) {
  const { podId } = useParams<{ podId: string }>();
  const pathname = usePathname();
  const { pod, inviteMembers, toggleDigest, togglePin } = usePodCtx();
  const [showInvite, setShowInvite] = useState(false);
  const style = KIND_STYLE[pod.kind];
  const Icon = style.icon;
  const baseHref = `/pods/${podId}`;
  const isAdmin = pod.members.some((m) => m.email === CURRENT_USER.email && m.role === "admin");

  const activeSub = (() => {
    if (pathname.includes("/discussion")) return "discussion";
    if (pathname.includes("/records")) return "records";
    if (pathname.includes("/events")) return "events";
    if (pathname.includes("/members")) return "members";
    if (pathname.includes("/files")) return "files";
    return "activity";
  })();

  const SUB_TABS = [
    { key: "activity", label: "Activity", href: "", count: null as number | null },
    { key: "discussion", label: "Discussion", href: "/discussion", count: pod.discussion.length },
    ...(pod.kind !== "community"
      ? [{ key: "records", label: POD_KIND_RECORD_LABEL[pod.kind], href: "/records", count: pod.records.length }]
      : []),
    { key: "events", label: "Events", href: "/events", count: pod.events.length },
    { key: "members", label: "Members", href: "/members", count: pod.members.length },
    { key: "files", label: "Files", href: "/files", count: pod.files.length },
  ];

  const statCards = getStatCards(pod);

  const openInvitations = pod.pendingInvitations.filter((i) => i.opened).length;
  const totalInvitations = pod.pendingInvitations.length || pod.members.length;
  const eventInvitees = pod.events.flatMap((e) => e.invitees);
  const respondedInvitees = eventInvitees.filter((i) => i.status !== "no_response").length;

  return (
    <div className="min-h-full bg-slate-50">
      {/* Sticky, full-bleed platform-style header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 pt-5">
          <div className="mb-4">
            <PodBreadcrumb items={[{ label: "My PODs", href: "/pods" }, { label: pod.name }]} />
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${style.iconBg}`}>
                <Icon size={19} className={style.iconColor} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-tight">{pod.name}</h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 text-[10.5px] font-semibold border border-slate-200">
                    {pod.category}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${style.badge}`}>
                    {POD_KIND_LABEL[pod.kind]}
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 mt-1">{pod.description}</p>
                <p className="text-[11.5px] text-slate-400 mt-1.5 flex items-center gap-1 flex-wrap">
                  <span>Hosted by <span className="font-medium text-slate-500">{pod.hostedBy}</span></span>
                  {pod.administeredBy && (
                    <>
                      <span>·</span>
                      <span>Administered by <span className="font-medium text-slate-500">{pod.administeredBy}{pod.administeredByOrg ? ` · ${pod.administeredByOrg}` : ""}</span></span>
                    </>
                  )}
                  {pod.createdBy && (
                    <>
                      <span>·</span>
                      <span>Created by <span className="font-medium text-slate-500">{pod.createdBy}</span></span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={togglePin}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                  pod.pinned ? "bg-amber-50 border-amber-200 text-amber-600" : "border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200"
                }`}
                title={pod.pinned ? "Unpin POD" : "Pin POD"}
              >
                <Pin size={14} fill={pod.pinned ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0066f3] text-white text-[13px] font-semibold hover:bg-[#0052c2] shadow-sm hover:shadow-md transition-all"
              >
                <UserPlus size={15} />
                Invite Members
              </button>
            </div>
          </div>

          <PodSubTabs
            activeKey={activeSub}
            tabs={SUB_TABS.map((tab) => ({ key: tab.key, label: tab.label, href: `${baseHref}${tab.href}` }))}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} hint={s.hint} color={s.color} />
          ))}
        </div>

        {/* Weekly insight */}
        {pod.weeklyInsight && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#0066f3]/[0.06] border border-[#0066f3]/15">
            <Sparkles size={14} className="text-[#0052c2] shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-slate-700 leading-snug">
              <span className="font-bold text-[#0052c2]">This week in {pod.name}: </span>
              {pod.weeklyInsight}
            </p>
          </div>
        )}

        {/* Body: content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="min-w-0 space-y-4">{children}</div>

          <div className="space-y-4">
            <SectionCard title="POD Details" action={<Link href={baseHref} className="text-[11.5px] font-semibold text-[#0052c2] hover:underline">See all</Link>}>
              <PodInfoTags hostedBy={pod.hostedBy} administeredBy={pod.administeredBy} type={pod.category} />
            </SectionCard>

            <SectionCard title="Members" action={<Link href={`${baseHref}/members`} className="text-[11.5px] font-semibold text-[#0052c2] hover:underline">See all</Link>}>
              <div className="space-y-2.5">
                {pod.members.slice(0, 2).map((m) => (
                  <div key={m.id} className="flex items-center gap-2.5">
                    <PodAvatar name={m.name} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-slate-800 truncate">{m.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{m.org}</p>
                    </div>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      m.role === "admin" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      {m.role[0].toUpperCase() + m.role.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {isAdmin && (
              <SectionCard title="Engagement Audit" badge="Admin only">
                <div className="space-y-3">
                  <EngagementBar label="POD invitations opened" done={openInvitations} total={Math.max(1, totalInvitations)} />
                  <EngagementBar label="Event emails opened" done={respondedInvitees} total={Math.max(1, eventInvitees.length)} />
                </div>
                <p className="text-[10.5px] text-slate-400 mt-3 leading-snug">Tracks whether invitation and event emails were opened. Visible to POD admins only.</p>
              </SectionCard>
            )}

            <button
              onClick={toggleDigest}
              className="w-full text-left flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors"
            >
              <span className={`shrink-0 w-9 h-5 rounded-full mt-0.5 relative transition-colors ${pod.digestEnabled ? "bg-[#0066f3]" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${pod.digestEnabled ? "left-4" : "left-0.5"}`} />
              </span>
              <span>
                <span className="block text-[12.5px] font-bold text-slate-800">Weekly email digest</span>
                <span className="block text-[11.5px] text-slate-400 mt-0.5">A summary of activity, RSVPs and new files, every Monday.</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {showInvite && (
        <InviteMembersModal
          onClose={() => setShowInvite(false)}
          onInvite={(entries) => {
            inviteMembers(entries);
            setShowInvite(false);
          }}
        />
      )}
    </div>
  );
}

function EngagementBar({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[11.5px] mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-700">{done} of {total}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-[#0066f3]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type StatCardData = {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: "green" | "amber" | "blue" | "violet" | "navy" | "slate";
};

function getStatCards(pod: ReturnType<typeof getPodById>): StatCardData[] {
  if (!pod) return [];
  if (pod.kind === "deal" || pod.kind === "vendor") {
    const listed = pod.records.filter((r) => r.status === "listed").length;
    const awaiting = pod.records.filter((r) => r.status === "awaiting").length;
    const newDiscussion = pod.discussion.filter((d) => d.isNew).length;
    const contributors = new Set(pod.discussion.map((d) => d.author)).size;
    return [
      { label: pod.kind === "deal" ? "Deals Curated" : "Vendors Curated", value: listed, hint: `by ${pod.members.length} members`, icon: CheckCircle2, color: "green" },
      { label: pod.kind === "deal" ? "Awaiting Sponsor" : "Awaiting Permission", value: awaiting, hint: "not yet visible", icon: Clock, color: "amber" },
      { label: "Discussion", value: newDiscussion, hint: "new this week", icon: MessageSquare, color: "blue" },
      { label: "Contributors", value: contributors, hint: `of ${pod.members.length} members`, icon: Users, color: "navy" },
    ];
  }
  const totalFileSize = pod.files.length;
  const openedInvites = pod.pendingInvitations.filter((i) => i.opened).length;
  const pct = pod.pendingInvitations.length ? Math.round((openedInvites / pod.pendingInvitations.length) * 100) : 100;
  return [
    { label: "Members", value: pod.members.length, hint: "+2 this week", icon: Users, color: "navy" },
    { label: "Events", value: pod.events.length, hint: pod.events[0] ? `next: ${pod.events[0].dateISO.slice(5)}` : "none scheduled", icon: Calendar, color: "blue" },
    { label: "Files", value: totalFileSize, icon: FileText, color: "slate" },
    { label: "Email Opens", value: `${pct}%`, hint: "invites opened", icon: Mail, color: "green" },
  ];
}
