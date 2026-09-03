import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mic, Video, BookOpen, Calendar, Headphones, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { MediaItem } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const revalidate = 300;

const typeMeta: Record<MediaItem["type"], { icon: LucideIcon; color: string }> = {
  interview: { icon: Mic, color: "#4361EE" },
  event: { icon: Video, color: "#06D6A0" },
  article: { icon: BookOpen, color: "#FFB703" },
  podcast: { icon: Headphones, color: "#4361EE" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "media" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function NaMidiaPage() {
  const t = await getTranslations("media");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("media_items").select("*").order("order");
  const items = (data ?? []) as MediaItem[];

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
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              Nenhuma menção cadastrada no momento.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {items.map((item) => {
                const meta = typeMeta[item.type];
                const Icon = meta.icon;
                const card = (
                  <div className="hover-card" style={{ backgroundColor: "var(--site-card)", borderRadius: "1rem", padding: "1.75rem", border: "1px solid var(--site-border)", display: "flex", gap: "1.25rem" }}>
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "0.875rem",
                        flexShrink: 0,
                        background: item.thumbnail ? `url(${item.thumbnail}) center/cover` : `${meta.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {!item.thumbnail && <Icon size={20} color={meta.color} />}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.375rem" }}>{item.title}</h3>
                      {item.outlet && <div style={{ color: "var(--site-muted)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.25rem" }}>{item.outlet}</div>}
                      {item.date && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--site-faint)", fontSize: "0.75rem" }}>
                          <Calendar size={12} /> {new Date(item.date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                        </div>
                      )}
                    </div>
                  </div>
                );
                return item.url ? (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    {card}
                  </a>
                ) : (
                  <div key={item.id}>{card}</div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
