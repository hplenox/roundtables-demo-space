import { PortfolioList } from "@/types/portfolio";

export const MOCK_PORTFOLIO_LISTS: PortfolioList[] = [
  {
    id: "list-core",
    name: "Core Relationships",
    managerIds: ["pm-blackstone", "pm-kkr", "pm-brookfield"],
    createdDate: "Jan 15, 2026",
  },
  {
    id: "list-credit",
    name: "Credit Focus",
    managerIds: ["pm-apollo", "pm-ares"],
    createdDate: "Feb 2, 2026",
  },
  {
    id: "list-emerging",
    name: "Emerging Tech",
    managerIds: ["pm-sequoia", "pm-a16z", "pm-general-atlantic"],
    createdDate: "Mar 20, 2026",
  },
];
