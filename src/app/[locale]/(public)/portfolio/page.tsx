import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/Reveal";
import { pickLocale } from "@/lib/locale-content";
import type { PortfolioCase } from "@/types/database.types";

export const revalidate = 300;

const categoryColor: Record<PortfolioCase["category"], string> = {
  marketing: "#4361EE",
  growth: "#06D6A0",
  data: "#FFB703",
  ai: "#4361EE",
  consulting: "#06D6A0",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function PortfolioPage() {
  const t = await getTranslations("portfolio");
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("portfolio_cases").select("*").eq("status", "active").order("order");
  const cases = (data ?? []) as PortfolioCase[];

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "5rem", color: "white", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, marginBottom: "1rem" }}>{t("title")}</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>{t("subtitle")}</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl">
          <Reveal>
          {cases.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {t("noCases")}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: "2rem" }}>
              {cases.map((c) => {
                const color = categoryColor[c.category];
                const label = t(c.category);
                const firstResult = (pickLocale(locale, c.results_pt, c.results_en) ?? "").split("\n").map((l) => l.trim()).filter(Boolean)[0];
                return (
                  <Link
                    key={c.id}
                    href={{ pathname: "/portfolio/[slug]", params: { slug: c.slug } }}
                    style={{ display: "block", textDecoration: "none" }}
                    className="hover-card"
                  >
                    <article style={{ backgroundColor: "var(--site-card)", borderRadius: "1.25rem", overflow: "hidden", border: "1px solid var(--site-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", height: "100%", display: "flex", flexDirection: "column" }}>
                      <div
                        style={{
                          height: "220px",
                          background: c.cover_image ? `url(${c.cover_image}) center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: "0.75rem",
                        }}
                      >
                        <span style={{ backgroundColor: `${color}25`, color, padding: "0.25rem 0.875rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 700 }}>
                          {label}
                        </span>
                        {firstResult && (
                          <div style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "0.625rem 1.25rem", textAlign: "center" }}>
                            <div style={{ fontWeight: 800, color, fontSize: "1.0625rem" }}>{firstResult}</div>
                          </div>
                        )}
                      </div>

                      <div style={{ padding: "1.75rem", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.625rem" }}>{pickLocale(locale, c.title_pt, c.title_en)}</h3>
                        {c.challenge_pt && (
                          <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1.25rem", flex: 1 }}>{pickLocale(locale, c.challenge_pt, c.challenge_en)}</p>
                        )}

                        {c.tools && c.tools.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "1.25rem" }}>
                            {c.tools.map((tool) => (
                              <span key={tool} style={{ backgroundColor: "var(--site-surface-alt)", color: "var(--site-text-secondary)", padding: "0.2rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 600 }}>
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#4361EE", fontWeight: 700, fontSize: "0.9rem" }}>
                          {t("viewFullCase")} <ArrowRight size={16} />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
