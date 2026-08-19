"use client";

import { useState } from "react";
import { X, MessagesSquare, Handshake, Briefcase, Check } from "lucide-react";
import { PodKind } from "@/types/pod";
import { createPod, CURRENT_USER } from "@/lib/mock-pods";

const KIND_OPTIONS: { kind: PodKind; icon: typeof MessagesSquare; title: string; description: string; adds: string }[] = [
  {
    kind: "community",
    icon: MessagesSquare,
    title: "Community POD",
    description: "Conversation first — for groups that meet, share documents and discuss.",
    adds: "Discussion, events, files, members",
  },
  {
    kind: "vendor",
    icon: Handshake,
    title: "Vendor POD",
    description: "Everything a Community POD has, plus a permission-based vendor list members curate together.",
    adds: "Adds: vendor listings, permission requests, member notes, meeting requests",
  },
  {
    kind: "deal",
    icon: Briefcase,
    title: "Deal POD",
    description: "Run by a sponsor: invite investors to a co-investment programme and list deals the sponsor confirms.",
    adds: "Adds: deal listings, sponsor confirmation, investor introductions",
  },
];

export default function CreatePodModal({ onClose, onCreated }: { onClose: () => void; onCreated: (podId: string) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [kind, setKind] = useState<PodKind>("vendor");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hostOrg, setHostOrg] = useState(CURRENT_USER.org);
  const [joinPolicy, setJoinPolicy] = useState<"invite_only" | "request" | "open">("invite_only");
  const [inviteText, setInviteText] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    const emails = inviteText.split(",").map((e) => e.trim()).filter(Boolean);
    const pod = createPod({ kind, name: name.trim(), description: description.trim(), hostOrg: hostOrg.trim() || CURRENT_USER.org, joinPolicy, inviteEmails: emails });
    onCreated(pod.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create a POD</h2>
            <p className="text-[12.5px] text-slate-400 mt-0.5">Step {step} of 2 — {step === 1 ? "what kind of POD?" : "the basics"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 pt-5">
              {KIND_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = kind === opt.kind;
                return (
                  <button
                    key={opt.kind}
                    onClick={() => setKind(opt.kind)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      active ? "border-[#4361ee] bg-[#4361ee]/5 shadow-sm" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${active ? "bg-[#4361ee] text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Icon size={16} />
                    </div>
                    <p className="text-[13.5px] font-bold text-slate-900 mb-1.5">{opt.title}</p>
                    <p className="text-[12px] text-slate-500 leading-snug mb-2">{opt.description}</p>
                    <p className="text-[11px] text-slate-400 leading-snug">{opt.adds}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-5 mt-2">
              <button onClick={onClose} className="text-[13px] font-medium text-slate-500 hover:text-slate-700 px-3 py-2">Cancel</button>
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg bg-[#4361ee] text-white text-[13px] font-semibold hover:bg-[#3d58d9] transition-colors"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pt-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4361ee]/10 text-[#3147af] text-[11px] font-semibold border border-[#4361ee]/25">
                  {KIND_OPTIONS.find((o) => o.kind === kind)?.title}
                </span>
                <button onClick={() => setStep(1)} className="text-[12px] font-medium text-slate-400 hover:text-slate-600">Change</button>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">POD name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Emerging Managers Vendor List"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">One-line description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this POD for?"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Host organization</label>
                  <input
                    value={hostOrg}
                    onChange={(e) => setHostOrg(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Who can join</label>
                  <select
                    value={joinPolicy}
                    onChange={(e) => setJoinPolicy(e.target.value as typeof joinPolicy)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] bg-white focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                  >
                    <option value="invite_only">Invite only</option>
                    <option value="request">Anyone can request</option>
                    <option value="open">Open to join</option>
                  </select>
                </div>
              </div>

              {kind !== "community" && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100 text-[12px] text-blue-800">
                  <Check size={14} className="shrink-0 mt-0.5" />
                  <p>
                    {kind === "vendor"
                      ? "Vendor PODs are permission-based: a member suggests a vendor or firm, RoundTables notifies that organization's administrator, and the listing appears only once they grant visibility for this POD."
                      : "Deal PODs are sponsor-administered: a member proposes a deal, RoundTables notifies the sponsoring organization's administrator, and it appears to investors only once the sponsor confirms participation."}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Invite members — optional, you can do this later</label>
                <input
                  value={inviteText}
                  onChange={(e) => setInviteText(e.target.value)}
                  placeholder="Search people, or paste emails separated by commas"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-6 py-5 mt-2">
              <p className="text-[11.5px] text-slate-400">You can change any of this later.</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(1)} className="text-[13px] font-medium text-slate-500 hover:text-slate-700 px-3 py-2">Back</button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="px-4 py-2 rounded-lg bg-[#4361ee] text-white text-[13px] font-semibold hover:bg-[#3d58d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Create POD
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
