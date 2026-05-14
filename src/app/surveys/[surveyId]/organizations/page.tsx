"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getOrgsBySurveyId } from "@/lib/mock-data";
import { InvitedOrg } from "@/types/survey";
import {
  ArrowRight, Search, SlidersHorizontal, Mail, X, Send, CheckCircle,
  BellRing, Upload, Download, AlertTriangle, CheckCircle2, Users,
  ChevronRight, Plus, Trash2, Check, FileText,
} from "lucide-react";

// ══ Shared types ══════════════════════════════════════════════════════════════

type StatusFilter = "all" | "submitted" | "in_progress" | "not_started";

interface UploadedContact {
  id: string;
  orgName: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ContactIssue {
  field: "orgName" | "firstName" | "lastName" | "email";
  message: string;
}

// ══ Constants ═════════════════════════════════════════════════════════════════

const STATUS_CONFIG = {
  submitted:   { label: "Submitted",   dot: "bg-emerald-400", text: "text-emerald-700", badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  in_progress: { label: "In Progress", dot: "bg-amber-400",   text: "text-amber-700",   badge: "bg-amber-50 border-amber-200 text-amber-700" },
  not_started: { label: "Not Started", dot: "bg-slate-300",   text: "text-slate-500",   badge: "bg-slate-50 border-slate-200 text-slate-500" },
};

const UPLOAD_STEPS = [
  { id: 1, label: "Upload CSV" },
  { id: 2, label: "Review & Fix" },
  { id: 3, label: "Edit Contacts" },
  { id: 4, label: "Submit for Approval" },
  { id: 5, label: "Pending Approval" },
  { id: 6, label: "Launch" },
];

const SAMPLE_DATA: UploadedContact[] = [
  { id: "s-1", orgName: "Acme Capital Partners",     firstName: "Sarah",   lastName: "Johnson", email: "s.johnson@acmecapital.com" },
  { id: "s-2", orgName: "Blue Harbor Investments",   firstName: "Michael", lastName: "Chen",    email: "" },
  { id: "s-3", orgName: "Summit Growth Fund",        firstName: "Priya",   lastName: "Sharma",  email: "p.sharma@summitgrowth.com" },
  { id: "s-4", orgName: "",                          firstName: "David",   lastName: "Park",    email: "d.park@crestview.com" },
  { id: "s-5", orgName: "Vanguard Private Equity",   firstName: "Lisa",    lastName: "Wong",    email: "lisa.wong-invalid" },
  { id: "s-6", orgName: "Meridian Asset Management", firstName: "James",   lastName: "Okonkwo", email: "j.okonkwo@meridian.com" },
  { id: "s-7", orgName: "Nexus Capital Group",       firstName: "Rachel",  lastName: "Torres",  email: "r.torres@nexuscapital.com" },
];

// ══ Helpers ═══════════════════════════════════════════════════════════════════

function getContactIssues(c: UploadedContact): ContactIssue[] {
  const issues: ContactIssue[] = [];
  if (!c.orgName.trim()) issues.push({ field: "orgName", message: "Organization name required" });
  if (!c.firstName.trim()) issues.push({ field: "firstName", message: "First name required" });
  if (!c.lastName.trim()) issues.push({ field: "lastName", message: "Last name required" });
  if (!c.email.trim()) {
    issues.push({ field: "email", message: "Email required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
    issues.push({ field: "email", message: "Invalid email format" });
  }
  return issues;
}

function parseCSV(text: string): UploadedContact[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  return lines
    .slice(1)
    .map((line, i) => {
      const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      return {
        id: `c-${Date.now()}-${i}`,
        orgName: parts[0] ?? "",
        firstName: parts[1] ?? "",
        lastName: parts[2] ?? "",
        email: parts[3] ?? "",
      };
    })
    .filter((c) => c.orgName || c.firstName || c.lastName || c.email);
}

function downloadTemplate() {
  const csv =
    "Organization Name,First Name,Last Name,Email\nExample Organization,Jane,Smith,jane.smith@example.com\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contacts_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ══ Step bar ══════════════════════════════════════════════════════════════════

function StepBar({ current }: { current: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-6 py-4">
      {/* Circle row */}
      <div className="flex items-center">
        {UPLOAD_STEPS.flatMap((step, i) => {
          const done = step.id < current;
          const active = step.id === current;
          const node = (
            <div
              key={`node-${step.id}`}
              className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[12px] font-bold transition-all
                ${done ? "bg-[#00b8a9] text-white" : active ? "bg-[#0f1923] text-white" : "bg-slate-100 text-slate-400"}`}
            >
              {done ? <Check size={13} strokeWidth={2.5} /> : step.id}
            </div>
          );
          const line = i < UPLOAD_STEPS.length - 1 ? (
            <div key={`line-${step.id}`} className={`flex-1 h-px transition-colors ${done ? "bg-[#00b8a9]" : "bg-slate-200"}`} />
          ) : null;
          return line ? [node, line] : [node];
        })}
      </div>
      {/* Label row */}
      <div className="flex justify-between mt-2.5">
        {UPLOAD_STEPS.map((step) => {
          const done = step.id < current;
          const active = step.id === current;
          return (
            <p
              key={step.id}
              className={`text-[9.5px] font-medium text-center leading-tight max-w-[62px]
                ${active ? "text-slate-800 font-semibold" : done ? "text-[#00897b]" : "text-slate-400"}`}
            >
              {step.label}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// ══ Step 1 — Upload ═══════════════════════════════════════════════════════════

function StepUpload({ onContinue }: { onContinue: (contacts: UploadedContact[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onContinue(parseCSV(text));
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-100">
        <p className="text-[13px] font-semibold text-slate-800">Upload your contact list</p>
        <p className="text-[12px] text-slate-400 mt-0.5">
          Each row in your CSV represents one invited organization contact.
        </p>
      </div>
      <div className="p-6 max-w-lg mx-auto space-y-5">
        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl py-12 text-center cursor-pointer transition-all
            ${isDragging
              ? "border-[#00b8a9] bg-[#00b8a9]/5"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
          }}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Upload size={22} className="text-slate-400" />
          </div>
          <p className="text-[13px] font-medium text-slate-600">Drop your CSV here</p>
          <p className="text-[11.5px] text-slate-400 mt-1">or click to browse files · .csv only</p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[11px] text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={13} />
            Download Template
          </button>
          <button
            onClick={() => onContinue(SAMPLE_DATA)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
          >
            <FileText size={13} />
            Load sample data
          </button>
        </div>

        {/* Column guide */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Required CSV columns</p>
          <div className="flex flex-wrap gap-2">
            {["Organization Name", "First Name", "Last Name", "Email"].map((col) => (
              <span key={col} className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 font-medium">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══ Shared editable cell ══════════════════════════════════════════════════════

function EditableCell({
  value,
  issue,
  placeholder,
  onChange,
}: {
  value: string;
  issue?: ContactIssue;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={issue ? issue.message : placeholder}
        className={`w-full text-[12px] px-2 py-1 rounded-md border transition-colors focus:outline-none
          ${issue
            ? "border-red-300 bg-red-50 text-red-700 placeholder:text-red-300 focus:border-red-400"
            : "border-transparent bg-transparent text-slate-700 placeholder:text-slate-300 hover:border-slate-200 focus:border-slate-300 focus:bg-white"}`}
      />
      {issue && (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <AlertTriangle size={11} className="text-red-400" />
        </div>
      )}
    </div>
  );
}

// ══ Step 2 — Review & Fix ════════════════════════════════════════════════════

type ReviewFilter = "all" | "issues" | "clean";

function StepReview({
  initialContacts,
  onBack,
  onContinue,
}: {
  initialContacts: UploadedContact[];
  onBack: () => void;
  onContinue: (contacts: UploadedContact[]) => void;
}) {
  const [contacts, setContacts] = useState(initialContacts);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");

  const withIssues = contacts.filter((c) => getContactIssues(c).length > 0);
  const clean = contacts.filter((c) => getContactIssues(c).length === 0);
  const issueCount = contacts.flatMap((c) => getContactIssues(c)).length;
  const canContinue = issueCount === 0;

  const visible =
    reviewFilter === "issues" ? withIssues
    : reviewFilter === "clean" ? clean
    : contacts;

  const updateField = (id: string, field: keyof UploadedContact, value: string) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      {issueCount > 0 ? (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[12.5px] font-semibold text-amber-800">
              {issueCount} issue{issueCount !== 1 ? "s" : ""} found across {withIssues.length} contact{withIssues.length !== 1 ? "s" : ""}
            </p>
            <p className="text-[11.5px] text-amber-600 mt-0.5">
              Click any highlighted field to edit it inline. Fix all issues to continue.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          <p className="text-[12.5px] font-semibold text-emerald-800">
            All {contacts.length} contacts look good — ready to continue!
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Filter chips + count */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          {(
            [
              { key: "all",    label: "All",               count: contacts.length,  activeClass: "bg-[#0f1923] border-[#0f1923] text-white" },
              { key: "issues", label: "Requires Changes",  count: withIssues.length, activeClass: "bg-red-600 border-red-600 text-white" },
              { key: "clean",  label: "Successful",        count: clean.length,     activeClass: "bg-emerald-600 border-emerald-600 text-white" },
            ] as { key: ReviewFilter; label: string; count: number; activeClass: string }[]
          ).map(({ key, label, count, activeClass }) => {
            const active = reviewFilter === key;
            return (
              <button
                key={key}
                onClick={() => setReviewFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium border transition-all duration-150
                  ${active ? activeClass : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold
                  ${active ? "bg-white/20 text-inherit" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Column headers */}
        <div
          className="grid gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider"
          style={{ gridTemplateColumns: "28px 1fr 1fr 1fr 1.6fr" }}
        >
          <div>#</div>
          <div>Organization Name</div>
          <div>First Name</div>
          <div>Last Name</div>
          <div>Email</div>
        </div>

        {visible.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[12.5px] text-slate-400">
              {reviewFilter === "issues" ? "No issues found — all contacts look good." : "No contacts to show."}
            </p>
          </div>
        ) : (
          visible.map((contact, idx) => {
            const issues = getContactIssues(contact);
            const fieldIssue = (f: ContactIssue["field"]) => issues.find((i) => i.field === f);
            const hasIssues = issues.length > 0;

            return (
              <div
                key={contact.id}
                className={`grid gap-2 px-4 py-2 border-b border-slate-50 last:border-0 items-center
                  ${hasIssues ? "bg-red-50/20" : ""}`}
                style={{ gridTemplateColumns: "28px 1fr 1fr 1fr 1.6fr" }}
              >
                <span className="text-[11px] text-slate-400 tabular-nums">{idx + 1}</span>
                <EditableCell value={contact.orgName} issue={fieldIssue("orgName")} onChange={(v) => updateField(contact.id, "orgName", v)} />
                <EditableCell value={contact.firstName} issue={fieldIssue("firstName")} onChange={(v) => updateField(contact.id, "firstName", v)} />
                <EditableCell value={contact.lastName} issue={fieldIssue("lastName")} onChange={(v) => updateField(contact.id, "lastName", v)} />
                <EditableCell value={contact.email} issue={fieldIssue("email")} placeholder="email@example.com" onChange={(v) => updateField(contact.id, "email", v)} />
              </div>
            );
          })
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <p className="text-[11.5px] text-slate-400">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
          <button
            onClick={() => onContinue(contacts)}
            disabled={!canContinue}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12.5px] font-medium transition-colors
              ${canContinue
                ? "bg-[#0f1923] text-white hover:bg-[#1a2733]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            Continue <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ══ Step 3 — Edit Contacts ════════════════════════════════════════════════════

function StepEdit({
  initialContacts,
  onBack,
  onContinue,
}: {
  initialContacts: UploadedContact[];
  onBack: () => void;
  onContinue: (contacts: UploadedContact[]) => void;
}) {
  const [contacts, setContacts] = useState(initialContacts);

  const allIssues = contacts.flatMap((c) => getContactIssues(c));
  const canContinue = allIssues.length === 0;

  const updateField = (id: string, field: keyof UploadedContact, value: string) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addRow = () => {
    setContacts((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, orgName: "", firstName: "", lastName: "", email: "" },
    ]);
  };

  const deleteRow = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2.5">
          <Users size={14} className="text-slate-500" />
          <p className="text-[12.5px] font-medium text-slate-700">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} · Make any final changes before submitting
          </p>
        </div>
        {allIssues.length > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
            <AlertTriangle size={12} />
            {allIssues.length} issue{allIssues.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div
          className="grid gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider"
          style={{ gridTemplateColumns: "28px 1fr 1fr 1fr 1.6fr 28px" }}
        >
          <div>#</div>
          <div>Organization Name</div>
          <div>First Name</div>
          <div>Last Name</div>
          <div>Email</div>
          <div />
        </div>

        {contacts.map((contact, idx) => {
          const issues = getContactIssues(contact);
          const fieldIssue = (f: ContactIssue["field"]) => issues.find((i) => i.field === f);

          return (
            <div
              key={contact.id}
              className="group grid gap-2 px-4 py-2 border-b border-slate-50 last:border-0 items-center"
              style={{ gridTemplateColumns: "28px 1fr 1fr 1fr 1.6fr 28px" }}
            >
              <span className="text-[11px] text-slate-400 tabular-nums">{idx + 1}</span>
              <EditableCell value={contact.orgName} issue={fieldIssue("orgName")} onChange={(v) => updateField(contact.id, "orgName", v)} />
              <EditableCell value={contact.firstName} issue={fieldIssue("firstName")} onChange={(v) => updateField(contact.id, "firstName", v)} />
              <EditableCell value={contact.lastName} issue={fieldIssue("lastName")} onChange={(v) => updateField(contact.id, "lastName", v)} />
              <EditableCell value={contact.email} issue={fieldIssue("email")} placeholder="email@example.com" onChange={(v) => updateField(contact.id, "email", v)} />
              <button
                onClick={() => deleteRow(contact.id)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}

        {/* Add row */}
        <button
          onClick={addRow}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] font-medium text-slate-400 hover:text-[#00897b] hover:bg-slate-50 transition-colors border-t border-slate-50"
        >
          <Plus size={13} />
          Add contact
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => onContinue(contacts)}
          disabled={!canContinue}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12.5px] font-medium transition-colors
            ${canContinue
              ? "bg-[#0f1923] text-white hover:bg-[#1a2733]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
        >
          Continue to Submit <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ══ Step 4 — Submit for Approval ══════════════════════════════════════════════

function StepSubmit({
  contacts,
  onBack,
  onSubmit,
}: {
  contacts: UploadedContact[];
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit();
    }, 1600);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100">
          <p className="text-[13px] font-semibold text-slate-800">Review & submit for LPS approval</p>
          <p className="text-[12px] text-slate-400 mt-0.5">
            The LPS team will review your contact list and notify you once approved.
          </p>
        </div>

        <div className="p-6 max-w-lg mx-auto space-y-5">
          {/* Summary card */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-[#00b8a9]/10 flex items-center justify-center shrink-0">
              <Users size={22} className="text-[#00b8a9]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-800">{contacts.length} contacts</p>
              <p className="text-[11.5px] text-slate-500 mt-0.5">ready to submit for approval</p>
            </div>
          </div>

          {/* Contact preview list */}
          <div className="bg-white rounded-xl border border-slate-100 max-h-52 overflow-y-auto">
            {contacts.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0"
              >
                <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[8.5px] font-bold text-slate-500">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700 truncate">{c.orgName}</p>
                  <p className="text-[10.5px] text-slate-400 truncate">
                    {c.firstName} {c.lastName} · {c.email}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0f1923] text-white text-[13px] font-semibold hover:bg-[#1a2733] transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting to LPS team…
              </>
            ) : (
              <>
                <Send size={14} />
                Submit for LPS Approval
              </>
            )}
          </button>

          <p className="text-center text-[10.5px] text-slate-400">
            For demo purposes — no actual submission is sent.
          </p>
        </div>
      </div>

      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="px-4 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// ══ Step 5 — Pending Approval ═════════════════════════════════════════════════

function StepPendingApproval({ count, onApprove }: { count: number; onApprove: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-6 py-5 border-b border-slate-100">
        <p className="text-[13px] font-semibold text-slate-800">Pending LPS approval</p>
        <p className="text-[12px] text-slate-400 mt-0.5">
          Your contact list has been submitted. The LPS team is reviewing your {count} contacts.
        </p>
      </div>

      <div className="p-6 max-w-lg mx-auto space-y-5">
        {/* Status badge */}
        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-amber-800">Awaiting LPS review</p>
            <p className="text-[11.5px] text-amber-600 mt-0.5">
              {count} contacts submitted · You&apos;ll be notified once approved
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div className="space-y-3">
          <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">What happens next</p>
          {[
            "LPS team reviews your contact list for completeness and accuracy",
            "Any issues will be flagged back to you for correction",
            "Once approved, your survey will be ready to launch",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] font-bold text-slate-400">{i + 1}</span>
              </div>
              <p className="text-[12px] text-slate-600 leading-snug">{item}</p>
            </div>
          ))}
        </div>

        {/* Demo trigger */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[10.5px] text-slate-400 mb-3 text-center italic">
            Demo trigger — simulate LPS approval:
          </p>
          <button
            onClick={onApprove}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[#00b8a9]/40 text-[#00897b] text-[12.5px] font-semibold hover:bg-[#00b8a9]/5 transition-colors"
          >
            <Check size={14} />
            Mark as Approved by LPS
          </button>
        </div>
      </div>
    </div>
  );
}

// ══ Step 6 — Launch ═══════════════════════════════════════════════════════════

function StepLaunch({ contacts, surveyId }: { contacts: UploadedContact[]; surveyId: string }) {
  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="bg-white rounded-xl border border-slate-200 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} className="text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-800">Survey launched!</p>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Invitations have been sent to {contacts.length} organization{contacts.length !== 1 ? "s" : ""} below.
            </p>
          </div>
          <Link
            href={`/surveys/${surveyId}`}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0f1923] text-white text-[12px] font-semibold hover:bg-[#1a2733] transition-colors"
          >
            View Overview <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Invited contacts table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Invited Organizations</p>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {contacts.length} sent
          </span>
        </div>

        {/* Column headers */}
        <div
          className="grid gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider"
          style={{ gridTemplateColumns: "28px 1fr 1fr 1.6fr 80px" }}
        >
          <div>#</div>
          <div>Organization</div>
          <div>Contact</div>
          <div>Email</div>
          <div className="text-center">Status</div>
        </div>

        {contacts.map((c, i) => (
          <div
            key={c.id}
            className="grid gap-4 px-5 py-3 border-b border-slate-50 last:border-0 items-center"
            style={{ gridTemplateColumns: "28px 1fr 1fr 1.6fr 80px" }}
          >
            <span className="text-[11px] text-slate-400 tabular-nums">{i + 1}</span>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-[8.5px] font-bold text-slate-500">
                  {c.orgName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-[12.5px] font-semibold text-slate-700 truncate">{c.orgName}</p>
            </div>
            <p className="text-[12px] text-slate-600 truncate">{c.firstName} {c.lastName}</p>
            <p className="text-[12px] text-slate-500 truncate">{c.email}</p>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Invited
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══ Upload flow container ═════════════════════════════════════════════════════

function ContactUploadFlow({ surveyId }: { surveyId: string }) {
  const [step, setStep] = useState(1);
  const [contacts, setContacts] = useState<UploadedContact[]>([]);

  return (
    <div className="space-y-4">
      <StepBar current={step} />

      {step === 1 && (
        <StepUpload
          onContinue={(uploaded) => {
            setContacts(uploaded);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <StepReview
          initialContacts={contacts}
          onBack={() => setStep(1)}
          onContinue={(fixed) => {
            setContacts(fixed);
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <StepEdit
          initialContacts={contacts}
          onBack={() => setStep(2)}
          onContinue={(edited) => {
            setContacts(edited);
            setStep(4);
          }}
        />
      )}

      {step === 4 && (
        <StepSubmit
          contacts={contacts}
          onBack={() => setStep(3)}
          onSubmit={() => setStep(5)}
        />
      )}

      {step === 5 && (
        <StepPendingApproval count={contacts.length} onApprove={() => setStep(6)} />
      )}

      {step === 6 && <StepLaunch contacts={contacts} surveyId={surveyId} />}
    </div>
  );
}

// ══ Existing org-table components ════════════════════════════════════════════

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2.5 w-36">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: value === 100 ? "#00b8a9" : value > 0 ? "#fbbf24" : "transparent",
          }}
        />
      </div>
      <span className="text-[11.5px] text-slate-500 tabular-nums w-8 text-right">{value}%</span>
    </div>
  );
}

function LpiScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[12px] text-slate-300">—</span>;
  const color = score >= 8 ? "text-emerald-600" : score >= 6.5 ? "text-amber-600" : "text-red-600";
  return <span className={`text-[13px] font-semibold tabular-nums ${color}`}>{score}</span>;
}

function buildEmailBody(org: InvitedOrg): string {
  return `Dear ${org.contactName},

We hope this message finds you well. We're reaching out because ${org.name}'s survey response is currently at ${org.progress}% completion, and we'd love to see you cross the finish line.

Your organization's participation is essential to our DEI benchmarking initiative. Completing the survey ensures ${org.name} is fully represented in this year's LPI results and enables a richer, more accurate picture of diversity, equity, and inclusion across the industry.

Please log in at your earliest convenience to complete the remaining sections. If you have any questions or run into any issues, our team is here to help.

Thank you for your continued partnership.

Warm regards,
Survey Administration Team`;
}

function NudgeEmailModal({ orgs, onClose }: { orgs: InvitedOrg[]; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const isBulk = orgs.length > 1;
  const single = orgs[0];

  const subject = "Action Required: Complete Your DEI Survey Submission";

  const bulkBodyPreview = `Dear [Contact Name],

We hope this message finds you well. We're reaching out because [Organization Name]'s survey response is currently at [X]% completion, and we'd love to see you cross the finish line.

Your organization's participation is essential to our DEI benchmarking initiative. Completing the survey ensures your firm is fully represented in this year's LPI results and enables a richer, more accurate picture of diversity, equity, and inclusion across the industry.

Please log in at your earliest convenience to complete the remaining sections. If you have any questions or run into any issues, our team is here to help.

Thank you for your continued partnership.

Warm regards,
Survey Administration Team`;

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { onClose(); }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5f3] flex items-center justify-center shrink-0">
              <Mail size={15} className="text-[#00897b]" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800">
                {isBulk ? `Nudge ${orgs.length} Organizations` : "Send Nudge Reminder"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBulk
                  ? `${orgs.length} contacts · all under 80% completion`
                  : `${single.contactName} · ${single.progress}% complete`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <p className="text-[14px] font-semibold text-slate-800">
              {isBulk ? `${orgs.length} Nudges Queued!` : "Nudge Sent!"}
            </p>
            <p className="text-[12px] text-slate-400 text-center max-w-xs">
              {isBulk
                ? `Personalized reminders have been queued for all ${orgs.length} organizations.`
                : `A reminder has been queued for ${single.contactName} at ${single.contactEmail}.`}
            </p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide w-14 shrink-0 mt-0.5">To</span>
                {isBulk ? (
                  <div className="flex flex-wrap gap-1">
                    {orgs.slice(0, 4).map((o) => (
                      <span key={o.id} className="text-[11px] bg-white border border-slate-200 rounded-md px-2 py-0.5 text-slate-600">
                        {o.contactEmail}
                      </span>
                    ))}
                    {orgs.length > 4 && (
                      <span className="text-[11px] bg-white border border-slate-200 rounded-md px-2 py-0.5 text-slate-500 italic">
                        +{orgs.length - 4} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[12px] text-slate-700">{single.contactEmail}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide w-14 shrink-0">Subject</span>
                <span className="text-[12px] text-slate-700">{subject}</span>
              </div>
            </div>
            <div className="px-5 py-4 max-h-64 overflow-y-auto">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <pre className="text-[11.5px] text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                  {isBulk ? bulkBodyPreview : buildEmailBody(single)}
                </pre>
              </div>
              {isBulk && (
                <p className="text-[10.5px] text-slate-400 mt-2 text-center italic">
                  Preview shown with placeholders — each email will be personalized per organization.
                </p>
              )}
              {!isBulk && (
                <p className="text-[10.5px] text-slate-400 mt-2 text-center italic">
                  For demo purposes only — no actual email will be sent.
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
              <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f1923] text-white text-[12px] font-medium hover:bg-[#1a2733] transition-colors"
              >
                <Send size={12} />
                {isBulk ? `Send ${orgs.length} Nudges` : "Send Nudge"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OrgRow({ org, surveyId, onNudge }: { org: InvitedOrg; surveyId: string; onNudge: (org: InvitedOrg) => void }) {
  const st = STATUS_CONFIG[org.status];
  const canNudge = org.progress < 80;

  return (
    <div className="group relative border-b border-slate-50 last:border-0">
      <Link
        href={`/surveys/${surveyId}/organizations/${org.id}`}
        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-slate-600">{org.name.substring(0, 2).toUpperCase()}</span>
            </div>
            <p className="text-[13px] font-semibold text-slate-800 group-hover:text-[#00897b] transition-colors truncate">{org.name}</p>
            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{org.type}</span>
          </div>
          <p className="text-[11.5px] text-slate-400 ml-8 truncate">
            {org.contactName} · {org.assetClass} · {org.location}
          </p>
        </div>
        <div className="hidden xl:block w-16 text-right">
          <p className="text-[12.5px] font-medium text-slate-700">{org.aum}</p>
          <p className="text-[10.5px] text-slate-400">AUM</p>
        </div>
        <div className="hidden lg:block w-16 text-center">
          <LpiScore score={org.lpiScore} />
          {org.lpiScore !== null && <p className="text-[10px] text-slate-400">LPI Score</p>}
        </div>
        <div className="hidden sm:block">
          <ProgressCell value={org.progress} />
        </div>
        <div className="w-24 text-right">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${st.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>
        <div className="hidden lg:block w-24 text-right">
          <p className="text-[11.5px] text-slate-400">{org.lastActivity ?? "No activity"}</p>
        </div>
        <div className="w-6 shrink-0" />
        <ArrowRight size={14} className="shrink-0 text-slate-300 group-hover:text-[#00b8a9] group-hover:translate-x-0.5 transition-all" />
      </Link>
      {canNudge && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center">
          <button
            onClick={() => onNudge(org)}
            title={`Send nudge to ${org.contactName} (${org.progress}% complete)`}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-[#00897b] hover:bg-[#e8f5f3] transition-all"
          >
            <Mail size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ══ Main page ════════════════════════════════════════════════════════════════

export default function OrganizationsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const searchParams = useSearchParams();
  const allOrgs = getOrgsBySurveyId(surveyId);

  // ── No contacts → show upload flow ──────────────────────────────────────
  if (allOrgs.length === 0) {
    return <ContactUploadFlow surveyId={surveyId} />;
  }

  // ── Existing org table ───────────────────────────────────────────────────
  return <OrgTable surveyId={surveyId} allOrgs={allOrgs} searchParams={searchParams} />;
}

function OrgTable({
  surveyId,
  allOrgs,
  searchParams,
}: {
  surveyId: string;
  allOrgs: InvitedOrg[];
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const initialStatus = searchParams.get("status") as StatusFilter | null;
  const [filter, setFilter] = useState<StatusFilter>(
    initialStatus && ["submitted", "in_progress", "not_started"].includes(initialStatus)
      ? initialStatus
      : "all"
  );
  const [search, setSearch] = useState("");
  const [nudgeOrgs, setNudgeOrgs] = useState<InvitedOrg[] | null>(null);

  useEffect(() => {
    const s = searchParams.get("status") as StatusFilter | null;
    if (s && ["submitted", "in_progress", "not_started"].includes(s)) {
      setFilter(s);
    } else {
      setFilter("all");
    }
  }, [searchParams]);

  const filtered = allOrgs.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch =
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.contactName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const nudgeable = filtered.filter((o) => o.progress < 80);

  const counts = {
    all: allOrgs.length,
    submitted: allOrgs.filter((o) => o.status === "submitted").length,
    in_progress: allOrgs.filter((o) => o.status === "in_progress").length,
    not_started: allOrgs.filter((o) => o.status === "not_started").length,
  };

  return (
    <div className="space-y-4">
      {/* Summary chips + actions */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "submitted", "in_progress", "not_started"] as StatusFilter[]).map((key) => {
          const isAll = key === "all";
          const cfg = isAll ? null : STATUS_CONFIG[key as keyof typeof STATUS_CONFIG];
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
                border transition-all duration-150
                ${active
                  ? "bg-[#0f1923] border-[#0f1923] text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
              {isAll ? "All Organizations" : cfg!.label}
              <span className={`text-[10.5px] px-1 rounded ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                {counts[key]}
              </span>
            </button>
          );
        })}

        <div className="ml-auto relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 w-52 rounded-lg bg-white border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition-all duration-150"
          />
        </div>

        <button className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 text-[12px]">
          <SlidersHorizontal size={13} />
          Sort
        </button>

        {nudgeable.length > 0 && (
          <button
            onClick={() => setNudgeOrgs(nudgeable)}
            className="h-8 px-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 flex items-center gap-1.5 text-[12px] font-medium transition-colors"
          >
            <BellRing size={13} />
            Nudge All
            <span className="text-[10.5px] px-1 rounded bg-amber-100 text-amber-600">{nudgeable.length}</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Organization</div>
          <div className="hidden xl:block w-16 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">AUM</div>
          <div className="hidden lg:block w-16 text-center text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">LPI</div>
          <div className="hidden sm:block w-36 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Progress</div>
          <div className="w-24 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
          <div className="hidden lg:block w-24 text-right text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Last Activity</div>
          <div className="w-6 shrink-0" />
          <div className="w-4" />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[13px] text-slate-500">No organizations match your filter.</p>
          </div>
        ) : (
          filtered.map((org) => (
            <OrgRow key={org.id} org={org} surveyId={surveyId} onNudge={(o) => setNudgeOrgs([o])} />
          ))
        )}
      </div>

      <p className="text-center text-[11.5px] text-slate-400">
        {filtered.length} of {allOrgs.length} organizations shown
      </p>

      {nudgeOrgs && <NudgeEmailModal orgs={nudgeOrgs} onClose={() => setNudgeOrgs(null)} />}
    </div>
  );
}
