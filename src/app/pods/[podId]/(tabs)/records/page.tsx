"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Columns3, Download, Plus, ShieldCheck, Sparkles, Paperclip, ExternalLink,
} from "lucide-react";
import { usePodCtx } from "../../pod-context";
import { POD_KIND_RECORD_LABEL } from "@/lib/mock-pods";
import { CONFIRMATION_STYLE } from "@/components/pods/kindStyles";
import PodAvatar from "@/components/pods/PodAvatar";
import AddRecordModal from "@/components/pods/AddRecordModal";
import type { PodRecord } from "@/types/pod";

export default function PodRecordsPage() {
  const { pod, addRecord, addRecordNote, resendRecord, withdrawRecord } = usePodCtx();
  const [tab, setTab] = useState<"listed" | "awaiting">("listed");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const noun = pod.kind === "deal" ? "deals" : "vendors";
  const confirmer = pod.kind === "deal" ? "the sponsor" : "their administrator";
  const listed = pod.records.filter((r) => r.status === "listed" && r.name.toLowerCase().includes(query.toLowerCase()));
  const awaiting = pod.records.filter((r) => r.status === "awaiting" && r.name.toLowerCase().includes(query.toLowerCase()));
  const selected = listed.find((r) => r.id === selectedId) ?? listed[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
          <button
            onClick={() => setTab("listed")}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors flex items-center gap-1.5 ${tab === "listed" ? "bg-[#0f1923] text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            {pod.kind === "deal" ? "Open" : "Listed"}
          </button>
          <button
            onClick={() => setTab("awaiting")}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors flex items-center gap-1.5 ${tab === "awaiting" ? "bg-[#0f1923] text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            Awaiting {pod.kind === "deal" ? "sponsor confirmation" : "permission"}
            {awaiting.length > 0 && <span className="text-[10px] font-bold opacity-70">{awaiting.length}</span>}
          </button>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-end">
          <div className="relative flex-1 max-w-[220px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search records"
              className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-[12px] font-medium hover:border-slate-300 transition-colors">
            <Columns3 size={13} /> Fields
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-[12px] font-medium hover:border-slate-300 transition-colors">
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#4361ee] text-white text-[12.5px] font-semibold hover:bg-[#3650d4] transition-colors"
          >
            <Plus size={13} /> Add a {pod.kind === "deal" ? "deal" : "vendor"}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-500 leading-snug">
        <ShieldCheck size={14} className="shrink-0 mt-0.5 text-slate-400" />
        <p>
          {pod.kind === "deal"
            ? "Administered by the sponsor. Investors see only what the sponsor has confirmed for this POD. A member proposes a deal; RoundTables notifies the sponsoring organization's administrator. It appears to investors only once the sponsor confirms participation in this POD."
            : "A member-curated list of firms and the service providers around them. A member suggests a vendor; RoundTables notifies that organization's administrator. The listing appears only once that administrator grants visibility for this POD."}
        </p>
      </div>

      {tab === "listed" ? (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[2.1fr_0.9fr_0.7fr_0.9fr_1.1fr_0.6fr] gap-2 px-4 py-2.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <span>{POD_KIND_RECORD_LABEL[pod.kind]}</span>
              <span>Category</span>
              <span>Added by</span>
              <span>Confirmation</span>
              <span>POD signal</span>
              <span className="text-right">Updated</span>
            </div>
            {listed.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`w-full grid grid-cols-[2.1fr_0.9fr_0.7fr_0.9fr_1.1fr_0.6fr] gap-2 px-4 py-3 items-center text-left border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors ${
                  selected?.id === r.id ? "bg-[#4361ee]/5" : ""
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <PodAvatar name={r.name} size="xs" />
                  <span className="text-[12.5px] font-semibold text-slate-800 truncate">{r.name}</span>
                </span>
                <span className="text-[12px] text-slate-500 truncate">{r.category}</span>
                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                  {r.contactName ? <PodAvatar name={r.contactName} size="xs" /> : null}
                  <span className="truncate">{r.addedByLabel}</span>
                </span>
                <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${CONFIRMATION_STYLE[r.confirmation]}`}>
                  {r.confirmation === "confirmed" ? "Confirmed" : r.confirmation === "sent" ? "Sent" : "Reviewing"}
                </span>
                <span className="flex items-center gap-1.5 text-[11.5px] text-slate-500 min-w-0">
                  <span className="flex -space-x-1.5 shrink-0">
                    {r.signal.initials.slice(0, 3).map((ini, i) => (
                      <span key={i} className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[8.5px] font-bold flex items-center justify-center ring-2 ring-white">{ini}</span>
                    ))}
                  </span>
                  <span className="truncate">{r.signal.text}</span>
                </span>
                <span className="text-[11.5px] text-slate-400 text-right">{r.addedDateLabel}</span>
              </button>
            ))}
            {listed.length === 0 && <p className="px-4 py-8 text-center text-[12.5px] text-slate-400">No {noun} match your search.</p>}
          </div>

          {selected && (
            <RecordDetail
              record={selected}
              podId={pod.id}
              requestLabel={pod.kind === "deal" ? "an introduction" : "a meeting"}
              onAddNote={() => {
                if (!noteDraft.trim()) return;
                addRecordNote(selected.id, noteDraft.trim());
                setNoteDraft("");
              }}
              noteDraft={noteDraft}
              setNoteDraft={setNoteDraft}
            />
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
            <span className="text-[12.5px] font-bold text-slate-700">Awaiting {pod.kind === "deal" ? "sponsor confirmation" : "permission"}</span>
            <span className="text-[11px] text-slate-400">visible only to the member who suggested it and POD admins</span>
          </div>
          {awaiting.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <PodAvatar name={r.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{r.name}</p>
                  <p className="text-[11.5px] text-slate-400 truncate">{r.category} · suggested by {r.addedByLabel} · {r.addedDateLabel}</p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${CONFIRMATION_STYLE[r.confirmation]}`}>
                  {r.confirmation === "sent" ? `Sent to ${confirmer}` : `${confirmer[0].toUpperCase()}${confirmer.slice(1)} reviewing`}
                </span>
                {r.confirmation === "sent" ? (
                  <button onClick={() => resendRecord(r.id)} className="text-[12px] font-semibold text-[#3650d4] hover:underline">Resend</button>
                ) : (
                  <button onClick={() => withdrawRecord(r.id)} className="text-[12px] font-semibold text-rose-600 hover:underline">Withdraw</button>
                )}
              </div>
            </div>
          ))}
          {awaiting.length === 0 && <p className="px-4 py-8 text-center text-[12.5px] text-slate-400">Nothing awaiting confirmation.</p>}
        </div>
      )}

      {showAdd && (
        <AddRecordModal
          kind={pod.kind}
          onClose={() => setShowAdd(false)}
          onSubmit={(input) => {
            addRecord(input);
            setShowAdd(false);
            setTab("awaiting");
          }}
        />
      )}
    </div>
  );
}

function RecordDetail({
  record, podId, requestLabel, onAddNote, noteDraft, setNoteDraft,
}: {
  record: PodRecord;
  podId: string;
  requestLabel: string;
  onAddNote: () => void;
  noteDraft: string;
  setNoteDraft: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-3">
          <PodAvatar name={record.name} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-bold text-slate-900">{record.name}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-semibold">Listed</span>
            </div>
            <p className="text-[12px] text-slate-400 mt-0.5">Added by {record.addedByLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/pods/${podId}/discussion`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-semibold hover:border-slate-300 transition-colors">
            Discuss in POD
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#4361ee] text-white text-[12px] font-semibold hover:bg-[#3650d4] transition-colors">
            Request {requestLabel}
          </button>
        </div>
      </div>

      {record.aiSummary && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#4361ee]/[0.06] border border-[#4361ee]/15 mb-4">
          <Sparkles size={14} className="text-[#3650d4] shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-slate-700 leading-snug">
            <span className="font-bold text-[#3650d4]">Members say — </span>
            {record.aiSummary}
            <span className="block text-[11px] text-slate-400 mt-1">Summarized from {record.notes.length || 1} member note{record.notes.length === 1 ? "" : "s"}. Not an endorsement or diligence.</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Field label="Category" value={record.category} />
        <Field label="Contact" value={record.contactName ?? "—"} />
        <Field label="Website" value={record.website ? <a href={`https://${record.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#3650d4] hover:underline">{record.website}<ExternalLink size={10} /></a> : "—"} />
        <Field label="Confirmation" value={record.confirmedDateLabel ? `Confirmed ${record.confirmedDateLabel}` : "—"} valueClass="text-emerald-600" />
      </div>

      <div>
        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide mb-2">Member notes <span className="font-normal normal-case text-slate-300">POD members only</span></p>
        <div className="space-y-3 mb-3">
          {record.notes.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5">
              <PodAvatar name={n.author} size="xs" />
              <div className="min-w-0">
                <p className="text-[12px] text-slate-500">
                  <span className="font-semibold text-slate-800">{n.author}</span>
                  {n.authorTag && <span className="ml-1.5 text-[10.5px] font-semibold text-slate-400">{n.authorTag}</span>}
                  <span className="ml-1.5 text-slate-300">· {n.dateLabel}</span>
                </p>
                <p className="text-[12.5px] text-slate-700 mt-0.5">{n.body}</p>
              </div>
            </div>
          ))}
          {record.notes.length === 0 && <p className="text-[12px] text-slate-400">No notes yet.</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Add a note — visible to POD members only"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30"
            onKeyDown={(e) => e.key === "Enter" && onAddNote()}
          />
          <button onClick={onAddNote} className="text-[12px] font-semibold text-white bg-[#4361ee] hover:bg-[#3650d4] px-3 py-2 rounded-lg transition-colors">Add note</button>
          <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-600 px-2"><Paperclip size={13} /> Attach</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, valueClass = "text-slate-700" }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-[12.5px] font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
