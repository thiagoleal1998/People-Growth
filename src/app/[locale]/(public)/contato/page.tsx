import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ContatoPage() {
  const t = await getTranslations("contact");

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)",
          paddingTop: "6rem",
          paddingBottom: "5rem",
          color: "white",
          textAlign: "center",
        }}
      >
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>
            {t("title")}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "560px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "var(--site-card)", borderRadius: "1.25rem", padding: "2rem", border: "1px solid var(--site-border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.5rem" }}>
              Enviar mensagem
            </h2>
            <p style={{ color: "var(--site-muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
              Respondemos em até 24 horas úteis.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
