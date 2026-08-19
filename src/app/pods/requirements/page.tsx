import Link from "next/link";
import {
  ClipboardList, ArrowLeft, ArrowUpRight, CheckCircle2, Circle, Users, Compass,
  MessageSquare, CalendarClock, FolderOpen, Handshake, ShieldCheck, Sparkles,
} from "lucide-react";

type ReqStatus = "shipped" | "planned";

type Requirement = {
  id: string;
  title: string;
  story: string;
  criteria: string[];
  status: ReqStatus;
  designLabel?: string;
  designHref?: string;
};

type Phase = {
  number: number;
  title: string;
  goal: string;
  icon: typeof ClipboardList;
  items: Requirement[];
};

// Example POD used to link requirements straight to a live screen —
// "pod-coinvest" is a kind:"deal" POD in mock-pods.ts with events, records,
// discussion and files already populated.
const POD = "pod-coinvest";
const EVENT = "ev-deal-review";

const PHASES: Phase[] = [
  {
    number: 1,
    title: "POD Workspace Core",
    goal: "Give every member one place to see all their PODs, and a single consistent workspace once inside one.",
    icon: ClipboardList,
    items: [
      {
        id: "1.1",
        title: "My PODs list",
        story: "As a member, I want to see every POD I belong to, sorted by what's relevant, so I know where to focus this week.",
        criteria: [
          "Card per POD: name, kind, member count, activity sparkline, last-activity label",
          "Sort by Most active, Recent activity, Next event, or A–Z",
          "Filter chips: All, New activity, I'm admin, Advisory & Governance, Awaiting my RSVP, Vendor & Deal",
          "Search by POD name, category, or member name",
          "Pin a POD to keep it at the top of the list",
        ],
        status: "shipped",
        designLabel: "My PODs list",
        designHref: "/pods",
      },
      {
        id: "1.2",
        title: "POD workspace shell",
        story: "As a member, I want a consistent header for any POD showing what it is, who runs it, and quick stats, so I can orient in seconds.",
        criteria: [
          "Header shows name, category, kind badge, and hosted-by / administered-by / created-by",
          "Stat tiles adapt to POD kind — Members/Events/Files/Email-opens for community, Curated/Awaiting/Discussion/Contributors for vendor & deal",
          "Weekly insight callout summarizing what happened this week",
          "Sub-tabs: Activity, Discussion, Records (kind-dependent), Events, Members, Files",
        ],
        status: "shipped",
        designLabel: "Open the Co-Investment POD",
        designHref: `/pods/${POD}`,
      },
      {
        id: "1.3",
        title: "“Needs you” + upcoming events",
        story: "As a member, I want the app to surface what needs my action — an RSVP, a new document, a pending invite — so nothing slips through.",
        criteria: [
          "Dismissible “Needs you” cards, each with one primary call to action",
          "“Next 14 days” sidebar rolling up events across all my PODs",
          "Personal attendance-rate indicator (e.g. “attended 3 of 4 this month”)",
        ],
        status: "shipped",
        designLabel: "My PODs list",
        designHref: "/pods",
      },
    ],
  },
  {
    number: 2,
    title: "Membership & Access",
    goal: "Let admins grow a POD's membership and let members find new ones.",
    icon: Users,
    items: [
      {
        id: "2.1",
        title: "Invite members",
        story: "As a POD admin, I want to invite people by email with a role attached, so the right people get in fast.",
        criteria: [
          "Bulk email entry (paste multiple addresses) with a role per invite",
          "Pending-invitations list tracks whether the invite email was opened",
          "Resend or revoke a pending invitation",
        ],
        status: "shipped",
        designLabel: "Members tab — Invite members",
        designHref: `/pods/${POD}/members`,
      },
      {
        id: "2.2",
        title: "Member roster & roles",
        story: "As an admin, I want to see everyone in the POD, change their role, or remove them, so membership stays accurate.",
        criteria: [
          "Searchable roster with role badges (Admin / Member / Viewer)",
          "Change a member's role or remove them from the POD",
          "CSV roster upload entry point",
        ],
        status: "shipped",
        designLabel: "Members tab",
        designHref: `/pods/${POD}/members`,
      },
      {
        id: "2.3",
        title: "Create a POD",
        story: "As a member, I want to start a new POD around a topic, vendor list, or deal, so my group has a home.",
        criteria: [
          "Name, kind (Community / Vendor / Deal), category, description",
          "Join policy: invite-only, request-to-join, or open",
          "Optional invite of members at creation time",
        ],
        status: "shipped",
        designLabel: "My PODs — Create POD",
        designHref: "/pods",
      },
      {
        id: "2.4",
        title: "Discover PODs",
        story: "As a member, I want to browse PODs outside my own organization and request to join, so I can reach a wider network.",
        criteria: [
          "Directory of discoverable PODs with host, category, and member count",
          "Open-join PODs join immediately; request-to-join PODs queue a request",
        ],
        status: "shipped",
        designLabel: "Discover PODs",
        designHref: "/pods/discover",
      },
    ],
  },
  {
    number: 3,
    title: "Events & Scheduling",
    goal: "Coordinate meetings inside a POD and track who's showing up.",
    icon: CalendarClock,
    items: [
      {
        id: "3.1",
        title: "Add & manage events",
        story: "As an admin, I want to schedule an event with a location and agenda, so members know when and where to show up.",
        criteria: [
          "Zoom, phone, or in-person location types",
          "Date, start/end time, timezone, and optional agenda",
          "Upcoming vs. Past tabs",
        ],
        status: "shipped",
        designLabel: "Events tab — Add event",
        designHref: `/pods/${POD}/events`,
      },
      {
        id: "3.2",
        title: "RSVP & attendance",
        story: "As a member, I want to RSVP Yes, No, or Maybe from the list or the event page, so hosts can plan headcount.",
        criteria: [
          "One-tap RSVP from the POD activity feed and events list",
          "Full invitee list with per-person RSVP status on the event detail page",
        ],
        status: "shipped",
        designLabel: "Event detail — Deal Review",
        designHref: `/pods/${POD}/events/${EVENT}`,
      },
      {
        id: "3.3",
        title: "Event documents",
        story: "As a member, I want to upload materials to an event and choose whether they're visible to invitees only or the whole POD.",
        criteria: [
          "Upload with event-only vs. POD-wide visibility",
          "Uploaded files also surface in the POD Files tab",
        ],
        status: "shipped",
        designLabel: "Event detail — Deal Review",
        designHref: `/pods/${POD}/events/${EVENT}`,
      },
    ],
  },
  {
    number: 4,
    title: "Discussion & Files",
    goal: "Give every POD a shared feed and a single library for everything that's been shared.",
    icon: MessageSquare,
    items: [
      {
        id: "4.1",
        title: "Discussion feed",
        story: "As a member, I want to post updates, pin important posts, like, reply, and attach files, so the POD has a running conversation.",
        criteria: [
          "Compose box with @mention and attachment affordances",
          "Pinned posts surface above the regular feed",
          "Like and reply counts per post",
        ],
        status: "shipped",
        designLabel: "Discussion tab",
        designHref: `/pods/${POD}/discussion`,
      },
      {
        id: "4.2",
        title: "Scheduling polls → events",
        story: "As a member, I want to post a time poll and have the winning option become a real event automatically.",
        criteria: [
          "Poll with multiple time options and live vote counts",
          "Converting a poll's winner creates a POD event",
        ],
        status: "shipped",
        designLabel: "Discussion tab — poll post",
        designHref: `/pods/${POD}/discussion`,
      },
      {
        id: "4.3",
        title: "Files library",
        story: "As a member, I want one place to find every file shared in the POD, tagged by where it came from.",
        criteria: [
          "Filter by source: from events, from discussion, or POD-wide",
          "Upload directly to the shared library",
        ],
        status: "shipped",
        designLabel: "Files tab",
        designHref: `/pods/${POD}/files`,
      },
    ],
  },
  {
    number: 5,
    title: "Vendor & Deal Curation",
    goal: "Give Vendor and Deal PODs a curated record list distinct from plain community discussion.",
    icon: Handshake,
    items: [
      {
        id: "5.1",
        title: "Records: Listed vs. Awaiting",
        story: "As a member, I want to see which vendors/deals are confirmed and visible versus still awaiting confirmation, so I know what's actionable.",
        criteria: [
          "“Listed / Open” tab vs. “Awaiting sponsor confirmation / permission” tab",
          "Search across records",
        ],
        status: "shipped",
        designLabel: "Records tab",
        designHref: `/pods/${POD}/records`,
      },
      {
        id: "5.2",
        title: "Add a record",
        story: "As a member, I want to submit a new vendor or deal to the POD for curation.",
        criteria: [
          "Name, category, website, contact",
          "Submission enters “Awaiting” until confirmed",
        ],
        status: "shipped",
        designLabel: "Records tab — Add record",
        designHref: `/pods/${POD}/records`,
      },
      {
        id: "5.3",
        title: "Record detail: notes & signal",
        story: "As a member, I want to see contributor notes and an AI summary on a record, and admins can resend or withdraw it.",
        criteria: [
          "Threaded notes per record with author + date",
          "AI-generated summary and a member “signal” indicator",
          "Admin actions: resend confirmation request, withdraw record",
        ],
        status: "shipped",
        designLabel: "Records tab — record detail",
        designHref: `/pods/${POD}/records`,
      },
    ],
  },
  {
    number: 6,
    title: "Admin Insights & Retention",
    goal: "Give admins visibility into engagement, and give members a reason to keep coming back.",
    icon: ShieldCheck,
    items: [
      {
        id: "6.1",
        title: "Engagement audit (admin-only)",
        story: "As an admin, I want to see whether invitation and event emails are actually being opened, so I know if the POD is reaching people.",
        criteria: [
          "“POD invitations opened” and “Event emails opened” progress bars",
          "Visible only to POD admins",
        ],
        status: "shipped",
        designLabel: "POD overview — sidebar (visible to admins)",
        designHref: `/pods/${POD}`,
      },
      {
        id: "6.2",
        title: "Weekly email digest",
        story: "As a member, I want an opt-in weekly email summarizing activity, RSVPs, and new files, so I don't have to check in daily.",
        criteria: ["Per-POD, per-member toggle", "Summarizes activity, RSVPs, and new files since the last digest"],
        status: "shipped",
        designLabel: "POD overview — sidebar toggle",
        designHref: `/pods/${POD}`,
      },
    ],
  },
  {
    number: 7,
    title: "Planned — Not Yet Designed",
    goal: "Roadmap items already stubbed in the left nav, waiting on design.",
    icon: Compass,
    items: [
      {
        id: "7.1",
        title: "Exchange",
        story: "As a member, I want a cross-POD marketplace to trade intros, deal flow, or vendor recommendations beyond a single POD.",
        criteria: ["Scope not yet defined — today a disabled nav placeholder"],
        status: "planned",
      },
      {
        id: "7.2",
        title: "Community hub",
        story: "As a member, I want an org-wide feed that surfaces highlights across all the PODs I belong to.",
        criteria: ["Scope not yet defined — today a disabled nav placeholder"],
        status: "planned",
      },
      {
        id: "7.3",
        title: "Unified calendar",
        story: "As a member, I want one calendar view across every POD's events, not just the “next 14 days” list.",
        criteria: ["Scope not yet defined — today a disabled nav placeholder"],
        status: "planned",
      },
    ],
  },
];

function StatusChip({ status }: { status: ReqStatus }) {
  if (status === "shipped") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-semibold">
        <CheckCircle2 size={11} />
        Designed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-[10.5px] font-semibold">
      <Circle size={11} />
      Planned
    </span>
  );
}

function RequirementCard({ item }: { item: Requirement }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-[10.5px] font-bold text-slate-400 tabular-nums">{item.id}</span>
          <h3 className="text-[13.5px] font-bold text-slate-900 leading-snug truncate">{item.title}</h3>
        </div>
        <StatusChip status={item.status} />
      </div>
      <p className="text-[12.5px] text-slate-600 leading-snug mb-3">{item.story}</p>
      <ul className="space-y-1.5 mb-3">
        {item.criteria.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] text-slate-500 leading-snug">
            <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-slate-300" />
            {c}
          </li>
        ))}
      </ul>
      {item.designHref ? (
        <Link
          href={item.designHref}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3650d4] hover:text-[#2a3fb0] hover:underline"
        >
          View design — {item.designLabel}
          <ArrowUpRight size={12} />
        </Link>
      ) : (
        <span className="text-[12px] font-medium text-slate-400">No design yet</span>
      )}
    </div>
  );
}

export default function PodsRequirementsPage() {
  const shippedCount = PHASES.flatMap((p) => p.items).filter((i) => i.status === "shipped").length;
  const totalCount = PHASES.flatMap((p) => p.items).length;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-7">
        <Link href="/pods" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft size={14} />
          Back to My PODs
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4361ee]/10 text-[#3650d4] text-[10.5px] font-bold uppercase tracking-wide">
                <Sparkles size={11} />
                Product Requirements
              </span>
            </div>
            <h1 className="text-[26px] font-bold text-slate-900 tracking-tight mt-2">PODs</h1>
            <p className="text-[13px] text-slate-500 mt-1 max-w-2xl">
              A member-run workspace for a community, a vendor list, or a live deal — discussion, events, files,
              and (for vendor &amp; deal PODs) a curated record list, all under one roof. This page breaks the
              product into bite-sized requirements grouped by phase, each linked to the working design for that piece.
            </p>
          </div>
          <div className="shrink-0 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-[22px] font-bold text-slate-900 leading-none">{shippedCount}<span className="text-slate-300 font-medium">/{totalCount}</span></p>
            <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide mt-1">requirements designed</p>
          </div>
        </div>

        <div className="mt-8 space-y-10">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <section key={phase.number}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-[#0f1923] text-white flex items-center justify-center font-bold text-[13px]">
                    {phase.number}
                  </div>
                  <div>
                    <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                      <Icon size={15} className="text-[#3650d4]" />
                      Phase {phase.number} — {phase.title}
                    </h2>
                    <p className="text-[12.5px] text-slate-500 mt-0.5 max-w-2xl">{phase.goal}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-12">
                  {phase.items.map((item) => (
                    <RequirementCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 flex items-center gap-2.5 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <FolderOpen size={16} className="text-slate-400 shrink-0" />
          <p className="text-[12px] text-slate-500">
            Every “View design” link opens the live prototype screen for that requirement — not a static mock.
          </p>
        </div>
      </div>
    </div>
  );
}
