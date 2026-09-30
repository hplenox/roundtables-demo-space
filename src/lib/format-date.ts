// Bare `YYYY-MM-DD` strings are parsed by `new Date()` as UTC midnight, which
// renders as the *previous* day for anyone west of Greenwich. These dates are
// calendar dates, not instants, so they're parsed as local time instead.

function parseCalendarDate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return new Date(iso);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** e.g. "Aug 25, 2026" */
export function formatShortDate(iso: string): string {
  return parseCalendarDate(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/** e.g. "August 25, 2026" */
export function formatLongDate(iso: string): string {
  return parseCalendarDate(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}
