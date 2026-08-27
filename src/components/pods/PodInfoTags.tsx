import { Building2 } from "lucide-react";
import { avatarStyle, initialsOf } from "@/lib/mock-pods";

const TAG_CLASS =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[12.5px] font-medium max-w-full";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11.5px] text-slate-400 mb-1">{label}</p>
      {children}
    </div>
  );
}

/**
 * Host / Admin / Type field group, styled after the platform's POD Details
 * card: a gray label above a soft tag value (plain text for Type).
 */
export default function PodInfoTags({
  hostedBy,
  administeredBy,
  type,
  layout = "stacked",
  className = "",
}: {
  hostedBy: string;
  administeredBy?: string;
  type?: string;
  layout?: "stacked" | "inline";
  className?: string;
}) {
  const hostTag = (
    <span className={TAG_CLASS}>
      <Building2 size={12} className="shrink-0" />
      <span className="truncate">{hostedBy}</span>
    </span>
  );
  const adminTag = administeredBy ? (
    <span className={TAG_CLASS}>
      <span
        className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${avatarStyle(administeredBy).bg} ${avatarStyle(administeredBy).text}`}
      >
        {initialsOf(administeredBy)}
      </span>
      <span className="truncate">{administeredBy}</span>
    </span>
  ) : null;

  if (layout === "inline") {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        {hostTag}
        {adminTag}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Field label="Host">{hostTag}</Field>
      {adminTag && <Field label="Admin">{adminTag}</Field>}
      <Field label="Type">
        <p className="text-[13px] text-slate-800 font-medium">{type || "No information"}</p>
      </Field>
    </div>
  );
}
