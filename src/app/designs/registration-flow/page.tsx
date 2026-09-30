"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  Info,
  Mail,
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
  // The organization name typed on the invitation by the survey sender. This
  // is the ONLY string the match percentages below are measured against.
  invitedOrgName: "Arctos LLC",
  emailDomain: "arctosllc.com",
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
// Every candidate below is an organization already registered under the
// contact's email domain. The percentage is a NAME-SIMILARITY score and
// nothing else: how closely each registered organization's name resembles
// the organization name on the invitation ("Arctos LLC"). Keeping the score
// to one comparison is what makes it explainable on screen — the contact can
// read the two names side by side and see why the number is what it is.

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
    confidence: 92,
    reason:
      "Shares the distinctive word \u201cArctos\u201d with your invitation name and is the only registered match using it as the leading word.",
    logoTint: "bg-emerald-600",
    initials: "AC",
  },
  {
    id: "org-arctos-global",
    name: "Arctos Global Partners",
    members: 61,
    confidence: 54,
    reason:
      "Also leads with \u201cArctos,\u201d but the qualifier \u201cGlobal\u201d is a different entity name than the one on your invitation.",
    logoTint: "bg-amber-500",
    initials: "AG",
  },
  {
    id: "org-arctos-management",
    name: "Arctos Partners Management",
    members: 12,
    confidence: 38,
    reason:
      "Begins with \u201cArctos,\u201d but carries two extra words that do not appear in the name you were invited as.",
    logoTint: "bg-amber-500",
    initials: "AP",
  },
  {
    id: "org-arctos-spv",
    name: "Arctos SPV Holdings",
    members: 4,
    confidence: 27,
    reason:
      "Only the word \u201cArctos\u201d overlaps \u2014 \u201cSPV Holdings\u201d reads as a separate vehicle, not the firm you were invited as.",
    logoTint: "bg-slate-400",
    initials: "AS",
  },
  {
    id: "org-arctos-ventures",
    name: "Arctos Ventures",
    members: 9,
    confidence: 19,
    reason:
      "Shares only the leading word; \u201cVentures\u201d is a different line of business from the name on your invitation.",
    logoTint: "bg-slate-400",
    initials: "AV",
  },
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
      {value}% name match
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
        <p className="text-[12.5px] text-slate-500 mt-0.5 leading-relaxed">{org.reason}</p>
        <p className="text-[11.5px] text-slate-400 mt-0.5">{org.members} members</p>
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
          We first pull every organization already registered under your email domain, then score each one purely on
          how closely its name resembles the organization name on your invitation. Nothing else moves the
          percentage. Pick the top match if it looks right. If none of them is your firm, the only other option is
          to submit a new organization for review.
        </span>
      )}
    </span>
  );
}

function InvitedOrgHeader() {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3.5 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-[#4361ee] flex items-center justify-center shrink-0">
        <Building2 size={17} className="text-white" strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">You were invited as</p>
        <p className="text-[17px] font-bold text-slate-900 leading-snug truncate">{INVITED_CONTACT.invitedOrgName}</p>
        <p className="text-[12px] text-indigo-900/60 mt-0.5 truncate">
          {SURVEY.senderName} of {SURVEY.senderOrg} listed this organization on your invitation.
        </p>
      </div>
    </div>
  );
}

function StepOrganization({ onNext }: { onNext: (choice: { name: string; created: boolean }) => void }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  return (
    <div>
      <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
        Confirm your organization
        <InfoTooltip />
      </h1>
      <p className="text-slate-400 text-[15px] mt-1 mb-5">
        Join the organization you were invited as, or create a new one only as a last resort.
      </p>

      <InvitedOrgHeader />

      <p className="text-[13px] text-slate-600 leading-relaxed mt-5 mb-3">
        These are the organizations already registered under your email domain{" "}
        <span className="font-semibold text-slate-800">{INVITED_CONTACT.emailDomain}</span>. Each percentage is
        based solely on how closely that organization&rsquo;s name matches{" "}
        <span className="font-semibold text-slate-800">{INVITED_CONTACT.invitedOrgName}</span>, the name you were
        invited as &mdash; no other signal affects the score. This is the complete list for your domain.
      </p>

      <div className="space-y-2.5 pt-2">
        {SUGGESTED_MATCHES.map((org, i) => (
          <SuggestionCard key={org.id} org={org} recommended={i === 0} onJoin={(o) => onNext({ name: o.name, created: false })} />
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-dashed border-slate-200 space-y-3">
        <button
          type="button"
          onClick={() => setCreateOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-slate-600 transition-colors duration-150"
        >
          <X size={13} className={`transition-transform duration-150 ${createOpen ? "rotate-0" : "rotate-45"}`} />
          None of these is my organization
        </button>
        {createOpen && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[12px] text-slate-500 mb-3 leading-relaxed">
              This should be rare &mdash; your invitation was addressed to an organization, so it is almost always
              one of the matches above. Creating a new one starts your firm&rsquo;s survey history from scratch and
              goes to RoundTables staff for review before you can begin the survey.
            </p>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">New organization name</label>
            <input
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder={INVITED_CONTACT.invitedOrgName}
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
