"use client";

import { useState } from "react";
import { Search, Upload, UserPlus, Send, XCircle, MessageSquare, MoreHorizontal } from "lucide-react";
import { usePodCtx } from "../../pod-context";
import { CURRENT_USER } from "@/lib/mock-pods";
import PodAvatar from "@/components/pods/PodAvatar";
import InviteMembersModal from "@/components/pods/InviteMembersModal";
import type { PodRole } from "@/types/pod";

const ROLE_BADGE: Record<PodRole, string> = {
  admin: "bg-violet-50 text-violet-700 border-violet-200",
  member: "bg-slate-50 text-slate-500 border-slate-200",
  viewer: "bg-blue-50 text-blue-600 border-blue-200",
};

export default function PodMembersPage() {
  const { pod, inviteMembers, revokeInvitation, remindInvitation, updateMemberRole, removeMember } = usePodCtx();
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const members = pod.members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.org.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[12.5px] font-semibold hover:border-slate-300 transition-colors">
          <Upload size={14} /> Upload CSV
        </button>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#00b8a9] text-white text-[12.5px] font-semibold hover:bg-[#00a89a] transition-colors"
        >
          <UserPlus size={14} /> Invite members
        </button>
      </div>

      {pod.pendingInvitations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50/60 border-b border-amber-100">
            <span className="text-[12.5px] font-bold text-amber-800">Pending invitations</span>
            <span className="text-[11px] text-amber-600">{pod.pendingInvitations.length} sent, not yet accepted</span>
          </div>
          {pod.pendingInvitations.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <PodAvatar name={inv.email.split("@")[0]} size="sm" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{inv.email}</p>
                  <p className="text-[11.5px] text-slate-400 truncate">Invited by {inv.invitedBy} · {inv.invitedDate}</p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 text-[11.5px] font-medium ${inv.opened ? "text-emerald-600" : "text-slate-400"}`}>
                  {inv.opened ? "Opened" : "Not opened"}
                </span>
                <button onClick={() => remindInvitation(inv.email)} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#00897b] hover:underline">
                  <Send size={11} /> Remind
                </button>
                <button onClick={() => revokeInvitation(inv.id)} className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600 hover:underline">
                  <XCircle size={11} /> Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.6fr_1fr_0.9fr_0.7fr_1fr] gap-2 px-4 py-2.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100">
          <span>Member</span>
          <span>Organization</span>
          <span>Role</span>
          <span>Last active</span>
          <span className="text-right">Actions</span>
        </div>
        {members.map((m) => (
          <div key={m.id} className="relative grid grid-cols-[1.6fr_1fr_0.9fr_0.7fr_1fr] gap-2 px-4 py-3 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <PodAvatar name={m.name} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate">{m.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
              </div>
            </div>
            <span className="text-[12.5px] text-slate-500 truncate">{m.org}</span>
            {m.email === CURRENT_USER.email ? (
              <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${ROLE_BADGE[m.role]}`}>
                {m.role[0].toUpperCase() + m.role.slice(1)}
              </span>
            ) : (
              <select
                value={m.role}
                onChange={(e) => updateMemberRole(m.id, e.target.value as PodRole)}
                className={`w-fit px-2 py-1 rounded-lg text-[11.5px] font-semibold border bg-white focus:outline-none ${ROLE_BADGE[m.role]}`}
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            )}
            <span className="text-[12px] text-slate-400">{m.lastActive}</span>
            <div className="flex items-center justify-end gap-2 relative">
              <button className="inline-flex items-center gap-1 text-[12px] font-medium text-[#00897b] hover:underline">
                <MessageSquare size={12} /> Message
              </button>
              {m.email !== CURRENT_USER.email && (
                <button onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)} className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreHorizontal size={15} />
                </button>
              )}
              {openMenuId === m.id && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-10">
                  <button
                    onClick={() => { removeMember(m.id); setOpenMenuId(null); }}
                    className="w-full text-left px-3 py-2 text-[12.5px] text-rose-600 hover:bg-rose-50"
                  >
                    Remove from POD
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {members.length === 0 && <p className="px-4 py-8 text-center text-[12.5px] text-slate-400">No members match your search.</p>}
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
