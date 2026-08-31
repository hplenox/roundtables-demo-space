"use client";

import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import type { PodKind } from "@/types/pod";
import type { NewRecordInput } from "@/lib/mock-pods";

export default function AddRecordModal({
  kind,
  onClose,
  onSubmit,
}: {
  kind: PodKind;
  onClose: () => void;
  onSubmit: (input: NewRecordInput) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [context, setContext] = useState("");

  const noun = kind === "deal" ? "deal" : "vendor";
  const confirmer = kind === "deal" ? "the sponsor" : "their administrator";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] px-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add a {noun}</h2>
            <p className="text-[12.5px] text-slate-400 mt-0.5">Step {step} of 2 — {step === 1 ? "the opportunity" : "review & send"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          <>
            <div className="px-6 pt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">{noun === "deal" ? "Deal" : "Vendor"} name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={noun === "deal" ? "e.g. Bridgeway Logistics SPV" : "e.g. Lantern Ridge Capital"}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30 focus:border-[#0066f3]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate-500 mb-1.5">{noun === "deal" ? "Asset type" : "Category"}</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={noun === "deal" ? "Industrial real estate" : "Asset management"}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30 focus:border-[#0066f3]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Website</label>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30 focus:border-[#0066f3]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate-500 mb-1.5">{kind === "deal" ? "Sponsor" : "Administrator"} contact</label>
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={`Who at ${confirmer.replace("the ", "")} should we notify?`}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30 focus:border-[#0066f3]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Contact email</label>
                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@sponsor.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30 focus:border-[#0066f3]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">
                  Context for POD {kind === "deal" ? "investors" : "members"} — <span className="font-normal text-slate-400">shown to POD members, not to {confirmer}</span>
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="One or two lines on the opportunity and how you came across it."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13.5px] resize-none focus:outline-none focus:ring-2 focus:ring-[#0066f3]/30 focus:border-[#0066f3]"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-6 py-5 mt-2">
              <p className="text-[11.5px] text-slate-400">Investors see nothing until {confirmer} confirms this {noun} for the POD.</p>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="text-[13px] font-medium text-slate-500 hover:text-slate-700 px-3 py-2">Cancel</button>
                <button
                  onClick={() => name.trim() && setStep(2)}
                  disabled={!name.trim()}
                  className="px-4 py-2 rounded-lg bg-[#0066f3] text-white text-[13px] font-semibold hover:bg-[#0052c2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pt-5 space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="text-[14px] font-bold text-slate-900">{name}</p>
                {category && <p className="text-[12px] text-slate-500">{category}</p>}
                {contactName && <p className="text-[12px] text-slate-500">Contact: {contactName}{contactEmail ? ` · ${contactEmail}` : ""}</p>}
                {context && <p className="text-[12.5px] text-slate-600 mt-2 leading-snug">&ldquo;{context}&rdquo;</p>}
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100 text-[12px] text-blue-800">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                <p>RoundTables will notify {confirmer} on this {noun}&rsquo;s behalf. It appears to other POD members only once they confirm.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-5 mt-2">
              <button onClick={() => setStep(1)} className="text-[13px] font-medium text-slate-500 hover:text-slate-700 px-3 py-2">Back</button>
              <button
                onClick={() => onSubmit({ name: name.trim(), category: category.trim() || "Uncategorized", website: website.trim() || undefined, contactName: contactName.trim() || undefined, contactEmail: contactEmail.trim() || undefined, context: context.trim() || undefined })}
                className="px-4 py-2 rounded-lg bg-[#0066f3] text-white text-[13px] font-semibold hover:bg-[#0052c2] transition-colors"
              >
                Send to {confirmer}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
