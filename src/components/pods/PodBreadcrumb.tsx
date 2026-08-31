import Link from "next/link";
import { LayoutGrid } from "lucide-react";

export interface PodBreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Matches the breadcrumb pattern used across the main Roundtables platform:
 * a grid icon followed by "/"-separated crumbs, the last of which is plain text.
 */
export default function PodBreadcrumb({ items }: { items: PodBreadcrumbItem[] }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-slate-400">
      <LayoutGrid size={15} className="text-slate-400" />
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          <span className="text-slate-300">/</span>
          {item.href ? (
            <Link href={item.href} className="text-[#0052c2] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-400 truncate max-w-xs">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
