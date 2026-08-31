"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, Clock, Info, Check } from "lucide-react";
import { getOrgById } from "@/lib/mock-org-associations";
import { ORG_REGISTRY } from "@/lib/mock-organizations";
import {
  getSurveyHistoryForOrg,
  getDefaultPrefillSourceId,
  OrgSurveyHistoryEntry,
} from "@/lib/mock-org-survey-history";
import { useCustomOrgRecords } from "@/lib/org-registry-store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: OrgSurveyHistoryEntry["status"] }) {
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
        <CheckCircle2 size={9} /> Submitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
      <Clock size={9} /> In progress
    </span>
  );
}

export default function OrgDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const customOrgs = useCustomOrgRecords();
  const customOrg = customOrgs.find((r) => r.org.id === orgId);
  const org = getOrgById(orgId) ?? customOrg?.org;
  const registryRow =
    ORG_REGISTRY.find((r) => r.orgId === orgId) ??
    (customOrg
      ? {
          displayId: customOrg.displayId,
          orgId: customOrg.org.id,
          name: customOrg.org.name,
          orgCode: customOrg.orgCode,
          lpiScore: null,
          lastUpdated: customOrg.createdAt,
          totalUsers: 0,
          status: "Active" as const,
        }
      : undefined);
  const history = getSurveyHistoryForOrg(orgId);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(() => getDefaultPrefillSourceId(orgId));
  const [savedSourceId, setSavedSourceId] = useState<string | null>(() => getDefaultPrefillSourceId(orgId));
  const [toast, setToast] = useState<string | null>(null);

  if (!org) {
    return (
      <div className="text-center py-16">
        <p className="text-[13px] text-gray-500">Organization not found.</p>
        <Link href="/admin/organizations" className="text-blue-600 text-[12.5px] font-medium hover:underline mt-2 inline-block">
          ← Back to All Organizations
        </Link>
      </div>
    );
  }

  const defaultSourceId = getDefaultPrefillSourceId(orgId);
  const hasUnsavedChange = selectedSourceId !== savedSourceId;

  function handleSave() {
    setSavedSourceId(selectedSourceId);
    const entry = history.find((h) => h.id === selectedSourceId);
    setToast(
      entry
        ? `${entry.surveyName} (${entry.year}) set as the pre-fill source for ${org?.name}'s next survey.`
        : "Pre-fill source updated."
    );
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm flex items-center gap-2.5 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-white/10 text-[13px] font-medium">
          <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
          {toast}
        </div>
      )}

      <Link href="/admin/organizations" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft size={13} /> All Organizations
      </Link>

      {/* Org header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-serif text-[20px] font-bold text-gray-900">{org.name}</h2>
              <p className="text-[12.5px] text-gray-400 mt-0.5">
                {org.domains && org.domains.length > 0 ? org.domains.join(", ") : org.domain} · {org.type}
              </p>
              {customOrg && (
                <p className="text-[11px] text-gray-400 mt-0.5">Unique identifier: {customOrg.uniqueId}</p>
              )}
            </div>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              registryRow?.status === "Archived"
                ? "bg-gray-100 text-gray-500 border-gray-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {registryRow?.status ?? "Active"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100">
          {[
            { label: "Org Code", value: registryRow?.orgCode ?? "—" },
            {
              label: "LPI Score",
              value: registryRow?.lpiScore !== null && registryRow?.lpiScore !== undefined ? registryRow.lpiScore.toFixed(3) : "N/A",
            },
            { label: "Total Users", value: String(registryRow?.totalUsers ?? 0) },
            { label: "Last Updated", value: registryRow ? formatDate(registryRow.lastUpdated) : "—" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</p>
              <p className="text-[14px] font-semibold text-gray-900 mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Survey history */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="font-serif text-[15px] font-semibold text-gray-900">Survey History</span>
            <span className="bg-gray-100 text-gray-600 text-[12px] font-semibold px-2 py-0.5 rounded">
              {history.length}
            </span>
          </div>
          {history.length === 0 ? (
            <p className="text-[12.5px] text-gray-400 italic px-4 py-8 text-center">
              No survey history recorded yet for this organization.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((entry) => (
                <div key={entry.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-gray-900 truncate" title={entry.surveyName}>
                      {entry.surveyName}
                    </p>
                    <StatusBadge status={entry.status} />
                  </div>
                  <p className="text-[11.5px] text-gray-400 mt-0.5">
                    {entry.hostOrg} · {entry.year} · {formatDate(entry.submittedDate)}
                  </p>
                  <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">{entry.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pre-fill source selection */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="font-serif text-[15px] font-semibold text-gray-900">Pre-fill Source for Next Survey</span>
          </div>

          {history.length === 0 ? (
            <p className="text-[12.5px] text-gray-400 italic px-4 py-8 text-center">
              No prior survey to pre-fill from — {org.name}&rsquo;s next survey will start blank.
            </p>
          ) : (
            <div className="px-4 py-3.5">
              <div className="flex items-start gap-1.5 text-[11.5px] text-blue-900 bg-blue-50 border border-blue-100 rounded-md px-3 py-2.5 mb-3">
                <Info size={12} className="text-blue-400 mt-0.5 shrink-0" />
                <span>
                  The selected response will pre-populate {org.name}&rsquo;s next survey. Defaults to the most
                  recently <span className="font-semibold">completed</span> survey — never one still in
                  progress, so incomplete data never carries forward automatically.
                </span>
              </div>

              <div className="space-y-1.5">
                {history.map((entry) => {
                  const selected = selectedSourceId === entry.id;
                  const isDefault = entry.id === defaultSourceId;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setSelectedSourceId(entry.id)}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-md border text-left transition-colors ${
                        selected ? "border-blue-300 bg-blue-50/60" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                        }`}
                      >
                        {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[12.5px] font-medium text-gray-900 truncate">{entry.surveyName}</span>
                          {isDefault && (
                            <span className="shrink-0 text-[9.5px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                              Latest completed
                            </span>
                          )}
                        </span>
                        <span className="block text-[11px] text-gray-400 mt-0.5">
                          {entry.hostOrg} · {formatDate(entry.submittedDate)}
                        </span>
                      </span>
                      <span className="shrink-0 mt-0.5">
                        <StatusBadge status={entry.status} />
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={!hasUnsavedChange}
                className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-[12px] font-semibold disabled:opacity-40 disabled:pointer-events-none hover:bg-blue-700 transition-colors"
              >
                {hasUnsavedChange ? "Save selection" : "Selection saved"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
