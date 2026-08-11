"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { getOrgsBySurveyId, getContactsBySurveyId } from "@/lib/mock-data";
import type { Contact, InvitedOrg } from "@/types/survey";
import { Search, AlertTriangle, CheckCircle2, ChevronDown, Check, X, LogIn, History } from "lucide-react";

function initials(c: Contact) {
  return `${c.firstName[0] ?? ""}${c.lastName[0] ?? ""}`.toUpperCase();
}

// ─── Organization single-select ────────────────────────────────────────────
// A contact logs into their own account and links to at most one
// organization, so this is a single-select (unlike the multi-select used
// for asset-class → benchmark-category mapping). Portaled + `fixed`-
// positioned from the anchor's live bounding box so the panel isn't clipped
// by the table's rounded `overflow-hidden` container.

function OrgAssignSelect({
  orgs,
  selectedOrgId,
  onChange,
  size = "md",
}: {
  orgs: InvitedOrg[];
  selectedOrgId: string | null;
  onChange: (id: string | null) => void;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggleOpen() {
    if (!open) {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
    setOpen((o) => !o);
  }

  const selectedOrg = orgs.find((o) => o.id === selectedOrgId) ?? null;
  const isSm = size === "sm";

  return (
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className={`w-full flex items-center gap-1.5 rounded-lg border bg-white transition-colors ${
          isSm ? "min-h-8 px-2.5 py-1" : "min-h-9 px-3 py-1.5"
        } ${
          open
            ? "border-[#00b8a9] ring-1 ring-[#00b8a9]/20"
            : !selectedOrg
              ? "border-dashed border-amber-300 bg-amber-50/40"
              : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex-1 flex items-center gap-1 min-w-0">
          {selectedOrg ? (
            <span
              className={`inline-flex items-center gap-1 rounded font-medium bg-[#e8f5f3] text-[#00897b] max-w-full ${
                isSm ? "px-1.5 py-0.5 text-[10.5px]" : "px-1.5 py-0.5 text-[11.5px]"
              }`}
            >
              <span className="truncate">{selectedOrg.name}</span>
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="hover:text-[#00695c] shrink-0"
              >
                <X size={10} />
              </span>
            </span>
          ) : (
            <span className={`text-amber-700 ${isSm ? "text-[11.5px]" : "text-[13px]"}`}>Not matched</span>
          )}
        </div>
        <ChevronDown size={13} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: coords.top, left: coords.left, minWidth: Math.max(coords.width, 220) }}
            className="z-[9999] bg-white rounded-lg border border-slate-200 shadow-lg py-1.5 max-h-64 overflow-y-auto"
          >
            {selectedOrg && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-red-50 transition-colors text-red-500 text-[12px]"
              >
                <X size={12} /> Clear match
              </button>
            )}
            {orgs.map((o) => {
              const checked = o.id === selectedOrgId;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      checked ? "bg-[#00b8a9] border-[#00b8a9]" : "border-slate-300"
                    }`}
                  >
                    {checked && <Check size={11} className="text-white" strokeWidth={2.5} />}
                  </span>
                  <span className="text-[12.5px] text-slate-700 truncate">{o.name}</span>
                  <span className="text-[10px] text-slate-400 ml-auto shrink-0">{o.type}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

// ─── Needs Attention card ───────────────────────────────────────────────────

function NeedsAttentionCard({
  unmatched,
  orgs,
  onAssign,
}: {
  unmatched: Contact[];
  orgs: InvitedOrg[];
  onAssign: (contactId: string, orgId: string | null) => void;
}) {
  if (unmatched.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
        <p className="text-[12.5px] font-semibold text-emerald-800">
          Every contact is matched to an organization — nothing needs attention.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3.5 border-b border-amber-200/70">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={15} className="text-amber-600" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-amber-800">
            {unmatched.length} contact{unmatched.length !== 1 ? "s" : ""} need{unmatched.length === 1 ? "s" : ""} an organization
            match
          </p>
          <p className="text-[11.5px] text-amber-700/80 mt-0.5 max-w-2xl leading-relaxed">
            These people came from the host&rsquo;s raw contact list without a clear organization on record. Match each one to
            an existing invited organization below, or leave it unmatched if that firm doesn&rsquo;t have a platform account
            yet — each contact can only be linked to one organization.
          </p>
        </div>
      </div>

      <div className="divide-y divide-amber-100">
        {unmatched.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-7 h-7 rounded-full bg-white border border-amber-200 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-amber-700">{initials(c)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold text-slate-800 truncate">
                {c.firstName} {c.lastName}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {c.email} · Imported as{" "}
                {c.rawOrgLabel ? (
                  <span className="italic">&ldquo;{c.rawOrgLabel}&rdquo;</span>
                ) : (
                  <span className="italic text-slate-400">no company given</span>
                )}
              </p>
            </div>
            <div className="w-56 shrink-0">
              <OrgAssignSelect orgs={orgs} selectedOrgId={c.orgId} onChange={(id) => onAssign(c.id, id)} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contact row ─────────────────────────────────────────────────────────────

function ContactRow({
  contact,
  orgs,
  onAssign,
}: {
  contact: Contact;
  orgs: InvitedOrg[];
  onAssign: (contactId: string, orgId: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
      <div className="flex-1 min-w-0 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-slate-600">{initials(contact)}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 truncate">
            {contact.firstName} {contact.lastName}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{contact.title}</p>
        </div>
      </div>
      <div className="hidden md:block w-52 shrink-0">
        <p className="text-[12px] text-slate-600 truncate">{contact.email}</p>
      </div>
      <div className="hidden lg:block w-44 shrink-0">
        <p className="text-[11.5px] text-slate-500 truncate italic">
          {contact.rawOrgLabel ? <>&ldquo;{contact.rawOrgLabel}&rdquo;</> : <span className="text-slate-300">—</span>}
        </p>
      </div>
      <div className="w-56 shrink-0 flex items-center gap-1.5">
        <div className="flex-1 min-w-0">
          <OrgAssignSelect orgs={orgs} selectedOrgId={contact.orgId} onChange={(id) => onAssign(contact.id, id)} size="sm" />
        </div>
        {contact.orgId && contact.hasSubmittedBefore && (
          <span title="Has submitted a survey for this organization before" className="shrink-0 inline-flex">
            <History size={12} className="text-slate-400" strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="w-28 shrink-0 text-right">
        {contact.hasAccount ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border bg-emerald-50 border-emerald-200 text-emerald-700">
            <LogIn size={10} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border bg-slate-50 border-slate-200 text-slate-500">
            No account
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type MatchFilter = "all" | "matched" | "unmatched";

export default function ContactsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const orgs = getOrgsBySurveyId(surveyId);
  const [contacts, setContacts] = useState<Contact[]>(() => getContactsBySurveyId(surveyId));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MatchFilter>("all");

  const unmatched = contacts.filter((c) => !c.orgId);
  const matched = contacts.filter((c) => c.orgId);

  function handleAssign(contactId: string, orgId: string | null) {
    setContacts((prev) => prev.map((c) => (c.id === contactId ? { ...c, orgId } : c)));
  }

  const filtered = contacts.filter((c) => {
    const matchesFilter = filter === "all" || (filter === "matched" ? !!c.orgId : !c.orgId);
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.rawOrgLabel.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <NeedsAttentionCard unmatched={unmatched} orgs={orgs} onAssign={handleAssign} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: "all", label: "All Contacts", count: contacts.length },
            { key: "matched", label: "Matched", count: matched.length },
            { key: "unmatched", label: "Unmatched", count: unmatched.length },
          ] as { key: MatchFilter; label: string; count: number }[]
        ).map(({ key, label, count }) => {
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
              {label}
              <span className={`text-[10.5px] px-1 rounded ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}

        <div className="ml-auto relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 w-52 rounded-lg bg-white border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition-all duration-150"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Contact</div>
          <div className="hidden md:block w-52 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Email</div>
          <div className="hidden lg:block w-44 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
            Imported As
          </div>
          <div className="w-56 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Matched Organization</div>
          <div className="w-28 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Account</div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[13px] text-slate-500">No contacts match your filter.</p>
          </div>
        ) : (
          filtered.map((c) => <ContactRow key={c.id} contact={c} orgs={orgs} onAssign={handleAssign} />)
        )}
      </div>

      <p className="text-center text-[11.5px] text-slate-400">
        {filtered.length} of {contacts.length} contacts shown
      </p>
    </div>
  );
}
