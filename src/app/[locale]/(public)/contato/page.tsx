import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mail, Phone, Linkedin, Calendar } from "lucide-react";
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

      <section className="section-padding" style={{ backgroundColor: "#f0f4f8" }}>
        <div
          className="container-xl"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "3rem",
            alignItems: "start",
          }}
        >
          {/* Contact info */}
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "2rem" }}>
              Informações de contato
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2.5rem" }}>
              {[
                {
                  icon: Mail,
                  label: "E-mail",
                  value: "contato.neurobotics@gmail.com",
                  href: "mailto:contato.neurobotics@gmail.com",
                  color: "#4361EE",
                },
                {
                  icon: Linkedin,
                  label: "LinkedIn",
                  value: "/in/thiagoleal98",
                  href: "https://www.linkedin.com/in/thiagoleal98/",
                  color: "#0077B5",
                },
              ].map(({ icon: Icon, label, value, href, color }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1.25rem",
                    backgroundColor: "white",
                    borderRadius: "0.875rem",
                    border: "1px solid rgba(0,0,0,0.06)",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: "0.75rem",
                      backgroundColor: `${color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {label}
                    </div>
                    <div style={{ color: "#0d1b2a", fontWeight: 600, fontSize: "0.9375rem" }}>{value}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Calendly embed */}
            <div
              style={{
                background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                borderRadius: "1.25rem",
                padding: "2rem",
                color: "white",
              }}
            >
              <Calendar size={32} color="#06D6A0" style={{ marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                {t("scheduleTitle")}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                {t("scheduleSubtitle")} Escolha um horário que funcione para você — sem compromisso.
              </p>

              {/* Calendly placeholder — substituir pela URL real */}
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px dashed rgba(255,255,255,0.2)",
                  borderRadius: "0.875rem",
                  padding: "2rem",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.875rem",
                }}
              >
                <Calendar size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.4 }} />
                Integrar com Calendly
                <br />
                <span style={{ fontSize: "0.75rem" }}>Adicione sua URL do Calendly nas configurações</span>
              </div>

              <a
                href="https://calendly.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "#06D6A0",
                  color: "#0d1b2a",
                  padding: "0.875rem",
                  borderRadius: "0.75rem",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  marginTop: "1rem",
                  textDecoration: "none",
                }}
              >
                Agendar sessão gratuita
              </a>
            </div>
          </div>

          {/* Form */}
          <div>
            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.5rem" }}>
                Enviar mensagem
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
                Respondo em até 24 horas úteis.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
