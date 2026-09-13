import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 300;

type SiteConfigRow = { key: string; value: string | null };

async function getFaqEntries(locale: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any).from("site_config").select("*")) as { data: SiteConfigRow[] | null };
  const config = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));

  // Same source and "question | answer" format as the invisible FAQPage
  // JSON-LD schema in [locale]/layout.tsx — this page is what a human
  // visitor actually sees, the schema is what search engines/voice
  // assistants read; both are fed by the same admin-editable text.
  const faqKey = locale === "en" ? "aeo_faq_en" : "aeo_faq_pt";
  const raw = config[faqKey] || config.aeo_faq_pt || "";
  return raw
    .split("\n")
    .map((line: string) => line.split("|").map((part) => part.trim()))
    .filter((parts: string[]): parts is [string, string] => parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1]));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("faq");
  const entries = await getFaqEntries(locale);

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "5rem", color: "white", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, marginBottom: "1rem" }}>{t("title")}</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>{t("subtitle")}</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "760px" }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>{t("empty")}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {entries.map(([question, answer], i) => (
                <details key={i} className="faq-item" style={{ backgroundColor: "var(--site-card)", borderRadius: "1rem", border: "1px solid var(--site-border)", padding: "0.25rem 1.5rem" }}>
                  <summary
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      padding: "1.125rem 0",
                      cursor: "pointer",
                      listStyle: "none",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--site-text)",
                    }}
                  >
                    {question}
                    <ChevronDown size={18} className="faq-chevron" style={{ flexShrink: 0, color: "var(--site-muted)", transition: "transform 0.2s" }} />
                  </summary>
                  <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, paddingBottom: "1.375rem", margin: 0 }}>
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          )}
        </div>

        <style>{`
          .faq-item summary::-webkit-details-marker { display: none; }
          .faq-item[open] .faq-chevron { transform: rotate(180deg); }
        `}</style>
      </section>
    </>
  );
}
