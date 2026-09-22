// Static config for the "New Survey" creation flow (/surveys/new/*).
// Kept data-driven so the section pages can render forms generically instead
// of hand-coding near-duplicate JSX per row.

export const REQUEST_TYPES = [
  "Diversity, Equity, & Inclusion+",
  "ESG & Diversity Reporting",
  "Workforce Diversity Assessment",
  "Emerging Manager Diversity",
];

export const HOST_ORGANIZATIONS = [
  "Lenox Park Solutions, Inc.",
  "Hamilton Lane Advisors",
  "CalPERS",
  "McKnight Foundation",
  "MACP",
  "Maryland State Retirement Agency",
  "ILPA",
];

export interface LpiOptionConfig {
  key: string;
  label: string;
  defaultChecked: boolean;
}

export interface LpiRowConfig {
  key: string;
  label: string;
  locked: boolean; // "Enabled, not customizable" — can't be turned off
  defaultEnabled: boolean;
  options: LpiOptionConfig[];
}

export const LPI_SETTINGS_CONFIG: LpiRowConfig[] = [
  { key: "overview", label: "Overview", locked: true, defaultEnabled: true, options: [] },
  {
    key: "totalFtEmployees",
    label: "Total Full-time Employees",
    locked: true,
    defaultEnabled: true,
    options: [{ key: "usBased", label: "US-Based", defaultChecked: false }],
  },
  {
    key: "decisionMakers",
    label: "Decision Makers",
    locked: true,
    defaultEnabled: true,
    options: [
      { key: "militaryVeteran", label: "Military Member / Veteran", defaultChecked: true },
      { key: "lgbtqia", label: "LGBTQIA2S+", defaultChecked: true },
      { key: "disability", label: "Disability", defaultChecked: true },
      { key: "immigrationIdentity", label: "Immigration Identity", defaultChecked: true },
      { key: "mwbeIdentity", label: "U.S. Citizen/Permanent Resident? (MWBE Requirement) Identity", defaultChecked: false },
      { key: "usBased", label: "US-Based", defaultChecked: false },
    ],
  },
  {
    key: "historicalInsights",
    label: "Historical Insights",
    locked: false,
    defaultEnabled: true,
    options: [
      { key: "hires", label: "Hires", defaultChecked: true },
      { key: "attritions", label: "Attritions", defaultChecked: true },
      { key: "promotions", label: "Promotions", defaultChecked: true },
    ],
  },
  {
    key: "investmentStaff",
    label: "Investment Staff",
    locked: false,
    defaultEnabled: true,
    options: [{ key: "usBased", label: "US-Based", defaultChecked: false }],
  },
  {
    key: "investmentCommittee",
    label: "Investment Committee",
    locked: false,
    defaultEnabled: true,
    options: [{ key: "usBased", label: "US-Based", defaultChecked: false }],
  },
  {
    key: "board",
    label: "Board",
    locked: false,
    defaultEnabled: true,
    options: [
      { key: "militaryVeteran", label: "Military Member / Veteran", defaultChecked: true },
      { key: "lgbtqia", label: "LGBTQIA2S+", defaultChecked: true },
      { key: "disability", label: "Disability", defaultChecked: true },
      { key: "immigrationIdentity", label: "Immigration Identity", defaultChecked: true },
    ],
  },
  {
    key: "policies",
    label: "Policies",
    locked: false,
    defaultEnabled: true,
    options: [
      { key: "fmla", label: "FMLA", defaultChecked: true },
      { key: "codeOfConduct", label: "Code of Conduct", defaultChecked: true },
      { key: "payEquity", label: "Pay Equity", defaultChecked: true },
      { key: "dei", label: "DEI", defaultChecked: true },
    ],
  },
];

export interface PracticeQuestionConfig {
  key: string;
  question: string;
  defaultEnabled: boolean;
}

export interface PracticeCategoryConfig {
  key: string;
  label: string;
  sublabel: string;
  questions: PracticeQuestionConfig[];
}

export const PRACTICES_CONFIG: PracticeCategoryConfig[] = [
  {
    key: "organizationalActivities",
    label: "Organizational Activities",
    sublabel: "Governance Activities",
    questions: [
      {
        key: "internationalStandards",
        question:
          "Do you commit to any international standards, industry association guidelines, reporting frameworks, or initiatives that promote DEI?",
        defaultEnabled: false,
      },
      {
        key: "maritalStatus",
        question:
          "Do you track Marital Status information? For example, information on whether individuals are currently married, single, or divorced.",
        defaultEnabled: false,
      },
      {
        key: "dedicatedDeiRole",
        question: "Do you have a dedicated DEI officer or committee responsible for oversight of DEI initiatives?",
        defaultEnabled: false,
      },
    ],
  },
  {
    key: "talentPractices",
    label: "Talent Practices",
    sublabel: "Recruiting & Advancement",
    questions: [
      {
        key: "structuredInterviews",
        question: "Do you use structured interview processes designed to reduce bias in hiring decisions?",
        defaultEnabled: false,
      },
      {
        key: "payEquityAudit",
        question: "Have you conducted a formal pay equity audit within the last 24 months?",
        defaultEnabled: false,
      },
      {
        key: "mentorshipProgram",
        question: "Do you offer a formal mentorship or sponsorship program for underrepresented employees?",
        defaultEnabled: false,
      },
    ],
  },
];

export interface StandardQuestionConfig {
  key: string;
  category: string;
  categorySublabel: string;
  label: string;
  kind: "paragraph" | "consent";
  defaultText?: string;
  defaultEnabled: boolean;
}

export const STANDARD_QUESTIONS_CONFIG: StandardQuestionConfig[] = [
  {
    key: "surveyIntroduction",
    category: "Overview",
    categorySublabel: "Survey Overview",
    label: "Survey introduction shown to every invited organization",
    kind: "paragraph",
    defaultText:
      "Thank you for your assistance as we gather data to compile our annual report on the participation of diverse-owned businesses in providing professional services to our organization.\n\nAnswers to the survey should reflect your business ownership and operations as of the reporting period.",
    defaultEnabled: false,
  },
  {
    key: "termsConsent",
    category: "Terms",
    categorySublabel: "Consent & Data Use",
    label: "Require organizations to accept data-use terms before starting",
    kind: "consent",
    defaultEnabled: false,
  },
];

export const CUSTOM_QUESTION_TYPES: { type: "text" | "formatted-text" | "number" | "select" | "multi-select"; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "formatted-text", label: "Formatted Text" },
  { type: "number", label: "Number" },
  { type: "select", label: "Select" },
  { type: "multi-select", label: "Multi-Select" },
];
