"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bookmark, Plus, Search, X, Trash2, Edit2, Users,
  MapPin, FolderPlus, CheckCircle,
} from "lucide-react";
import { MOCK_PORTFOLIO_MANAGERS } from "@/lib/mock-portfolio-data";
import { MOCK_PORTFOLIO_LISTS } from "@/lib/mock-lists-data";
import { getOrgById } from "@/lib/mock-data";
import { PortfolioManager, PortfolioList } from "@/types/portfolio";
import PortfolioInsights from "@/components/lists/PortfolioInsights";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt$M(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}B` : `$${n}M`;
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

const ALL_MANAGERS_ID = "all";
const TODAY_DISPLAY = "Mar 31, 2026";

type QuickFilter = { key: string; label: string; test: (m: PortfolioManager) => boolean };

const QUICK_FILTERS: QuickFilter[] = [
  { key: "lpi",          label: "LPI Scored",       test: (m) => m.lpiScore != null },
  { key: "no-lpi",       label: "No LPI Score",     test: (m) => m.lpiScore == null },
  { key: "active-funds", label: "Has Active Funds", test: (m) => m.funds.some((f) => f.status === "active") },
  { key: "core",         label: "Core / Flagship",  test: (m) => !!m.tags?.some((t) => t === "core" || t === "flagship") },
];

function initials(name: string) {
  return name.substring(0, 2).toUpperCase();
}

// ─── ManagerRow ──────────────────────────────────────────────────────────────

function ManagerRow({
  manager,
  onRemove,
  removable,
  checkbox,
}: {
  manager: PortfolioManager;
  onRemove?: () => void;
  removable?: boolean;
  checkbox?: { checked: boolean; onToggle: () => void };
}) {
  const ac = assetColor(manager.assetClass);
  const totalCommitted = manager.funds.reduce((s, f) => s + f.commitment, 0);
  const org = manager.orgId ? getOrgById(manager.orgId) : undefined;
  const reportHref = org ? `/surveys/${org.surveyId}/organizations/${org.id}/report` : undefined;

  const identity = (
    <>
      <div className="w-8 h-8 rounded-lg bg-[#0f1923] flex items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-white">{initials(manager.name)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[12.5px] font-semibold text-slate-800 truncate ${reportHref ? "group-hover/id:text-[#00897b]" : ""}`}>{manager.name}</p>
        <p className="text-[10.5px] text-slate-400 flex items-center gap-1 truncate">
          <MapPin size={9} className="shrink-0" /> {manager.location}
        </p>
      </div>
    </>
  );

  return (
    <div className="group flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
      {checkbox && (
        <button
          onClick={checkbox.onToggle}
          className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
            ${checkbox.checked ? "bg-[#00b8a9] border-[#00b8a9]" : "border-slate-300 hover:border-slate-400"}`}
        >
          {checkbox.checked && <CheckCircle size={9} className="text-white" strokeWidth={3} />}
        </button>
      )}
      {reportHref ? (
        <Link href={reportHref} title="View most recent survey report" className="group/id flex items-center gap-3 flex-1 min-w-0">
          {identity}
        </Link>
      ) : (
        <div className="flex items-center gap-3 flex-1 min-w-0">{identity}</div>
      )}
      <span className={`hidden sm:inline-flex shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${ac.bg} ${ac.text}`}>
        {manager.assetClass}
      </span>
      <div className="hidden md:block w-20 text-right shrink-0">
        <p className="text-[12px] font-medium text-slate-700">{fmt$M(totalCommitted)}</p>
        <p className="text-[10px] text-slate-400">Committed</p>
      </div>
      <div className="hidden lg:block w-14 text-right shrink-0">
        {manager.lpiScore != null
          ? <p className="text-[12px] font-semibold text-slate-700">{manager.lpiScore}</p>
          : <p className="text-[12px] text-slate-300">—</p>}
        <p className="text-[10px] text-slate-400">LPI</p>
      </div>
      {removable && (
        <button
          onClick={onRemove}
          title="Remove from list"
          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-red-400 shrink-0"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

// ─── CreateListModal ─────────────────────────────────────────────────────────

function CreateListModal({
  managers,
  preselected,
  onCreate,
  onClose,
}: {
  managers: PortfolioManager[];
  preselected: Set<string>;
  onCreate: (list: PortfolioList) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [startWith, setStartWith] = useState<"current" | "full" | "empty">("full");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set(managers.map((m) => m.id)));

  function applyStartWith(mode: "current" | "full" | "empty") {
    setStartWith(mode);
    setActiveFilter(null);
    if (mode === "current") setChecked(new Set(preselected));
    else if (mode === "full") setChecked(new Set(managers.map((m) => m.id)));
    else setChecked(new Set());
  }

  function applyQuickFilter(filter: QuickFilter) {
    if (activeFilter === filter.key) {
      setActiveFilter(null);
      setChecked(new Set(managers.map((m) => m.id)));
      return;
    }
    setActiveFilter(filter.key);
    setChecked(new Set(managers.filter(filter.test).map((m) => m.id)));
  }

  function toggleManager(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleCreate() {
    if (!name.trim()) return;
    onCreate({
      id: `list-${Date.now()}`,
      name: name.trim(),
      managerIds: Array.from(checked),
      createdDate: TODAY_DISPLAY,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#e8f5f3] flex items-center justify-center">
              <FolderPlus size={14} className="text-[#00897b]" />
            </div>
            <p className="text-[13.5px] font-semibold text-slate-800">Create a list</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <p className="text-[12px] text-slate-500">
            Lists are personal sub-portfolios — visible only to you, shown under <span className="font-semibold text-slate-700">Lists</span>, and usable anywhere a manager can be pinned.
          </p>

          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1">List name</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. High-conviction 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Start with</label>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={preselected.size === 0}
                onClick={() => applyStartWith("current")}
                className={`h-8 px-3 rounded-lg text-[12px] font-medium border transition-colors
                  ${startWith === "current" ? "border-[#00b8a9] bg-[#e8f5f3] text-[#00897b]" : "border-slate-200 text-slate-600 hover:border-slate-300"}
                  ${preselected.size === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                Current view · {preselected.size} manager{preselected.size !== 1 ? "s" : ""}
              </button>
              <button
                onClick={() => applyStartWith("full")}
                className={`h-8 px-3 rounded-lg text-[12px] font-medium border transition-colors
                  ${startWith === "full" ? "border-[#00b8a9] bg-[#e8f5f3] text-[#00897b]" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                Full list · narrow down
              </button>
              <button
                onClick={() => applyStartWith("empty")}
                className={`h-8 px-3 rounded-lg text-[12px] font-medium border transition-colors
                  ${startWith === "empty" ? "border-[#00b8a9] bg-[#e8f5f3] text-[#00897b]" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                Empty list
              </button>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1.5">
              Current view = managers you had checked before opening this dialog. You can add or remove managers later.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick narrow · one tap</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => applyQuickFilter(f)}
                  className={`h-7 px-2.5 rounded-full text-[11px] font-medium border transition-colors
                    ${activeFilter === f.key ? "border-[#00b8a9] bg-[#e8f5f3] text-[#00897b]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white max-h-64 overflow-y-auto">
              {managers.map((m) => {
                const isChecked = checked.has(m.id);
                const ac = assetColor(m.assetClass);
                return (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 px-3 py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleManager(m.id)}
                      className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                        ${isChecked ? "bg-[#00b8a9] border-[#00b8a9]" : "border-slate-300 hover:border-slate-400"}`}
                    >
                      {isChecked && <CheckCircle size={9} className="text-white" strokeWidth={3} />}
                    </button>
                    <p className="flex-1 min-w-0 text-[12.5px] font-medium text-slate-800 truncate">{m.name}</p>
                    <span className="text-[10.5px] text-slate-400 shrink-0">
                      {m.assetClass} · {m.lpiScore != null ? `LPI ${m.lpiScore}` : "no LPI"}
                    </span>
                    <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${ac.dot}`} />
                  </label>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {checked.size} of {managers.length} managers selected
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 shrink-0 bg-slate-50/40">
          <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] disabled:opacity-40 transition-colors"
          >
            <FolderPlus size={12} />
            Create list
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AddManagersModal ────────────────────────────────────────────────────────

function AddManagersModal({
  listName,
  candidates,
  onAdd,
  onClose,
}: {
  listName: string;
  candidates: PortfolioManager[];
  onAdd: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const filtered = candidates.filter(
    (m) =>
      search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.assetClass.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[13.5px] font-semibold text-slate-800">Add managers</p>
            <p className="text-[11px] text-slate-400 mt-0.5">to {listName}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        <div className="p-4 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              autoFocus
              type="text"
              placeholder="Search managers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
            />
          </div>
        </div>

        <div className="px-4 pb-2 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <p className="text-center text-[12px] text-slate-400 py-8">
              {candidates.length === 0 ? "Every portfolio manager is already in this list." : "No matching managers."}
            </p>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((m) => {
                const isChecked = checked.has(m.id);
                const ac = assetColor(m.assetClass);
                return (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                        ${isChecked ? "bg-[#00b8a9] border-[#00b8a9]" : "border-slate-300 hover:border-slate-400"}`}
                    >
                      {isChecked && <CheckCircle size={9} className="text-white" strokeWidth={3} />}
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-[#0f1923] flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-white">{initials(m.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-slate-800 truncate">{m.name}</p>
                      <p className="text-[10.5px] text-slate-400 truncate">{m.location}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${ac.bg} ${ac.text}`}>
                      {m.assetClass}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 shrink-0 bg-slate-50/40">
          <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => onAdd(Array.from(checked))}
            disabled={checked.size === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] disabled:opacity-40 transition-colors"
          >
            <Plus size={12} />
            Add {checked.size || ""} manager{checked.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ListsPage() {
  const managers = MOCK_PORTFOLIO_MANAGERS;
  const [lists, setLists] = useState<PortfolioList[]>(MOCK_PORTFOLIO_LISTS);
  const [selectedListId, setSelectedListId] = useState<string>(ALL_MANAGERS_ID);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showAddManagers, setShowAddManagers] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const managersById = useMemo(() => new Map(managers.map((m) => [m.id, m])), [managers]);

  const selectedList = selectedListId === ALL_MANAGERS_ID
    ? null
    : lists.find((l) => l.id === selectedListId) ?? null;

  const viewManagers = useMemo(() => {
    const base = selectedList
      ? selectedList.managerIds.map((id) => managersById.get(id)).filter((m): m is PortfolioManager => !!m)
      : managers;
    if (search === "") return base;
    const q = search.toLowerCase();
    return base.filter(
      (m) => m.name.toLowerCase().includes(q) || m.assetClass.toLowerCase().includes(q) || m.location.toLowerCase().includes(q)
    );
  }, [selectedList, managers, managersById, search]);

  const totalCommitted = viewManagers.reduce((s, m) => s + m.funds.reduce((fs, f) => fs + f.commitment, 0), 0);

  function handleCreateList(list: PortfolioList) {
    setLists((prev) => [...prev, list]);
    setSelectedListId(list.id);
    setShowCreate(false);
  }

  function handleDeleteList(id: string) {
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (selectedListId === id) setSelectedListId(ALL_MANAGERS_ID);
  }

  function startRename(list: PortfolioList) {
    setRenamingId(list.id);
    setRenameValue(list.name);
  }

  function commitRename() {
    if (!renamingId) return;
    const trimmed = renameValue.trim();
    if (trimmed) {
      setLists((prev) => prev.map((l) => (l.id === renamingId ? { ...l, name: trimmed } : l)));
    }
    setRenamingId(null);
  }

  function removeFromList(managerId: string) {
    if (!selectedList) return;
    setLists((prev) =>
      prev.map((l) => (l.id === selectedList.id ? { ...l, managerIds: l.managerIds.filter((id) => id !== managerId) } : l))
    );
  }

  function addManagersToList(ids: string[]) {
    if (!selectedList) return;
    setLists((prev) =>
      prev.map((l) => (l.id === selectedList.id ? { ...l, managerIds: [...l.managerIds, ...ids] } : l))
    );
    setShowAddManagers(false);
  }

  const addCandidates = selectedList
    ? managers.filter((m) => !selectedList.managerIds.includes(m.id))
    : [];

  return (
    <div className="min-h-full bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center shrink-0">
                <Bookmark size={16} className="text-[#00b8a9]" />
              </div>
              <div>
                <h1 className="text-[20px] font-semibold text-slate-900">Lists</h1>
                <p className="text-[12.5px] text-slate-400 mt-0.5">
                  Organize the managers and organizations in your portfolio into personal lists — visible only to you.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors shrink-0"
            >
              <Plus size={13} />
              New list
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
        {/* Left: My Lists */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-fit overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">My Lists</p>
          </div>
          <div className="py-1.5">
            <button
              onClick={() => setSelectedListId(ALL_MANAGERS_ID)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors
                ${selectedListId === ALL_MANAGERS_ID ? "bg-[#e8f5f3]/60" : "hover:bg-slate-50"}`}
            >
              <Users size={13} className={selectedListId === ALL_MANAGERS_ID ? "text-[#00897b]" : "text-slate-400"} />
              <span className={`flex-1 text-[12.5px] truncate ${selectedListId === ALL_MANAGERS_ID ? "font-semibold text-[#00897b]" : "font-medium text-slate-700"}`}>
                All Managers
              </span>
              <span className="text-[10.5px] text-slate-400 shrink-0">{managers.length}</span>
            </button>

            {lists.length === 0 ? (
              <p className="px-4 py-3 text-[11.5px] text-slate-400">No lists yet — create one to get started.</p>
            ) : (
              lists.map((list) => {
                const active = selectedListId === list.id;
                const isRenaming = renamingId === list.id;
                return (
                  <div
                    key={list.id}
                    className={`group flex items-center gap-2.5 px-4 py-2 transition-colors ${active ? "bg-[#e8f5f3]/60" : "hover:bg-slate-50"}`}
                  >
                    <Bookmark size={13} className={active ? "text-[#00897b] shrink-0" : "text-slate-400 shrink-0"} />
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onBlur={commitRename}
                        className="flex-1 min-w-0 h-6 px-1.5 rounded border border-[#00b8a9] text-[12.5px] text-slate-800 focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => setSelectedListId(list.id)}
                        className={`flex-1 min-w-0 text-left text-[12.5px] truncate ${active ? "font-semibold text-[#00897b]" : "font-medium text-slate-700"}`}
                      >
                        {list.name}
                      </button>
                    )}
                    {!isRenaming && (
                      <>
                        <span className="text-[10.5px] text-slate-400 shrink-0 group-hover:hidden">{list.managerIds.length}</span>
                        <button
                          onClick={() => startRename(list)}
                          className="hidden group-hover:flex shrink-0 w-5 h-5 rounded items-center justify-center text-slate-300 hover:text-slate-600"
                          title="Rename list"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="hidden group-hover:flex shrink-0 w-5 h-5 rounded items-center justify-center text-slate-300 hover:text-red-400"
                          title="Delete list"
                        >
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: selected list content */}
        <div>
          {selectedList ? (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div>
                  <h2 className="text-[14px] font-semibold text-slate-800">{selectedList.name}</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {viewManagers.length} manager{viewManagers.length !== 1 ? "s" : ""} · {fmt$M(totalCommitted)} committed
                    {` · created ${selectedList.createdDate}`}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-8 pl-8 pr-3 w-44 rounded-lg bg-white border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddManagers(true)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Plus size={13} />
                    Add managers
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="w-8 shrink-0" />
                  <div className="flex-1">Manager</div>
                  <div className="hidden sm:block w-20">Asset Class</div>
                  <div className="hidden md:block w-20 text-right">Committed</div>
                  <div className="hidden lg:block w-14 text-right">LPI</div>
                  <div className="w-6 shrink-0" />
                </div>

                {viewManagers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center">
                      <Bookmark size={18} className="text-slate-400" />
                    </div>
                    <p className="text-[12.5px] font-medium text-slate-500">
                      {viewManagers.length === 0 && search ? "No managers match your search" : "No managers in this list yet"}
                    </p>
                    <button
                      onClick={() => setShowAddManagers(true)}
                      className="text-[12px] text-[#00897b] hover:underline"
                    >
                      Add managers
                    </button>
                  </div>
                ) : (
                  viewManagers.map((m) => (
                    <ManagerRow key={m.id} manager={m} removable onRemove={() => removeFromList(m.id)} />
                  ))
                )}
              </div>
            </>
          ) : (
            <PortfolioInsights />
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateListModal
          managers={managers}
          preselected={new Set()}
          onCreate={handleCreateList}
          onClose={() => setShowCreate(false)}
        />
      )}
      {showAddManagers && selectedList && (
        <AddManagersModal
          listName={selectedList.name}
          candidates={addCandidates}
          onAdd={addManagersToList}
          onClose={() => setShowAddManagers(false)}
        />
      )}
    </div>
  );
}
