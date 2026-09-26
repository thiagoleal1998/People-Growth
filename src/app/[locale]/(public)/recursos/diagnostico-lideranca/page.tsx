import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LeadershipAssessmentTool } from "@/components/LeadershipAssessmentTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leadershipTool" });
  return { title: t("heroTitle"), description: t("heroSubtitle") };
}

export default async function DiagnosticoLiderancaPage() {
  const t = await getTranslations("leadershipTool");

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "3.5rem", color: "white", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, marginBottom: "1rem" }}>{t("heroTitle")}</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>{t("heroSubtitle")}</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "760px", margin: "0 auto" }}>
          <LeadershipAssessmentTool />
        </div>
      </section>
    </>
  );
}
