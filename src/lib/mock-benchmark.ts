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

export interface HistoricalScore {
  year: number;
  surveyLabel: string;
  lpiScore: number;
}

export interface OrgBenchmarkEntry {
  id: string;
  orgName: string;
  lpiScore: number;           // most recent score
  assetClass: AssetClass | null;
  aum: string;                // formatted, e.g. "$1.0T"
  aumRaw: number;             // billions, for sorting
  city: string;
  state: string;              // state / province / "—" for non-applicable
  country: string;
  excludedFromBenchmark: boolean;
  historicalScores: HistoricalScore[]; // oldest → newest, NOT including current year
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

export const BENCHMARK_ORGS: OrgBenchmarkEntry[] = [
  // ── Private Equity ──────────────────────────────────────────────────────────
  {
    id: "org-blackstone", orgName: "Blackstone Group", lpiScore: 8.2,
    assetClass: "Private Equity", aum: "$1.1T", aumRaw: 1100,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2023, surveyLabel: "2023 DEI — Lenox Park", lpiScore: 7.1 },
      { year: 2024, surveyLabel: "2024 DEI — Lenox Park", lpiScore: 7.6 },
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 7.9 },
    ],
  },
  {
    id: "org-kkr", orgName: "KKR & Co.", lpiScore: 7.8,
    assetClass: "Private Equity", aum: "$510B", aumRaw: 510,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2023, surveyLabel: "2023 DEI — Lenox Park", lpiScore: 6.5 },
      { year: 2024, surveyLabel: "2024 DEI — Lenox Park", lpiScore: 6.9 },
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 7.2 },
    ],
  },
  {
    id: "org-bain", orgName: "Bain Capital", lpiScore: 7.1,
    assetClass: "Private Equity", aum: "$185B", aumRaw: 185,
    city: "Boston", state: "MA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 DEI — Lenox Park", lpiScore: 6.6 },
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 6.8 },
    ],
  },
  {
    id: "org-carlyle", orgName: "The Carlyle Group", lpiScore: 6.4,
    assetClass: "Private Equity", aum: "$426B", aumRaw: 426,
    city: "Washington", state: "DC", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 DEI — Lenox Park", lpiScore: 5.7 },
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 6.1 },
    ],
  },
  {
    id: "org-tpg", orgName: "TPG Capital", lpiScore: 6.1,
    assetClass: "Private Equity", aum: "$222B", aumRaw: 222,
    city: "Fort Worth", state: "TX", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 DEI — Lenox Park", lpiScore: 5.2 },
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 5.8 },
    ],
  },
  {
    id: "org-hellman", orgName: "Hellman & Friedman", lpiScore: 7.8,
    assetClass: "Private Equity", aum: "$40B", aumRaw: 40,
    city: "San Francisco", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 7.4 },
    ],
  },
  {
    id: "org-silverlake", orgName: "Silver Lake", lpiScore: 6.6,
    assetClass: "Private Equity", aum: "$102B", aumRaw: 102,
    city: "Menlo Park", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 6.1 },
    ],
  },
  {
    id: "org-cvc", orgName: "CVC Capital Partners", lpiScore: 5.9,
    assetClass: "Private Equity", aum: "$193B", aumRaw: 193,
    city: "Luxembourg", state: "—", country: "Luxembourg", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-eqt", orgName: "EQT AB", lpiScore: 7.0,
    assetClass: "Private Equity", aum: "$248B", aumRaw: 248,
    city: "Stockholm", state: "—", country: "Sweden", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 6.6 },
    ],
  },
  {
    id: "org-ga", orgName: "General Atlantic", lpiScore: 6.3,
    assetClass: "Private Equity", aum: "$96B", aumRaw: 96,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-apax", orgName: "Apax Partners", lpiScore: 6.7,
    assetClass: "Private Equity", aum: "$65B", aumRaw: 65,
    city: "London", state: "England", country: "United Kingdom", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-advent", orgName: "Advent International", lpiScore: 7.5,
    assetClass: "Private Equity", aum: "$95B", aumRaw: 95,
    city: "Boston", state: "MA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Venture Capital ──────────────────────────────────────────────────────────
  {
    id: "org-warburg", orgName: "Warburg Pincus", lpiScore: 7.3,
    assetClass: "Venture Capital", aum: "$83B", aumRaw: 83,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-vista", orgName: "Vista Equity Partners", lpiScore: 5.9,
    assetClass: "Venture Capital", aum: "$101B", aumRaw: 101,
    city: "Austin", state: "TX", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-sequoia", orgName: "Sequoia Capital", lpiScore: 5.6,
    assetClass: "Venture Capital", aum: "$85B", aumRaw: 85,
    city: "Menlo Park", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 5.1 },
    ],
  },
  {
    id: "org-a16z", orgName: "Andreessen Horowitz", lpiScore: 6.4,
    assetClass: "Venture Capital", aum: "$52B", aumRaw: 52,
    city: "Menlo Park", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 5.8 },
    ],
  },
  {
    id: "org-lightspeed", orgName: "Lightspeed Venture Partners", lpiScore: 6.2,
    assetClass: "Venture Capital", aum: "$25B", aumRaw: 25,
    city: "Menlo Park", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-bessemer", orgName: "Bessemer Venture Partners", lpiScore: 6.5,
    assetClass: "Venture Capital", aum: "$20B", aumRaw: 20,
    city: "San Francisco", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-battery", orgName: "Battery Ventures", lpiScore: 6.0,
    assetClass: "Venture Capital", aum: "$15B", aumRaw: 15,
    city: "Boston", state: "MA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Credit ───────────────────────────────────────────────────────────────────
  {
    id: "org-apollo", orgName: "Apollo Global Management", lpiScore: 6.8,
    assetClass: "Credit", aum: "$651B", aumRaw: 651,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 DEI — Lenox Park", lpiScore: 6.2 },
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 6.5 },
    ],
  },
  {
    id: "org-ares", orgName: "Ares Management", lpiScore: 6.5,
    assetClass: "Credit", aum: "$428B", aumRaw: 428,
    city: "Los Angeles", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-pimco", orgName: "PIMCO", lpiScore: 6.9,
    assetClass: "Credit", aum: "$1.9T", aumRaw: 1900,
    city: "Newport Beach", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 6.4 },
    ],
  },
  {
    id: "org-hps", orgName: "HPS Investment Partners", lpiScore: 5.4,
    assetClass: "Credit", aum: "$117B", aumRaw: 117,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-angelo", orgName: "Angelo Gordon", lpiScore: 5.9,
    assetClass: "Credit", aum: "$73B", aumRaw: 73,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-owlrock", orgName: "Owl Rock Capital", lpiScore: 5.7,
    assetClass: "Credit", aum: "$53B", aumRaw: 53,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-blueowl", orgName: "Blue Owl Capital", lpiScore: 6.1,
    assetClass: "Credit", aum: "$167B", aumRaw: 167,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Public Pension ────────────────────────────────────────────────────────────
  {
    id: "org-cppib", orgName: "CPPIB", lpiScore: 8.4,
    assetClass: "Public Pension", aum: "$575B", aumRaw: 575,
    city: "Toronto", state: "Ontario", country: "Canada", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2022, surveyLabel: "2022 DEI — Hamilton Lane", lpiScore: 7.2 },
      { year: 2023, surveyLabel: "2023 DEI — Hamilton Lane", lpiScore: 7.6 },
      { year: 2024, surveyLabel: "2024 DEI — Hamilton Lane", lpiScore: 8.0 },
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 8.2 },
    ],
  },
  {
    id: "org-otpp", orgName: "Ontario Teachers' Pension Plan", lpiScore: 8.1,
    assetClass: "Public Pension", aum: "$248B", aumRaw: 248,
    city: "Toronto", state: "Ontario", country: "Canada", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 DEI — Hamilton Lane", lpiScore: 7.7 },
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 7.9 },
    ],
  },
  {
    id: "org-calpers", orgName: "CalPERS", lpiScore: 7.9,
    assetClass: "Public Pension", aum: "$502B", aumRaw: 502,
    city: "Sacramento", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 7.5 },
    ],
  },
  {
    id: "org-cdpq", orgName: "CDPQ", lpiScore: 7.6,
    assetClass: "Public Pension", aum: "$434B", aumRaw: 434,
    city: "Montreal", state: "Quebec", country: "Canada", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 7.2 },
    ],
  },
  {
    id: "org-nysc", orgName: "New York State Common", lpiScore: 7.8,
    assetClass: "Public Pension", aum: "$267B", aumRaw: 267,
    city: "Albany", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 7.4 },
    ],
  },
  {
    id: "org-wsib", orgName: "Washington State Inv. Board", lpiScore: 7.3,
    assetClass: "Public Pension", aum: "$196B", aumRaw: 196,
    city: "Olympia", state: "WA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-calstrs", orgName: "CalSTRS", lpiScore: 7.5,
    assetClass: "Public Pension", aum: "$326B", aumRaw: 326,
    city: "West Sacramento", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Endowment ─────────────────────────────────────────────────────────────────
  {
    id: "org-stanford", orgName: "Stanford Management Company", lpiScore: 8.6,
    assetClass: "Endowment", aum: "$41B", aumRaw: 41,
    city: "Stanford", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 DEI — Hamilton Lane", lpiScore: 8.2 },
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 8.4 },
    ],
  },
  {
    id: "org-yale", orgName: "Yale Endowment", lpiScore: 8.9,
    assetClass: "Endowment", aum: "$42B", aumRaw: 42,
    city: "New Haven", state: "CT", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2022, surveyLabel: "2022 DEI — Hamilton Lane", lpiScore: 8.1 },
      { year: 2023, surveyLabel: "2023 DEI — Hamilton Lane", lpiScore: 8.3 },
      { year: 2024, surveyLabel: "2024 DEI — Hamilton Lane", lpiScore: 8.6 },
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 8.8 },
    ],
  },
  {
    id: "org-harvard", orgName: "Harvard Management Company", lpiScore: 8.3,
    assetClass: "Endowment", aum: "$50B", aumRaw: 50,
    city: "Boston", state: "MA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 7.9 },
    ],
  },
  {
    id: "org-duke", orgName: "Duke Management Company", lpiScore: 7.9,
    assetClass: "Endowment", aum: "$13B", aumRaw: 13,
    city: "Durham", state: "NC", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 7.5 },
    ],
  },
  {
    id: "org-mit", orgName: "MIT Investment Management", lpiScore: 8.1,
    assetClass: "Endowment", aum: "$28B", aumRaw: 28,
    city: "Cambridge", state: "MA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Foundation ────────────────────────────────────────────────────────────────
  {
    id: "org-ford", orgName: "Ford Foundation", lpiScore: 9.1,
    assetClass: "Foundation", aum: "$16B", aumRaw: 16,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2021, surveyLabel: "2021 DEI — Hamilton Lane", lpiScore: 8.2 },
      { year: 2022, surveyLabel: "2022 DEI — Hamilton Lane", lpiScore: 8.5 },
      { year: 2023, surveyLabel: "2023 DEI — Hamilton Lane", lpiScore: 8.7 },
      { year: 2024, surveyLabel: "2024 DEI — Hamilton Lane", lpiScore: 8.9 },
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 9.0 },
    ],
  },
  {
    id: "org-macarthur", orgName: "MacArthur Foundation", lpiScore: 8.7,
    assetClass: "Foundation", aum: "$8B", aumRaw: 8,
    city: "Chicago", state: "IL", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 DEI — Hamilton Lane", lpiScore: 8.3 },
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 8.5 },
    ],
  },
  {
    id: "org-rockefeller", orgName: "Rockefeller Foundation", lpiScore: 8.4,
    assetClass: "Foundation", aum: "$6B", aumRaw: 6,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 8.0 },
    ],
  },

  // ── Hedge Fund ────────────────────────────────────────────────────────────────
  {
    id: "org-bridgewater", orgName: "Bridgewater Associates", lpiScore: 5.8,
    assetClass: "Hedge Fund", aum: "$125B", aumRaw: 125,
    city: "Westport", state: "CT", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 Workforce — KKR", lpiScore: 5.2 },
      { year: 2025, surveyLabel: "2025 Workforce — KKR", lpiScore: 5.5 },
    ],
  },
  {
    id: "org-twosigma", orgName: "Two Sigma Investments", lpiScore: 6.2,
    assetClass: "Hedge Fund", aum: "$60B", aumRaw: 60,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 5.7 },
    ],
  },
  {
    id: "org-man", orgName: "Man Group", lpiScore: 6.0,
    assetClass: "Hedge Fund", aum: "$167B", aumRaw: 167,
    city: "London", state: "England", country: "United Kingdom", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-deshaw", orgName: "D.E. Shaw Group", lpiScore: 5.4,
    assetClass: "Hedge Fund", aum: "$60B", aumRaw: 60,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-citadel", orgName: "Citadel", lpiScore: 5.7,
    assetClass: "Hedge Fund", aum: "$63B", aumRaw: 63,
    city: "Miami", state: "FL", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-millennium", orgName: "Millennium Management", lpiScore: 5.1,
    assetClass: "Hedge Fund", aum: "$70B", aumRaw: 70,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Long-Only ─────────────────────────────────────────────────────────────────
  {
    id: "org-blackrock", orgName: "BlackRock", lpiScore: 7.2,
    assetClass: "Long-Only", aum: "$10.5T", aumRaw: 10500,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2023, surveyLabel: "2023 DEI — Hamilton Lane", lpiScore: 6.6 },
      { year: 2024, surveyLabel: "2024 DEI — Hamilton Lane", lpiScore: 6.9 },
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 7.0 },
    ],
  },
  {
    id: "org-vanguard", orgName: "Vanguard Group", lpiScore: 6.9,
    assetClass: "Long-Only", aum: "$8.5T", aumRaw: 8500,
    city: "Malvern", state: "PA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 6.6 },
    ],
  },
  {
    id: "org-fidelity", orgName: "Fidelity Investments", lpiScore: 6.5,
    assetClass: "Long-Only", aum: "$4.9T", aumRaw: 4900,
    city: "Boston", state: "MA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-troweprice", orgName: "T. Rowe Price", lpiScore: 7.4,
    assetClass: "Long-Only", aum: "$1.4T", aumRaw: 1400,
    city: "Baltimore", state: "MD", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 7.0 },
    ],
  },

  // ── Real Estate ───────────────────────────────────────────────────────────────
  {
    id: "org-bkre", orgName: "Brookfield Real Estate", lpiScore: 6.8,
    assetClass: "Real Estate", aum: "$100B", aumRaw: 100,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 Workforce — KKR", lpiScore: 6.3 },
    ],
  },
  {
    id: "org-cbre", orgName: "CBRE Investment Management", lpiScore: 6.1,
    assetClass: "Real Estate", aum: "$145B", aumRaw: 145,
    city: "Los Angeles", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-starwood", orgName: "Starwood Capital Group", lpiScore: 5.9,
    assetClass: "Real Estate", aum: "$115B", aumRaw: 115,
    city: "Miami Beach", state: "FL", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Real Assets ───────────────────────────────────────────────────────────────
  {
    id: "org-brookfield", orgName: "Brookfield Asset Management", lpiScore: 7.0,
    assetClass: "Real Assets", aum: "$900B", aumRaw: 900,
    city: "Toronto", state: "Ontario", country: "Canada", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-gip", orgName: "Global Infrastructure Partners", lpiScore: 6.3,
    assetClass: "Real Assets", aum: "$100B", aumRaw: 100,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-macquarie", orgName: "Macquarie Asset Management", lpiScore: 6.7,
    assetClass: "Real Assets", aum: "$620B", aumRaw: 620,
    city: "Sydney", state: "NSW", country: "Australia", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 Workforce — KKR", lpiScore: 6.2 },
    ],
  },

  // ── Fund-of-Funds ─────────────────────────────────────────────────────────────
  {
    id: "org-stepstone", orgName: "StepStone Group", lpiScore: 7.1,
    assetClass: "Fund-of-Funds", aum: "$670B", aumRaw: 670,
    city: "La Jolla", state: "CA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 6.7 },
    ],
  },

  // ── P.E. - Fund-o-Funds ───────────────────────────────────────────────────────
  {
    id: "org-hamiltonlane", orgName: "Hamilton Lane", lpiScore: 7.8,
    assetClass: "P.E. - Fund-o-Funds", aum: "$920B", aumRaw: 920,
    city: "Philadelphia", state: "PA", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 DEI — Lenox Park", lpiScore: 7.2 },
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 7.5 },
    ],
  },
  {
    id: "org-pantheon", orgName: "Pantheon Ventures", lpiScore: 7.4,
    assetClass: "P.E. - Fund-o-Funds", aum: "$90B", aumRaw: 90,
    city: "London", state: "England", country: "United Kingdom", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-partners", orgName: "Partners Group", lpiScore: 7.8,
    assetClass: "P.E. - Fund-o-Funds", aum: "$149B", aumRaw: 149,
    city: "Baar", state: "—", country: "Switzerland", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Financial Institution ─────────────────────────────────────────────────────
  {
    id: "org-gsam", orgName: "Goldman Sachs Asset Management", lpiScore: 7.5,
    assetClass: "Financial Institution", aum: "$2.8T", aumRaw: 2800,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2024, surveyLabel: "2024 DEI — Lenox Park", lpiScore: 7.0 },
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 7.3 },
    ],
  },
  {
    id: "org-msim", orgName: "Morgan Stanley Investment Mgmt", lpiScore: 7.2,
    assetClass: "Financial Institution", aum: "$1.5T", aumRaw: 1500,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Lenox Park", lpiScore: 6.9 },
    ],
  },

  // ── Family Office ─────────────────────────────────────────────────────────────
  {
    id: "org-koch", orgName: "Koch Family Office", lpiScore: 5.3,
    assetClass: "Family Office", aum: "$90B", aumRaw: 90,
    city: "Wichita", state: "KS", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Corporate Pension ─────────────────────────────────────────────────────────
  {
    id: "org-ibm", orgName: "IBM Retirement Fund", lpiScore: 6.8,
    assetClass: "Corporate Pension", aum: "$90B", aumRaw: 90,
    city: "Armonk", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 Workforce — KKR", lpiScore: 6.4 },
    ],
  },
  {
    id: "org-boeing", orgName: "Boeing Company Pension", lpiScore: 6.4,
    assetClass: "Corporate Pension", aum: "$62B", aumRaw: 62,
    city: "Chicago", state: "IL", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Unassigned (sovereign wealth) ─────────────────────────────────────────────
  {
    id: "org-gic", orgName: "GIC Private Ltd.", lpiScore: 7.2,
    assetClass: null, aum: "$770B", aumRaw: 770,
    city: "Singapore", state: "—", country: "Singapore", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 DEI — Hamilton Lane", lpiScore: 6.8 },
    ],
  },
  {
    id: "org-temasek", orgName: "Temasek Holdings", lpiScore: 7.5,
    assetClass: null, aum: "$311B", aumRaw: 311,
    city: "Singapore", state: "—", country: "Singapore", excludedFromBenchmark: false,
    historicalScores: [],
  },
  {
    id: "org-mubadala", orgName: "Mubadala Investment Company", lpiScore: 7.4,
    assetClass: null, aum: "$302B", aumRaw: 302,
    city: "Abu Dhabi", state: "—", country: "UAE", excludedFromBenchmark: false,
    historicalScores: [
      { year: 2025, surveyLabel: "2025 Workforce — KKR", lpiScore: 7.0 },
    ],
  },
  {
    id: "org-adia", orgName: "Abu Dhabi Investment Authority", lpiScore: 7.8,
    assetClass: null, aum: "$993B", aumRaw: 993,
    city: "Abu Dhabi", state: "—", country: "UAE", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Full RT ───────────────────────────────────────────────────────────────────
  {
    id: "org-fullrt", orgName: "Full RT Capital Partners", lpiScore: 5.5,
    assetClass: "Full RT", aum: "$12B", aumRaw: 12,
    city: "New York", state: "NY", country: "USA", excludedFromBenchmark: false,
    historicalScores: [],
  },

  // ── Zero score (newly onboarded / pending) ────────────────────────────────────
  {
    id: "org-pending1", orgName: "Nexus Capital Management", lpiScore: 0,
    assetClass: "Private Equity", aum: "$8B", aumRaw: 8,
    city: "Los Angeles", state: "CA", country: "USA", excludedFromBenchmark: true,
    historicalScores: [],
  },
  {
    id: "org-pending2", orgName: "Azimuth Capital", lpiScore: 0,
    assetClass: null, aum: "$3B", aumRaw: 3,
    city: "Toronto", state: "Ontario", country: "Canada", excludedFromBenchmark: true,
    historicalScores: [],
  },
];
