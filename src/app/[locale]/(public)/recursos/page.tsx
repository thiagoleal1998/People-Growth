import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { FileText, Layout, BookOpen, CheckSquare, Zap, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ResourceDownloadButton } from "@/components/ResourceDownloadButton";
import { pickLocale } from "@/lib/locale-content";
import type { Resource } from "@/types/database.types";

export const revalidate = 300;

const typeMeta: Record<Resource["type"], { labelKey: string; icon: LucideIcon; color: string }> = {
  template: { labelKey: "typeTemplate", icon: Layout, color: "#4361EE" },
  checklist: { labelKey: "typeChecklist", icon: CheckSquare, color: "#06D6A0" },
  prompt: { labelKey: "typePrompt", icon: Zap, color: "#FFB703" },
  guide: { labelKey: "typeGuide", icon: BookOpen, color: "#4361EE" },
  ebook: { labelKey: "typeEbook", icon: FileText, color: "#06D6A0" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function RecursosPage() {
  const t = await getTranslations("resources");
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("resources").select("*").eq("status", "active").order("created_at", { ascending: false });
  const resources = (data ?? []) as Resource[];

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
          {resources.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {t("noResources")}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "1.75rem" }}>
              {resources.map((resource) => {
                const meta = typeMeta[resource.type];
                const Icon = meta.icon;
                return (
                  <div key={resource.id} className="hover-card" style={{ backgroundColor: "var(--site-card)", borderRadius: "1.25rem", padding: "2rem", border: "1px solid var(--site-border)", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                      <div style={{ width: "3rem", height: "3rem", borderRadius: "0.875rem", backgroundColor: `${meta.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={20} color={meta.color} />
                      </div>
                      <span style={{ backgroundColor: `${meta.color}12`, color: meta.color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>{t(meta.labelKey)}</span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--site-text)", marginBottom: "0.5rem" }}>{pickLocale(locale, resource.title_pt, resource.title_en)}</h3>
                    {resource.description_pt && (
                      <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.65, flex: 1, marginBottom: "1.5rem" }}>{pickLocale(locale, resource.description_pt, resource.description_en)}</p>
                    )}
                    {resource.file_url ? (
                      <ResourceDownloadButton
                        resourceId={resource.id}
                        leadRequired={resource.lead_required}
                        downloadCount={resource.download_count}
                        color={meta.color}
                        label={t("download")}
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--site-border-strong)", paddingTop: "1.25rem" }}>
                        <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)", fontWeight: 500 }}>{resource.download_count.toLocaleString(locale === "en" ? "en-US" : "pt-BR")} {t("downloadsLabel")}</span>
                        <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)", fontWeight: 600 }}>{t("comingSoon")}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
