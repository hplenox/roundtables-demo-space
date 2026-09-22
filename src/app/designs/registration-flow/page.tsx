"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Info,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────
// This is a standalone, clickable DESIGN PROTOTYPE of the contact
// registration flow that follows a survey invitation link. It renders no
// real invitation, sends no real code, and creates no real organization —
// every value here is fixture data local to this file. The point is to
// show, end to end, what the smart organization-matching step (the part
// this redesign is actually about) should feel like in context, not just
// as an isolated component.
// ─────────────────────────────────────────────────────────────────────────

const SURVEY = {
  name: "2026 Private Equity DEI Benchmarking Survey",
  senderName: "Morgan Reyes",
  senderOrg: "CalPERS",
};

const INVITED_CONTACT = {
  firstName: "Priya",
  email: "priya.nandakumar@arctosllc.com",
};

type Step = 0 | 1 | 2 | 3;

const STEP_LABELS = ["About You", "Verify Email", "Organization"];

// ─── Step 1 field options ───────────────────────────────────────────────

const CORPORATE_TITLES = [
  "CEO", "President", "Managing Partner", "CFO", "COO",
  "General Counsel", "Managing Director", "Principal", "Vice President", "Analyst", "Other",
];

const FUNCTIONAL_TITLES = [
  "Executive Team", "Investor Relations", "Legal & Compliance", "Human Resources",
  "Operations", "Finance & Accounting", "ESG / DEI", "Portfolio Management",
  "Business Development", "Other",
];

const INTEREST_OPTIONS = [
  "Board Diversity", "Business-Line Diversity Data", "Co-Investment Opportunities",
  "DEI-Based Hiring", "DEI-Focused Diligence", "Diverse Vendors", "Dollar-Weighted Impact",
  "Emerging Managers", "ESG-Focused Investing", "Pay Equity Benchmarking",
  "Supplier Diversity", "Impact Reporting Standards",
];

// ─── Step 3 organization matching fixture data ──────────────────────────
//
// Confidence is illustrative of the *kind* of signals a real matcher would
// blend — exact domain match, fuzzy name/domain similarity, weak secondary
// signals — not a specific scoring formula. The goal of showing the number
// and the reason together is to make the recommendation legible enough
// that a contact trusts it instead of reflexively hitting "Create New."

type OrgSuggestion = {
  id: string;
  name: string;
  members: number;
  confidence: number;
  reason: string;
  logoTint: string;
  initials: string;
};

const SUGGESTED_MATCHES: OrgSuggestion[] = [
  {
    id: "org-arctos-capital",
    name: "Arctos Capital Partners",
    members: 34,
    confidence: 96,
    reason: "Your email domain (arctosllc.com) exactly matches this organization's verified domain.",
    logoTint: "bg-emerald-600",
    initials: "AC",
  },
  {
    id: "org-arctos-global",
    name: "Arctos Global Partners",
    members: 61,
    confidence: 58,
    reason:
      "Similar organization name, but its verified domain (arctosglobal.com) differs from yours — confirm before joining.",
    logoTint: "bg-amber-500",
    initials: "AG",
  },
  {
    id: "org-arctos-spv",
    name: "Arctos SPV Holdings",
    members: 4,
    confidence: 21,
    reason:
      "One existing member listed arctosllc.com as a secondary contact domain. Low confidence — verify before joining.",
    logoTint: "bg-slate-400",
    initials: "AS",
  },
];

const OTHER_ORGS: OrgSuggestion[] = [
  { id: "org-kkr", name: "KKR", members: 212, confidence: 0, reason: "", logoTint: "bg-slate-700", initials: "KK" },
  { id: "org-apollo", name: "Apollo Global Management", members: 188, confidence: 0, reason: "", logoTint: "bg-indigo-600", initials: "AG" },
  { id: "org-carlyle", name: "The Carlyle Group", members: 176, confidence: 0, reason: "", logoTint: "bg-slate-600", initials: "CG" },
  { id: "org-bain", name: "Bain Capital", members: 154, confidence: 0, reason: "", logoTint: "bg-rose-600", initials: "BC" },
  { id: "org-vista", name: "Vista Equity Partners", members: 121, confidence: 0, reason: "", logoTint: "bg-sky-600", initials: "VE" },
  { id: "org-ssga", name: "State Street Global Advisors", members: 98, confidence: 0, reason: "", logoTint: "bg-blue-700", initials: "SS" },
  { id: "org-gip", name: "Global Infrastructure Partners", members: 74, confidence: 0, reason: "", logoTint: "bg-teal-600", initials: "GI" },
  { id: "org-bluebay", name: "BlueBay Asset Management", members: 52, confidence: 0, reason: "", logoTint: "bg-cyan-700", initials: "BB" },
  { id: "org-aduro", name: "Aduro Advisors", members: 29, confidence: 0, reason: "", logoTint: "bg-violet-600", initials: "AA" },
  { id: "org-meritage", name: "Meritage Group", members: 17, confidence: 0, reason: "", logoTint: "bg-orange-600", initials: "MG" },
];

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex-1">
          <div className={`h-1.5 rounded-full transition-colors duration-300 ${i <= step ? "bg-emerald-500" : "bg-slate-200"}`} />
          <div className={`mt-1.5 text-[11px] font-medium ${i <= step ? "text-emerald-700" : "text-slate-400"}`}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function InvitationBanner() {
  return (
    <div className="bg-[#0a0e14] text-white">
      <div className="max-w-xl mx-auto px-6 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-emerald-400" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold truncate">{SURVEY.name}</p>
          <p className="text-[11.5px] text-white/50 truncate">
            Invited by {SURVEY.senderName} &middot; {SURVEY.senderOrg}
          </p>
        </div>
      </div>
    </div>
  );
}

function Dropdown({
  label,
  required,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
        {label} {required && <span className="text-slate-400">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-left hover:border-slate-400 transition-colors duration-150"
      >
        {value ? (
          <span className="inline-flex items-center rounded-md bg-indigo-50 text-indigo-700 text-[13px] font-medium px-2 py-0.5">
            {value}
          </span>
        ) : (
          <span className="text-[14px] text-slate-400 italic">{placeholder}</span>
        )}
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-[13.5px] hover:bg-slate-50 transition-colors duration-100 ${
                value === opt ? "text-indigo-700 font-medium bg-indigo-50/60" : "text-slate-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InterestsPicker({ selected, onToggle }: { selected: string[]; onToggle: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Interests</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-left hover:border-slate-400 transition-colors duration-150"
      >
        <span className="flex items-center gap-2 flex-wrap min-w-0">
          <Tag size={15} className="text-slate-400 shrink-0" />
          {selected.length === 0 ? (
            <span className="text-[14px] text-slate-400 italic">Empty</span>
          ) : (
            selected.map((s) => (
              <span key={s} className="inline-flex items-center rounded-md bg-indigo-50 text-indigo-700 text-[12.5px] font-medium px-2 py-0.5">
                {s}
              </span>
            ))
          )}
        </span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
          {INTEREST_OPTIONS.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                className={`w-full flex items-center justify-between text-left px-3.5 py-2 text-[13.5px] hover:bg-slate-50 transition-colors duration-100 ${
                  active ? "text-indigo-700 font-medium bg-indigo-50/60" : "text-slate-700"
                }`}
              >
                {opt}
                {active && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepPersonalInfo({ onNext }: { onNext: () => void }) {
  const [corporateTitle, setCorporateTitle] = useState<string | null>("CEO");
  const [functionalTitle, setFunctionalTitle] = useState<string | null>("Executive Team");
  const [interests, setInterests] = useState<string[]>([]);

  const canContinue = !!corporateTitle && !!functionalTitle;

  return (
    <div>
      <h1 className="text-[26px] font-bold text-slate-900">Welcome, {INVITED_CONTACT.firstName}!</h1>
      <p className="text-slate-400 text-[15px] mt-0.5 mb-6">Tell us about yourself</p>

      <div className="space-y-5">
        <Dropdown
          label="Corporate Title"
          required
          placeholder="Select a title"
          options={CORPORATE_TITLES}
          value={corporateTitle}
          onChange={setCorporateTitle}
        />
        <Dropdown
          label="Functional Title"
          required
          placeholder="Select a function"
          options={FUNCTIONAL_TITLES}
          value={functionalTitle}
          onChange={setFunctionalTitle}
        />
        <InterestsPicker
          selected={interests}
          onToggle={(v) => setInterests((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))}
        />
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onNext}
        className="w-full mt-8 rounded-xl bg-[#4361ee] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 text-[15px] transition-colors duration-150 hover:bg-[#3651d4] disabled:cursor-not-allowed"
      >
        Confirm
      </button>
    </div>
  );
}

function StepVerify({ onNext }: { onNext: () => void }) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const filled = digits.every((d) => d.length === 1);

  return (
    <div>
      <h1 className="text-[26px] font-bold text-slate-900">Verify it&rsquo;s you</h1>
      <p className="text-slate-400 text-[15px] mt-0.5 mb-6">
        We sent a 6-digit code to <span className="font-medium text-slate-600">{INVITED_CONTACT.email}</span>
      </p>

      <div className="flex items-center gap-2.5 mb-2">
        <Mail size={16} className="text-slate-400" />
        <span className="text-[13px] text-slate-500">
          Confirming this address ties your response to the right person on file for this survey.
        </span>
      </div>

      <div className="flex gap-2.5 my-5">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            value={d}
            maxLength={1}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "").slice(-1);
              setDigits((cur) => cur.map((c, idx) => (idx === i ? v : c)));
              if (v && i < digits.length - 1) inputRefs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
            }}
            className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-slate-300 focus:border-[#4361ee] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20 transition-shadow duration-150"
          />
        ))}
      </div>

      <button type="button" className="text-[13px] text-[#4361ee] font-medium hover:underline">
        Didn&rsquo;t get a code? Resend
      </button>

      <button
        type="button"
        disabled={!filled}
        onClick={onNext}
        className="w-full mt-8 rounded-xl bg-[#4361ee] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 text-[15px] transition-colors duration-150 hover:bg-[#3651d4] disabled:cursor-not-allowed"
      >
        Verify
      </button>
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const tone =
    value >= 90
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : value >= 40
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span className={`shrink-0 text-[12px] font-bold px-2 py-0.5 rounded-full border ${tone}`}>
      {value}% match
    </span>
  );
}

function SuggestionCard({
  org,
  recommended,
  onJoin,
}: {
  org: OrgSuggestion;
  recommended?: boolean;
  onJoin: (org: OrgSuggestion) => void;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-4 flex items-center gap-3 transition-all duration-150 ${
        recommended ? "border-emerald-300 bg-emerald-50/50 shadow-sm" : "border-slate-200 bg-white"
      }`}
    >
      {recommended && (
        <span className="absolute -top-2.5 left-4 bg-emerald-600 text-white text-[10.5px] font-bold px-2 py-0.5 rounded-full tracking-wide">
          RECOMMENDED FOR YOU
        </span>
      )}
      <div className={`w-10 h-10 rounded-lg ${org.logoTint} flex items-center justify-center shrink-0 text-white text-[12px] font-bold`}>
        {org.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-[14.5px]">{org.name}</span>
          <ConfidenceBadge value={org.confidence} />
        </div>
        <p className="text-[12.5px] text-slate-500 mt-0.5">{org.members} members &middot; {org.reason}</p>
      </div>
      <button
        type="button"
        onClick={() => onJoin(org)}
        className="shrink-0 rounded-lg bg-[#4361ee] hover:bg-[#3651d4] text-white text-[13px] font-semibold px-4 py-2 transition-colors duration-150"
      >
        Join
      </button>
    </div>
  );
}

function InfoTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block align-middle ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="text-slate-400 hover:text-[#4361ee] transition-colors duration-150"
      >
        <Info size={16} />
      </button>
      {open && (
        <span className="absolute z-30 left-1/2 -translate-x-1/2 top-6 w-72 rounded-xl bg-slate-900 text-white text-[12.5px] leading-relaxed p-3 shadow-xl">
          We rank organizations by how likely they are to be yours — starting with an exact match on your email
          domain, then name similarity and other members already registered nearby. Pick the top match if it looks
          right. Only create a new organization if you&rsquo;ve checked the list and yours truly isn&rsquo;t there.
        </span>
      )}
    </span>
  );
}

function StepOrganization({ onNext }: { onNext: (choice: { name: string; created: boolean }) => void }) {
  const [query, setQuery] = useState("");
  const [howOpen, setHowOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const filteredOthers = useMemo(() => {
    if (!query.trim()) return OTHER_ORGS;
    const q = query.toLowerCase();
    return OTHER_ORGS.filter((o) => o.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
        Choose your organization on RoundTables
        <InfoTooltip />
      </h1>
      <p className="text-slate-400 text-[15px] mt-1 mb-4">
        Join your organization below, or create a new one only as a last resort.
      </p>

      <button
        type="button"
        onClick={() => setHowOpen((o) => !o)}
        className="w-full text-left flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 mb-5 hover:bg-indigo-50 transition-colors duration-150"
      >
        <ShieldCheck size={17} className="text-indigo-500 shrink-0 mt-0.5" />
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-indigo-900">How organization matching works</span>
          {howOpen && (
            <span className="block text-[12.5px] text-indigo-800/80 leading-relaxed mt-1">
              Because you signed up with <span className="font-medium">{INVITED_CONTACT.email}</span>, we checked
              which registered organizations share that email domain, have similar names, or already have members
              associated with it. Each suggestion below shows a confidence percentage and the reason we surfaced it
              — the highest-confidence match is recommended first. Choosing an existing organization keeps your
              firm&rsquo;s survey history and benchmarking scores in one place, so please confirm a match here
              before creating a new organization from scratch.
            </span>
          )}
        </span>
        <ChevronDown size={15} className={`text-indigo-400 shrink-0 ml-auto mt-0.5 transition-transform duration-150 ${howOpen ? "rotate-180" : ""}`} />
      </button>

      <div className="border border-slate-200 rounded-2xl p-4 bg-white">
        <p className="text-[12.5px] text-slate-500 mb-3">
          Suggested matches for <span className="font-semibold text-slate-700">{INVITED_CONTACT.email}</span>
        </p>
        <div className="space-y-2.5">
          {SUGGESTED_MATCHES.map((org, i) => (
            <SuggestionCard key={org.id} org={org} recommended={i === 0} onJoin={(o) => onNext({ name: o.name, created: false })} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[12.5px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Not one of these? Search all organizations</p>
        <div className="relative mb-2.5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by organization name"
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-[13.5px] focus:border-[#4361ee] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20 transition-shadow duration-150"
          />
        </div>
        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
          {filteredOthers.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-slate-400">No organizations match &ldquo;{query}&rdquo;</p>
          )}
          {filteredOthers.map((org) => (
            <div key={org.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors duration-100">
              <div className={`w-8 h-8 rounded-lg ${org.logoTint} flex items-center justify-center shrink-0 text-white text-[11px] font-bold`}>
                {org.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-slate-800 truncate">{org.name}</p>
                <p className="text-[11.5px] text-slate-400">{org.members} members</p>
              </div>
              <button
                type="button"
                onClick={() => onNext({ name: org.name, created: false })}
                className="shrink-0 rounded-lg border border-slate-300 hover:border-[#4361ee] hover:text-[#4361ee] text-slate-600 text-[12.5px] font-semibold px-3 py-1.5 transition-colors duration-150"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-dashed border-slate-200">
        <button
          type="button"
          onClick={() => setCreateOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-slate-600 transition-colors duration-150"
        >
          <X size={13} className={`transition-transform duration-150 ${createOpen ? "rotate-0" : "rotate-45"}`} />
          Can&rsquo;t find your organization anywhere above?
        </button>
        {createOpen && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[12px] text-slate-500 mb-3 leading-relaxed">
              This should be rare — most contacts belong to an organization that&rsquo;s already registered.
              Creating a new one starts your firm&rsquo;s survey history from scratch and goes to RoundTables staff
              for review before it&rsquo;s active.
            </p>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">New organization name</label>
            <input
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="e.g. Arctos Capital Partners"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13.5px] mb-3 focus:border-slate-400 focus:outline-none"
            />
            <button
              type="button"
              disabled={!newOrgName.trim()}
              onClick={() => onNext({ name: newOrgName.trim(), created: true })}
              className="rounded-lg bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 hover:bg-slate-800 text-white text-[13px] font-semibold px-4 py-2 transition-colors duration-150 disabled:cursor-not-allowed"
            >
              Create Organization
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepDone({ choice }: { choice: { name: string; created: boolean } | null }) {
  return (
    <div className="text-center py-6">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <Check size={26} className="text-emerald-600" strokeWidth={2.5} />
      </div>
      <h1 className="text-[24px] font-bold text-slate-900">You&rsquo;re all set, {INVITED_CONTACT.firstName}!</h1>
      {choice?.created ? (
        <p className="text-slate-500 text-[14.5px] mt-2 max-w-sm mx-auto">
          We&rsquo;ve submitted <span className="font-semibold text-slate-700">{choice.name}</span>{" "}
          as a new organization for RoundTables staff review. You&rsquo;ll get an email once it&rsquo;s approved and
          you can start the survey.
        </p>
      ) : (
        <p className="text-slate-500 text-[14.5px] mt-2 max-w-sm mx-auto">
          You&rsquo;ve joined <span className="font-semibold text-slate-700">{choice?.name}</span>{" "}
          on RoundTables. You&rsquo;re ready to start &ldquo;{SURVEY.name}.&rdquo;
        </p>
      )}
    </div>
  );
}

export default function RegistrationFlowDesign() {
  const [step, setStep] = useState<Step>(0);
  const [choice, setChoice] = useState<{ name: string; created: boolean } | null>(null);

  return (
    <div className="min-h-full bg-slate-100">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <Link href="/designs" className="flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-800 transition-colors duration-150">
            <ArrowLeft size={14} /> Back to Designs
          </Link>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Clickable Prototype</span>
        </div>
      </div>

      <InvitationBanner />

      <div className="max-w-xl mx-auto px-6 py-8">
        {step < 3 && <ProgressBar step={step} />}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
          {step === 0 && <StepPersonalInfo onNext={() => setStep(1)} />}
          {step === 1 && <StepVerify onNext={() => setStep(2)} />}
          {step === 2 && (
            <StepOrganization
              onNext={(c) => {
                setChoice(c);
                setStep(3);
              }}
            />
          )}
          {step === 3 && <StepDone choice={choice} />}
        </div>
        {step > 0 && step < 3 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="mt-4 text-[12.5px] text-slate-400 hover:text-slate-600 transition-colors duration-150"
          >
            &larr; Back
          </button>
        )}
        {step === 3 && (
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setChoice(null);
            }}
            className="mt-4 text-[12.5px] text-slate-400 hover:text-slate-600 transition-colors duration-150 block mx-auto"
          >
            Restart prototype
          </button>
        )}
      </div>
    </div>
  );
}
