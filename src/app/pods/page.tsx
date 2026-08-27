"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Compass, Pin, ChevronRight, Calendar, Sparkles, X,
  CalendarClock, FileText, UserPlus, ArrowRight,
} from "lucide-react";
import {
  getAllPods, getNeedsYouCards, rsvpToEvent, togglePinPod,
  nextUpcomingEvent, recencyRank, fmtEventDate, isUpcoming, CURRENT_USER, getDiscoverablePods,
} from "@/lib/mock-pods";
import type { Pod } from "@/types/pod";
import { KIND_STYLE } from "@/components/pods/kindStyles";
import PodAvatar, { AvatarStack } from "@/components/pods/PodAvatar";
import PodSparkline from "@/components/pods/PodSparkline";
import CreatePodModal from "@/components/pods/CreatePodModal";
import PodBreadcrumb from "@/components/pods/PodBreadcrumb";
import PodInfoTags from "@/components/pods/PodInfoTags";

type SortKey = "active" | "recent" | "next_event" | "az";
type FilterKey = "all" | "new" | "admin" | "advisory" | "rsvp" | "vendor_deal";

const NEEDS_YOU_STYLE: Record<string, { icon: typeof CalendarClock; iconBg: string; iconColor: string; label: string }> = {
  rsvp: { icon: CalendarClock, iconBg: "bg-amber-50", iconColor: "text-amber-600", label: "RSVP due" },
  document: { icon: FileText, iconBg: "bg-blue-50", iconColor: "text-blue-600", label: "New document" },
  invitation: { icon: UserPlus, iconBg: "bg-violet-50", iconColor: "text-violet-600", label: "Waiting on you" },
};

function newActivityCount(pod: Pod): number {
  return pod.discussion.filter((d) => d.isNew).length;
}

function isAdmin(pod: Pod): boolean {
  return pod.members.some((m) => m.email === CURRENT_USER.email && m.role === "admin");
}

function awaitingMyRsvp(pod: Pod): boolean {
  return pod.events.some(
    (e) => isUpcoming(e.dateISO) && e.invitees.some((i) => i.email === CURRENT_USER.email && i.status === "no_response")
  );
}

export default function PodsListPage() {
  const router = useRouter();
  const [pods, setPods] = useState<Pod[]>(() => getAllPods());
  const [dismissedNeeds, setDismissedNeeds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("active");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showCreate, setShowCreate] = useState(false);

  const needsYou = getNeedsYouCards().filter((c) => !dismissedNeeds.includes(c.id));

  const counts = useMemo(() => ({
    all: pods.length,
    new: pods.filter((p) => newActivityCount(p) > 0).length,
    admin: pods.filter(isAdmin).length,
    advisory: pods.filter((p) => p.category === "Advisory & Governance").length,
    rsvp: pods.filter(awaitingMyRsvp).length,
    vendor_deal: pods.filter((p) => p.kind === "vendor" || p.kind === "deal").length,
  }), [pods]);

  const filtered = useMemo(() => {
    let list = pods;
    if (filter === "new") list = list.filter((p) => newActivityCount(p) > 0);
    if (filter === "admin") list = list.filter(isAdmin);
    if (filter === "advisory") list = list.filter((p) => p.category === "Advisory & Governance");
    if (filter === "rsvp") list = list.filter(awaitingMyRsvp);
    if (filter === "vendor_deal") list = list.filter((p) => p.kind === "vendor" || p.kind === "deal");
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.members.some((m) => m.name.toLowerCase().includes(q)));
    }
    const sorted = [...list];
    if (sort === "active") sorted.sort((a, b) => (b.activityTrend.at(-1) ?? 0) - (a.activityTrend.at(-1) ?? 0));
    if (sort === "recent") sorted.sort((a, b) => recencyRank(a.lastActivityLabel) - recencyRank(b.lastActivityLabel));
    if (sort === "next_event") sorted.sort((a, b) => {
      const ea = nextUpcomingEvent(a)?.dateISO ?? "9999";
      const eb = nextUpcomingEvent(b)?.dateISO ?? "9999";
      return ea.localeCompare(eb);
    });
    if (sort === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
    sorted.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
    return sorted;
  }, [pods, filter, query, sort]);

  const next14 = useMemo(() => {
    const all = pods.flatMap((p) => p.events.map((e) => ({ event: e, pod: p })));
    return all
      .filter(({ event }) => isUpcoming(event.dateISO) && daysBetween(event.dateISO) <= 14)
      .sort((a, b) => a.event.dateISO.localeCompare(b.event.dateISO));
  }, [pods]);

  function daysBetween(dateISO: string) {
    return Math.round((new Date(`${dateISO}T00:00:00`).getTime() - new Date("2026-07-25T00:00:00").getTime()) / 86400000);
  }

  function handleRsvp(podId: string, eventId: string) {
    const updated = rsvpToEvent(podId, eventId, "attending");
    if (updated) setPods((prev) => prev.map((p) => (p.id === podId ? updated : p)));
  }

  function handlePin(podId: string) {
    const updated = togglePinPod(podId);
    if (updated) setPods((prev) => prev.map((p) => (p.id === podId ? updated : p)));
  }

  const needsAttentionCount = needsYou.length;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-7">
        <div className="mb-4">
          <PodBreadcrumb items={[{ label: "My PODs" }]} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">My PODs</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {pods.length} PODs{needsAttentionCount > 0 ? ` · ${needsAttentionCount} need your attention this week` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/pods/discover"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-semibold hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <Compass size={15} />
              Discover PODs
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4361ee] text-white text-[13px] font-semibold hover:bg-[#3650d4] shadow-sm hover:shadow-md transition-all"
            >
              <Plus size={15} />
              Create POD
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="min-w-0">
            {/* Needs You */}
            {needsYou.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold text-slate-500 uppercase tracking-wide">
                    <Sparkles size={13} className="text-[#4361ee]" />
                    Needs you
                  </h2>
                  <button
                    onClick={() => setDismissedNeeds(needsYou.map((c) => c.id))}
                    className="text-[12px] font-medium text-slate-400 hover:text-slate-600"
                  >
                    Dismiss all
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {needsYou.map((card) => {
                    const style = NEEDS_YOU_STYLE[card.kind];
                    const Icon = style.icon;
                    return (
                      <div key={card.id} className="relative bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <button
                          onClick={() => setDismissedNeeds((prev) => [...prev, card.id])}
                          className="absolute top-3 right-3 text-slate-300 hover:text-slate-500"
                        >
                          <X size={13} />
                        </button>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${style.iconBg} ${style.iconColor}`}>
                          <Icon size={15} />
                        </div>
                        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide mb-1">{style.label}</p>
                        <p className="text-[13px] font-semibold text-slate-800 leading-snug mb-1">{card.title}</p>
                        <p className="text-[11.5px] text-slate-400 mb-3">{card.subtitle}</p>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/pods/${card.podId}`}
                            className="text-[12px] font-semibold text-white bg-[#4361ee] hover:bg-[#3650d4] px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {card.primaryLabel}
                          </Link>
                          <button
                            onClick={() => setDismissedNeeds((prev) => [...prev, card.id])}
                            className="text-[12px] font-medium text-slate-400 hover:text-slate-600"
                          >
                            Later
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Search + sort */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search PODs, people, files"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                {([
                  { key: "active", label: "Most active" },
                  { key: "recent", label: "Recent activity" },
                  { key: "next_event", label: "Next event" },
                  { key: "az", label: "A–Z" },
                ] as { key: SortKey; label: string }[]).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSort(opt.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      sort === opt.key ? "bg-[#0f1923] text-white" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {([
                { key: "all", label: "All PODs", count: counts.all },
                { key: "new", label: "New activity", count: counts.new },
                { key: "admin", label: "I'm admin", count: counts.admin },
                { key: "advisory", label: "Advisory & Governance", count: counts.advisory },
                { key: "rsvp", label: "Awaiting my RSVP", count: counts.rsvp },
                { key: "vendor_deal", label: "Vendor & Deal PODs", count: counts.vendor_deal },
              ] as { key: FilterKey; label: string; count: number }[]).map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setFilter(chip.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors ${
                    filter === chip.key
                      ? "bg-[#0f1923] border-[#0f1923] text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {chip.label}
                  <span className={`text-[10.5px] font-bold ${filter === chip.key ? "text-white/60" : "text-slate-400"}`}>{chip.count}</span>
                </button>
              ))}
            </div>

            {/* Pod cards */}
            <div className="space-y-3">
              {filtered.map((pod) => (
                <PodRow key={pod.id} pod={pod} onRsvp={handleRsvp} onPin={handlePin} />
              ))}
              {filtered.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <p className="text-[13px] text-slate-400">No PODs match this filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800">
                  <Calendar size={14} className="text-[#3650d4]" />
                  Next 14 days
                </h3>
                <Link href="/calendar" className="text-[11.5px] font-semibold text-[#3650d4] hover:underline">Calendar</Link>
              </div>
              <div className="space-y-3">
                {next14.length === 0 && <p className="text-[12px] text-slate-400">Nothing scheduled in the next 14 days.</p>}
                {next14.map(({ event, pod }) => {
                  const { month, day } = fmtEventDate(event.dateISO);
                  const myStatus = event.invitees.find((i) => i.email === CURRENT_USER.email)?.status ?? "no_response";
                  return (
                    <Link
                      key={event.id}
                      href={`/pods/${pod.id}/events/${event.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center leading-none">
                        <span className="text-[8.5px] font-bold text-[#3650d4]">{month}</span>
                        <span className="text-[13px] font-bold text-slate-800">{day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-slate-800 truncate group-hover:text-[#3650d4] transition-colors">{event.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{pod.name} · {event.startTime} {event.timezone === "Eastern Time" ? "ET" : ""}</p>
                      </div>
                      <span className={`shrink-0 w-2 h-2 rounded-full ${myStatus === "attending" ? "bg-emerald-500" : "bg-slate-200"}`} />
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11.5px] text-slate-500 mb-1.5">You attended 3 of 4 events this month</p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#4361ee]" style={{ width: "75%" }} />
                </div>
              </div>
            </div>

            <Link
              href="/pods/discover"
              className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-[#4361ee]/40 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={15} className="text-[#4361ee]" />
                <p className="text-[12.5px] font-semibold text-slate-700">{getDiscoverablePods().length} PODs suggested for you</p>
              </div>
              <ArrowRight size={15} className="text-slate-300 group-hover:text-[#3650d4] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreatePodModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false);
            router.push(`/pods/${id}`);
          }}
        />
      )}
    </div>
  );
}

function PodRow({ pod, onRsvp, onPin }: { pod: Pod; onRsvp: (podId: string, eventId: string) => void; onPin: (podId: string) => void }) {
  const style = KIND_STYLE[pod.kind];
  const Icon = style.icon;
  const nextEvent = nextUpcomingEvent(pod);
  const myRsvp = nextEvent?.invitees.find((i) => i.email === CURRENT_USER.email)?.status;
  const admin = isAdmin(pod);
  const newCount = newActivityCount(pod);
  const curatedLabel =
    pod.kind === "deal"
      ? pod.records.filter((r) => r.status === "listed").length > 0
        ? `${pod.records.filter((r) => r.status === "listed").length} deals curated`
        : null
      : pod.kind === "vendor"
      ? pod.records.filter((r) => r.status === "listed").length > 0
        ? `${pod.records.filter((r) => r.status === "listed").length} vendors curated`
        : null
      : null;

  const recentNames = pod.activity
    .filter((a) => a.type === "member_joined")
    .slice(0, 3)
    .map((a) => (a as { memberName: string }).memberName);
  const avatarNames = recentNames.length ? recentNames : pod.members.slice(0, 3).map((m) => m.name);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${style.iconBg}`}>
          <Icon size={20} className={style.iconColor} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/pods/${pod.id}`} className="text-[15.5px] font-bold text-slate-900 hover:text-[#3650d4] transition-colors">
                  {pod.name}
                </Link>
                {newCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#4361ee] text-white text-[10.5px] font-bold">
                    {newCount} new
                  </span>
                )}
                {curatedLabel && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${style.badge}`}>
                    {curatedLabel}
                  </span>
                )}
                {admin && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 text-[10.5px] font-semibold border border-slate-200">
                    You&rsquo;re admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-400">
                <span>{pod.kind === "community" ? "Community POD" : pod.kind === "vendor" ? "Vendor POD" : "Deal POD"}</span>
                <span>·</span>
                <span>{pod.members.length} members</span>
              </div>
              <PodInfoTags hostedBy={pod.hostedBy} administeredBy={pod.administeredBy} layout="inline" className="mt-2.5" />
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[9.5px] font-bold text-slate-300 uppercase tracking-wide mb-1">Activity</p>
              <PodSparkline values={pod.activityTrend} color={style.accent} />
              <p className="text-[10.5px] text-slate-400 mt-1">{pod.isDormant ? pod.dormantLabel : pod.lastActivityLabel}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <AvatarStack names={avatarNames} />
              {nextEvent ? (
                <span className="text-[12px] text-slate-500 truncate">
                  {nextEvent.title} · {fmtEventDate(nextEvent.dateISO).full.split(",").slice(0, 2).join(",")}
                </span>
              ) : (
                <span className="text-[12px] text-slate-400">{pod.isDormant ? `Dormant · ${pod.dormantLabel}` : "No event scheduled"}</span>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {nextEvent && myRsvp === "no_response" && (
                <button
                  onClick={() => onRsvp(pod.id, nextEvent.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4361ee] text-white text-[12px] font-semibold hover:bg-[#3650d4] transition-colors"
                >
                  RSVP
                </button>
              )}
              <button
                onClick={() => onPin(pod.id)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                  pod.pinned ? "bg-amber-50 border-amber-200 text-amber-600" : "border-slate-200 text-slate-400 hover:text-slate-600"
                }`}
                title={pod.pinned ? "Unpin" : "Pin"}
              >
                <Pin size={13} fill={pod.pinned ? "currentColor" : "none"} />
              </button>
              <Link
                href={`/pods/${pod.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[12px] font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Open
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
