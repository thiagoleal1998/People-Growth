import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "testimonials" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function DepoimentosPage() {
  const t = await getTranslations("testimonials");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("testimonials").select("*").eq("status", "active").order("order");
  const testimonials = (data ?? []) as Testimonial[];

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
          {testimonials.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              Nenhum depoimento cadastrado no momento.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem" }}>
              {testimonials.map((item) => (
                <div key={item.id} className="hover-card" style={{ backgroundColor: "var(--site-card)", borderRadius: "1.25rem", padding: "2rem", border: "1px solid var(--site-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                  {item.rating && (
                    <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.25rem" }}>
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={16} fill="#FFB703" color="#FFB703" />
                      ))}
                    </div>
                  )}
                  <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.75, flex: 1, marginBottom: "1.5rem", fontStyle: "italic" }}>
                    &ldquo;{item.text_pt}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <div
                      style={{
                        width: "2.75rem",
                        height: "2.75rem",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: item.avatar_url ? `url(${item.avatar_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 800,
                        fontSize: "1rem",
                      }}
                    >
                      {!item.avatar_url && item.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--site-text)", fontSize: "0.9375rem" }}>{item.name}</div>
                      <div style={{ color: "var(--site-muted)", fontSize: "0.8125rem" }}>
                        {[item.role, item.company].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
