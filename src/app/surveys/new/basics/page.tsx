"use client";

import { useEffect } from "react";
import { ensureDraft, markTouched, updateBasics, useDraft } from "@/lib/survey-draft-store";
import { HOST_ORGANIZATIONS, REQUEST_TYPES } from "@/lib/survey-draft-config";
import SectionPageShell from "@/components/surveys/SectionPageShell";
import { DraftBasics } from "@/types/survey-draft";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00b8a9]/30 focus:border-[#00b8a9]";

export default function BasicsPage() {
  const draft = useDraft();

  useEffect(() => {
    ensureDraft();
    markTouched("basics");
  }, []);

  if (!draft) return null;
  const basics = draft.basics;

  function set<K extends keyof DraftBasics>(key: K, value: DraftBasics[K]) {
    updateBasics({ [key]: value } as Partial<DraftBasics>);
  }

  return (
    <SectionPageShell
      title="Survey Basics"
      description="Who this survey is for, what type it is, and who to contact about it."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Organization" required>
          <select
            className={inputCls}
            value={basics.organization}
            onChange={(e) => set("organization", e.target.value)}
          >
            {HOST_ORGANIZATIONS.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Request Type" required>
          <select
            className={inputCls}
            value={basics.requestType}
            onChange={(e) => set("requestType", e.target.value)}
          >
            <option value="">Select a request type…</option>
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Survey Name" required>
            <input
              className={inputCls}
              placeholder={`2026 ${basics.requestType || "Survey"} + ${basics.organization}`}
              value={basics.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Start Date" required>
          <input type="date" className={inputCls} value={basics.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </Field>

        <Field label="Due Date" required>
          <input type="date" className={inputCls} value={basics.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </Field>

        <Field label="Primary Contact" required>
          <input
            className={inputCls}
            placeholder="Full name"
            value={basics.primaryContact}
            onChange={(e) => set("primaryContact", e.target.value)}
          />
        </Field>

        <Field label="Contact Email for Inquiries" required>
          <input
            type="email"
            className={inputCls}
            placeholder="name@organization.com"
            value={basics.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </Field>

        <Field label="Technical Support Email" required>
          <input
            type="email"
            className={inputCls}
            placeholder="support@organization.com"
            value={basics.technicalSupport}
            onChange={(e) => set("technicalSupport", e.target.value)}
          />
        </Field>
      </div>
    </SectionPageShell>
  );
}
