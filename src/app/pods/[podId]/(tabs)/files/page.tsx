"use client";

import { useState } from "react";
import { Upload, Eye, Download, MoreHorizontal, FileText, CalendarClock, MessagesSquare, Shapes } from "lucide-react";
import { usePodCtx } from "../../pod-context";
import type { PodFileSource } from "@/types/pod";

const SOURCE_TAG: Record<PodFileSource, { label: string; style: string; icon: typeof CalendarClock }> = {
  event: { label: "Shared from event", style: "bg-blue-50 text-blue-700 border-blue-200", icon: CalendarClock },
  discussion: { label: "Shared in discussion", style: "bg-violet-50 text-violet-700 border-violet-200", icon: MessagesSquare },
  pod: { label: "POD-wide", style: "bg-slate-50 text-slate-500 border-slate-200", icon: Shapes },
};

export default function PodFilesPage() {
  const { pod, uploadPodFile } = usePodCtx();
  const [filter, setFilter] = useState<"all" | PodFileSource>("all");

  const files = pod.files.filter((f) => filter === "all" || f.source === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
          {([
            { key: "all", label: "All files" },
            { key: "event", label: "From events" },
            { key: "discussion", label: "From discussion" },
          ] as { key: "all" | PodFileSource; label: string }[]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${filter === opt.key ? "bg-[#0f1923] text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => uploadPodFile("New Upload.pdf", "1.4 MB")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0066f3] text-white text-[12.5px] font-semibold hover:bg-[#0052c2] transition-colors"
        >
          <Upload size={14} /> Upload
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {files.map((f) => {
          const tag = SOURCE_TAG[f.source];
          const TagIcon = tag.icon;
          return (
            <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{f.name}</p>
                  <p className="text-[11.5px] text-slate-400 truncate">{f.sizeLabel} · {f.uploadedBy} · {f.uploadedDateLabel}</p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${tag.style}`}>
                  <TagIcon size={10} /> {tag.label}
                </span>
                <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"><Eye size={13} /></button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"><Download size={13} /></button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"><MoreHorizontal size={13} /></button>
              </div>
            </div>
          );
        })}
        {files.length === 0 && <p className="px-4 py-10 text-center text-[12.5px] text-slate-400">No files yet.</p>}
      </div>
    </div>
  );
}
