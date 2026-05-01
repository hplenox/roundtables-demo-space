export type FlagCategory =
  | "completeness"
  | "gender_outlier"
  | "racial_outlier"
  | "data_inconsistency"
  | "no_submission"
  | "suspicious_pattern"
  | "missing_demographics";

export type FlagSeverity = "critical" | "warning";
export type AuditSeverity = "critical" | "warning" | "clean";

export interface DataFlag {
  id: string;
  category: FlagCategory;
  severity: FlagSeverity;
  title: string;
  detail: string;
  metric?: string;
  threshold?: string;
}

export interface SubmissionAudit {
  surveyId: string;
  orgId: string;
  orgName: string;
  contactName: string;
  contactEmail: string;
  contactTitle: string;
  submittedDate: string | null;
  status: "submitted" | "in_progress" | "not_started";
  progress: number;
  assetClass: string;
  aum: string;
  flags: DataFlag[];
  overallSeverity: AuditSeverity;
  scanScore: number;
  includedInReport: boolean;
}

export const DATA_CONTROL_AUDITS: SubmissionAudit[] = [
  {
    surveyId: "survey-2026-dei-lenox",
    orgId: "org-blackstone",
    orgName: "Blackstone Group",
    contactName: "Michael Davis",
    contactEmail: "m.davis@blackstone.com",
    contactTitle: "Chief Diversity & Inclusion Officer",
    submittedDate: "Mar 10, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Private Equity",
    aum: "$1.0T",
    overallSeverity: "critical",
    scanScore: 34,
    includedInReport: false,
    flags: [
      {
        id: "bx-f1",
        category: "gender_outlier",
        severity: "critical",
        title: "Gender Exclusion — Leadership",
        detail: "100% male representation across 9 leadership positions. Zero women reported in any leadership role.",
        metric: "100% male (9/9)",
        threshold: "Threshold: ≤70% any single gender",
      },
      {
        id: "bx-f2",
        category: "gender_outlier",
        severity: "critical",
        title: "Gender Outlier — Ownership",
        detail: "76.5% male ownership significantly exceeds the platform concentration threshold.",
        metric: "76.5% male (13/17)",
        threshold: "Threshold: ≤70%",
      },
      {
        id: "bx-f3",
        category: "racial_outlier",
        severity: "critical",
        title: "Racial Homogeneity — Ownership",
        detail: "76.5% white representation in ownership tier. Near-zero racial diversity across all other groups combined.",
        metric: "76.5% white (13/17)",
        threshold: "Threshold: ≤75%",
      },
      {
        id: "bx-f4",
        category: "missing_demographics",
        severity: "warning",
        title: "Racial LPI Score Zero",
        detail: "Racial ownership LPI score recorded as 0.00/3.00. Null percentile ranking — no scoreable racial diversity detected in ownership positions.",
        metric: "LPI Racial Ownership: 0.00/3.00",
      },
      {
        id: "bx-f5",
        category: "racial_outlier",
        severity: "warning",
        title: "Workforce Racial Concentration",
        detail: "55.6% white workforce. Non-white groups (Asian 3, Black 2, Latino 1, MENA 1) represent 38.9% but no single group is meaningfully represented.",
        metric: "55.6% white (10/18)",
      },
    ],
  },
  {
    surveyId: "survey-2026-dei-lenox",
    orgId: "org-kkr",
    orgName: "KKR & Co.",
    contactName: "Jennifer Walsh",
    contactEmail: "j.walsh@kkr.com",
    contactTitle: "Head of Human Capital",
    submittedDate: "Mar 18, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Private Equity",
    aum: "$510B",
    overallSeverity: "warning",
    scanScore: 68,
    includedInReport: true,
    flags: [
      {
        id: "kkr-f1",
        category: "gender_outlier",
        severity: "warning",
        title: "Gender Imbalance — Leadership",
        detail: "78.6% male leadership exceeds the benchmark threshold. 11 of 14 leadership roles are held by men.",
        metric: "78.6% male (11/14)",
        threshold: "Threshold: ≤70%",
      },
      {
        id: "kkr-f2",
        category: "missing_demographics",
        severity: "warning",
        title: "Racial Score Zero — Leadership",
        detail: "LPI Racial Leadership Score is 0.00/1.00 with a null percentile. No racial leadership diversity was captured.",
        metric: "LPI Racial Leadership: 0.00/1.00",
      },
      {
        id: "kkr-f3",
        category: "racial_outlier",
        severity: "warning",
        title: "Ownership Racial Concentration",
        detail: "66.7% white representation in ownership tier. Other groups are underrepresented relative to peer benchmarks.",
        metric: "66.7% white (8/12)",
      },
    ],
  },
  {
    surveyId: "survey-2026-dei-lenox",
    orgId: "org-bain",
    orgName: "Bain Capital",
    contactName: "Thomas Grant",
    contactEmail: "t.grant@baincapital.com",
    contactTitle: "Partner, Talent & Culture",
    submittedDate: "Mar 1, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Private Equity",
    aum: "$185B",
    overallSeverity: "critical",
    scanScore: 28,
    includedInReport: false,
    flags: [
      {
        id: "bain-f1",
        category: "gender_outlier",
        severity: "critical",
        title: "Extreme Gender Imbalance — Ownership",
        detail: "82.4% male ownership is a severe outlier. Only 3 women reported out of 17 total ownership positions.",
        metric: "82.4% male (14/17)",
        threshold: "Threshold: ≤70%",
      },
      {
        id: "bain-f2",
        category: "racial_outlier",
        severity: "critical",
        title: "Racial Exclusion — Ownership",
        detail: "94.1% white representation in ownership. Only 1 non-white individual across all 17 ownership positions.",
        metric: "94.1% white (16/17)",
        threshold: "Threshold: ≤75%",
      },
      {
        id: "bain-f3",
        category: "missing_demographics",
        severity: "warning",
        title: "Racial LPI Score Zero — Leadership",
        detail: "Despite 12 reported leadership members, racial leadership LPI score is 0.00/1.00 with a null percentile.",
        metric: "LPI Racial Leadership: 0.00/1.00",
      },
      {
        id: "bain-f4",
        category: "gender_outlier",
        severity: "warning",
        title: "Gender Concentration — Workforce",
        detail: "66.7% male workforce is above the 65% workforce threshold. 22 of 33 reported workforce members are male.",
        metric: "66.7% male (22/33)",
        threshold: "Threshold: ≤65%",
      },
    ],
  },
  {
    surveyId: "survey-2026-dei-lenox",
    orgId: "org-apollo",
    orgName: "Apollo Global Management",
    contactName: "Robert Kim",
    contactEmail: "r.kim@apollo.com",
    contactTitle: "Managing Director, DEI",
    submittedDate: null,
    status: "in_progress",
    progress: 64,
    assetClass: "Private Credit",
    aum: "$651B",
    overallSeverity: "warning",
    scanScore: 42,
    includedInReport: true,
    flags: [
      {
        id: "apo-f1",
        category: "completeness",
        severity: "critical",
        title: "Incomplete Submission — 36% Missing",
        detail: "Workforce racial demographics and ownership data sections are incomplete. Final LPI score cannot be calculated.",
        metric: "36% incomplete",
      },
      {
        id: "apo-f2",
        category: "missing_demographics",
        severity: "warning",
        title: "Demographic Data Unverifiable",
        detail: "Cannot audit for demographic outliers or validate claims — racial breakdown sections are currently empty.",
        metric: "Demographics: N/A",
      },
      {
        id: "apo-f3",
        category: "completeness",
        severity: "warning",
        title: "Partial Workforce Section",
        detail: "Workforce section is partially filled. Submitted totals do not account for all reported team members.",
      },
    ],
  },
  {
    surveyId: "survey-2026-dei-lenox",
    orgId: "org-carlyle",
    orgName: "The Carlyle Group",
    contactName: "Amanda Torres",
    contactEmail: "a.torres@carlyle.com",
    contactTitle: "VP, Diversity & Inclusion",
    submittedDate: null,
    status: "in_progress",
    progress: 41,
    assetClass: "Private Equity",
    aum: "$426B",
    overallSeverity: "critical",
    scanScore: 18,
    includedInReport: false,
    flags: [
      {
        id: "car-f1",
        category: "completeness",
        severity: "critical",
        title: "Major Incomplete Submission — 59% Missing",
        detail: "Ownership, leadership, and all racial demographic sections are entirely blank. Core DEI data cannot be scored.",
        metric: "59% incomplete",
      },
      {
        id: "car-f2",
        category: "missing_demographics",
        severity: "critical",
        title: "All Racial Data Missing",
        detail: "Zero racial demographics recorded across ownership, leadership, and workforce tiers. All three sections are blank.",
        metric: "Racial data: 0%",
      },
      {
        id: "car-f3",
        category: "suspicious_pattern",
        severity: "warning",
        title: "Submission Stalled — 56 Days",
        detail: "Last recorded activity was Mar 5, 2026 — 56 days with no additional progress. May require escalation.",
        metric: "Stalled: 56+ days",
      },
    ],
  },
  {
    surveyId: "survey-2026-dei-lenox",
    orgId: "org-warburg",
    orgName: "Warburg Pincus",
    contactName: "Lisa Park",
    contactEmail: "l.park@warburgpincus.com",
    contactTitle: "Managing Director",
    submittedDate: null,
    status: "in_progress",
    progress: 22,
    assetClass: "Venture Capital",
    aum: "$83B",
    overallSeverity: "warning",
    scanScore: 38,
    includedInReport: true,
    flags: [
      {
        id: "war-f1",
        category: "completeness",
        severity: "warning",
        title: "Early Stage — 78% Remaining",
        detail: "Only the organizational profile has been submitted. All DEI metric sections (ownership, leadership, workforce) are pending.",
        metric: "78% incomplete",
      },
      {
        id: "war-f2",
        category: "missing_demographics",
        severity: "warning",
        title: "No DEI Data Available",
        detail: "No demographic data recorded yet — cannot validate any claims or detect outliers at this stage.",
        metric: "DEI data: 0%",
      },
    ],
  },
  {
    surveyId: "survey-2026-dei-lenox",
    orgId: "org-vista",
    orgName: "Vista Equity Partners",
    contactName: "Nicole Brown",
    contactEmail: "n.brown@vistaequitypartners.com",
    contactTitle: "Chief People Officer",
    submittedDate: null,
    status: "not_started",
    progress: 0,
    assetClass: "Venture Capital",
    aum: "$101B",
    overallSeverity: "warning",
    scanScore: 0,
    includedInReport: false,
    flags: [
      {
        id: "vis-f1",
        category: "no_submission",
        severity: "warning",
        title: "Survey Not Started — 81 Days",
        detail: "Invited Feb 8, 2026. No survey activity recorded. 81 days have elapsed since invitation was sent.",
        metric: "Days elapsed: 81",
      },
    ],
  },
  {
    surveyId: "survey-2026-dei-lenox",
    orgId: "org-tpg",
    orgName: "TPG Capital",
    contactName: "Chris Lee",
    contactEmail: "c.lee@tpg.com",
    contactTitle: "Director, Human Resources",
    submittedDate: null,
    status: "not_started",
    progress: 0,
    assetClass: "Private Equity",
    aum: "$222B",
    overallSeverity: "warning",
    scanScore: 0,
    includedInReport: false,
    flags: [
      {
        id: "tpg-f1",
        category: "no_submission",
        severity: "warning",
        title: "Survey Not Started — 81 Days",
        detail: "Invited Feb 8, 2026. No survey activity recorded. 81 days have elapsed since invitation was sent.",
        metric: "Days elapsed: 81",
      },
    ],
  },
  {
    surveyId: "survey-2026-dei-lenox",
    orgId: "org-ares",
    orgName: "Ares Management",
    contactName: "Sarah Williams",
    contactEmail: "s.williams@aresmgmt.com",
    contactTitle: "Chief People Officer",
    submittedDate: "Mar 3, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Private Credit",
    aum: "$428B",
    overallSeverity: "clean",
    scanScore: 91,
    includedInReport: true,
    flags: [],
  },
];

export function getAuditsBySurveyId(surveyId: string): SubmissionAudit[] {
  return DATA_CONTROL_AUDITS.filter((a) => a.surveyId === surveyId);
}

export function generateReminderEmail(audit: SubmissionAudit): { subject: string; body: string } {
  const firstName = audit.contactName.split(" ")[0];
  const criticalFlags = audit.flags.filter((f) => f.severity === "critical");
  const warningFlags = audit.flags.filter((f) => f.severity === "warning");

  const flagLines = [
    ...criticalFlags.map((f) => `  • [CRITICAL] ${f.title}: ${f.detail}`),
    ...warningFlags.map((f) => `  • [ATTENTION] ${f.title}: ${f.detail}`),
  ].join("\n");

  const statusNote =
    audit.status === "submitted"
      ? "While your submission has been received, our automated data quality review has flagged items that need clarification or correction before your data can be included in the final report."
      : `Your survey is currently ${audit.progress}% complete and has not yet been submitted. Without a complete submission, your organization will be excluded from the final report.`;

  return {
    subject: `Action Required: 2026 DEI Survey Data Review — ${audit.orgName}`,
    body: `Dear ${firstName},

I hope this message finds you well.

${statusNote}

Our data quality audit has identified the following items requiring your attention:

${flagLines || "  • Please log in to review your submission status."}

${
  audit.status === "submitted"
    ? `If the submitted data accurately reflects your organization, please reply to confirm and we will add an explanatory notation to your final report. Otherwise, please log into the platform to update your submission at your earliest convenience.`
    : `To ensure ${audit.orgName} is represented in the final report, please complete the remaining sections by logging into the platform.`
}

Your current data quality score is ${audit.scanScore > 0 ? `${audit.scanScore}/100` : "N/A (no submission)"}. Submissions scoring below 50 may be excluded from certain comparative analyses in the report.

If you have any questions or need assistance completing the survey, please don't hesitate to reach out.

Best regards,
Survey Administration Team
Lenox Park Solutions, Inc.
heran.patel@lenoxparkinc.com`,
  };
}
