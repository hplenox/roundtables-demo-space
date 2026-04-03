export type FundStatus = "active" | "harvesting" | "closed";

export interface PortfolioFund {
  id: string;
  managerId: string;
  name: string;
  vintage: number;
  strategy: string;
  commitment: number;   // $M committed
  called: number;       // % called (0–100)
  nav: number;          // $M current NAV
  dpi: number;          // distributions to paid-in (e.g. 0.42)
  tvpi: number;         // total value to paid-in (e.g. 1.31)
  status: FundStatus;
  geography: string;
}

export interface PortfolioManager {
  id: string;
  orgId?: string;        // links to InvitedOrg.id if sourced from directory
  name: string;
  contactName: string;
  contactEmail: string;
  contactTitle: string;
  assetClass: string;
  strategy: string[];
  location: string;
  aum: string;
  aumRaw: number;        // $B for sorting
  founded?: string;
  addedDate: string;
  notes?: string;
  lpiScore?: number | null;
  funds: PortfolioFund[];
  tags?: string[];
}
