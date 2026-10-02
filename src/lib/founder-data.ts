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
// field started with — for every other option, falling back to the
// person's own first name ("Sobre {Nome}") sidesteps needing a gendered
// noun at all, which is the simplest respectful option in Portuguese
// (there's no single standard neutral form in widespread formal use).
export function aboutAuthorLabel(gender: Author["gender"], firstName: string, locale: string): string {
  if (locale === "en") return "About the author";
  if (gender === "masculino") return "Sobre o autor";
  if (gender === "feminino") return "Sobre a autora";
  return `Sobre ${firstName}`;
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

export function bioParagraphs(text: string | null) {
  return (text ?? "")
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
