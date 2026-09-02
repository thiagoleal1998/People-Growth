export type Milestone = { year: string; label: string };

export const founderMilestones: Record<string, Milestone[]> = {
  "Thiago Leal": [
    { year: "2022", label: "Fundou a People & Growth" },
    { year: "2024", label: "Fundou a Neuro Botics" },
  ],
};

export function bioParagraphs(text: string | null) {
  return (text ?? "")
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
