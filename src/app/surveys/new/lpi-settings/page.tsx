"use client";

import { useEffect } from "react";
import { ensureDraft, markTouched, updateLpiRow, useDraft } from "@/lib/survey-draft-store";
import { LPI_SETTINGS_CONFIG } from "@/lib/survey-draft-config";
import SectionPageShell from "@/components/surveys/SectionPageShell";
import { Lock } from "lucide-react";

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
        checked ? "bg-[#00b8a9]" : "bg-slate-200"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

export default function LpiSettingsPage() {
  const draft = useDraft();

  useEffect(() => {
    ensureDraft();
    markTouched("lpi-settings");
  }, []);

  if (!draft) return null;

  return (
    <SectionPageShell
      title="LPI Data Fields"
      description="Choose which workforce, ownership, and governance data points this cycle asks organizations to report."
    >
      <div className="divide-y divide-slate-100">
        {LPI_SETTINGS_CONFIG.map((row) => {
          const rowState = draft.lpiSettings[row.key];
          return (
            <div key={row.key} className="py-4 flex items-start gap-4">
              <div className="flex items-center gap-2 w-56 shrink-0 pt-0.5">
                <Toggle
                  checked={rowState.enabled}
                  disabled={row.locked}
                  onChange={(v) => updateLpiRow(row.key, { enabled: v })}
                />
                <div>
                  <p className="text-[13px] font-semibold text-slate-800 flex items-center gap-1">
                    {row.label}
                    {row.locked && <Lock size={10} className="text-slate-400" />}
                  </p>
                  {row.locked && <p className="text-[11px] text-slate-400">Enabled, not customizable</p>}
                </div>
              </div>
              {row.options.length > 0 && (
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5">
                  {row.options.map((opt) => (
                    <label key={opt.key} className="inline-flex items-center gap-2 text-[12.5px] text-slate-600">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-[#00b8a9] focus:ring-[#00b8a9]/40"
                        checked={rowState.options[opt.key] ?? false}
                        onChange={(e) => updateLpiRow(row.key, { options: { [opt.key]: e.target.checked } })}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionPageShell>
  );
}
