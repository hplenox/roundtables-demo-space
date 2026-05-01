export const ASSET_CLASSES = [
  "Private Equity",
  "Long-Only",
  "Other",
  "Hedge Fund",
  "Real Estate",
  "Real Assets",
  "Fund-of-Funds",
  "Venture Capital",
  "Financial Institution",
  "Public Pension",
  "P.E. - Fund-o-Funds",
  "Foundation",
  "Endowment",
  "Corporate Pension",
  "Family Office",
  "Credit",
  "Full RT",
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number];

export interface BenchmarkEntry {
  id: string;
  surveyId: string;
  surveyLabel: string; // e.g. "2026 DEI — Lenox Park"
  orgName: string;
  lpiScore: number;
  assetClass: AssetClass | null;
  excludedFromBenchmark: boolean;
}

export interface DistStats {
  n: number;
  min: number;
  max: number;
  p10: number;
  q1: number;
  median: number;
  q3: number;
  p90: number;
}

// ── Percentile interpolation ──────────────────────────────────────────────────
export function pctile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function computeDistStats(scores: number[]): DistStats | null {
  if (scores.length === 0) return null;
  const sorted = [...scores].sort((a, b) => a - b);
  return {
    n:      sorted.length,
    min:    sorted[0],
    max:    sorted[sorted.length - 1],
    p10:    pctile(sorted, 10),
    q1:     pctile(sorted, 25),
    median: pctile(sorted, 50),
    q3:     pctile(sorted, 75),
    p90:    pctile(sorted, 90),
  };
}

// ── Mock entries ──────────────────────────────────────────────────────────────
export const BENCHMARK_ENTRIES: BenchmarkEntry[] = [
  // ── 2026 DEI Lenox Park (12 submitted) ────────────────────────────────────
  { id: "lx26-01", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "Blackstone Group",              lpiScore: 8.2, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx26-02", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "KKR & Co.",                     lpiScore: 7.8, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx26-03", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "Bain Capital",                  lpiScore: 7.1, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx26-04", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "Apollo Global Management",      lpiScore: 6.8, assetClass: "Credit",              excludedFromBenchmark: false },
  { id: "lx26-05", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "The Carlyle Group",             lpiScore: 6.4, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx26-06", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "Warburg Pincus",                lpiScore: 7.3, assetClass: "Venture Capital",     excludedFromBenchmark: false },
  { id: "lx26-07", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "Vista Equity Partners",         lpiScore: 5.9, assetClass: "Venture Capital",     excludedFromBenchmark: false },
  { id: "lx26-08", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "TPG Capital",                   lpiScore: 6.1, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx26-09", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "Advent International",          lpiScore: 7.5, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx26-10", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "Apax Partners",                 lpiScore: 6.7, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx26-11", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "Brookfield Asset Management",   lpiScore: 7.0, assetClass: "Real Assets",         excludedFromBenchmark: false },
  { id: "lx26-12", surveyId: "survey-2026-dei-lenox", surveyLabel: "2026 DEI — Lenox Park",      orgName: "Ares Management",               lpiScore: 6.5, assetClass: "Credit",              excludedFromBenchmark: false },

  // ── 2026 DEI Manager Assessment — Hamilton Lane (19 submitted) ────────────
  { id: "ha26-01", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "CPPIB",                         lpiScore: 8.4, assetClass: "Public Pension",      excludedFromBenchmark: false },
  { id: "ha26-02", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Ontario Teachers' Pension Plan", lpiScore: 8.1, assetClass: "Public Pension",     excludedFromBenchmark: false },
  { id: "ha26-03", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "CalPERS",                       lpiScore: 7.9, assetClass: "Public Pension",      excludedFromBenchmark: false },
  { id: "ha26-04", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "CDPQ",                          lpiScore: 7.6, assetClass: "Public Pension",      excludedFromBenchmark: false },
  { id: "ha26-05", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "GIC Private Ltd.",              lpiScore: 7.2, assetClass: null,                  excludedFromBenchmark: false },
  { id: "ha26-06", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Temasek Holdings",              lpiScore: 7.5, assetClass: null,                  excludedFromBenchmark: false },
  { id: "ha26-07", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Stanford Management Company",   lpiScore: 8.6, assetClass: "Endowment",           excludedFromBenchmark: false },
  { id: "ha26-08", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Yale Endowment",                lpiScore: 8.9, assetClass: "Endowment",           excludedFromBenchmark: false },
  { id: "ha26-09", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Harvard Management Company",    lpiScore: 8.3, assetClass: "Endowment",           excludedFromBenchmark: false },
  { id: "ha26-10", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Ford Foundation",               lpiScore: 9.1, assetClass: "Foundation",          excludedFromBenchmark: false },
  { id: "ha26-11", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "MacArthur Foundation",          lpiScore: 8.7, assetClass: "Foundation",          excludedFromBenchmark: false },
  { id: "ha26-12", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Rockefeller Foundation",        lpiScore: 8.4, assetClass: "Foundation",          excludedFromBenchmark: false },
  { id: "ha26-13", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "BlackRock Asset Management",    lpiScore: 7.2, assetClass: "Long-Only",           excludedFromBenchmark: false },
  { id: "ha26-14", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Vanguard Group",                lpiScore: 6.9, assetClass: "Long-Only",           excludedFromBenchmark: false },
  { id: "ha26-15", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Fidelity Investments",          lpiScore: 6.5, assetClass: "Long-Only",           excludedFromBenchmark: false },
  { id: "ha26-16", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "T. Rowe Price",                 lpiScore: 7.4, assetClass: "Long-Only",           excludedFromBenchmark: false },
  { id: "ha26-17", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Bridgewater Associates",        lpiScore: 5.8, assetClass: "Hedge Fund",          excludedFromBenchmark: false },
  { id: "ha26-18", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Two Sigma Investments",         lpiScore: 6.2, assetClass: "Hedge Fund",          excludedFromBenchmark: false },
  { id: "ha26-19", surveyId: "survey-2026-dei-hamilton", surveyLabel: "2026 DEI — Hamilton Lane", orgName: "Man Group",                     lpiScore: 6.0, assetClass: "Hedge Fund",          excludedFromBenchmark: false },

  // ── 2025 DEI Lenox Park (38 submitted — 25 shown) ─────────────────────────
  { id: "lx25-01", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Blackstone Group",              lpiScore: 7.9, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx25-02", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "KKR & Co.",                     lpiScore: 7.2, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx25-03", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "The Carlyle Group",             lpiScore: 6.1, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx25-04", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Apollo Global Management",      lpiScore: 6.5, assetClass: "Credit",              excludedFromBenchmark: false },
  { id: "lx25-05", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "TPG Capital",                   lpiScore: 5.8, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx25-06", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Hellman & Friedman",            lpiScore: 7.8, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx25-07", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Silver Lake",                   lpiScore: 6.6, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx25-08", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "CVC Capital Partners",          lpiScore: 5.9, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx25-09", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "EQT AB",                        lpiScore: 7.0, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx25-10", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "General Atlantic",              lpiScore: 6.3, assetClass: "Private Equity",      excludedFromBenchmark: false },
  { id: "lx25-11", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "New York State Common",         lpiScore: 7.8, assetClass: "Public Pension",      excludedFromBenchmark: false },
  { id: "lx25-12", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Washington State Inv. Board",   lpiScore: 7.3, assetClass: "Public Pension",      excludedFromBenchmark: false },
  { id: "lx25-13", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "CalSTRS",                       lpiScore: 7.5, assetClass: "Public Pension",      excludedFromBenchmark: false },
  { id: "lx25-14", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Duke Management Company",       lpiScore: 7.9, assetClass: "Endowment",           excludedFromBenchmark: false },
  { id: "lx25-15", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "MIT Investment Management",     lpiScore: 8.1, assetClass: "Endowment",           excludedFromBenchmark: false },
  { id: "lx25-16", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Sequoia Capital",               lpiScore: 5.6, assetClass: "Venture Capital",     excludedFromBenchmark: false },
  { id: "lx25-17", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Andreessen Horowitz",           lpiScore: 6.4, assetClass: "Venture Capital",     excludedFromBenchmark: false },
  { id: "lx25-18", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Lightspeed Venture Partners",   lpiScore: 6.2, assetClass: "Venture Capital",     excludedFromBenchmark: false },
  { id: "lx25-19", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "PIMCO",                         lpiScore: 6.9, assetClass: "Credit",              excludedFromBenchmark: false },
  { id: "lx25-20", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "HPS Investment Partners",       lpiScore: 5.4, assetClass: "Credit",              excludedFromBenchmark: false },
  { id: "lx25-21", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Goldman Sachs Asset Mgmt",      lpiScore: 7.5, assetClass: "Financial Institution", excludedFromBenchmark: false },
  { id: "lx25-22", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Morgan Stanley Inv. Mgmt",      lpiScore: 7.2, assetClass: "Financial Institution", excludedFromBenchmark: false },
  { id: "lx25-23", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Koch Family Office",            lpiScore: 5.3, assetClass: "Family Office",       excludedFromBenchmark: false },
  { id: "lx25-24", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "Hamilton Lane",                 lpiScore: 7.8, assetClass: "P.E. - Fund-o-Funds", excludedFromBenchmark: false },
  { id: "lx25-25", surveyId: "survey-2025-dei-lenox", surveyLabel: "2025 DEI — Lenox Park",      orgName: "StepStone Group",               lpiScore: 7.1, assetClass: "Fund-of-Funds",       excludedFromBenchmark: false },

  // ── 2025 Workforce Diversity — KKR (71 submitted — 20 shown) ──────────────
  { id: "kkr25-01", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Mubadala Investment Company",   lpiScore: 7.4, assetClass: null,                  excludedFromBenchmark: false },
  { id: "kkr25-02", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Abu Dhabi Investment Authority", lpiScore: 7.8, assetClass: null,                 excludedFromBenchmark: false },
  { id: "kkr25-03", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "D.E. Shaw Group",               lpiScore: 5.4, assetClass: "Hedge Fund",          excludedFromBenchmark: false },
  { id: "kkr25-04", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Citadel",                       lpiScore: 5.7, assetClass: "Hedge Fund",          excludedFromBenchmark: false },
  { id: "kkr25-05", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Millennium Management",         lpiScore: 5.1, assetClass: "Hedge Fund",          excludedFromBenchmark: false },
  { id: "kkr25-06", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Angelo Gordon",                 lpiScore: 5.9, assetClass: "Credit",              excludedFromBenchmark: false },
  { id: "kkr25-07", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Owl Rock Capital",              lpiScore: 5.7, assetClass: "Credit",              excludedFromBenchmark: false },
  { id: "kkr25-08", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Blue Owl Capital",              lpiScore: 6.1, assetClass: "Credit",              excludedFromBenchmark: false },
  { id: "kkr25-09", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Brookfield Real Estate",        lpiScore: 6.8, assetClass: "Real Estate",         excludedFromBenchmark: false },
  { id: "kkr25-10", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "CBRE Investment Management",    lpiScore: 6.1, assetClass: "Real Estate",         excludedFromBenchmark: false },
  { id: "kkr25-11", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Starwood Capital Group",        lpiScore: 5.9, assetClass: "Real Estate",         excludedFromBenchmark: false },
  { id: "kkr25-12", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Global Infrastructure Partners", lpiScore: 6.3, assetClass: "Real Assets",       excludedFromBenchmark: false },
  { id: "kkr25-13", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Macquarie Asset Management",    lpiScore: 6.7, assetClass: "Real Assets",         excludedFromBenchmark: false },
  { id: "kkr25-14", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Pantheon Ventures",             lpiScore: 7.4, assetClass: "P.E. - Fund-o-Funds", excludedFromBenchmark: false },
  { id: "kkr25-15", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Partners Group",                lpiScore: 7.8, assetClass: "P.E. - Fund-o-Funds", excludedFromBenchmark: false },
  { id: "kkr25-16", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "IBM Retirement Fund",           lpiScore: 6.8, assetClass: "Corporate Pension",   excludedFromBenchmark: false },
  { id: "kkr25-17", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Boeing Company Pension",        lpiScore: 6.4, assetClass: "Corporate Pension",   excludedFromBenchmark: false },
  { id: "kkr25-18", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Bessemer Venture Partners",     lpiScore: 6.5, assetClass: "Venture Capital",     excludedFromBenchmark: false },
  { id: "kkr25-19", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Battery Ventures",              lpiScore: 6.0, assetClass: "Venture Capital",     excludedFromBenchmark: false },
  { id: "kkr25-20", surveyId: "survey-2025-dei-kkr", surveyLabel: "2025 Workforce — KKR",        orgName: "Full RT Capital Partners",      lpiScore: 5.5, assetClass: "Full RT",             excludedFromBenchmark: false },
];
