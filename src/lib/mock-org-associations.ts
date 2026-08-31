// ─── Multi-Org Support (Phase I): Super Admin association ─────────────────
//
// RoundTables assumes one user belongs to one organization. When a survey
// host asks a contact at one firm to respond for a second firm (usually a
// subsidiary or a fund the contact administers), domain matching silently
// overrides the invited-as organization and the response gets filed under
// the wrong firm. This is the narrow first-step fix: let a Super Admin
// manually associate a registered user with another already-registered
// organization, scoped narrowly — the user can take a survey on behalf of
// that organization and nothing else.
//
// Deliberately no "primary" vs. "secondary" distinction: a user simply
// belongs to a list of organizations. Locking in a fixed "home" org and
// treating everything else as a lesser, bolted-on grant doesn't match how
// this is actually used — a fund administrator like Aduro Advisors isn't
// "primarily" any one of the funds it administers, and a parent company's
// contact isn't more entitled to KKR than to Arctos once both are legitimate.
// Every organization in the list carries the same scope (survey response
// only); this matches how most multi-tenant products model membership —
// GitHub organization membership, Slack workspaces, Google Workspace
// delegated access — as a flat, freely editable set rather than a ranked
// hierarchy. See the Users tab for the management UI.
//
// Scenarios below mirror the three live client escalations named in the
// Aug 19, 2026 requirements doc: CalPERS (parent firms responding for
// subsidiaries), McKnight Foundation (fund administrators responding for
// the managers they support), and MACP (an acquirer's contact responding
// for the acquired manager).

export interface PlatformOrg {
  id: string;
  name: string;
  /** Primary email domain used for the domain-matching behavior this feature overrides. */
  domain: string;
  /** Every domain registered to this org, when it has more than one. Falls back to `domain` when absent. */
  domains?: string[];
  type: "GP" | "LP" | "Administrator";
}

export interface PlatformUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  /**
   * Every organization this user is affiliated with — no primary/secondary
   * ranking. The first entry is simply the org they originally registered
   * under; it carries no special weight and can be edited or removed like
   * any other. Scope for every org in the list: survey response only.
   */
  organizationIds: string[];
  registeredDate: string;
}

export type OrgAssociationAction = "added" | "removed";

export interface OrgAssociationAuditEntry {
  id: string;
  timestamp: string;
  /** Super Admin who performed the action. */
  adminName: string;
  userId: string;
  orgId: string;
  action: OrgAssociationAction;
  note?: string;
}

export const PLATFORM_ORGS: PlatformOrg[] = [
  // ── CalPERS: parent firms responding for subsidiaries ──
  { id: "porg-rbc-gam", name: "RBC Global Asset Management", domain: "rbcgam.com", type: "GP" },
  { id: "porg-bluebay", name: "BlueBay Asset Management", domain: "bluebay.com", type: "GP" },
  { id: "porg-blackrock", name: "BlackRock", domain: "blackrock.com", type: "GP" },
  { id: "porg-gip", name: "Global Infrastructure Partners", domain: "gip.com", type: "GP" },
  { id: "porg-ssga", name: "State Street Global Advisors", domain: "ssga.com", type: "GP" },
  { id: "porg-ss-bank", name: "State Street Bank", domain: "statestreet.com", type: "GP" },

  // ── McKnight Foundation: fund administrators responding for managers ──
  { id: "porg-aduro", name: "Aduro Advisors", domain: "aduroadvisors.com", type: "Administrator" },
  { id: "porg-bluebear", name: "Blue Bear Capital", domain: "bluebearcap.com", type: "GP" },
  { id: "porg-cherryrock", name: "Cherryrock Capital", domain: "cherryrock.com", type: "GP" },
  { id: "porg-meritage", name: "Meritage Funds", domain: "meritagefunds.com", type: "GP" },

  // ── MACP: an acquirer's contact responding for the acquired manager ──
  { id: "porg-kkr", name: "KKR & Co.", domain: "kkr.com", type: "GP" },
  { id: "porg-arctos", name: "Arctos Partners", domain: "arctospartners.com", type: "GP" },

  // ── Other registered orgs (no multi-org need — for list contrast) ──
  { id: "porg-apollo", name: "Apollo Global Management", domain: "apollo.com", type: "GP" },
  { id: "porg-carlyle", name: "The Carlyle Group", domain: "carlyle.com", type: "GP" },
  { id: "porg-bain", name: "Bain Capital", domain: "baincapital.com", type: "GP" },
  { id: "porg-vista", name: "Vista Equity Partners", domain: "vistaequitypartners.com", type: "GP" },
];

export const PLATFORM_USERS: PlatformUser[] = [
  {
    id: "puser-01",
    firstName: "David",
    lastName: "Chen",
    email: "david.chen@kkr.com",
    title: "Investor Relations Associate",
    organizationIds: ["porg-kkr", "porg-arctos"],
    registeredDate: "2025-11-03",
  },
  {
    id: "puser-02",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@rbcgam.com",
    title: "Client Reporting Manager",
    organizationIds: ["porg-rbc-gam", "porg-bluebay"],
    registeredDate: "2024-06-18",
  },
  {
    id: "puser-03",
    firstName: "Marcus",
    lastName: "Webb",
    email: "marcus.webb@blackrock.com",
    title: "ESG Data Coordinator",
    organizationIds: ["porg-blackrock", "porg-gip"],
    registeredDate: "2023-09-22",
  },
  {
    id: "puser-04",
    firstName: "Elaine",
    lastName: "Roth",
    email: "elaine.roth@ssga.com",
    title: "Diversity Reporting Lead",
    organizationIds: ["porg-ssga", "porg-ss-bank"],
    registeredDate: "2024-02-11",
  },
  {
    id: "puser-05",
    firstName: "Sandra",
    lastName: "Kim",
    email: "sandra.kim@aduroadvisors.com",
    title: "Fund Administrator",
    organizationIds: ["porg-aduro", "porg-bluebear", "porg-cherryrock", "porg-meritage"],
    registeredDate: "2023-04-30",
  },
  {
    id: "puser-06",
    firstName: "Thomas",
    lastName: "Grant",
    email: "thomas.grant@baincapital.com",
    title: "Portfolio Analyst",
    organizationIds: ["porg-bain"],
    registeredDate: "2022-08-14",
  },
  {
    id: "puser-07",
    firstName: "Robert",
    lastName: "Kim",
    email: "robert.kim@apollo.com",
    title: "Investor Relations Director",
    organizationIds: ["porg-apollo"],
    registeredDate: "2023-01-09",
  },
  {
    id: "puser-08",
    firstName: "Amanda",
    lastName: "Torres",
    email: "amanda.torres@carlyle.com",
    title: "Compliance Associate",
    organizationIds: ["porg-carlyle"],
    registeredDate: "2023-05-27",
  },
  {
    id: "puser-09",
    firstName: "Jennifer",
    lastName: "Walsh",
    email: "jennifer.walsh@kkr.com",
    title: "Head of ESG Reporting",
    organizationIds: ["porg-kkr"],
    registeredDate: "2021-11-15",
  },
  {
    id: "puser-10",
    firstName: "Nicole",
    lastName: "Brown",
    email: "nicole.brown@vistaequitypartners.com",
    title: "Data Governance Manager",
    organizationIds: ["porg-vista"],
    registeredDate: "2024-10-02",
  },
];

// Seed audit history, newest first. Includes one add-then-revert pair
// (Thomas Grant) so the trail demonstrates removals, not just grants.
export const ORG_ASSOCIATION_AUDIT: OrgAssociationAuditEntry[] = [
  {
    id: "audit-09",
    timestamp: "2026-08-19T16:20:00Z",
    adminName: "Sarah Whitman",
    userId: "puser-05",
    orgId: "porg-meritage",
    action: "added",
    note: "McKnight Foundation cycle — Aduro also administers Meritage Funds.",
  },
  {
    id: "audit-08",
    timestamp: "2026-08-18T14:05:00Z",
    adminName: "Sarah Whitman",
    userId: "puser-01",
    orgId: "porg-arctos",
    action: "added",
    note: "MACP cycle — KKR acquired Arctos and provides its RoundTables contact.",
  },
  {
    id: "audit-07",
    timestamp: "2026-08-15T10:40:00Z",
    adminName: "Derek Osei",
    userId: "puser-04",
    orgId: "porg-ss-bank",
    action: "added",
    note: "CalPERS cycle — State Street Global Advisors responds for State Street Bank.",
  },
  {
    id: "audit-06",
    timestamp: "2026-08-14T09:15:00Z",
    adminName: "Derek Osei",
    userId: "puser-03",
    orgId: "porg-gip",
    action: "added",
    note: "CalPERS cycle — BlackRock responds for Global Infrastructure Partners.",
  },
  {
    id: "audit-05",
    timestamp: "2026-08-14T09:02:00Z",
    adminName: "Sarah Whitman",
    userId: "puser-02",
    orgId: "porg-bluebay",
    action: "added",
    note: "CalPERS cycle — RBC Global Asset Management responds for BlueBay, its subsidiary.",
  },
  {
    id: "audit-04",
    timestamp: "2026-08-11T13:30:00Z",
    adminName: "Sarah Whitman",
    userId: "puser-05",
    orgId: "porg-cherryrock",
    action: "added",
    note: "McKnight Foundation cycle — fund administrator serving as contact for Cherryrock.",
  },
  {
    id: "audit-03",
    timestamp: "2026-08-11T13:22:00Z",
    adminName: "Sarah Whitman",
    userId: "puser-05",
    orgId: "porg-bluebear",
    action: "added",
    note: "McKnight Foundation cycle — fund administrator serving as contact for Blue Bear.",
  },
  {
    id: "audit-02",
    timestamp: "2026-08-06T11:00:00Z",
    adminName: "Sarah Whitman",
    userId: "puser-06",
    orgId: "porg-vista",
    action: "removed",
    note: "Granted in error — Thomas Grant has no reporting relationship to Vista. Reverted same day.",
  },
  {
    id: "audit-01",
    timestamp: "2026-08-05T15:45:00Z",
    adminName: "Sarah Whitman",
    userId: "puser-06",
    orgId: "porg-vista",
    action: "added",
    note: "Requested by mistake during MACP setup.",
  },
];

export function getOrgById(id: string): PlatformOrg | undefined {
  return PLATFORM_ORGS.find((o) => o.id === id);
}

export function getUserFullName(u: PlatformUser): string {
  return `${u.firstName} ${u.lastName}`;
}
