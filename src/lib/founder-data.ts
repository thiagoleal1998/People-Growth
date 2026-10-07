import type { Author } from "@/types/database.types";

export type Milestone = { year: string; label: string };

// A columnist only becomes publicly visible once their profile has enough
// to actually show: a real photo (not the gradient placeholder), their
// name, and a tagline — otherwise an unfinished profile (no photo, no
// tagline) ends up listed everywhere looking broken/empty.
export function isAuthorPubliclyVisible(author: Pick<Author, "photo_url" | "name" | "tagline_pt">): boolean {
  return Boolean(author.photo_url?.trim() && author.name?.trim() && author.tagline_pt?.trim());
}

// "Sobre o autor"/"Sobre a autora" only works for the binary genders this
// field started with — for every other option, dropping the noun
// ("Sobre") sidesteps needing a gendered word at all, which is the
// simplest respectful option in Portuguese (there's no single standard
// neutral form in widespread formal use). The author's name is always
// shown right next to this label already, so repeating it here would be
// redundant rather than clarifying.
export function aboutAuthorLabel(gender: Author["gender"], locale: string): string {
  if (locale === "en") return "About the author";
  if (gender === "masculino") return "Sobre o autor";
  if (gender === "feminino") return "Sobre a autora";
  return "Sobre";
}

export function parseMilestones(text: string | null): Milestone[] {
  return (text ?? "")
    .split("\n")
    .map((line) => {
      const [year, ...rest] = line.split("|");
      return { year: (year ?? "").trim(), label: rest.join("|").trim() };
    })
    .filter((m) => m.year && m.label);
}

// "A, B e C" (or "A, B and C" in English) for a collaborative piece's byline —
// falls back to "" for an empty list so callers can just check truthiness.
export function joinAuthorNames(names: string[], locale: string): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  const and = locale === "en" ? "and" : "e";
  return `${names.slice(0, -1).join(", ")} ${and} ${names[names.length - 1]}`;
}

export function bioParagraphs(text: string | null) {
  return (text ?? "")
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
