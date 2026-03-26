"use client";

const POLICIES = [
  { label: "Diversity, Equity & Inclusion Policy", uploaded: true },
  { label: "Family and Medical Leave Act",          uploaded: true },
  { label: "Pay Equity Policy",                     uploaded: false },
  { label: "Code of Conduct",                       uploaded: true },
];

export default function WorkplacePoliciesCard() {
  const uploadedCount = POLICIES.filter(p => p.uploaded).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">
          Workplace Policies
        </span>
        <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
          {uploadedCount}/{POLICIES.length} uploaded
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 divide-x divide-slate-100">
        {POLICIES.map((policy) => (
          <div
            key={policy.label}
            className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0"
          >
            {policy.uploaded ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7.25" fill="#00b8a9" fillOpacity="0.12" stroke="#00b8a9" strokeWidth="1.25"/>
                <path d="M4.5 8.5L6.5 10.5L11 5.5" stroke="#00897b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7.25" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.25"/>
                <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#cbd5e1" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            )}
            <span className={`text-[12.5px] font-medium leading-snug ${policy.uploaded ? "text-slate-700" : "text-slate-400"}`}>
              {policy.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
