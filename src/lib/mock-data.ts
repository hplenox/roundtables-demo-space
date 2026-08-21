import { Survey, InvitedOrg, CustomAssetClass, Contact } from "@/types/survey";

export const MOCK_SURVEYS: Survey[] = [
  {
    id: "survey-2026-dei-lenox",
    name: "Diversity, Equity, & Inclusion",
    year: 2026,
    hostOrg: "Lenox Park Solutions, Inc.",
    hostContact: "Esteban Fernandez",
    startDate: "Feb 8, 2026",
    targetCloseDate: "Feb 1, 2027",
    status: "active",
    assetClasses: ["Private Equity", "Venture Capital", "Real Assets"],
    privacyLevel: "No information",
    totalInvited: 47,
    submitted: 12,
    inProgress: 8,
    notStarted: 27,
    lastSubmission: "Mar 18, 2026",
    daysRemaining: 313,
    weeklyReportUrl: "#",
  },
  {
    id: "survey-2026-dei-hamilton",
    name: "DEI Manager Assessment",
    year: 2026,
    hostOrg: "Hamilton Lane Advisors",
    hostContact: "Patricia Moore",
    startDate: "Jan 15, 2026",
    targetCloseDate: "Jun 30, 2026",
    status: "active",
    assetClasses: ["Private Credit", "Infrastructure"],
    privacyLevel: "Aggregate only",
    totalInvited: 0,
    submitted: 0,
    inProgress: 0,
    notStarted: 0,
    lastSubmission: null,
    daysRemaining: 96,
    weeklyReportUrl: "#",
  },
  {
    id: "survey-2026-dei-calpers",
    name: "Emerging Manager DEI Survey",
    year: 2026,
    hostOrg: "CalPERS",
    hostContact: "James Okonkwo",
    startDate: "Apr 1, 2026",
    targetCloseDate: "Sep 30, 2026",
    status: "upcoming",
    assetClasses: ["Private Equity", "Real Estate"],
    privacyLevel: "Full disclosure",
    totalInvited: 62,
    submitted: 0,
    inProgress: 0,
    notStarted: 62,
    lastSubmission: null,
    daysRemaining: null,
    weeklyReportUrl: "#",
  },
  {
    id: "survey-2025-dei-lenox",
    name: "Diversity, Equity, & Inclusion",
    year: 2025,
    hostOrg: "Lenox Park Solutions, Inc.",
    hostContact: "Esteban Fernandez",
    startDate: "Feb 5, 2025",
    targetCloseDate: "Jan 31, 2026",
    status: "closed",
    assetClasses: ["Private Equity", "Venture Capital", "Real Assets"],
    privacyLevel: "No information",
    totalInvited: 41,
    submitted: 38,
    inProgress: 0,
    notStarted: 3,
    lastSubmission: "Jan 28, 2026",
    daysRemaining: 0,
    weeklyReportUrl: "#",
  },
  {
    id: "survey-2025-dei-kkr",
    name: "Workforce Diversity Assessment",
    year: 2025,
    hostOrg: "KKR & Co.",
    hostContact: "Sarah Chen",
    startDate: "Mar 1, 2025",
    targetCloseDate: "Nov 30, 2025",
    status: "closed",
    assetClasses: ["Private Equity", "Infrastructure", "Real Estate"],
    privacyLevel: "Aggregate only",
    totalInvited: 88,
    submitted: 71,
    inProgress: 0,
    notStarted: 17,
    lastSubmission: "Nov 29, 2025",
    daysRemaining: 0,
    weeklyReportUrl: "#",
  },
];

export const MOCK_ORGS: InvitedOrg[] = [
  {
    id: "org-blackstone",
    surveyId: "survey-2026-dei-lenox",
    name: "Blackstone Group",
    type: "GP",
    contactName: "Michael Davis",
    contactTitle: "Chief Diversity & Inclusion Officer",
    contactEmail: "m.davis@blackstone.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 10, 2026",
    lastActivity: "Mar 10, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Private Equity",
    customAssetClass: null, // example: not yet classified with a custom asset class
    strategyFocus: ["Buyout", "Real Estate", "Credit", "Infrastructure"],
    aum: "$1.0T",
    aumRaw: 1000,
    founded: "1985",
    headquarters: "Miami, FL",
    location: "Miami, FL",
    lpiScore: 8.2,
    lpiVersion: "v3.1",

    // ── Sub-components: exactly matching the reference image ──────────────
    lpiSubComponents: {
      overall: {
        ownership:  { label: "Ownership Score",  rawScore: 0.44, maxScore: 6.00, percentile: 60 },
        leadership: { label: "Leadership Score",  rawScore: 0.00, maxScore: 2.00, percentile: null },
        workforce:  { label: "Workforce Score",   rawScore: 0.33, maxScore: 2.00, percentile: 11 },
      },
      dimensions: [
        {
          dimension: "Gender",
          color: "#6366f1",   // indigo
          ownership:  { label: "Gender Ownership Score",   rawScore: 0.44, maxScore: 3.00, percentile: 81 },
          leadership: { label: "Gender Leadership Score",  rawScore: 0.00, maxScore: 1.00, percentile: null },
          workforce:  { label: "Gender Workforce Score",   rawScore: 0.33, maxScore: 1.00, percentile: 40 },
        },
        {
          dimension: "Racial",
          color: "#f59e0b",   // amber
          ownership:  { label: "Racial Ownership Score",   rawScore: 0.00, maxScore: 3.00, percentile: null },
          leadership: { label: "Racial Leadership Score",  rawScore: 0.00, maxScore: 1.00, percentile: null },
          workforce:  { label: "Racial Workforce Score",   rawScore: 0.00, maxScore: 1.00, percentile: null },
        },
      ],
      peerGroups: [
        { label: "$AUM",       sublabel: "No AUM Reported",  percentile: 30 },
        { label: "HQ Region",  sublabel: "International",    percentile: 34 },
      ],
    },

    benchmarks: {
      universe: {
        label: "Roundtables Universe",
        p10: 4.2, q1: 5.8, median: 6.9, q3: 8.0, p90: 9.1,
        min: 2.1, max: 10.0,
        managerValue: 8.2, managerPercentile: 72, n: 312,
      },
      portfolio: {
        label: "My Portfolio",
        p10: 5.1, q1: 6.4, median: 7.2, q3: 8.3, p90: 9.3,
        min: 3.8, max: 9.8,
        managerValue: 8.2, managerPercentile: 61, n: 47,
      },
      assetClass: {
        label: "Asset Class (Private Equity)",
        p10: 4.8, q1: 6.1, median: 7.0, q3: 8.1, p90: 9.2,
        min: 2.9, max: 10.0,
        managerValue: 8.2, managerPercentile: 68, n: 89,
        comingSoon: true,
      },
    },
    genderDemographics: {
      ownership:  { men: 13, women: 4 },
      leadership: { men: 9,  women: 0 },
      workforce:  { men: 12, women: 6 },
    },
    racialDemographics: {
      ownership: {
        indigenous_na:  0,
        asian:          2,
        black:          1,
        latino:         0,
        mena:           0,
        indigenous_out: 0,
        white:          13,
        other:          1,
        multiracial:    0,
      },
      leadership: {
        indigenous_na:  0,
        asian:          1,
        black:          0,
        latino:         1,
        mena:           0,
        indigenous_out: 0,
        white:          7,
        other:          0,
        multiracial:    0,
      },
      workforce: {
        indigenous_na:  0,
        asian:          3,
        black:          2,
        latino:         1,
        mena:           1,
        indigenous_out: 0,
        white:          10,
        other:          1,
        multiracial:    0,
      },
    },
    aumBenchmarks: {
      managerBracket: "$100B+",
      brackets: {
        "$100B+": {
          universe: {
            label: "$100B+ · RoundTables Universe",
            p10: 5.1, q1: 6.4, median: 7.4, q3: 8.5, p90: 9.3,
            min: 3.2, max: 10.0,
            managerValue: 8.2, managerPercentile: 74, n: 18,
          },
          portfolio: {
            label: "$100B+ · My Portfolio",
            p10: 5.8, q1: 6.9, median: 7.8, q3: 8.7, p90: 9.4,
            min: 4.5, max: 9.8,
            managerValue: 8.2, managerPercentile: 63, n: 6,
          },
        },
        "$25B–$100B": {
          universe: {
            label: "$25B–$100B · RoundTables Universe",
            p10: 4.4, q1: 5.9, median: 7.0, q3: 8.1, p90: 9.0,
            min: 2.7, max: 9.8,
            managerValue: 8.2, managerPercentile: 67, n: 44,
          },
          portfolio: {
            label: "$25B–$100B · My Portfolio",
            p10: 5.2, q1: 6.4, median: 7.3, q3: 8.3, p90: 9.1,
            min: 3.9, max: 9.7,
            managerValue: 8.2, managerPercentile: 58, n: 12,
          },
        },
        "$5B–$25B": {
          universe: {
            label: "$5B–$25B · RoundTables Universe",
            p10: 4.0, q1: 5.6, median: 6.8, q3: 7.9, p90: 8.9,
            min: 2.4, max: 9.9,
            managerValue: 8.2, managerPercentile: 71, n: 87,
          },
          portfolio: {
            label: "$5B–$25B · My Portfolio",
            p10: 4.9, q1: 6.1, median: 7.1, q3: 8.2, p90: 9.0,
            min: 3.6, max: 9.6,
            managerValue: 8.2, managerPercentile: 62, n: 18,
          },
        },
        "$1B–$5B": {
          universe: {
            label: "$1B–$5B · RoundTables Universe",
            p10: 3.8, q1: 5.3, median: 6.6, q3: 7.7, p90: 8.8,
            min: 2.1, max: 10.0,
            managerValue: 8.2, managerPercentile: 69, n: 124,
          },
          portfolio: {
            label: "$1B–$5B · My Portfolio",
            p10: 4.7, q1: 5.9, median: 6.9, q3: 8.0, p90: 8.9,
            min: 3.4, max: 9.8,
            managerValue: 8.2, managerPercentile: 57, n: 22,
          },
        },
        "<$1B": {
          universe: {
            label: "<$1B · RoundTables Universe",
            p10: 3.2, q1: 4.6, median: 5.9, q3: 7.2, p90: 8.4,
            min: 1.5, max: 9.7,
            managerValue: 8.2, managerPercentile: 83, n: 39,
          },
          portfolio: {
            label: "<$1B · My Portfolio",
            p10: 4.1, q1: 5.4, median: 6.4, q3: 7.6, p90: 8.5,
            min: 2.8, max: 9.4,
            managerValue: 8.2, managerPercentile: 71, n: 5,
          },
        },
      },
    },
    geography: {
      city: "Miami",
      state: "Florida",
      country: "United States",
      region: "Southeast",
      isUSBased: true,
    },
    geographyBenchmarks: {
      regions: {
        Southeast: {
          universe: {
            label: "Southeast Region · RoundTables Universe",
            p10: 3.9, q1: 5.4, median: 6.6, q3: 7.7, p90: 8.8,
            min: 2.3, max: 9.7,
            managerValue: 8.2, managerPercentile: 78, n: 47,
          },
          portfolio: {
            label: "Southeast Region · My Portfolio",
            p10: 5.0, q1: 6.1, median: 7.0, q3: 8.0, p90: 8.9,
            min: 3.9, max: 9.5,
            managerValue: 8.2, managerPercentile: 68, n: 11,
          },
        },
        Northeast: {
          universe: {
            label: "Northeast Region · RoundTables Universe",
            p10: 4.5, q1: 6.1, median: 7.3, q3: 8.4, p90: 9.2,
            min: 2.8, max: 10.0,
            managerValue: 8.2, managerPercentile: 65, n: 89,
          },
          portfolio: {
            label: "Northeast Region · My Portfolio",
            p10: 5.3, q1: 6.5, median: 7.4, q3: 8.5, p90: 9.3,
            min: 4.0, max: 9.8,
            managerValue: 8.2, managerPercentile: 55, n: 18,
          },
        },
        South: {
          universe: {
            label: "South Region · RoundTables Universe",
            p10: 3.7, q1: 5.1, median: 6.4, q3: 7.5, p90: 8.6,
            min: 2.0, max: 9.5,
            managerValue: 8.2, managerPercentile: 71, n: 38,
          },
          portfolio: {
            label: "South Region · My Portfolio",
            p10: 4.8, q1: 5.9, median: 6.8, q3: 7.8, p90: 8.7,
            min: 3.5, max: 9.2,
            managerValue: 8.2, managerPercentile: 61, n: 9,
          },
        },
        Midwest: {
          universe: {
            label: "Midwest Region · RoundTables Universe",
            p10: 3.5, q1: 4.9, median: 6.2, q3: 7.4, p90: 8.5,
            min: 1.9, max: 9.6,
            managerValue: 8.2, managerPercentile: 82, n: 52,
          },
          portfolio: {
            label: "Midwest Region · My Portfolio",
            p10: 4.6, q1: 5.8, median: 6.7, q3: 7.7, p90: 8.7,
            min: 3.3, max: 9.4,
            managerValue: 8.2, managerPercentile: 72, n: 13,
          },
        },
        Northwest: {
          universe: {
            label: "Northwest Region · RoundTables Universe",
            p10: 4.3, q1: 5.8, median: 7.0, q3: 8.1, p90: 9.1,
            min: 2.6, max: 9.9,
            managerValue: 8.2, managerPercentile: 58, n: 29,
          },
          portfolio: {
            label: "Northwest Region · My Portfolio",
            p10: 5.1, q1: 6.3, median: 7.2, q3: 8.3, p90: 9.0,
            min: 3.7, max: 9.6,
            managerValue: 8.2, managerPercentile: 48, n: 7,
          },
        },
        Southwest: {
          universe: {
            label: "Southwest Region · RoundTables Universe",
            p10: 3.8, q1: 5.2, median: 6.5, q3: 7.6, p90: 8.8,
            min: 2.1, max: 9.7,
            managerValue: 8.2, managerPercentile: 75, n: 35,
          },
          portfolio: {
            label: "Southwest Region · My Portfolio",
            p10: 4.9, q1: 6.0, median: 6.9, q3: 7.9, p90: 8.8,
            min: 3.6, max: 9.3,
            managerValue: 8.2, managerPercentile: 65, n: 8,
          },
        },
      },
      usBased: {
        universe: {
          label: "U.S.-Based · RoundTables Universe",
          p10: 4.1, q1: 5.7, median: 6.8, q3: 7.9, p90: 9.0,
          min: 2.1, max: 10.0,
          managerValue: 8.2, managerPercentile: 71, n: 198,
        },
        portfolio: {
          label: "U.S.-Based · My Portfolio",
          p10: 5.0, q1: 6.2, median: 7.1, q3: 8.2, p90: 9.2,
          min: 3.5, max: 9.8,
          managerValue: 8.2, managerPercentile: 60, n: 39,
        },
      },
      country: {
        universe: {
          label: "United States · RoundTables Universe",
          p10: 4.1, q1: 5.6, median: 6.8, q3: 7.9, p90: 9.0,
          min: 2.0, max: 10.0,
          managerValue: 8.2, managerPercentile: 72, n: 201,
        },
        portfolio: {
          label: "United States · My Portfolio",
          p10: 5.0, q1: 6.2, median: 7.1, q3: 8.2, p90: 9.2,
          min: 3.5, max: 9.8,
          managerValue: 8.2, managerPercentile: 61, n: 40,
        },
      },
      city: {
        universe: {
          label: "Miami, FL · RoundTables Universe",
          p10: 0, q1: 0, median: 0, q3: 0, p90: 0,
          min: 0, max: 0,
          managerValue: 8.2, managerPercentile: 0, n: 3,
          insufficientData: true,
        },
        portfolio: {
          label: "Miami, FL · My Portfolio",
          p10: 0, q1: 0, median: 0, q3: 0, p90: 0,
          min: 0, max: 0,
          managerValue: 8.2, managerPercentile: 0, n: 1,
          insufficientData: true,
        },
      },
    },
  },

  {
    id: "org-kkr",
    surveyId: "survey-2026-dei-lenox",
    name: "KKR & Co.",
    type: "GP",
    contactName: "Jennifer Walsh",
    contactTitle: "Head of Human Capital",
    contactEmail: "j.walsh@kkr.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 18, 2026",
    lastActivity: "Mar 18, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Private Equity",
    customAssetClass: "Large-Cap Buyout",
    strategyFocus: ["Buyout", "Growth Equity", "Credit"],
    aum: "$510B",
    aumRaw: 510,
    founded: "1976",
    headquarters: "New York, NY",
    location: "New York, NY",
    lpiScore: 7.8,
    lpiVersion: "v3.1",

    lpiSubComponents: {
      overall: {
        ownership:  { label: "Ownership Score",  rawScore: 0.67, maxScore: 6.00, percentile: 71 },
        leadership: { label: "Leadership Score",  rawScore: 0.25, maxScore: 2.00, percentile: 44 },
        workforce:  { label: "Workforce Score",   rawScore: 0.58, maxScore: 2.00, percentile: 38 },
      },
      dimensions: [
        {
          dimension: "Gender",
          color: "#6366f1",
          ownership:  { label: "Gender Ownership Score",  rawScore: 0.50, maxScore: 3.00, percentile: 74 },
          leadership: { label: "Gender Leadership Score", rawScore: 0.25, maxScore: 1.00, percentile: 55 },
          workforce:  { label: "Gender Workforce Score",  rawScore: 0.42, maxScore: 1.00, percentile: 48 },
        },
        {
          dimension: "Racial",
          color: "#f59e0b",
          ownership:  { label: "Racial Ownership Score",  rawScore: 0.17, maxScore: 3.00, percentile: 30 },
          leadership: { label: "Racial Leadership Score", rawScore: 0.00, maxScore: 1.00, percentile: null },
          workforce:  { label: "Racial Workforce Score",  rawScore: 0.16, maxScore: 1.00, percentile: 22 },
        },
      ],
      peerGroups: [
        { label: "$AUM",      sublabel: "$250B–$750B",  percentile: 58 },
        { label: "HQ Region", sublabel: "Northeast US", percentile: 61 },
      ],
    },

    benchmarks: {
      universe: {
        label: "Roundtables Universe",
        p10: 4.2, q1: 5.8, median: 6.9, q3: 8.0, p90: 9.1,
        min: 2.1, max: 10.0,
        managerValue: 7.8, managerPercentile: 58, n: 312,
      },
      portfolio: {
        label: "My Portfolio",
        p10: 5.1, q1: 6.4, median: 7.2, q3: 8.3, p90: 9.3,
        min: 3.8, max: 9.8,
        managerValue: 7.8, managerPercentile: 44, n: 47,
      },
      assetClass: {
        label: "Asset Class (Private Equity)",
        p10: 4.8, q1: 6.1, median: 7.0, q3: 8.1, p90: 9.2,
        min: 2.9, max: 10.0,
        managerValue: 7.8, managerPercentile: 54, n: 89,
        comingSoon: true,
      },
    },

    genderDemographics: {
      ownership:  { men: 8,  women: 4 },
      leadership: { men: 11, women: 3 },
      workforce:  { men: 19, women: 14 },
    },
    racialDemographics: {
      ownership: {
        indigenous_na: 0, asian: 2, black: 1, latino: 1, mena: 0,
        indigenous_out: 0, white: 8, other: 0, multiracial: 0,
      },
      leadership: {
        indigenous_na: 0, asian: 2, black: 0, latino: 0, mena: 1,
        indigenous_out: 0, white: 11, other: 0, multiracial: 0,
      },
      workforce: {
        indigenous_na: 0, asian: 5, black: 3, latino: 2, mena: 1,
        indigenous_out: 0, white: 19, other: 2, multiracial: 1,
      },
    },
  },

  {
    id: "org-apollo",
    surveyId: "survey-2026-dei-lenox",
    name: "Apollo Global Management",
    type: "GP",
    contactName: "Robert Kim",
    contactTitle: "Managing Director, DEI",
    contactEmail: "r.kim@apollo.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: null,
    lastActivity: "Feb 22, 2026",
    status: "in_progress",
    progress: 64,
    assetClass: "Private Credit",
    customAssetClass: "Direct Lending",
    strategyFocus: ["Credit", "Private Equity", "Real Assets"],
    aum: "$651B",
    aumRaw: 651,
    founded: "1990",
    headquarters: "New York, NY",
    location: "New York, NY",
    lpiScore: null,
    lpiVersion: "v3.1",
    lpiSubComponents: null,
    benchmarks: null,
    genderDemographics: null,
    racialDemographics: null,
  },

  {
    id: "org-carlyle",
    surveyId: "survey-2026-dei-lenox",
    name: "The Carlyle Group",
    type: "GP",
    contactName: "Amanda Torres",
    contactTitle: "VP, Diversity & Inclusion",
    contactEmail: "a.torres@carlyle.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: null,
    lastActivity: "Mar 5, 2026",
    status: "in_progress",
    progress: 41,
    assetClass: "Private Equity",
    customAssetClass: "Middle-Market Buyout",
    strategyFocus: ["Buyout", "Growth Capital", "Infrastructure"],
    aum: "$426B",
    aumRaw: 426,
    founded: "1987",
    headquarters: "Washington, DC",
    location: "Washington, DC",
    lpiScore: null,
    lpiVersion: "v3.1",
    lpiSubComponents: null,
    benchmarks: null,
    genderDemographics: null,
    racialDemographics: null,
  },

  {
    id: "org-tpg",
    surveyId: "survey-2026-dei-lenox",
    name: "TPG Capital",
    type: "GP",
    contactName: "Chris Lee",
    contactTitle: "Director, Human Resources",
    contactEmail: "c.lee@tpg.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: null,
    lastActivity: null,
    status: "not_started",
    progress: 0,
    assetClass: "Private Equity",
    customAssetClass: "Growth Equity",
    strategyFocus: ["Buyout", "Growth", "Impact"],
    aum: "$222B",
    aumRaw: 222,
    founded: "1992",
    headquarters: "Fort Worth, TX",
    location: "Fort Worth, TX",
    lpiScore: null,
    lpiVersion: "v3.1",
    lpiSubComponents: null,
    benchmarks: null,
    genderDemographics: null,
    racialDemographics: null,
  },

  {
    id: "org-vista",
    surveyId: "survey-2026-dei-lenox",
    name: "Vista Equity Partners",
    type: "GP",
    contactName: "Nicole Brown",
    contactTitle: "Chief People Officer",
    contactEmail: "n.brown@vistaequitypartners.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: null,
    lastActivity: null,
    status: "not_started",
    progress: 0,
    assetClass: "Venture Capital",
    customAssetClass: "Growth Equity",
    strategyFocus: ["Software Buyout", "Growth Equity"],
    aum: "$101B",
    aumRaw: 101,
    founded: "2000",
    headquarters: "Austin, TX",
    location: "Austin, TX",
    lpiScore: null,
    lpiVersion: "v3.1",
    lpiSubComponents: null,
    benchmarks: null,
    genderDemographics: null,
    racialDemographics: null,
  },

  {
    id: "org-bain",
    surveyId: "survey-2026-dei-lenox",
    name: "Bain Capital",
    type: "GP",
    contactName: "Thomas Grant",
    contactTitle: "Partner, Talent & Culture",
    contactEmail: "t.grant@baincapital.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 1, 2026",
    lastActivity: "Mar 1, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Private Equity",
    customAssetClass: "Middle-Market Buyout",
    strategyFocus: ["Buyout", "Venture", "Credit"],
    aum: "$185B",
    aumRaw: 185,
    founded: "1984",
    headquarters: "Boston, MA",
    location: "Boston, MA",
    lpiScore: 7.1,
    lpiVersion: "v3.1",

    lpiSubComponents: {
      overall: {
        ownership:  { label: "Ownership Score",  rawScore: 0.22, maxScore: 6.00, percentile: 31 },
        leadership: { label: "Leadership Score",  rawScore: 0.11, maxScore: 2.00, percentile: 18 },
        workforce:  { label: "Workforce Score",   rawScore: 0.44, maxScore: 2.00, percentile: 29 },
      },
      dimensions: [
        {
          dimension: "Gender",
          color: "#6366f1",
          ownership:  { label: "Gender Ownership Score",  rawScore: 0.22, maxScore: 3.00, percentile: 40 },
          leadership: { label: "Gender Leadership Score", rawScore: 0.11, maxScore: 1.00, percentile: 24 },
          workforce:  { label: "Gender Workforce Score",  rawScore: 0.33, maxScore: 1.00, percentile: 35 },
        },
        {
          dimension: "Racial",
          color: "#f59e0b",
          ownership:  { label: "Racial Ownership Score",  rawScore: 0.00, maxScore: 3.00, percentile: null },
          leadership: { label: "Racial Leadership Score", rawScore: 0.00, maxScore: 1.00, percentile: null },
          workforce:  { label: "Racial Workforce Score",  rawScore: 0.11, maxScore: 1.00, percentile: 15 },
        },
      ],
      peerGroups: [
        { label: "$AUM",      sublabel: "$100B–$250B",  percentile: 42 },
        { label: "HQ Region", sublabel: "Northeast US", percentile: 38 },
      ],
    },

    benchmarks: {
      universe: {
        label: "Roundtables Universe",
        p10: 4.2, q1: 5.8, median: 6.9, q3: 8.0, p90: 9.1,
        min: 2.1, max: 10.0,
        managerValue: 7.1, managerPercentile: 43, n: 312,
      },
      portfolio: {
        label: "My Portfolio",
        p10: 5.1, q1: 6.4, median: 7.2, q3: 8.3, p90: 9.3,
        min: 3.8, max: 9.8,
        managerValue: 7.1, managerPercentile: 31, n: 47,
      },
      assetClass: {
        label: "Asset Class (Private Equity)",
        p10: 4.8, q1: 6.1, median: 7.0, q3: 8.1, p90: 9.2,
        min: 2.9, max: 10.0,
        managerValue: 7.1, managerPercentile: 37, n: 89,
        comingSoon: true,
      },
    },

    genderDemographics: {
      ownership:  { men: 14, women: 3 },
      leadership: { men: 10, women: 2 },
      workforce:  { men: 22, women: 11 },
    },
    racialDemographics: {
      ownership: {
        indigenous_na: 0, asian: 1, black: 0, latino: 0, mena: 0,
        indigenous_out: 0, white: 16, other: 0, multiracial: 0,
      },
      leadership: {
        indigenous_na: 0, asian: 1, black: 1, latino: 0, mena: 0,
        indigenous_out: 0, white: 10, other: 0, multiracial: 0,
      },
      workforce: {
        indigenous_na: 0, asian: 4, black: 2, latino: 1, mena: 0,
        indigenous_out: 0, white: 24, other: 1, multiracial: 1,
      },
    },
  },

  {
    id: "org-warburg",
    surveyId: "survey-2026-dei-lenox",
    name: "Warburg Pincus",
    type: "GP",
    contactName: "Lisa Park",
    contactTitle: "Managing Director",
    contactEmail: "l.park@warburgpincus.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: null,
    lastActivity: "Feb 15, 2026",
    status: "in_progress",
    progress: 22,
    assetClass: "Venture Capital",
    customAssetClass: "Growth Equity",
    strategyFocus: ["Growth Equity", "Venture"],
    aum: "$83B",
    aumRaw: 83,
    founded: "1966",
    headquarters: "New York, NY",
    location: "New York, NY",
    lpiScore: null,
    lpiVersion: "v3.1",
    lpiSubComponents: null,
    benchmarks: null,
    genderDemographics: null,
    racialDemographics: null,
  },

  // ── Blackstone business units — subsidiaries shown on the "My Organization"
  // Org Structure tab, each with its own report view ────────────────────────
  {
    id: "bx-real-estate",
    surveyId: "survey-2026-dei-lenox",
    name: "Blackstone Real Estate",
    type: "GP",
    contactName: "Elena Rourke",
    contactTitle: "Global Head of Real Estate",
    contactEmail: "e.rourke@blackstone.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 9, 2026",
    lastActivity: "Mar 9, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Real Estate",
    customAssetClass: "Core-Plus Real Estate",
    strategyFocus: ["Real Estate", "Core+", "Debt"],
    aum: "$325B",
    aumRaw: 325,
    founded: "1991",
    headquarters: "Miami, FL",
    location: "Miami, FL",
    lpiScore: 8.4,
    lpiVersion: "v3.1",

    lpiSubComponents: {
      overall: {
        ownership:  { label: "Ownership Score",  rawScore: 0.50, maxScore: 6.00, percentile: 66 },
        leadership: { label: "Leadership Score",  rawScore: 0.15, maxScore: 2.00, percentile: 52 },
        workforce:  { label: "Workforce Score",   rawScore: 0.40, maxScore: 2.00, percentile: 45 },
      },
      dimensions: [
        {
          dimension: "Gender",
          color: "#6366f1",
          ownership:  { label: "Gender Ownership Score",  rawScore: 0.33, maxScore: 3.00, percentile: 70 },
          leadership: { label: "Gender Leadership Score", rawScore: 0.10, maxScore: 1.00, percentile: 58 },
          workforce:  { label: "Gender Workforce Score",  rawScore: 0.28, maxScore: 1.00, percentile: 50 },
        },
        {
          dimension: "Racial",
          color: "#f59e0b",
          ownership:  { label: "Racial Ownership Score",  rawScore: 0.17, maxScore: 3.00, percentile: 40 },
          leadership: { label: "Racial Leadership Score", rawScore: 0.05, maxScore: 1.00, percentile: 33 },
          workforce:  { label: "Racial Workforce Score",  rawScore: 0.12, maxScore: 1.00, percentile: 28 },
        },
      ],
      peerGroups: [
        { label: "$AUM",      sublabel: "$100B+",        percentile: 66 },
        { label: "HQ Region", sublabel: "Southeast US",  percentile: 60 },
      ],
    },

    benchmarks: {
      universe: {
        label: "Roundtables Universe",
        p10: 4.2, q1: 5.8, median: 6.9, q3: 8.0, p90: 9.1,
        min: 2.1, max: 10.0,
        managerValue: 8.4, managerPercentile: 78, n: 312,
      },
      portfolio: {
        label: "My Portfolio",
        p10: 5.1, q1: 6.4, median: 7.2, q3: 8.3, p90: 9.3,
        min: 3.8, max: 9.8,
        managerValue: 8.4, managerPercentile: 67, n: 47,
      },
      assetClass: {
        label: "Asset Class (Real Estate)",
        p10: 4.0, q1: 5.5, median: 6.7, q3: 7.9, p90: 9.0,
        min: 2.0, max: 9.9,
        managerValue: 8.4, managerPercentile: 81, n: 54,
        comingSoon: true,
      },
    },

    genderDemographics: {
      ownership:  { men: 10, women: 5 },
      leadership: { men: 7,  women: 3 },
      workforce:  { men: 14, women: 9 },
    },
    racialDemographics: {
      ownership: {
        indigenous_na: 0, asian: 2, black: 1, latino: 1, mena: 0,
        indigenous_out: 0, white: 10, other: 1, multiracial: 0,
      },
      leadership: {
        indigenous_na: 0, asian: 1, black: 0, latino: 0, mena: 0,
        indigenous_out: 0, white: 9, other: 0, multiracial: 0,
      },
      workforce: {
        indigenous_na: 0, asian: 3, black: 2, latino: 2, mena: 1,
        indigenous_out: 0, white: 14, other: 1, multiracial: 0,
      },
    },
  },

  {
    id: "bx-credit-insurance",
    surveyId: "survey-2026-dei-lenox",
    name: "Blackstone Credit & Insurance (BXCI)",
    type: "GP",
    contactName: "Dana Whitfield",
    contactTitle: "Global Head of Credit & Insurance",
    contactEmail: "d.whitfield@blackstone.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 6, 2026",
    lastActivity: "Mar 6, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Private Credit",
    customAssetClass: "Direct Lending",
    strategyFocus: ["Direct Lending", "Insurance", "Credit"],
    aum: "$290B",
    aumRaw: 290,
    founded: "1998",
    headquarters: "Miami, FL",
    location: "Miami, FL",
    lpiScore: 7.9,
    lpiVersion: "v3.1",

    lpiSubComponents: {
      overall: {
        ownership:  { label: "Ownership Score",  rawScore: 0.39, maxScore: 6.00, percentile: 55 },
        leadership: { label: "Leadership Score",  rawScore: 0.10, maxScore: 2.00, percentile: 33 },
        workforce:  { label: "Workforce Score",   rawScore: 0.35, maxScore: 2.00, percentile: 40 },
      },
      dimensions: [
        {
          dimension: "Gender",
          color: "#6366f1",
          ownership:  { label: "Gender Ownership Score",  rawScore: 0.28, maxScore: 3.00, percentile: 60 },
          leadership: { label: "Gender Leadership Score", rawScore: 0.08, maxScore: 1.00, percentile: 35 },
          workforce:  { label: "Gender Workforce Score",  rawScore: 0.25, maxScore: 1.00, percentile: 44 },
        },
        {
          dimension: "Racial",
          color: "#f59e0b",
          ownership:  { label: "Racial Ownership Score",  rawScore: 0.11, maxScore: 3.00, percentile: 22 },
          leadership: { label: "Racial Leadership Score", rawScore: 0.02, maxScore: 1.00, percentile: 10 },
          workforce:  { label: "Racial Workforce Score",  rawScore: 0.10, maxScore: 1.00, percentile: 20 },
        },
      ],
      peerGroups: [
        { label: "$AUM",      sublabel: "$25B–$100B",   percentile: 55 },
        { label: "HQ Region", sublabel: "Southeast US", percentile: 52 },
      ],
    },

    benchmarks: {
      universe: {
        label: "Roundtables Universe",
        p10: 4.2, q1: 5.8, median: 6.9, q3: 8.0, p90: 9.1,
        min: 2.1, max: 10.0,
        managerValue: 7.9, managerPercentile: 64, n: 312,
      },
      portfolio: {
        label: "My Portfolio",
        p10: 5.1, q1: 6.4, median: 7.2, q3: 8.3, p90: 9.3,
        min: 3.8, max: 9.8,
        managerValue: 7.9, managerPercentile: 54, n: 47,
      },
      assetClass: {
        label: "Asset Class (Private Credit)",
        p10: 4.4, q1: 5.9, median: 7.0, q3: 8.1, p90: 9.2,
        min: 2.3, max: 9.9,
        managerValue: 7.9, managerPercentile: 62, n: 63,
        comingSoon: true,
      },
    },

    genderDemographics: {
      ownership:  { men: 9,  women: 3 },
      leadership: { men: 6,  women: 2 },
      workforce:  { men: 12, women: 7 },
    },
    racialDemographics: {
      ownership: {
        indigenous_na: 0, asian: 1, black: 1, latino: 0, mena: 0,
        indigenous_out: 0, white: 9, other: 1, multiracial: 0,
      },
      leadership: {
        indigenous_na: 0, asian: 1, black: 0, latino: 0, mena: 0,
        indigenous_out: 0, white: 7, other: 0, multiracial: 0,
      },
      workforce: {
        indigenous_na: 0, asian: 2, black: 1, latino: 1, mena: 0,
        indigenous_out: 0, white: 14, other: 1, multiracial: 0,
      },
    },
  },

  {
    id: "bx-pe",
    surveyId: "survey-2026-dei-lenox",
    name: "Blackstone Private Equity",
    type: "GP",
    contactName: "Adrian Voss",
    contactTitle: "Global Head of Private Equity",
    contactEmail: "a.voss@blackstone.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 11, 2026",
    lastActivity: "Mar 11, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Private Equity",
    customAssetClass: "Large-Cap Buyout",
    strategyFocus: ["Buyout", "Growth Equity", "Tactical Opportunities"],
    aum: "$180B",
    aumRaw: 180,
    founded: "1985",
    headquarters: "Miami, FL",
    location: "Miami, FL",
    lpiScore: 8.0,
    lpiVersion: "v3.1",

    lpiSubComponents: {
      overall: {
        ownership:  { label: "Ownership Score",  rawScore: 0.42, maxScore: 6.00, percentile: 58 },
        leadership: { label: "Leadership Score",  rawScore: 0.12, maxScore: 2.00, percentile: 38 },
        workforce:  { label: "Workforce Score",   rawScore: 0.36, maxScore: 2.00, percentile: 42 },
      },
      dimensions: [
        {
          dimension: "Gender",
          color: "#6366f1",
          ownership:  { label: "Gender Ownership Score",  rawScore: 0.30, maxScore: 3.00, percentile: 63 },
          leadership: { label: "Gender Leadership Score", rawScore: 0.10, maxScore: 1.00, percentile: 40 },
          workforce:  { label: "Gender Workforce Score",  rawScore: 0.27, maxScore: 1.00, percentile: 46 },
        },
        {
          dimension: "Racial",
          color: "#f59e0b",
          ownership:  { label: "Racial Ownership Score",  rawScore: 0.12, maxScore: 3.00, percentile: 25 },
          leadership: { label: "Racial Leadership Score", rawScore: 0.02, maxScore: 1.00, percentile: 12 },
          workforce:  { label: "Racial Workforce Score",  rawScore: 0.09, maxScore: 1.00, percentile: 18 },
        },
      ],
      peerGroups: [
        { label: "$AUM",      sublabel: "$100B+",       percentile: 60 },
        { label: "HQ Region", sublabel: "Southeast US", percentile: 58 },
      ],
    },

    benchmarks: {
      universe: {
        label: "Roundtables Universe",
        p10: 4.2, q1: 5.8, median: 6.9, q3: 8.0, p90: 9.1,
        min: 2.1, max: 10.0,
        managerValue: 8.0, managerPercentile: 67, n: 312,
      },
      portfolio: {
        label: "My Portfolio",
        p10: 5.1, q1: 6.4, median: 7.2, q3: 8.3, p90: 9.3,
        min: 3.8, max: 9.8,
        managerValue: 8.0, managerPercentile: 57, n: 47,
      },
      assetClass: {
        label: "Asset Class (Private Equity)",
        p10: 4.8, q1: 6.1, median: 7.0, q3: 8.1, p90: 9.2,
        min: 2.9, max: 10.0,
        managerValue: 8.0, managerPercentile: 66, n: 89,
        comingSoon: true,
      },
    },

    genderDemographics: {
      ownership:  { men: 11, women: 4 },
      leadership: { men: 8,  women: 2 },
      workforce:  { men: 13, women: 8 },
    },
    racialDemographics: {
      ownership: {
        indigenous_na: 0, asian: 2, black: 0, latino: 1, mena: 0,
        indigenous_out: 0, white: 11, other: 1, multiracial: 0,
      },
      leadership: {
        indigenous_na: 0, asian: 1, black: 0, latino: 0, mena: 0,
        indigenous_out: 0, white: 9, other: 0, multiracial: 0,
      },
      workforce: {
        indigenous_na: 0, asian: 3, black: 1, latino: 2, mena: 0,
        indigenous_out: 0, white: 14, other: 1, multiracial: 0,
      },
    },
  },

  {
    id: "bx-infrastructure",
    surveyId: "survey-2026-dei-lenox",
    name: "Blackstone Infrastructure Partners",
    type: "GP",
    contactName: "Grace Umeh",
    contactTitle: "Head of Infrastructure",
    contactEmail: "g.umeh@blackstone.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 4, 2026",
    lastActivity: "Mar 4, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Infrastructure",
    customAssetClass: "Infrastructure Debt",
    strategyFocus: ["Infrastructure", "Energy Transition"],
    aum: "$55B",
    aumRaw: 55,
    founded: "2018",
    headquarters: "Miami, FL",
    location: "Miami, FL",
    lpiScore: 7.3,
    lpiVersion: "v3.1",

    lpiSubComponents: {
      overall: {
        ownership:  { label: "Ownership Score",  rawScore: 0.30, maxScore: 6.00, percentile: 40 },
        leadership: { label: "Leadership Score",  rawScore: 0.05, maxScore: 2.00, percentile: 20 },
        workforce:  { label: "Workforce Score",   rawScore: 0.28, maxScore: 2.00, percentile: 30 },
      },
      dimensions: [
        {
          dimension: "Gender",
          color: "#6366f1",
          ownership:  { label: "Gender Ownership Score",  rawScore: 0.22, maxScore: 3.00, percentile: 45 },
          leadership: { label: "Gender Leadership Score", rawScore: 0.05, maxScore: 1.00, percentile: 22 },
          workforce:  { label: "Gender Workforce Score",  rawScore: 0.20, maxScore: 1.00, percentile: 32 },
        },
        {
          dimension: "Racial",
          color: "#f59e0b",
          ownership:  { label: "Racial Ownership Score",  rawScore: 0.08, maxScore: 3.00, percentile: 15 },
          leadership: { label: "Racial Leadership Score", rawScore: 0.00, maxScore: 1.00, percentile: null },
          workforce:  { label: "Racial Workforce Score",  rawScore: 0.08, maxScore: 1.00, percentile: 14 },
        },
      ],
      peerGroups: [
        { label: "$AUM",      sublabel: "$25B–$100B",   percentile: 40 },
        { label: "HQ Region", sublabel: "Southeast US", percentile: 38 },
      ],
    },

    benchmarks: {
      universe: {
        label: "Roundtables Universe",
        p10: 4.2, q1: 5.8, median: 6.9, q3: 8.0, p90: 9.1,
        min: 2.1, max: 10.0,
        managerValue: 7.3, managerPercentile: 50, n: 312,
      },
      portfolio: {
        label: "My Portfolio",
        p10: 5.1, q1: 6.4, median: 7.2, q3: 8.3, p90: 9.3,
        min: 3.8, max: 9.8,
        managerValue: 7.3, managerPercentile: 40, n: 47,
      },
      assetClass: {
        label: "Asset Class (Infrastructure)",
        p10: 3.9, q1: 5.3, median: 6.5, q3: 7.7, p90: 8.9,
        min: 2.1, max: 9.6,
        managerValue: 7.3, managerPercentile: 52, n: 41,
        comingSoon: true,
      },
    },

    genderDemographics: {
      ownership:  { men: 6, women: 2 },
      leadership: { men: 4, women: 1 },
      workforce:  { men: 9, women: 4 },
    },
    racialDemographics: {
      ownership: {
        indigenous_na: 0, asian: 1, black: 0, latino: 0, mena: 0,
        indigenous_out: 0, white: 7, other: 0, multiracial: 0,
      },
      leadership: {
        indigenous_na: 0, asian: 0, black: 0, latino: 0, mena: 0,
        indigenous_out: 0, white: 5, other: 0, multiracial: 0,
      },
      workforce: {
        indigenous_na: 0, asian: 1, black: 1, latino: 1, mena: 0,
        indigenous_out: 0, white: 9, other: 1, multiracial: 0,
      },
    },
  },

  {
    id: "bx-bxma",
    surveyId: "survey-2026-dei-lenox",
    name: "Multi-Asset Investing (BXMA)",
    type: "GP",
    contactName: "Felix Nakamura",
    contactTitle: "Head of Multi-Asset Investing",
    contactEmail: "f.nakamura@blackstone.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 7, 2026",
    lastActivity: "Mar 7, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Multi-Asset",
    customAssetClass: "Diversified Macro",
    strategyFocus: ["Hedge Fund Solutions", "Multi-Strategy"],
    aum: "$80B",
    aumRaw: 80,
    founded: "2013",
    headquarters: "Miami, FL",
    location: "Miami, FL",
    lpiScore: 7.6,
    lpiVersion: "v3.1",

    lpiSubComponents: {
      overall: {
        ownership:  { label: "Ownership Score",  rawScore: 0.35, maxScore: 6.00, percentile: 47 },
        leadership: { label: "Leadership Score",  rawScore: 0.08, maxScore: 2.00, percentile: 28 },
        workforce:  { label: "Workforce Score",   rawScore: 0.30, maxScore: 2.00, percentile: 35 },
      },
      dimensions: [
        {
          dimension: "Gender",
          color: "#6366f1",
          ownership:  { label: "Gender Ownership Score",  rawScore: 0.25, maxScore: 3.00, percentile: 52 },
          leadership: { label: "Gender Leadership Score", rawScore: 0.07, maxScore: 1.00, percentile: 30 },
          workforce:  { label: "Gender Workforce Score",  rawScore: 0.22, maxScore: 1.00, percentile: 37 },
        },
        {
          dimension: "Racial",
          color: "#f59e0b",
          ownership:  { label: "Racial Ownership Score",  rawScore: 0.10, maxScore: 3.00, percentile: 20 },
          leadership: { label: "Racial Leadership Score", rawScore: 0.01, maxScore: 1.00, percentile: 8 },
          workforce:  { label: "Racial Workforce Score",  rawScore: 0.08, maxScore: 1.00, percentile: 15 },
        },
      ],
      peerGroups: [
        { label: "$AUM",      sublabel: "$25B–$100B",   percentile: 47 },
        { label: "HQ Region", sublabel: "Southeast US", percentile: 44 },
      ],
    },

    benchmarks: {
      universe: {
        label: "Roundtables Universe",
        p10: 4.2, q1: 5.8, median: 6.9, q3: 8.0, p90: 9.1,
        min: 2.1, max: 10.0,
        managerValue: 7.6, managerPercentile: 57, n: 312,
      },
      portfolio: {
        label: "My Portfolio",
        p10: 5.1, q1: 6.4, median: 7.2, q3: 8.3, p90: 9.3,
        min: 3.8, max: 9.8,
        managerValue: 7.6, managerPercentile: 47, n: 47,
      },
      assetClass: {
        label: "Asset Class (Multi-Asset)",
        p10: 4.1, q1: 5.6, median: 6.8, q3: 7.9, p90: 9.0,
        min: 2.4, max: 9.7,
        managerValue: 7.6, managerPercentile: 59, n: 37,
        comingSoon: true,
      },
    },

    genderDemographics: {
      ownership:  { men: 7,  women: 2 },
      leadership: { men: 5,  women: 1 },
      workforce:  { men: 10, women: 5 },
    },
    racialDemographics: {
      ownership: {
        indigenous_na: 0, asian: 1, black: 0, latino: 0, mena: 0,
        indigenous_out: 0, white: 8, other: 0, multiracial: 0,
      },
      leadership: {
        indigenous_na: 0, asian: 0, black: 0, latino: 0, mena: 0,
        indigenous_out: 0, white: 6, other: 0, multiracial: 0,
      },
      workforce: {
        indigenous_na: 0, asian: 2, black: 1, latino: 1, mena: 0,
        indigenous_out: 0, white: 10, other: 1, multiracial: 0,
      },
    },
  },

  {
    id: "bx-secondaries",
    surveyId: "survey-2026-dei-lenox",
    name: "Strategic Partners (Secondaries)",
    type: "GP",
    contactName: "Isabelle Ortega",
    contactTitle: "Head of Strategic Partners (Secondaries)",
    contactEmail: "i.ortega@blackstone.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: "Mar 12, 2026",
    lastActivity: "Mar 12, 2026",
    status: "submitted",
    progress: 100,
    assetClass: "Secondaries",
    customAssetClass: null,
    strategyFocus: ["Secondaries", "GP-Led"],
    aum: "$50B",
    aumRaw: 50,
    founded: "2000",
    headquarters: "Miami, FL",
    location: "Miami, FL",
    lpiScore: 8.1,
    lpiVersion: "v3.1",

    lpiSubComponents: {
      overall: {
        ownership:  { label: "Ownership Score",  rawScore: 0.46, maxScore: 6.00, percentile: 60 },
        leadership: { label: "Leadership Score",  rawScore: 0.14, maxScore: 2.00, percentile: 45 },
        workforce:  { label: "Workforce Score",   rawScore: 0.38, maxScore: 2.00, percentile: 44 },
      },
      dimensions: [
        {
          dimension: "Gender",
          color: "#6366f1",
          ownership:  { label: "Gender Ownership Score",  rawScore: 0.31, maxScore: 3.00, percentile: 65 },
          leadership: { label: "Gender Leadership Score", rawScore: 0.11, maxScore: 1.00, percentile: 48 },
          workforce:  { label: "Gender Workforce Score",  rawScore: 0.28, maxScore: 1.00, percentile: 48 },
        },
        {
          dimension: "Racial",
          color: "#f59e0b",
          ownership:  { label: "Racial Ownership Score",  rawScore: 0.15, maxScore: 3.00, percentile: 32 },
          leadership: { label: "Racial Leadership Score", rawScore: 0.03, maxScore: 1.00, percentile: 15 },
          workforce:  { label: "Racial Workforce Score",  rawScore: 0.10, maxScore: 1.00, percentile: 20 },
        },
      ],
      peerGroups: [
        { label: "$AUM",      sublabel: "$25B–$100B",   percentile: 62 },
        { label: "HQ Region", sublabel: "Southeast US", percentile: 58 },
      ],
    },

    benchmarks: {
      universe: {
        label: "Roundtables Universe",
        p10: 4.2, q1: 5.8, median: 6.9, q3: 8.0, p90: 9.1,
        min: 2.1, max: 10.0,
        managerValue: 8.1, managerPercentile: 69, n: 312,
      },
      portfolio: {
        label: "My Portfolio",
        p10: 5.1, q1: 6.4, median: 7.2, q3: 8.3, p90: 9.3,
        min: 3.8, max: 9.8,
        managerValue: 8.1, managerPercentile: 59, n: 47,
      },
      assetClass: {
        label: "Asset Class (Secondaries)",
        p10: 4.3, q1: 5.8, median: 7.0, q3: 8.2, p90: 9.1,
        min: 2.6, max: 9.8,
        managerValue: 8.1, managerPercentile: 70, n: 29,
        comingSoon: true,
      },
    },

    genderDemographics: {
      ownership:  { men: 6, women: 3 },
      leadership: { men: 4, women: 2 },
      workforce:  { men: 8, women: 5 },
    },
    racialDemographics: {
      ownership: {
        indigenous_na: 0, asian: 1, black: 1, latino: 0, mena: 0,
        indigenous_out: 0, white: 6, other: 1, multiracial: 0,
      },
      leadership: {
        indigenous_na: 0, asian: 0, black: 0, latino: 0, mena: 0,
        indigenous_out: 0, white: 5, other: 1, multiracial: 0,
      },
      workforce: {
        indigenous_na: 0, asian: 1, black: 1, latino: 1, mena: 0,
        indigenous_out: 0, white: 8, other: 1, multiracial: 0,
      },
    },
  },

  {
    id: "bx-corporate",
    surveyId: "survey-2026-dei-lenox",
    name: "Corporate & Shared Services",
    type: "GP",
    contactName: "Priscilla Adeyemi",
    contactTitle: "Chief Administrative Officer",
    contactEmail: "p.adeyemi@blackstone.com",
    invitedDate: "Feb 8, 2026",
    submissionDate: null,
    lastActivity: "Feb 9, 2026",
    status: "not_started",
    progress: 0,
    assetClass: "Corporate & Shared Services",
    customAssetClass: null,
    strategyFocus: ["Shared Services"],
    aum: "N/A",
    aumRaw: 0,
    founded: "1985",
    headquarters: "Miami, FL",
    location: "Miami, FL",
    lpiScore: null,
    lpiVersion: "v3.1",
    lpiSubComponents: null,
    benchmarks: null,
    genderDemographics: null,
    racialDemographics: null,
  },
];

export function getSurveyById(id: string): Survey | undefined {
  return MOCK_SURVEYS.find((s) => s.id === id);
}

export function getOrgsBySurveyId(surveyId: string): InvitedOrg[] {
  return MOCK_ORGS.filter((o) => o.surveyId === surveyId);
}

export function getOrgById(id: string): InvitedOrg | undefined {
  return MOCK_ORGS.find((o) => o.id === id);
}

// ── Custom asset classes (per-survey, host-defined) ─────────────────────────
// Each maps a free-text label the host uses internally to zero or more of the
// fixed Roundtables benchmark categories (see src/lib/asset-class-groups.ts).
// Mapping is optional at creation time and can span multiple categories.
export const MOCK_CUSTOM_ASSET_CLASSES: CustomAssetClass[] = [
  { id: "cac-large-cap-buyout",    surveyId: "survey-2026-dei-lenox", name: "Large-Cap Buyout",         benchmarkGroups: ["private-equity"],          createdAt: "Feb 9, 2026" },
  { id: "cac-mid-market-buyout",   surveyId: "survey-2026-dei-lenox", name: "Middle-Market Buyout",      benchmarkGroups: ["private-equity"],          createdAt: "Feb 9, 2026" },
  { id: "cac-growth-equity",       surveyId: "survey-2026-dei-lenox", name: "Growth Equity",             benchmarkGroups: ["private-equity"],          createdAt: "Feb 10, 2026" },
  { id: "cac-direct-lending",      surveyId: "survey-2026-dei-lenox", name: "Direct Lending",            benchmarkGroups: ["credit"],                  createdAt: "Feb 11, 2026" },
  { id: "cac-core-plus-re",        surveyId: "survey-2026-dei-lenox", name: "Core-Plus Real Estate",     benchmarkGroups: ["real-estate"],             createdAt: "Feb 12, 2026" },
  { id: "cac-diversified-macro",   surveyId: "survey-2026-dei-lenox", name: "Diversified Macro",         benchmarkGroups: ["hedge-funds"],             createdAt: "Feb 12, 2026" },
  { id: "cac-infra-debt",          surveyId: "survey-2026-dei-lenox", name: "Infrastructure Debt",       benchmarkGroups: ["real-assets", "credit"],   createdAt: "Feb 13, 2026" },
  { id: "cac-long-only-equities",  surveyId: "survey-2026-dei-lenox", name: "Public Equities Long-Only", benchmarkGroups: ["long-only"],               createdAt: "Feb 13, 2026" },
  { id: "cac-emerging-markets",    surveyId: "survey-2026-dei-lenox", name: "Emerging Markets",          benchmarkGroups: [],                          createdAt: "Feb 14, 2026" },
];

export function getCustomAssetClassesBySurveyId(surveyId: string): CustomAssetClass[] {
  return MOCK_CUSTOM_ASSET_CLASSES.filter((c) => c.surveyId === surveyId);
}

// ── Contacts (per-survey, from the host's raw contact list) ─────────────────
// Survey hosts hand us contact lists that don't reliably indicate which
// organization each person belongs to. `rawOrgLabel` preserves exactly what
// the host wrote (often messy/abbreviated), while `orgId` is the platform
// organization an admin has matched it to — null until scrubbed. Each
// contact logs into their own account and links to at most one org, so this
// is a plain nullable foreign key rather than a many-to-many mapping.
export const MOCK_CONTACTS: Contact[] = [
  // ── Matched — already scrubbed and linked to an invited organization ──
  { id: "contact-1",  surveyId: "survey-2026-dei-lenox", firstName: "Michael",  lastName: "Davis",  email: "m.davis@blackstone.com",         title: "Chief Diversity & Inclusion Officer", rawOrgLabel: "Blackstone",              orgId: "org-blackstone", hasAccount: true,  lastLogin: "Mar 10, 2026", hasSubmittedBefore: true },
  { id: "contact-2",  surveyId: "survey-2026-dei-lenox", firstName: "Jennifer", lastName: "Walsh",  email: "j.walsh@kkr.com",                title: "Head of Human Capital",                rawOrgLabel: "KKR & Co. Inc.",          orgId: "org-kkr",       hasAccount: true,  lastLogin: "Mar 8, 2026",  hasSubmittedBefore: true },
  { id: "contact-3",  surveyId: "survey-2026-dei-lenox", firstName: "Robert",   lastName: "Kim",    email: "r.kim@apollo.com",               title: "Managing Director, DEI",               rawOrgLabel: "Apollo Global Mgmt",      orgId: "org-apollo",    hasAccount: true,  lastLogin: "Mar 5, 2026",  hasSubmittedBefore: false },
  { id: "contact-4",  surveyId: "survey-2026-dei-lenox", firstName: "Amanda",   lastName: "Torres", email: "a.torres@carlyle.com",           title: "VP, Diversity & Inclusion",            rawOrgLabel: "The Carlyle Group",       orgId: "org-carlyle",   hasAccount: true,  lastLogin: "Feb 27, 2026", hasSubmittedBefore: true },
  { id: "contact-5",  surveyId: "survey-2026-dei-lenox", firstName: "Chris",    lastName: "Lee",    email: "c.lee@tpg.com",                  title: "Director, Human Resources",            rawOrgLabel: "TPG Capital, L.P.",       orgId: "org-tpg",       hasAccount: true,  lastLogin: "Feb 22, 2026", hasSubmittedBefore: false },
  { id: "contact-6",  surveyId: "survey-2026-dei-lenox", firstName: "Nicole",   lastName: "Brown",  email: "n.brown@vistaequitypartners.com", title: "Chief People Officer",                rawOrgLabel: "Vista Eq. Partners",      orgId: "org-vista",     hasAccount: true,  lastLogin: "Feb 18, 2026", hasSubmittedBefore: true },
  { id: "contact-7",  surveyId: "survey-2026-dei-lenox", firstName: "Thomas",   lastName: "Grant",  email: "t.grant@baincapital.com",        title: "Partner, Talent & Culture",            rawOrgLabel: "Bain Capital LP",         orgId: "org-bain",      hasAccount: false, lastLogin: null,           hasSubmittedBefore: false },
  { id: "contact-8",  surveyId: "survey-2026-dei-lenox", firstName: "Lisa",     lastName: "Park",   email: "l.park@warburgpincus.com",       title: "Managing Director",                    rawOrgLabel: "Warburg Pincus LLC",      orgId: "org-warburg",   hasAccount: false, lastLogin: null,           hasSubmittedBefore: false },

  // ── Unmatched — imported from the host's list without a clear org match ──
  { id: "contact-9",  surveyId: "survey-2026-dei-lenox", firstName: "Sarah",    lastName: "Kessler", email: "skessler@bx-advisors.com",     title: "Investor Relations Associate",         rawOrgLabel: "BX Advisors",             orgId: null, hasAccount: false, lastLogin: null, hasSubmittedBefore: false },
  { id: "contact-10", surveyId: "survey-2026-dei-lenox", firstName: "Daniel",   lastName: "Osei",    email: "d.osei@meridianpeakcap.com",   title: "Chief of Staff",                       rawOrgLabel: "Meridian Peak Capital",   orgId: null, hasAccount: false, lastLogin: null, hasSubmittedBefore: false },
  { id: "contact-11", surveyId: "survey-2026-dei-lenox", firstName: "Priya",    lastName: "Nair",    email: "priya.nair@tpgaxonpartn.com",  title: "Associate, Portfolio Ops",             rawOrgLabel: "TPG-Axon Sourcing",       orgId: null, hasAccount: false, lastLogin: null, hasSubmittedBefore: false },
  { id: "contact-12", surveyId: "survey-2026-dei-lenox", firstName: "Evelyn",   lastName: "Marsh",   email: "e.marsh@carlylegrp-intl.com",  title: "Senior Associate",                     rawOrgLabel: "Carlyle Grp (Intl Ops)",  orgId: null, hasAccount: false, lastLogin: null, hasSubmittedBefore: false },
  { id: "contact-13", surveyId: "survey-2026-dei-lenox", firstName: "Jonah",    lastName: "Fischer", email: "jonah.fischer@gmail.com",      title: "—",                                    rawOrgLabel: "",                        orgId: null, hasAccount: false, lastLogin: null, hasSubmittedBefore: false },

  // ── Blackstone business unit contacts — shown on the "My Organization" Org Structure tab ──
  { id: "contact-14", surveyId: "survey-2026-dei-lenox", firstName: "Elena",     lastName: "Rourke",    email: "e.rourke@blackstone.com",    title: "Global Head of Real Estate",              rawOrgLabel: "Blackstone Real Estate",              orgId: "bx-real-estate",      hasAccount: true,  lastLogin: "Mar 9, 2026",  hasSubmittedBefore: true },
  { id: "contact-15", surveyId: "survey-2026-dei-lenox", firstName: "Marcus",    lastName: "Ihle",      email: "m.ihle@blackstone.com",      title: "Head of Real Estate Debt Strategies",     rawOrgLabel: "Blackstone Real Estate",              orgId: "bx-real-estate",      hasAccount: true,  lastLogin: "Mar 8, 2026",  hasSubmittedBefore: false },
  { id: "contact-16", surveyId: "survey-2026-dei-lenox", firstName: "Dana",      lastName: "Whitfield", email: "d.whitfield@blackstone.com", title: "Global Head of Credit & Insurance",       rawOrgLabel: "Blackstone Credit & Insurance (BXCI)", orgId: "bx-credit-insurance", hasAccount: true,  lastLogin: "Mar 6, 2026",  hasSubmittedBefore: true },
  { id: "contact-17", surveyId: "survey-2026-dei-lenox", firstName: "Renee",     lastName: "Kowalski",  email: "r.kowalski@blackstone.com",  title: "Head of Insurance Solutions",             rawOrgLabel: "Blackstone Credit & Insurance (BXCI)", orgId: "bx-credit-insurance", hasAccount: true,  lastLogin: "Mar 5, 2026",  hasSubmittedBefore: false },
  { id: "contact-18", surveyId: "survey-2026-dei-lenox", firstName: "Adrian",    lastName: "Voss",      email: "a.voss@blackstone.com",      title: "Global Head of Private Equity",           rawOrgLabel: "Blackstone Private Equity",           orgId: "bx-pe",               hasAccount: true,  lastLogin: "Mar 11, 2026", hasSubmittedBefore: true },
  { id: "contact-19", surveyId: "survey-2026-dei-lenox", firstName: "Julia",     lastName: "Marchetti", email: "j.marchetti@blackstone.com", title: "Head of Tactical Opportunities",          rawOrgLabel: "Blackstone Private Equity",           orgId: "bx-pe",               hasAccount: true,  lastLogin: "Mar 10, 2026", hasSubmittedBefore: false },
  { id: "contact-20", surveyId: "survey-2026-dei-lenox", firstName: "Grace",     lastName: "Umeh",      email: "g.umeh@blackstone.com",      title: "Head of Infrastructure",                  rawOrgLabel: "Blackstone Infrastructure Partners",  orgId: "bx-infrastructure",   hasAccount: true,  lastLogin: "Mar 4, 2026",  hasSubmittedBefore: true },
  { id: "contact-21", surveyId: "survey-2026-dei-lenox", firstName: "Marcus",    lastName: "Lindqvist", email: "m.lindqvist@blackstone.com", title: "VP, Infrastructure Operations",           rawOrgLabel: "Blackstone Infrastructure Partners",  orgId: "bx-infrastructure",   hasAccount: false, lastLogin: null,           hasSubmittedBefore: false },
  { id: "contact-22", surveyId: "survey-2026-dei-lenox", firstName: "Felix",     lastName: "Nakamura",  email: "f.nakamura@blackstone.com",  title: "Head of Multi-Asset Investing",           rawOrgLabel: "Multi-Asset Investing (BXMA)",        orgId: "bx-bxma",             hasAccount: true,  lastLogin: "Mar 7, 2026",  hasSubmittedBefore: true },
  { id: "contact-23", surveyId: "survey-2026-dei-lenox", firstName: "Sophia",    lastName: "Reyes",     email: "s.reyes@blackstone.com",     title: "Director, Multi-Asset Investing",         rawOrgLabel: "Multi-Asset Investing (BXMA)",        orgId: "bx-bxma",             hasAccount: false, lastLogin: null,           hasSubmittedBefore: false },
  { id: "contact-24", surveyId: "survey-2026-dei-lenox", firstName: "Isabelle",  lastName: "Ortega",    email: "i.ortega@blackstone.com",    title: "Head of Strategic Partners (Secondaries)", rawOrgLabel: "Strategic Partners (Secondaries)",   orgId: "bx-secondaries",      hasAccount: true,  lastLogin: "Mar 12, 2026", hasSubmittedBefore: true },
  { id: "contact-25", surveyId: "survey-2026-dei-lenox", firstName: "Malik",     lastName: "Johnson",   email: "m.johnson@blackstone.com",   title: "VP, Secondaries",                         rawOrgLabel: "Strategic Partners (Secondaries)",   orgId: "bx-secondaries",      hasAccount: false, lastLogin: null,           hasSubmittedBefore: false },
  { id: "contact-26", surveyId: "survey-2026-dei-lenox", firstName: "Priscilla", lastName: "Adeyemi",   email: "p.adeyemi@blackstone.com",   title: "Chief Administrative Officer",            rawOrgLabel: "Corporate & Shared Services",        orgId: "bx-corporate",        hasAccount: true,  lastLogin: "Feb 9, 2026",  hasSubmittedBefore: false },
  { id: "contact-27", surveyId: "survey-2026-dei-lenox", firstName: "Tom",       lastName: "Whitaker",  email: "t.whitaker@blackstone.com",  title: "Director, HR Operations",                 rawOrgLabel: "Corporate & Shared Services",        orgId: "bx-corporate",        hasAccount: false, lastLogin: null,           hasSubmittedBefore: false },
];

export function getContactsBySurveyId(surveyId: string): Contact[] {
  return MOCK_CONTACTS.filter((c) => c.surveyId === surveyId);
}

// Gender demographics are exported separately for Blackstone
export const BLACKSTONE_GENDER_DEMOGRAPHICS = {
  ownership: { men: 13, women: 4 },
  leadership: { men: 9, women: 0 },
  workforce: { men: 12, women: 6 },
};
