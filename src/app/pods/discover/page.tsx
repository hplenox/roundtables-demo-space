"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Check } from "lucide-react";
import { getDiscoverablePods, joinDiscoverablePod } from "@/lib/mock-pods";
import { KIND_STYLE } from "@/components/pods/kindStyles";
import PodBreadcrumb from "@/components/pods/PodBreadcrumb";

export default function DiscoverPodsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pods, setPods] = useState(getDiscoverablePods());
  const [requested, setRequested] = useState<string[]>([]);
  const [joinedId, setJoinedId] = useState<string | null>(null);

  const filtered = pods.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())
  );

  function handleJoin(discId: string, policy: "open" | "request") {
    if (policy === "request") {
      setRequested((prev) => [...prev, discId]);
      return;
    }
    const pod = joinDiscoverablePod(discId);
    if (pod) {
      setPods((prev) => prev.filter((p) => p.id !== discId));
      setJoinedId(pod.id);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      {/* Sticky, full-bleed platform-style header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 pt-5 pb-5">
          <div className="mb-4">
            <PodBreadcrumb items={[{ label: "My PODs", href: "/pods" }, { label: "Discover" }]} />
          </div>

          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Discover PODs</h1>
          <p className="text-[13px] text-slate-500 mt-1">Networks and lists other RoundTables members have opened up beyond your organization.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="relative max-w-md mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search discoverable PODs"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
          />
        </div>

        {joinedId && (
          <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-[13px] text-emerald-800 font-medium flex items-center gap-2">
              <Check size={15} />
              You joined the POD.
            </p>
            <button
              onClick={() => router.push(`/pods/${joinedId}`)}
              className="text-[12.5px] font-semibold text-emerald-700 hover:underline"
            >
              View POD →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((d) => {
            const style = KIND_STYLE[d.kind];
            const Icon = style.icon;
            const isRequested = requested.includes(d.id);
            return (
              <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${style.iconBg}`}>
                    <Icon size={18} className={style.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-bold text-slate-900 leading-tight">{d.name}</p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">{d.category}</p>
                  </div>
                </div>
                <p className="text-[12.5px] text-slate-500 leading-snug mb-4 flex-1">{d.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-[11.5px] text-slate-400">
                    <p className="font-medium text-slate-500">Hosted by {d.hostedBy}</p>
                    <p className="flex items-center gap-1 mt-0.5"><Users size={11} /> {d.memberCount} members</p>
                  </div>
                  <button
                    onClick={() => handleJoin(d.id, d.joinPolicy)}
                    disabled={isRequested}
                    className={`px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-colors ${
                      isRequested
                        ? "bg-slate-100 text-slate-400 cursor-default"
                        : "bg-[#4361ee] text-white hover:bg-[#3650d4]"
                    }`}
                  >
                    {isRequested ? "Request sent" : d.joinPolicy === "open" ? "Join POD" : "Request to join"}
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="sm:col-span-2 bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <p className="text-[13px] text-slate-400">No discoverable PODs match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
