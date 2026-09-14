// Every bilingual table in this project stores a required "_pt" column
// plus an optional "_en" one (e.g. title_pt/title_en, name_pt/name_en).
// This picks whichever matches the active locale, falling back to the
// Portuguese value when English hasn't been authored yet (or is empty)
// rather than rendering blank content — used everywhere a public page
// displays that kind of field, so /en never silently shows Portuguese
// content that actually has a translation sitting unused in the DB.
//
// Separate type params for pt/en (rather than one shared T) so that a
// required, non-null "_pt" column (the common case) keeps the return
// type as plain `string` instead of widening to `string | null` just
// because its "_en" counterpart is nullable.
export function pickLocale<PT extends string | null | undefined, EN extends string | null | undefined>(
  locale: string,
  pt: PT,
  en: EN
): PT | NonNullable<EN> {
  return (locale === "en" && en ? en : pt) as PT | NonNullable<EN>;
}
