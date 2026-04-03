"use client";

import { useState, useRef, useMemo } from "react";
import {
  Briefcase, Plus, Upload, Search, LayoutGrid, Table2, ChevronDown,
  ChevronUp, X, CheckCircle, Trash2, Send, Edit2, Building2,
  MapPin, Calendar, TrendingUp, DollarSign, Users, Filter,
  FileText, AlertCircle, ExternalLink,
} from "lucide-react";
import {
  MOCK_PORTFOLIO_MANAGERS,
  getTotalCommitted,
  getTotalFunds,
  ASSET_CLASSES,
} from "@/lib/mock-portfolio-data";
import { MOCK_ORGS, MOCK_SURVEYS } from "@/lib/mock-data";
import { PortfolioManager, PortfolioFund, FundStatus } from "@/types/portfolio";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt$M(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}B` : `$${n}M`;
}

function fmtPct(n: number) {
  return `${n}%`;
}

const ASSET_CLASS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Private Equity":  { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400" },
  "Venture Capital": { bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-400" },
  "Private Credit":  { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
  "Real Assets":     { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  "Infrastructure":  { bg: "bg-teal-50",    text: "text-teal-700",    dot: "bg-teal-400" },
  "Real Estate":     { bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-400" },
};

function assetColor(ac: string) {
  return ASSET_CLASS_COLORS[ac] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
}

const FUND_STATUS_CFG: Record<FundStatus, { label: string; badge: string }> = {
  active:     { label: "Active",     badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  harvesting: { label: "Harvesting", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  closed:     { label: "Closed",     badge: "bg-slate-100 text-slate-500 border-slate-200" },
};

// ─── StatsBar ────────────────────────────────────────────────────────────────

function StatsBar({ managers }: { managers: PortfolioManager[] }) {
  const totalCommitted = getTotalCommitted(managers);
  const totalFunds = getTotalFunds(managers);
  const assetClasses = new Set(managers.map((m) => m.assetClass)).size;
  const withLpi = managers.filter((m) => m.lpiScore != null).length;

  const stats = [
    { label: "Managers", value: managers.length, icon: Building2, color: "text-violet-600 bg-violet-50" },
    { label: "Funds", value: totalFunds, icon: Briefcase, color: "text-sky-600 bg-sky-50" },
    { label: "Total Committed", value: fmt$M(totalCommitted), icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
    { label: "Asset Classes", value: assetClasses, icon: Filter, color: "text-amber-600 bg-amber-50" },
    { label: "LPI Scored", value: `${withLpi} / ${managers.length}`, icon: TrendingUp, color: "text-teal-600 bg-teal-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
            <Icon size={15} />
          </div>
          <div>
            <p className="text-[18px] font-bold text-slate-800 leading-none">{value}</p>
            <p className="text-[10.5px] text-slate-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FundRow ─────────────────────────────────────────────────────────────────

function FundRow({
  fund,
  onRemove,
}: {
  fund: PortfolioFund;
  onRemove: () => void;
}) {
  const cfg = FUND_STATUS_CFG[fund.status];
  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 hover:bg-slate-100/60 transition-colors">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 ml-1" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-slate-700 truncate">{fund.name}</p>
        <p className="text-[10.5px] text-slate-400">{fund.strategy} · {fund.geography}</p>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-[11px]">
        <div className="w-14 text-right">
          <p className="font-semibold text-slate-700">{fund.vintage}</p>
          <p className="text-slate-400">Vintage</p>
        </div>
        <div className="w-18 text-right">
          <p className="font-semibold text-slate-700">{fmt$M(fund.commitment)}</p>
          <p className="text-slate-400">Committed</p>
        </div>
        <div className="w-14 text-right">
          <p className="font-semibold text-slate-700">{fmtPct(fund.called)}</p>
          <p className="text-slate-400">Called</p>
        </div>
        <div className="w-16 text-right">
          <p className="font-semibold text-slate-700">{fmt$M(fund.nav)}</p>
          <p className="text-slate-400">NAV</p>
        </div>
        <div className="w-12 text-right">
          <p className="font-semibold text-slate-700">{fund.tvpi.toFixed(2)}x</p>
          <p className="text-slate-400">TVPI</p>
        </div>
        <div className="w-12 text-right">
          <p className="font-semibold text-slate-700">{fund.dpi.toFixed(2)}x</p>
          <p className="text-slate-400">DPI</p>
        </div>
      </div>
      <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${cfg.badge}`}>
        {cfg.label}
      </span>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-red-400"
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ─── ManagerCard ─────────────────────────────────────────────────────────────

function ManagerCard({
  manager,
  selected,
  onSelect,
  onRemove,
  onAddFund,
  onRemoveFund,
}: {
  manager: PortfolioManager;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onAddFund: () => void;
  onRemoveFund: (fundId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ac = assetColor(manager.assetClass);
  const totalCommitted = manager.funds.reduce((s, f) => s + f.commitment, 0);

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all duration-150 overflow-hidden
      ${selected ? "border-[#00b8a9] ring-1 ring-[#00b8a9]/30" : "border-slate-200 hover:border-slate-300"}`}>

      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={onSelect}
            className={`shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
              ${selected ? "bg-[#00b8a9] border-[#00b8a9]" : "border-slate-300 hover:border-slate-400"}`}
          >
            {selected && <CheckCircle size={10} className="text-white" strokeWidth={3} />}
          </button>

          {/* Avatar */}
          <div className="shrink-0 w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">
              {manager.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate">{manager.name}</p>
              <button
                onClick={onRemove}
                className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${ac.bg} ${ac.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ac.dot}`} />
                {manager.assetClass}
              </span>
              <span className="text-[10.5px] text-slate-400 flex items-center gap-0.5">
                <MapPin size={9} /> {manager.location}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-50">
          <div>
            <p className="text-[11.5px] font-semibold text-slate-700">{manager.aum}</p>
            <p className="text-[10px] text-slate-400">Mgr AUM</p>
          </div>
          <div>
            <p className="text-[11.5px] font-semibold text-slate-700">{fmt$M(totalCommitted)}</p>
            <p className="text-[10px] text-slate-400">Committed</p>
          </div>
          <div>
            {manager.lpiScore != null ? (
              <>
                <p className={`text-[11.5px] font-semibold ${manager.lpiScore >= 8 ? "text-emerald-600" : manager.lpiScore >= 6.5 ? "text-amber-600" : "text-red-500"}`}>
                  {manager.lpiScore}
                </p>
                <p className="text-[10px] text-slate-400">LPI Score</p>
              </>
            ) : (
              <>
                <p className="text-[11.5px] text-slate-300">—</p>
                <p className="text-[10px] text-slate-400">LPI Score</p>
              </>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Users size={10} className="text-slate-500" />
          </div>
          <p className="text-[10.5px] text-slate-500 truncate">{manager.contactName} · {manager.contactTitle}</p>
        </div>

        {/* Tags */}
        {manager.tags && manager.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {manager.tags.map((t) => (
              <span key={t} className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Fund expand/collapse */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <span>{manager.funds.length} fund{manager.funds.length !== 1 ? "s" : ""} · {fmt$M(totalCommitted)} committed</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {expanded && (
          <div>
            {manager.funds.map((fund) => (
              <FundRow
                key={fund.id}
                fund={fund}
                onRemove={() => onRemoveFund(fund.id)}
              />
            ))}
            <div className="border-t border-slate-100">
              <button
                onClick={onAddFund}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-[11px] font-medium text-[#00897b] hover:bg-[#e8f5f3] transition-colors"
              >
                <Plus size={12} />
                Add Fund
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Table view ──────────────────────────────────────────────────────────────

function TableView({
  managers,
  selectedIds,
  onToggle,
  onRemove,
}: {
  managers: PortfolioManager[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
        <div className="w-4 shrink-0" />
        <div className="flex-1">Manager</div>
        <div className="hidden lg:block w-28">Asset Class</div>
        <div className="hidden md:block w-20 text-right">Mgr AUM</div>
        <div className="hidden md:block w-20 text-right">Committed</div>
        <div className="hidden lg:block w-14 text-right">Funds</div>
        <div className="hidden lg:block w-14 text-right">LPI</div>
        <div className="hidden xl:block w-28">Contact</div>
        <div className="w-6 shrink-0" />
      </div>
      {managers.map((m) => {
        const totalCommitted = m.funds.reduce((s, f) => s + f.commitment, 0);
        const ac = assetColor(m.assetClass);
        const sel = selectedIds.has(m.id);
        return (
          <div
            key={m.id}
            className={`group flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0 transition-colors
              ${sel ? "bg-[#e8f5f3]/40" : "hover:bg-slate-50/80"}`}
          >
            <button
              onClick={() => onToggle(m.id)}
              className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                ${sel ? "bg-[#00b8a9] border-[#00b8a9]" : "border-slate-300 hover:border-slate-400"}`}
            >
              {sel && <CheckCircle size={9} className="text-white" strokeWidth={3} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#0f1923] flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-white">{m.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <p className="text-[12.5px] font-semibold text-slate-800 truncate">{m.name}</p>
              </div>
              <p className="text-[10.5px] text-slate-400 ml-8 truncate">{m.location}</p>
            </div>
            <div className="hidden lg:block w-28">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ac.bg} ${ac.text}`}>
                {m.assetClass}
              </span>
            </div>
            <div className="hidden md:block w-20 text-right">
              <p className="text-[12px] font-medium text-slate-700">{m.aum}</p>
            </div>
            <div className="hidden md:block w-20 text-right">
              <p className="text-[12px] font-medium text-slate-700">{fmt$M(totalCommitted)}</p>
            </div>
            <div className="hidden lg:block w-14 text-right">
              <p className="text-[12px] text-slate-600">{m.funds.length}</p>
            </div>
            <div className="hidden lg:block w-14 text-right">
              {m.lpiScore != null
                ? <p className={`text-[12px] font-semibold ${m.lpiScore >= 8 ? "text-emerald-600" : "text-amber-600"}`}>{m.lpiScore}</p>
                : <p className="text-[12px] text-slate-300">—</p>
              }
            </div>
            <div className="hidden xl:block w-28 truncate">
              <p className="text-[11px] text-slate-500 truncate">{m.contactName}</p>
            </div>
            <button
              onClick={() => onRemove(m.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── AddManagerModal ──────────────────────────────────────────────────────────

function AddManagerModal({
  existing: existingIds,
  onAdd,
  onClose,
}: {
  existing: Set<string>;
  onAdd: (m: PortfolioManager) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"directory" | "custom">("directory");
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState<string | null>(null);

  // Custom form state
  const [form, setForm] = useState({
    name: "", assetClass: "Private Equity", location: "", aum: "",
    contactName: "", contactEmail: "", contactTitle: "", notes: "",
  });

  const directoryOrgs = MOCK_ORGS.filter(
    (o) =>
      !existingIds.has("pm-" + o.id.replace("org-", "")) &&
      (search === "" ||
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.assetClass.toLowerCase().includes(search.toLowerCase()))
  );

  function handleAddFromDirectory(orgId: string) {
    const org = MOCK_ORGS.find((o) => o.id === orgId);
    if (!org) return;
    const m: PortfolioManager = {
      id: `pm-${Date.now()}`,
      orgId: org.id,
      name: org.name,
      contactName: org.contactName,
      contactEmail: org.contactEmail,
      contactTitle: org.contactTitle,
      assetClass: org.assetClass,
      strategy: org.strategyFocus,
      location: org.location,
      aum: org.aum,
      aumRaw: org.aumRaw,
      addedDate: "Mar 31, 2026",
      lpiScore: org.lpiScore,
      funds: [],
    };
    setAdded(orgId);
    setTimeout(() => { onAdd(m); onClose(); }, 900);
  }

  function handleAddCustom() {
    if (!form.name.trim()) return;
    const m: PortfolioManager = {
      id: `pm-${Date.now()}`,
      name: form.name,
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactTitle: form.contactTitle,
      assetClass: form.assetClass,
      strategy: [],
      location: form.location,
      aum: form.aum || "—",
      aumRaw: 0,
      addedDate: "Mar 31, 2026",
      notes: form.notes,
      funds: [],
    };
    onAdd(m);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <Building2 size={14} className="text-violet-600" />
            </div>
            <p className="text-[13.5px] font-semibold text-slate-800">Add Manager</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(["directory", "custom"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px
                ${tab === t ? "border-[#00b8a9] text-[#00897b]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {t === "directory" ? "Search Directory" : "Add Custom"}
            </button>
          ))}
        </div>

        {tab === "directory" ? (
          <div className="p-4">
            <div className="relative mb-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                autoFocus
                type="text"
                placeholder="Search by name or asset class…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
              />
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {directoryOrgs.length === 0 ? (
                <p className="text-center text-[12px] text-slate-400 py-8">No matching organizations found.</p>
              ) : directoryOrgs.map((org) => {
                const ac = assetColor(org.assetClass);
                const isAdded = added === org.id;
                return (
                  <div key={org.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#0f1923] flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-white">{org.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-slate-800 truncate">{org.name}</p>
                      <p className="text-[10.5px] text-slate-400">{org.contactName} · {org.location}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ac.bg} ${ac.text} shrink-0`}>
                      {org.assetClass}
                    </span>
                    <button
                      onClick={() => handleAddFromDirectory(org.id)}
                      className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors
                        ${isAdded
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-[#0f1923] text-white hover:bg-[#1a2733]"}`}
                    >
                      {isAdded ? "Added ✓" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {[
              { label: "Manager Name *", key: "name", placeholder: "e.g. Acme Capital" },
              { label: "Location", key: "location", placeholder: "e.g. New York, NY" },
              { label: "AUM", key: "aum", placeholder: "e.g. $50B" },
              { label: "Contact Name", key: "contactName", placeholder: "Full name" },
              { label: "Contact Email", key: "contactEmail", placeholder: "email@firm.com" },
              { label: "Contact Title", key: "contactTitle", placeholder: "e.g. Managing Director" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
                />
              </div>
            ))}
            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Asset Class</label>
              <select
                value={form.assetClass}
                onChange={(e) => setForm((f) => ({ ...f, assetClass: e.target.value }))}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 text-[12.5px] text-slate-700 focus:outline-none focus:border-slate-300 bg-white"
              >
                {ASSET_CLASSES.map((ac) => <option key={ac}>{ac}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</label>
              <textarea
                rows={2}
                placeholder="Optional notes…"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleAddCustom}
                disabled={!form.name.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] disabled:opacity-40 transition-colors"
              >
                <Plus size={12} />
                Add Manager
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AddFundModal ─────────────────────────────────────────────────────────────

function AddFundModal({
  managerName,
  managerId,
  onAdd,
  onClose,
}: {
  managerName: string;
  managerId: string;
  onAdd: (f: PortfolioFund) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "", vintage: new Date().getFullYear().toString(),
    strategy: "", geography: "North America",
    commitment: "", called: "0", nav: "", dpi: "0.00", tvpi: "1.00",
    status: "active" as FundStatus,
  });

  function handleSubmit() {
    if (!form.name.trim() || !form.commitment) return;
    onAdd({
      id: `f-${Date.now()}`,
      managerId,
      name: form.name,
      vintage: parseInt(form.vintage),
      strategy: form.strategy || "—",
      geography: form.geography,
      commitment: parseFloat(form.commitment) || 0,
      called: parseFloat(form.called) || 0,
      nav: parseFloat(form.nav) || 0,
      dpi: parseFloat(form.dpi) || 0,
      tvpi: parseFloat(form.tvpi) || 1,
      status: form.status,
    });
    onClose();
  }

  const fields: { label: string; key: string; placeholder: string; type?: string }[] = [
    { label: "Fund Name *", key: "name", placeholder: "e.g. Acme Capital Fund III" },
    { label: "Vintage Year", key: "vintage", placeholder: "2023", type: "number" },
    { label: "Strategy", key: "strategy", placeholder: "e.g. Large-Cap Buyout" },
    { label: "Geography", key: "geography", placeholder: "e.g. North America" },
    { label: "Commitment ($M) *", key: "commitment", placeholder: "50", type: "number" },
    { label: "% Called", key: "called", placeholder: "0", type: "number" },
    { label: "NAV ($M)", key: "nav", placeholder: "0", type: "number" },
    { label: "TVPI", key: "tvpi", placeholder: "1.00", type: "number" },
    { label: "DPI", key: "dpi", placeholder: "0.00", type: "number" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-[13.5px] font-semibold text-slate-800">Add Fund</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{managerName}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {fields.map(({ label, key, placeholder, type }) => (
            <div key={key} className={key === "name" ? "col-span-2" : ""}>
              <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
              <input
                type={type || "text"}
                placeholder={placeholder}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
              />
            </div>
          ))}
          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FundStatus }))}
              className="w-full h-8 px-3 rounded-lg border border-slate-200 text-[12.5px] text-slate-700 focus:outline-none bg-white"
            >
              <option value="active">Active</option>
              <option value="harvesting">Harvesting</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100">
          <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.commitment}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] disabled:opacity-40"
          >
            <Plus size={12} /> Add Fund
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── UploadCSVModal ───────────────────────────────────────────────────────────

function UploadCSVModal({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<"drop" | "preview" | "done">("drop");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewRows = [
    { name: "Summit Partners", assetClass: "Private Equity", commitment: "$60M", contact: "Alex Morgan" },
    { name: "New Enterprise Associates", assetClass: "Venture Capital", commitment: "$35M", contact: "Sam Liu" },
    { name: "Oaktree Capital", assetClass: "Private Credit", commitment: "$90M", contact: "Dana Price" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
              <Upload size={14} className="text-sky-600" />
            </div>
            <p className="text-[13.5px] font-semibold text-slate-800">Upload Portfolio CSV</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {stage === "drop" && (
          <div className="p-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); setStage("preview"); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
                ${dragging ? "border-[#00b8a9] bg-[#e8f5f3]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText size={22} className="text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-slate-700">Drop your CSV here</p>
                <p className="text-[11.5px] text-slate-400 mt-1">or click to browse · .csv files only</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={() => setStage("preview")} />
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
              <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11.5px] font-medium text-amber-700">Expected columns</p>
                <p className="text-[11px] text-amber-600 mt-0.5">
                  Manager Name, Asset Class, Location, AUM, Contact Name, Contact Email, Contact Title, Fund Name, Vintage, Commitment ($M), Called (%), NAV ($M), TVPI, DPI, Status
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center">
              <button className="flex items-center gap-1.5 text-[11.5px] text-slate-500 hover:text-slate-700 transition-colors">
                <ExternalLink size={11} />
                Download template CSV
              </button>
            </div>
          </div>
        )}

        {stage === "preview" && (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} className="text-emerald-500" />
              <p className="text-[12.5px] font-medium text-slate-700">portfolio_managers.csv — 3 records detected</p>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-4 gap-0 px-3 py-2 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <span>Manager</span><span>Asset Class</span><span>Committed</span><span>Contact</span>
              </div>
              {previewRows.map((r) => (
                <div key={r.name} className="grid grid-cols-4 gap-0 px-3 py-2 border-b border-slate-50 last:border-0 text-[11.5px] text-slate-700">
                  <span className="font-medium truncate">{r.name}</span>
                  <span className="text-slate-500">{r.assetClass}</span>
                  <span className="text-slate-500">{r.commitment}</span>
                  <span className="text-slate-500">{r.contact}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setStage("drop")} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Back</button>
              <button
                onClick={() => setStage("done")}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733]"
              >
                <Upload size={12} /> Import 3 Managers
              </button>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <p className="text-[14px] font-semibold text-slate-800">3 Managers Imported!</p>
            <p className="text-[12px] text-slate-400 text-center max-w-xs">
              Your portfolio has been updated. New managers are shown in the builder.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SurveyTargetModal ────────────────────────────────────────────────────────

function SurveyTargetModal({
  managers,
  onClose,
}: {
  managers: PortfolioManager[];
  onClose: () => void;
}) {
  const [selectedSurveyId, setSelectedSurveyId] = useState(MOCK_SURVEYS[0]?.id ?? "");
  const [sent, setSent] = useState(false);
  const activeSurveys = MOCK_SURVEYS.filter((s) => s.status === "active" || s.status === "upcoming");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#e8f5f3] flex items-center justify-center">
              <Send size={13} className="text-[#00897b]" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800">Target Survey</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{managers.length} manager{managers.length !== 1 ? "s" : ""} selected</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <p className="text-[14px] font-semibold text-slate-800">{managers.length} Invitations Queued</p>
            <p className="text-[12px] text-slate-400 text-center max-w-xs">
              Selected managers have been added to the survey's invitation list.
            </p>
            <button onClick={onClose} className="mt-2 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733]">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Select Survey</label>
                <div className="space-y-2">
                  {activeSurveys.map((s) => (
                    <label key={s.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                      ${selectedSurveyId === s.id ? "border-[#00b8a9] bg-[#e8f5f3]/40" : "border-slate-200 hover:border-slate-300"}`}>
                      <input
                        type="radio"
                        name="survey"
                        value={s.id}
                        checked={selectedSurveyId === s.id}
                        onChange={() => setSelectedSurveyId(s.id)}
                        className="mt-0.5 accent-[#00b8a9]"
                      />
                      <div>
                        <p className="text-[12.5px] font-semibold text-slate-800">{s.year} {s.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{s.hostOrg} · Closes {s.targetCloseDate}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Selected Managers</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {managers.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[#0f1923] flex items-center justify-center shrink-0">
                        <span className="text-[7px] font-bold text-white">{m.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <p className="text-[11.5px] text-slate-700 truncate">{m.name}</p>
                      <span className="ml-auto text-[10px] text-slate-400 shrink-0">{m.contactEmail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
              <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button
                onClick={() => setSent(true)}
                disabled={!selectedSurveyId}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] disabled:opacity-40"
              >
                <Send size={12} />
                Send {managers.length} Invitation{managers.length !== 1 ? "s" : ""}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [managers, setManagers] = useState<PortfolioManager[]>(MOCK_PORTFOLIO_MANAGERS);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [assetFilter, setAssetFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal state
  const [showAddManager, setShowAddManager] = useState(false);
  const [showUploadCSV, setShowUploadCSV] = useState(false);
  const [showSurveyTarget, setShowSurveyTarget] = useState(false);
  const [addFundForManager, setAddFundForManager] = useState<PortfolioManager | null>(null);

  const filtered = useMemo(() =>
    managers.filter((m) => {
      const matchSearch =
        search === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.contactName.toLowerCase().includes(search.toLowerCase()) ||
        m.assetClass.toLowerCase().includes(search.toLowerCase());
      const matchAsset = assetFilter === "all" || m.assetClass === assetFilter;
      return matchSearch && matchAsset;
    }),
    [managers, search, assetFilter]
  );

  const groupedByAsset = useMemo(() => {
    const order = ["Private Equity", "Venture Capital", "Private Credit", "Real Assets", "Infrastructure", "Real Estate"];
    const map: Record<string, PortfolioManager[]> = {};
    filtered.forEach((m) => {
      if (!map[m.assetClass]) map[m.assetClass] = [];
      map[m.assetClass].push(m);
    });
    return order.filter((ac) => map[ac]).map((ac) => ({ assetClass: ac, managers: map[ac] }));
  }, [filtered]);

  const existingIds = useMemo(() => new Set(managers.map((m) => m.id)), [managers]);
  const selectedManagers = managers.filter((m) => selectedIds.has(m.id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function removeManager(id: string) {
    setManagers((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }

  function removeFund(managerId: string, fundId: string) {
    setManagers((prev) =>
      prev.map((m) => m.id === managerId ? { ...m, funds: m.funds.filter((f) => f.id !== fundId) } : m)
    );
  }

  function addManager(m: PortfolioManager) {
    setManagers((prev) => [...prev, m]);
  }

  function addFund(fund: PortfolioFund) {
    setManagers((prev) =>
      prev.map((m) => m.id === fund.managerId ? { ...m, funds: [...m.funds, fund] } : m)
    );
  }

  const assetClassCounts = useMemo(() => {
    const counts: Record<string, number> = { all: managers.length };
    managers.forEach((m) => { counts[m.assetClass] = (counts[m.assetClass] ?? 0) + 1; });
    return counts;
  }, [managers]);

  return (
    <div className="min-h-full bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center shrink-0">
                <Briefcase size={16} className="text-[#00b8a9]" />
              </div>
              <div>
                <h1 className="text-[20px] font-semibold text-slate-900">Portfolio Builder</h1>
                <p className="text-[12.5px] text-slate-400 mt-0.5">Manage your LP portfolio, track manager relationships, and target surveys</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowUploadCSV(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Upload size={13} />
                Import CSV
              </button>
              <button
                onClick={() => setShowAddManager(true)}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
              >
                <Plus size={13} />
                Add Manager
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <StatsBar managers={managers} />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Asset class pills */}
          <button
            onClick={() => setAssetFilter("all")}
            className={`h-8 px-3 rounded-lg text-[12px] font-medium border transition-all
              ${assetFilter === "all" ? "bg-[#0f1923] border-[#0f1923] text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
          >
            All
            <span className={`ml-1.5 text-[10.5px] px-1 rounded ${assetFilter === "all" ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
              {assetClassCounts.all}
            </span>
          </button>
          {Object.entries(assetClassCounts)
            .filter(([k]) => k !== "all")
            .map(([ac, count]) => {
              const c = assetColor(ac);
              const active = assetFilter === ac;
              return (
                <button
                  key={ac}
                  onClick={() => setAssetFilter(ac)}
                  className={`h-8 px-3 rounded-lg text-[12px] font-medium border transition-all flex items-center gap-1.5
                    ${active ? `${c.bg} border-current ${c.text}` : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  {ac}
                  <span className={`text-[10.5px] px-1 rounded ${active ? "bg-black/10" : "bg-slate-100 text-slate-500"}`}>{count}</span>
                </button>
              );
            })}

          {/* Spacer */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search managers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-3 w-44 rounded-lg bg-white border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView("cards")}
                className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "cards" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setView("table")}
                className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "table" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Table2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Selection bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-xl bg-[#0f1923] text-white">
            <div className="flex items-center gap-2 flex-1">
              <CheckCircle size={14} className="text-[#00b8a9]" />
              <span className="text-[12.5px] font-medium">
                {selectedIds.size} manager{selectedIds.size !== 1 ? "s" : ""} selected
              </span>
              <span className="text-[11px] text-white/40">
                · {fmt$M(selectedManagers.reduce((s, m) => s + m.funds.reduce((fs, f) => fs + f.commitment, 0), 0))} committed
                · {selectedManagers.reduce((s, m) => s + m.funds.length, 0)} funds
              </span>
            </div>
            <button
              onClick={() => setShowSurveyTarget(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00b8a9] text-white text-[12px] font-medium hover:bg-[#00a99b] transition-colors"
            >
              <Send size={12} />
              Target Survey
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Briefcase size={20} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-medium text-slate-500">No managers match your filter</p>
            <button onClick={() => { setSearch(""); setAssetFilter("all"); }} className="text-[12px] text-[#00897b] hover:underline">
              Clear filters
            </button>
          </div>
        ) : view === "table" ? (
          <TableView
            managers={filtered}
            selectedIds={selectedIds}
            onToggle={toggleSelect}
            onRemove={removeManager}
          />
        ) : (
          <div className="space-y-8">
            {groupedByAsset.map(({ assetClass, managers: group }) => {
              const ac = assetColor(assetClass);
              return (
                <div key={assetClass}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${ac.dot}`} />
                    <h2 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">{assetClass}</h2>
                    <span className="text-[11px] text-slate-400">— {group.length} manager{group.length !== 1 ? "s" : ""}</span>
                    <div className="flex-1 h-px bg-slate-200 ml-2" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {group.map((m) => (
                      <ManagerCard
                        key={m.id}
                        manager={m}
                        selected={selectedIds.has(m.id)}
                        onSelect={() => toggleSelect(m.id)}
                        onRemove={() => removeManager(m.id)}
                        onAddFund={() => setAddFundForManager(m)}
                        onRemoveFund={(fid) => removeFund(m.id, fid)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddManager && (
        <AddManagerModal
          existing={existingIds}
          onAdd={addManager}
          onClose={() => setShowAddManager(false)}
        />
      )}
      {showUploadCSV && <UploadCSVModal onClose={() => setShowUploadCSV(false)} />}
      {addFundForManager && (
        <AddFundModal
          managerName={addFundForManager.name}
          managerId={addFundForManager.id}
          onAdd={addFund}
          onClose={() => setAddFundForManager(null)}
        />
      )}
      {showSurveyTarget && (
        <SurveyTargetModal
          managers={selectedManagers}
          onClose={() => { setShowSurveyTarget(false); setSelectedIds(new Set()); }}
        />
      )}
    </div>
  );
}
