export function ordinal(n: number): string {
  const r = n % 100;
  if (r >= 11 && r <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

export function pctColor(p: number | null): string {
  if (p === null) return "#94a3b8";
  return p >= 70 ? "#059669" : p >= 40 ? "#b45309" : "#dc2626";
}
