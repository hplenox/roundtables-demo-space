"use client";

import { useState } from "react";
import { X, ShieldCheck, User, Eye } from "lucide-react";
import type { PodRole } from "@/types/pod";

const ROLE_OPTIONS: { role: PodRole; icon: typeof ShieldCheck; label: string; description: string }[] = [
  { role: "admin", icon: ShieldCheck, label: "Admin", description: "Manage members and settings" },
  { role: "member", icon: User, label: "Member", description: "Post, RSVP, add notes" },
  { role: "viewer", icon: Eye, label: "Viewer", description: "Read only" },
];

export default function InviteMembersModal({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (entries: { email: string; role: PodRole }[]) => void;
}) {
  const [people, setPeople] = useState("");
  const [role, setRole] = useState<PodRole>("member");
  const [note, setNote] = useState("");

  function handleSend() {
    const emails = people.split(/[,\n]/).map((e) => e.trim()).filter(Boolean);
    if (!emails.length) return;
    onInvite(emails.map((email) => ({ email, role })));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Invite members</h2>
            <p className="text-[12.5px] text-slate-400 mt-0.5">Who are you adding?</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pt-5 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-slate-500 mb-1.5">People</label>
            <textarea
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              placeholder="Search RoundTables users, or paste emails"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] resize-none focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30 focus:border-[#00b8a9]"
            />
            <p className="text-[11px] text-slate-400 mt-1">Existing users are matched automatically — they keep their profile and organization.</p>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-2.5">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = role === opt.role;
                return (
                  <button
                    key={opt.role}
                    onClick={() => setRole(opt.role)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      active ? "border-[#00b8a9] bg-[#00b8a9]/5" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Icon size={14} className={active ? "text-[#00897b]" : "text-slate-400"} />
                    <p className="text-[12.5px] font-bold text-slate-800 mt-1.5">{opt.label}</p>
                    <p className="text-[10.5px] text-slate-400 leading-snug mt-0.5">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-slate-500 mb-1.5">
              Add a note to the invitation — <span className="font-normal text-slate-400">optional</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why you are inviting them"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] resize-none focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30 focus:border-[#00b8a9]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-5 mt-2">
          <button onClick={onClose} className="text-[13px] font-medium text-slate-500 hover:text-slate-700 px-3 py-2">Cancel</button>
          <button
            onClick={handleSend}
            disabled={!people.trim()}
            className="px-4 py-2 rounded-lg bg-[#00b8a9] text-white text-[13px] font-semibold hover:bg-[#00a89a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send invitations
          </button>
        </div>
      </div>
    </div>
  );
}
