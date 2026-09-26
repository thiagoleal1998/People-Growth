// Shared, framework-free scoring logic for the "Diagnóstico de Liderança"
// tool: an 11-competency assessment of one person, split across two axes
// (Desempenho/Performance, Comportamento/Behavior) that mirror a classic
// 9-box succession-planning grid. Used both by the API route (authoritative
// scoring — never trust a client-computed score) and, if ever needed, by a
// live preview in the client wizard.

export type CompetencyAxis = "performance" | "behavior";

export type CompetencyKey =
  | "business_acumen"
  | "customer_focus"
  | "strategic_thinking"
  | "action_orientation"
  | "commitment"
  | "results"
  | "vision_and_purpose"
  | "values_and_ethics"
  | "teamwork"
  | "innovation"
  | "people_development";

export type CompetencyRating = 1 | 2 | 3;
export type CompetencyRatings = Partial<Record<CompetencyKey, CompetencyRating>>;

export type Competency = {
  key: CompetencyKey;
  labelPt: string;
  labelEn: string;
  axis: CompetencyAxis;
};

// Split is an interpretation of the source material, not a rigid business
// rule — the "performance" axis groups the more outcome/business-facing
// traits, "behavior" groups the more people/values-facing ones.
export const COMPETENCIES: Competency[] = [
  { key: "business_acumen", labelPt: "Perspicácia/discernimento nos negócios", labelEn: "Business acumen", axis: "performance" },
  { key: "customer_focus", labelPt: "Foco no cliente", labelEn: "Customer focus", axis: "performance" },
  { key: "strategic_thinking", labelPt: "Percepção estratégica", labelEn: "Strategic thinking", axis: "performance" },
  { key: "action_orientation", labelPt: "Ação", labelEn: "Action orientation", axis: "performance" },
  { key: "commitment", labelPt: "Comprometimento", labelEn: "Commitment", axis: "performance" },
  { key: "results", labelPt: "Desempenho", labelEn: "Results", axis: "performance" },
  { key: "vision_and_purpose", labelPt: "Visão e propósito", labelEn: "Vision and purpose", axis: "behavior" },
  { key: "values_and_ethics", labelPt: "Valores e ética", labelEn: "Values and ethics", axis: "behavior" },
  { key: "teamwork", labelPt: "Trabalho em grupo", labelEn: "Teamwork", axis: "behavior" },
  { key: "innovation", labelPt: "Inovação", labelEn: "Innovation", axis: "behavior" },
  { key: "people_development", labelPt: "Desenvolvimento e alocação de pessoal", labelEn: "People development and allocation", axis: "behavior" },
];

// Axis-tier labels for the grid's ticks — LeadershipNineBox takes a plain
// `locale` prop rather than using next-intl, since it's shared with the
// admin (Server Component) tree, so this data stays colocated here rather
// than in messages/*.json.
export const TIER_LABELS: Record<1 | 2 | 3, { pt: string; en: string }> = {
  1: { pt: "Abaixo dos padrões", en: "Below standard" },
  2: { pt: "Dentro dos padrões", en: "Meets standard" },
  3: { pt: "Excede os padrões", en: "Exceeds standard" },
};

export function scoreAxis(ratings: CompetencyRatings, axis: CompetencyAxis): number {
  const items = COMPETENCIES.filter((c) => c.axis === axis);
  const values = items.map((c) => ratings[c.key]).filter((v): v is CompetencyRating => v != null);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

// Buckets a 1-3 average into one of the grid's 3 tiers.
function scoreTier(score: number): 1 | 2 | 3 {
  if (score < 1 + 2 / 3) return 1;
  if (score < 1 + 4 / 3) return 2;
  return 3;
}

export type QuadrantLabel = {
  key: string;
  legendMark: string;
  labelPt: string;
  labelEn: string;
};

// 9-cell lookup reusing the book's 6-category legend (some cells share a
// category, matching the book's typical layout: the top-right corner is
// the single best cell, the bottom-left the single worst, and the middle
// column/row spreads across "developing" categories).
const QUADRANTS: Record<`${1 | 2 | 3}-${1 | 2 | 3}`, QuadrantLabel> = {
  "3-3": { key: "high_potential", legendMark: "★", labelPt: "Alto potencial", labelEn: "High potential" },
  "3-2": { key: "promotable", legendMark: "●", labelPt: "Pode ser promovido", labelEn: "Promotable" },
  "2-3": { key: "promotable", legendMark: "●", labelPt: "Pode ser promovido", labelEn: "Promotable" },
  "3-1": { key: "seasoned_professional", legendMark: "■", labelPt: "Profissional experiente", labelEn: "Seasoned professional" },
  "2-2": { key: "seasoned_professional", legendMark: "■", labelPt: "Profissional experiente", labelEn: "Seasoned professional" },
  "1-3": { key: "seasoned_professional", legendMark: "■", labelPt: "Profissional experiente", labelEn: "Seasoned professional" },
  "1-2": { key: "too_new", legendMark: "▲", labelPt: "Muito novo na função", labelEn: "Too new to the role" },
  "2-1": { key: "too_new", legendMark: "▲", labelPt: "Muito novo na função", labelEn: "Too new to the role" },
  "1-1": { key: "needs_change", legendMark: "✕", labelPt: "Precisa mudar de função", labelEn: "Needs a role change" },
};

export function quadrantLabel(performanceScore: number, behaviorScore: number): QuadrantLabel {
  const p = scoreTier(performanceScore);
  const b = scoreTier(behaviorScore);
  return QUADRANTS[`${p}-${b}`];
}

export type AssessmentResult = {
  performanceScore: number;
  behaviorScore: number;
  quadrant: QuadrantLabel;
};

export function computeAssessment(ratings: CompetencyRatings): AssessmentResult {
  const performanceScore = scoreAxis(ratings, "performance");
  const behaviorScore = scoreAxis(ratings, "behavior");
  return { performanceScore, behaviorScore, quadrant: quadrantLabel(performanceScore, behaviorScore) };
}
