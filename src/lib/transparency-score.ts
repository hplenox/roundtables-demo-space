import { MOCK_SURVEYS } from "@/lib/mock-data";
import type { Survey } from "@/types/survey";

// A survey's Transparency Score is a composite of how much it discloses back
// to participants (privacy level), how many invited organizations actually
// respond, and how well those who start actually finish. It's computed from
// real Survey fields already in mock data — not random — so the same survey
// always scores the same, and the platform benchmark below reflects the
// actual 9 surveys in MOCK_SURVEYS rather than synthetic peers.

const DISCLOSURE_POINTS: Record<Survey["privacyLevel"], number> = {
  "Full disclosure": 100,
  "Aggregate only": 62,
  "No information": 25,
};

export interface TransparencyBreakdown {
  score: number;
  disclosureScore: number;
  responseRateScore: number;
  followThroughScore: number;
}

export function computeTransparencyScore(survey: Survey): TransparencyBreakdown {
  const disclosureScore = DISCLOSURE_POINTS[survey.privacyLevel];

  const responseRateScore = survey.totalInvited > 0
    ? Math.min(100, Math.round((survey.submitted / survey.totalInvited) * 100 * 1.15))
    : 0;

  const engaged = survey.submitted + survey.inProgress;
  const followThroughScore = engaged > 0
    ? Math.round((survey.submitted / engaged) * 100)
    : 0;

  const score = Math.round(
    disclosureScore * 0.5 + responseRateScore * 0.3 + followThroughScore * 0.2
  );

  return { score, disclosureScore, responseRateScore, followThroughScore };
}

export function transparencyBand(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Exceptional transparency", color: "#00897b" };
  if (score >= 70) return { label: "Strong transparency", color: "#00b8a9" };
  if (score >= 50) return { label: "Moderate transparency", color: "#b45309" };
  return { label: "Limited transparency", color: "#dc2626" };
}

export interface PlatformSurveyScore {
  surveyId: string;
  hostOrg: string;
  score: number;
}

/** Every surveys's score, computed the same way — the real benchmark population. */
export function allPlatformTransparencyScores(): PlatformSurveyScore[] {
  return MOCK_SURVEYS.map((s) => ({
    surveyId: s.id,
    hostOrg: s.hostOrg,
    score: computeTransparencyScore(s).score,
  }));
}

export function transparencyPercentile(score: number, all: PlatformSurveyScore[]): number {
  if (all.length === 0) return 0;
  const below = all.filter((p) => p.score < score).length;
  return Math.round((below / all.length) * 100);
}
