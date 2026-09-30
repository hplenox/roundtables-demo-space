// Static config for the "New Survey" creation flow (/surveys/new/*).
// Kept data-driven so the section pages can render forms generically instead
// of hand-coding near-duplicate JSX per row.
//
// Section labels, descriptions, and question text mirror the "Partnership
// Insights Survey Build Form" template (2026). Where that template updated
// wording, the newer phrasing is used here — most of the Organizational
// Activities questions were rewritten away from "DEI" toward workforce,
// human capital, and social impact language.

export const SURVEY_BUILD_FORM_TITLE = "Partnership Insights Survey Build Form";

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
  /** Short "what this section collects" note from the build form's overview table. */
  description: string;
  locked: boolean; // "Enabled, not customizable" — can't be turned off
  defaultEnabled: boolean;
  /** Heading for the per-row checkbox column, e.g. "Subsection" vs "Field". */
  optionsLabel?: string;
  options: LpiOptionConfig[];
}

export const LPI_SETTINGS_CONFIG: LpiRowConfig[] = [
  {
    key: "overview",
    label: "Overview",
    description: "Organization details. Required for LPI score.",
    locked: true,
    defaultEnabled: true,
    options: [],
  },
  {
    key: "totalFtEmployees",
    label: "Total Full-Time Employees",
    description: "Aggregate demographics by gender and race/ethnicity. Required for LPI score.",
    locked: true,
    defaultEnabled: true,
    optionsLabel: "Subsection",
    options: [{ key: "usBased", label: "U.S. Based", defaultChecked: false }],
  },
  {
    key: "decisionMakers",
    label: "Decision Makers",
    description: "Granular capture of senior leadership and ownership data. Required for LPI score.",
    locked: true,
    defaultEnabled: true,
    optionsLabel: "Field",
    options: [
      { key: "militaryVeteran", label: "Military Member/Veteran", defaultChecked: true },
      { key: "lgbtqia", label: "LGBTQIA2S+", defaultChecked: true },
      { key: "disability", label: "Person With a Disability", defaultChecked: true },
      { key: "immigrationIdentity", label: "Immigration Identity", defaultChecked: true },
      { key: "mwbeIdentity", label: "U.S. Citizen/Permanent Resident? (MWBE Requirement) Identity", defaultChecked: false },
      { key: "usBased", label: "U.S. Based", defaultChecked: false },
    ],
  },
  {
    key: "historicalInsights",
    label: "Historical Insights",
    description: "Hires, promotions, & attritions over 3 years.",
    locked: false,
    defaultEnabled: true,
    optionsLabel: "Subsection",
    options: [
      { key: "hires", label: "Hires", defaultChecked: true },
      { key: "promotions", label: "Promotions", defaultChecked: true },
      { key: "attritions", label: "Attritions", defaultChecked: true },
    ],
  },
  {
    key: "investmentStaff",
    label: "Total Investment Staff",
    description: "Aggregate demographics by gender, race/ethnicity, & role.",
    locked: false,
    defaultEnabled: true,
    optionsLabel: "Subsection",
    options: [{ key: "usBased", label: "U.S. Based", defaultChecked: false }],
  },
  {
    key: "investmentCommittee",
    label: "Investment Committee",
    description: "Demographics for the committee that makes investment decisions.",
    locked: false,
    defaultEnabled: true,
    optionsLabel: "Subsection",
    options: [{ key: "usBased", label: "U.S. Based", defaultChecked: false }],
  },
  {
    key: "board",
    label: "Board",
    description: "Granular capture of board demographics by role & type.",
    locked: false,
    defaultEnabled: true,
    optionsLabel: "Field",
    options: [
      { key: "militaryVeteran", label: "Military Member/Veteran", defaultChecked: true },
      { key: "lgbtqia", label: "LGBTQIA2S+", defaultChecked: true },
      { key: "disability", label: "Person With a Disability", defaultChecked: true },
      { key: "immigrationIdentity", label: "Immigration Identity", defaultChecked: true },
    ],
  },
  {
    key: "policies",
    label: "Policies",
    description: "Standard formal policies.",
    locked: false,
    defaultEnabled: true,
    optionsLabel: "Policy",
    options: [
      { key: "dei", label: "Diversity, Equity, & Inclusion", defaultChecked: true },
      { key: "codeOfConduct", label: "Code of Conduct", defaultChecked: true },
      { key: "fmla", label: "FMLA", defaultChecked: true },
      { key: "payEquity", label: "Pay Equity for Compensation", defaultChecked: true },
      { key: "aiGovernance", label: "Artificial Intelligence Governance & Ethics", defaultChecked: true },
    ],
  },
];

/** How a practices question is answered — drives the hint under each question. */
export type PracticeAnswerType = "yes-no" | "multi-select" | "number" | "percentage";

export const PRACTICE_ANSWER_HINT: Record<PracticeAnswerType, string> = {
  "yes-no": "Answers (Exclusive choice): Yes · No · Declines to specify",
  "multi-select": "Answers: Select all that apply",
  number: "Answers: Numeric entry",
  percentage: "Answers: Percentage of total",
};

export interface PracticeQuestionConfig {
  key: string;
  /** Reference code from the build form, e.g. "OA 1". */
  code: string;
  question: string;
  answerType: PracticeAnswerType;
  defaultEnabled: boolean;
}

export interface PracticeCategoryConfig {
  key: string;
  label: string;
  sublabel: string;
  questions: PracticeQuestionConfig[];
}

export const PRACTICES_INTRO =
  "This section of the survey is optional (Organizational Activities, ESG, and Impact). Please select which practices questions to include. If you wish to leave this section off entirely, select the appropriate option below.";

export const PRACTICES_NONE_LABEL = "The survey will not include any practices questions.";

export const PRACTICES_CONFIG: PracticeCategoryConfig[] = [
  {
    key: "organizationalActivities",
    label: "Organizational Activities",
    sublabel: "Governance, talent, and portfolio practices",
    questions: [
      {
        key: "oa1",
        code: "OA 1",
        question:
          "Do you commit to any international standards, industry association guidelines, reporting frameworks, or initiatives that promote non-bias in hiring practices / equitable hiring practices?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa2",
        code: "OA 2",
        question:
          "Do you track marital status information? For example, information on whether individuals are currently married, single, or divorced.",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa3",
        code: "OA 3",
        question: "Do you maintain a supplier or vendor diversity program?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa4",
        code: "OA 4",
        question: "Which of the following fall under your organization’s commitment, initiative or mission?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "oa5",
        code: "OA 5",
        question:
          "Have you made any press release or public announcements promoting workforce, organizational culture, human capital, social impact, or ESG initiatives?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa6",
        code: "OA 6",
        question:
          "Do you track caregiver, guardian, or parental information? For example, information on whether individuals provide direct care for a child, older adult, someone with a disability, or someone who is chronically ill.",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa7",
        code: "OA 7",
        question:
          "Do you utilize Key Performance Indicators (KPI) to determine if your social impact or human capital initiatives are successfully working as intended?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa8",
        code: "OA 8",
        question: "Do you have a competitive bid process for diverse suppliers or vendors for business services?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa9",
        code: "OA 9",
        question: "Which of the following factors do you utilize when conducting Pay Equity Analysis (PEA)?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "oa10",
        code: "OA 10",
        question:
          "Do you partner with your current portfolio companies to integrate social impact initiatives and/or practices into their operations, hiring, or other practices?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa11",
        code: "OA 11",
        question:
          "For which of the following do you track diversity characteristics within your current portfolio companies?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "oa12",
        code: "OA 12",
        question:
          "For which of the following do you track diversity characteristics within prospective portfolio companies in your pipeline?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "oa13",
        code: "OA 13",
        question:
          "Do you advocate for workforce, human capital, social impact, or ESG considerations as part of your capital allocation process?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa14",
        code: "OA 14",
        question:
          "Do you screen portfolio companies based on potential returns and considerations related to workforce, human capital, or organizational culture?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa15",
        code: "OA 15",
        question: "Do you prioritize social impact when voting on social and/or governance shareholder issues?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "oa16",
        code: "OA 16",
        question:
          "How many claims, formal charges, or lawsuits related to sexual or general harassment, misconduct, or discrimination against current or former employees (while employed by the organization) have occurred within the last five years?",
        answerType: "number",
        defaultEnabled: false,
      },
      {
        key: "oa17",
        code: "OA 17",
        question: "Total number of individuals within your organization that identify as military members/veterans:",
        answerType: "number",
        defaultEnabled: false,
      },
      {
        key: "oa18",
        code: "OA 18",
        question: "Total number of individuals within your organization that identify as having a disability:",
        answerType: "number",
        defaultEnabled: false,
      },
      {
        key: "oa19",
        code: "OA 19",
        question: "Total number of individuals within your organization that identify as LGBTQIA2S+:",
        answerType: "number",
        defaultEnabled: false,
      },
      {
        key: "oa20",
        code: "OA 20",
        question:
          "Total number of individuals within your organization that identify as first or second-generation:",
        answerType: "number",
        defaultEnabled: false,
      },
    ],
  },
  {
    key: "esg",
    label: "ESG",
    sublabel: "Environmental, social, & governance investing",
    questions: [
      {
        key: "esg1",
        code: "ESG 1",
        question:
          "For which of the following ESG or Impact leadership standards/groups have you made a public commitment?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "esg2",
        code: "ESG 2",
        question:
          "Which of the following groups within the organization hold decision-makers accountable for ESG investing objectives?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "esg3",
        code: "ESG 3",
        question:
          "What percentage of your total investment products have exposure to investments that you characterize as ESG?",
        answerType: "percentage",
        defaultEnabled: false,
      },
      {
        key: "esg4",
        code: "ESG 4",
        question: "Do you offer separate share classes dedicated to ESG investing?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "esg5",
        code: "ESG 5",
        question: "Do you offer products dedicated to ESG investing?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "esg6",
        code: "ESG 6",
        question:
          "Throughout which of the following stages of the investment process do you consider ESG opportunities and risks?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "esg7",
        code: "ESG 7",
        question: "Do you disclose and provide updates on material ESG incidents with investors?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "esg8",
        code: "ESG 8",
        question:
          "To which of the following reporting frameworks or initiatives dedicated to promoting sustainable investment practices do you commit to?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "esg9",
        code: "ESG 9",
        question:
          "Do you have a policy that describes your approach to identifying and managing ESG factors within the investment and portfolio management process?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "esg10",
        code: "ESG 10",
        question: "For which of the following do you integrate specific objectives as part of the investment process?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "esg11",
        code: "ESG 11",
        question: "Do you provide ESG reporting for your portfolio?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
    ],
  },
  {
    key: "impact",
    label: "Impact",
    sublabel: "Impact investing objectives & reporting",
    questions: [
      {
        key: "impact1",
        code: "IMPACT 1",
        question:
          "Which of the following groups within the organization hold decision-makers accountable for Impact investing objectives?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "impact2",
        code: "IMPACT 2",
        question:
          "What percentage of your total investment products have exposure to investments that you characterize as Impact?",
        answerType: "percentage",
        defaultEnabled: false,
      },
      {
        key: "impact3",
        code: "IMPACT 3",
        question: "Do you offer separate share classes dedicated to Impact investing?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "impact4",
        code: "IMPACT 4",
        question: "Do you offer products dedicated to Impact investing?",
        answerType: "yes-no",
        defaultEnabled: false,
      },
      {
        key: "impact5",
        code: "IMPACT 5",
        question:
          "Throughout which of the following stages of the investment process do you consider Impact investing opportunities and risks?",
        answerType: "multi-select",
        defaultEnabled: false,
      },
      {
        key: "impact6",
        code: "IMPACT 6",
        question: "Do you provide Impact reporting for your portfolio?",
        answerType: "yes-no",
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

export const CUSTOM_QUESTIONS_INTRO =
  "This section of the survey is optional. Enter custom questions to include in the survey. If you wish to leave this section off entirely, select the appropriate option below. All questions are subject to validation of content and answer options.";

export const CUSTOM_QUESTIONS_NONE_LABEL = "The survey will not include any custom questions.";

export const CUSTOM_QUESTION_TYPES: { type: "text" | "formatted-text" | "number" | "select" | "multi-select"; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "formatted-text", label: "Formatted Text" },
  { type: "number", label: "Number" },
  { type: "select", label: "Select" },
  { type: "multi-select", label: "Multi-Select" },
];
