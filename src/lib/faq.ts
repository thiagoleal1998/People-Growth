// Shared "question | answer" parser for the admin-editable FAQ text
// (Admin > SEO > AEO, keys aeo_faq_pt/aeo_faq_en in site_config) — used
// both for the invisible FAQPage JSON-LD schema and for the visible FAQ
// sections on the site, so all three stay in sync with one parsing rule.
export function parseFaqEntries(raw: string): [string, string][] {
  return raw
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts): parts is [string, string] => parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1]));
}

// config is the flattened site_config key/value map already fetched by
// the caller (every page that needs this also needs other site_config
// values, so there's no standalone fetch here — just the locale-fallback
// lookup plus the shared parse above).
export function getFaqEntriesFromConfig(config: Record<string, string>, locale: string): [string, string][] {
  const faqKey = locale === "en" ? "aeo_faq_en" : "aeo_faq_pt";
  const raw = config[faqKey] || config.aeo_faq_pt || "";
  return parseFaqEntries(raw);
}
