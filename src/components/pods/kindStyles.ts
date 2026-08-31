import { MessagesSquare, Handshake, Briefcase } from "lucide-react";
import { PodKind } from "@/types/pod";

export const KIND_STYLE: Record<PodKind, {
  icon: typeof MessagesSquare;
  iconBg: string;
  iconColor: string;
  badge: string;
  accent: string;
  gradient: string;
}> = {
  community: {
    icon: MessagesSquare,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    accent: "#0066f3",
    gradient: "from-blue-500/15 via-blue-500/5 to-transparent",
  },
  vendor: {
    icon: Handshake,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    accent: "#7c3aed",
    gradient: "from-violet-500/15 via-violet-500/5 to-transparent",
  },
  deal: {
    icon: Briefcase,
    iconBg: "bg-[#00b8a9]/10",
    iconColor: "text-[#00897b]",
    badge: "bg-[#00b8a9]/10 text-[#00897b] border-[#00b8a9]/25",
    accent: "#00b8a9",
    gradient: "from-[#00b8a9]/15 via-[#00b8a9]/5 to-transparent",
  },
};

export const CONFIRMATION_STYLE: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sent: "bg-amber-50 text-amber-700 border-amber-200",
  reviewing: "bg-amber-50 text-amber-700 border-amber-200",
};

export const RSVP_STYLE: Record<string, string> = {
  attending: "bg-emerald-50 text-emerald-700 border-emerald-200",
  declined: "bg-rose-50 text-rose-700 border-rose-200",
  maybe: "bg-amber-50 text-amber-700 border-amber-200",
  no_response: "bg-slate-50 text-slate-500 border-slate-200",
};
