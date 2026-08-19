"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, Plus, X, AlertTriangle, Users, Sparkles,
  ClipboardCheck, RefreshCw, ChevronRight, Handshake,
} from "lucide-react";
import {
  getAllClients, STATUS_CONFIG, PRIORITY_CONFIG, getClientNextMilestone,
  getActiveCycle, getMostRecentCompletedCycle, responseRate, fmtDate,
} from "@/lib/mock-clients";
import type { Client, ClientStatus, ClientPriority } from "@/types/client";

type StatusFilter = "all" | ClientStatus;
type SortKey = "priority" | "next_date" | "name" | "status";

const STATUS_ORDER: ClientStatus[] = ["prospect", "onboarding", "survey_live", "reporting", "renewal_due", "inactive"];
const PRIORITY_RANK: Record<ClientPriority, number> = { strategic: 0, standard: 1, low_touch: 2 };

function initials(name: string) {
  return name
    .replace(/[,.&]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Add Client modal ───────────────────────────────────────────────────────

function AddClientModal({ onClose, onAdd }: { onClose: () => void; onAdd: (client: Client) => void }) {
  const [name, setName] = useState("");
  const [segment, setSegment] = useState("");
  const [priority, setPriority] = useState<ClientPriority>("standard");
  const [contactName, setContactName] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const canSubmit = name.trim() !== "" && contactName.trim() !== "" && contactEmail.trim() !== "";

  function handleSubmit() {
    if (!canSubmit) return;
    const id = `client-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    onAdd({
      id,
      name: name.trim(),
      segment: segment.trim() || "Uncategorized",
      priority,
      status: "prospect",
      accountOwner: "Unassigned",
      clientSince: null,
      primaryContactName: contactName.trim(),
      primaryContactTitle: contactTitle.trim() || "—",
      primaryContactEmail: contactEmail.trim(),
      surveys: [],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5f3] flex items-center justify-center">
              <Users size={15} className="text-[#3147af]" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800">Add Client</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Creates a new prospect record in the pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3.5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Client Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wilshire Advisors"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#4361ee] transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Segment</label>
              <input
                type="text"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="e.g. Investment Consultant"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#4361ee] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ClientPriority)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-[#4361ee] transition-colors"
              >
                <option value="strategic">Strategic</option>
                <option value="standard">Standard</option>
                <option value="low_touch">Low-Touch</option>
              </select>
            </div>
          </div>
          <div className="pt-1 border-t border-slate-100" />
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Primary Contact Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#4361ee] transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Title</label>
              <input
                type="text"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                placeholder="Head of ESG"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#4361ee] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="jane@client.com"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#4361ee] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
          <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={12} /> Add Client
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────

function ClientRow({ client }: { client: Client }) {
  const st = STATUS_CONFIG[client.status];
  const pr = PRIORITY_CONFIG[client.priority];
  const milestone = getClientNextMilestone(client);
  const current = getActiveCycle(client);
  const past = getMostRecentCompletedCycle(client);
  const currentRate = responseRate(current);
  const pastRate = responseRate(past);

  return (
    <Link
      href={`/client-crm/${client.id}`}
      className="group flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors"
    >
      <div className="flex-1 min-w-0 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-slate-600">{initials(client.name)}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 group-hover:text-[#3147af] transition-colors truncate">{client.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{client.segment} · {client.accountOwner}</p>
        </div>
      </div>

      <div className="hidden sm:block w-24 shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${pr.badge}`}>
          {pr.label}
        </span>
      </div>

      <div className="w-28 shrink-0">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${st.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>
      </div>

      <div className="hidden lg:block w-40 shrink-0">
        {current ? (
          <>
            <p className="text-[12px] font-medium text-slate-700 truncate">{current.name} &rsquo;{String(current.year).slice(2)}</p>
            <p className="text-[10.5px] text-slate-400">
              {currentRate !== null ? `${currentRate}% response · ${current.submitted}/${current.totalInvited}` : "Not yet launched"}
            </p>
          </>
        ) : (
          <p className="text-[11.5px] text-slate-300">No active survey</p>
        )}
      </div>

      <div className="hidden xl:block w-32 shrink-0">
        {past ? (
          <>
            <p className="text-[12px] text-slate-600 truncate">{past.year}</p>
            <p className="text-[10.5px] text-slate-400">{pastRate !== null ? `${pastRate}% final response` : "—"}</p>
          </>
        ) : (
          <p className="text-[11.5px] text-slate-300">First survey</p>
        )}
      </div>

      <div className="w-36 shrink-0 text-right">
        {milestone ? (
          <>
            <p className={`text-[12px] font-medium ${milestone.overdue ? "text-red-600" : "text-slate-700"}`}>{milestone.label}</p>
            <p className={`text-[10.5px] ${milestone.overdue ? "text-red-500" : "text-slate-400"}`}>
              {milestone.overdue ? `${fmtDate(milestone.date)} · overdue` : `${fmtDate(milestone.date)} · ${milestone.days}d`}
            </p>
          </>
        ) : (
          <p className="text-[11.5px] text-slate-300">No dates set</p>
        )}
      </div>

      <ChevronRight size={14} className="shrink-0 text-slate-300 group-hover:text-[#4361ee] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────

export default function ClientCrmPage() {
  const [clients, setClients] = useState<Client[]>(() => getAllClients());
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("priority");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = { all: clients.length, prospect: 0, onboarding: 0, survey_live: 0, reporting: 0, renewal_due: 0, inactive: 0 };
    clients.forEach((c) => { base[c.status]++; });
    return base;
  }, [clients]);

  const needsAttention = useMemo(
    () => clients.filter((c) => c.status === "renewal_due" || getClientNextMilestone(c)?.overdue),
    [clients]
  );

  const filtered = useMemo(() => {
    let list = clients.filter((c) => filter === "all" || c.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.primaryContactName.toLowerCase().includes(q) ||
          c.accountOwner.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "priority") {
      sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.name.localeCompare(b.name));
    } else if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "status") {
      sorted.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.name.localeCompare(b.name));
    } else if (sort === "next_date") {
      sorted.sort((a, b) => {
        const ma = getClientNextMilestone(a);
        const mb = getClientNextMilestone(b);
        if (!ma && !mb) return a.name.localeCompare(b.name);
        if (!ma) return 1;
        if (!mb) return -1;
        return ma.days - mb.days;
      });
    }
    return sorted;
  }, [clients, filter, sort, search]);

  const activeOnboardingCount = counts.onboarding;
  const surveyLiveCount = counts.survey_live;

  return (
    <div className="min-h-full bg-slate-50">
      {showAdd && (
        <AddClientModal onClose={() => setShowAdd(false)} onAdd={(c) => { setClients((prev) => [c, ...prev]); setShowAdd(false); }} />
      )}

      {/* Header band */}
      <div className="bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="h-[3px] bg-gradient-to-r from-[#4361ee] via-[#4361ee]/70 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-[#0f1923] flex items-center justify-center">
                <Handshake size={18} className="text-[#4361ee]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[18px] font-bold text-slate-900 leading-tight">Client CRM</h1>
                <p className="text-[12px] text-slate-400 mt-1 max-w-xl">
                  Track every client relationship from prospecting through onboarding, survey delivery, and reporting —
                  with the key dates and action items the LPS team needs to stay ahead of.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0f1923] text-white text-[12.5px] font-medium hover:bg-[#1a2733] transition-colors"
            >
              <Plus size={14} /> Add Client
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Total Clients", value: clients.length, color: "text-slate-600", bg: "bg-slate-100" },
          { icon: Sparkles, label: "Active Onboarding", value: activeOnboardingCount, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: RefreshCw, label: "Surveys Live", value: surveyLiveCount, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: AlertTriangle, label: "Needs Attention", value: needsAttention.length, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Needs attention strip */}
      {needsAttention.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          <p className="text-[12.5px] text-amber-800 flex-1">
            <span className="font-semibold">{needsAttention.length} client{needsAttention.length !== 1 ? "s" : ""}</span> need
            attention — an overdue milestone or a renewal conversation that hasn&rsquo;t been scheduled:{" "}
            <span className="font-medium">{needsAttention.slice(0, 3).map((c) => c.name).join(", ")}</span>
            {needsAttention.length > 3 && ` +${needsAttention.length - 3} more`}
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150 ${
            filter === "all" ? "bg-[#0f1923] border-[#0f1923] text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          All
          <span className={`text-[10.5px] px-1 rounded ${filter === "all" ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{counts.all}</span>
        </button>
        {STATUS_ORDER.map((key) => {
          const cfg = STATUS_CONFIG[key];
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150 ${
                active ? "bg-[#0f1923] border-[#0f1923] text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
              <span className={`text-[10.5px] px-1 rounded ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{counts[key]}</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[12px] text-slate-600 focus:outline-none focus:border-slate-300 transition-colors"
          >
            <option value="priority">Sort: Priority</option>
            <option value="next_date">Sort: Next Key Date</option>
            <option value="status">Sort: Status</option>
            <option value="name">Sort: Name</option>
          </select>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 w-52 rounded-lg bg-white border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition-all duration-150"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Client</div>
          <div className="hidden sm:block w-24 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Priority</div>
          <div className="w-28 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
          <div className="hidden lg:block w-40 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Current Survey</div>
          <div className="hidden xl:block w-32 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Previous Survey</div>
          <div className="w-36 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Next Key Date</div>
          <div className="w-3.5" />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <ClipboardCheck size={18} className="text-slate-300" />
            </div>
            <p className="text-[13px] font-medium text-slate-600">No clients match your filters</p>
            <p className="text-[11.5px] text-slate-400 mt-1 max-w-xs">Try a different status filter or search term.</p>
          </div>
        ) : (
          filtered.map((c) => <ClientRow key={c.id} client={c} />)
        )}
      </div>

      <p className="text-center text-[11.5px] text-slate-400">
        {filtered.length} of {clients.length} clients shown
      </p>
      </div>
    </div>
  );
}
