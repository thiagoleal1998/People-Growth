export type Milestone = { year: string; label: string };

export function parseMilestones(text: string | null): Milestone[] {
  return (text ?? "")
    .split("\n")
    .map((line) => {
      const [year, ...rest] = line.split("|");
      return { year: (year ?? "").trim(), label: rest.join("|").trim() };
    })
    .filter((m) => m.year && m.label);
}

export function bioParagraphs(text: string | null) {
  return (text ?? "")
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
