import Link from "next/link";
import { LayoutGrid, ChevronRight } from "lucide-react";

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
    <div className="flex items-center gap-1.5 text-[13px] text-slate-400">
      <LayoutGrid size={15} className="text-slate-400" />
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-slate-300" />
          {item.href ? (
            <Link href={item.href} className="text-[#3650d4] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-400">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
