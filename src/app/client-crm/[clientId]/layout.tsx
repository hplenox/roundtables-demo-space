"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { getClientById, STATUS_CONFIG, PRIORITY_CONFIG, CYCLE_STATUS_CONFIG, checklistProgress } from "@/lib/mock-clients";
import { ClientProvider, useClientCtx } from "./client-context";
import { ChevronRight, Handshake, Mail, Building2, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const SUB_TABS = [
  { key: "home",       label: "Home",       href: "" },
  { key: "surveys",    label: "Surveys",    href: "/surveys" },
  { key: "key-dates",  label: "Key Dates",  href: "/key-dates" },
  { key: "checklist",  label: "Checklist",  href: "/checklist" },
  { key: "onboarding", label: "Onboarding", href: "/onboarding" },
];

export default function ClientDetailLayout({ children }: { children: React.ReactNode }) {
  const { clientId } = useParams<{ clientId: string }>();
  const client = getClientById(clientId);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 text-sm">Client not found.</p>
      </div>
    );
  }

  return (
    <ClientProvider initialClient={client}>
      <ClientDetailShell clientId={clientId}>{children}</ClientDetailShell>
    </ClientProvider>
  );
}

function ClientDetailShell({ clientId, children }: { clientId: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { client, activeCycle, toasts, dismissToast } = useClientCtx();
  const st = STATUS_CONFIG[client.status];
  const pr = PRIORITY_CONFIG[client.priority];
  const progress = checklistProgress(activeCycle);
  const baseHref = `/client-crm/${clientId}`;

  const activeSub = (() => {
    if (pathname.includes("/surveys"))    return "surveys";
    if (pathname.includes("/key-dates"))  return "key-dates";
    if (pathname.includes("/checklist"))  return "checklist";
    if (pathname.includes("/onboarding")) return "onboarding";
    return "home";
  })();

  return (
    <div className="min-h-full bg-slate-50">
      <div className="h-[3px] bg-gradient-to-r from-[#00b8a9] via-[#00b8a9]/70 to-transparent" />
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11.5px]">
        <Link
          href="/client-crm"
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0f1923] text-[#00b8a9] hover:bg-[#1a2d3d] transition-colors font-semibold text-[10.5px] tracking-wide"
        >
          <Handshake size={10} strokeWidth={2} />
          Client CRM
        </Link>
        <ChevronRight size={12} className="text-slate-300 shrink-0" />
        <span className="text-slate-700 font-medium truncate max-w-xs">{client.name}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 min-w-0">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-[#0f1923] flex items-center justify-center">
                <Building2 size={18} className="text-[#00b8a9]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[17px] font-bold text-slate-900 leading-tight">{client.name}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${st.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${pr.badge}`}>
                    {pr.label}
                  </span>
                </div>
                <p className="text-[12px] text-slate-400 mt-1">
                  {client.segment} · Account Owner {client.accountOwner}
                </p>
                <p className="text-[12px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <Mail size={11} className="text-slate-300 shrink-0" />
                  {client.primaryContactName} — {client.primaryContactTitle} · {client.primaryContactEmail}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              {activeCycle ? (
                <>
                  <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide flex items-center justify-end gap-1.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold border ${CYCLE_STATUS_CONFIG[activeCycle.status].badge}`}>
                      {CYCLE_STATUS_CONFIG[activeCycle.status].label}
                    </span>
                    {activeCycle.name} &rsquo;{String(activeCycle.year).slice(2)} Checklist
                  </p>
                  <p className="text-[15px] font-bold text-slate-800 mt-0.5">
                    {progress.done}/{progress.total} <span className="text-[11px] font-medium text-slate-400">complete</span>
                  </p>
                  <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5 ml-auto">
                    <div
                      className="h-full rounded-full bg-[#00b8a9] transition-all duration-500"
                      style={{ width: `${progress.pct}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-[11.5px] text-slate-400 max-w-[160px]">No active survey cycle</p>
              )}
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-0 px-5 border-t border-slate-100">
          {SUB_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`${baseHref}${tab.href}`}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-150 ${
                activeSub === tab.key
                  ? "border-[#00b8a9] text-[#00897b]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {children}

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-[12.5px] ${
              t.tone === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : t.tone === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            {t.tone === "success" ? (
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
            ) : t.tone === "warning" ? (
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            ) : (
              <Info size={15} className="shrink-0 mt-0.5" />
            )}
            <p className="flex-1">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
