import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Target, TrendingUp, Rocket, BarChart3, Brain, Users, Sparkles, ArrowRight, CheckCircle2, Wrench,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/types/database.types";

export const revalidate = 300;

const iconMap: Record<string, LucideIcon> = {
  Target, TrendingUp, Rocket, BarChart3, Brain, Users, Sparkles,
};

const palette = ["#4361EE", "#06D6A0", "#FFB703"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ServicosPage() {
  const t = await getTranslations("services");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("services").select("*").eq("status", "active").order("order");
  const services = (data ?? []) as Service[];

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
        <div className="container-xl" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(67,97,238,0.2)",
              color: "#6b80f4",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
            }}
          >
            {t("title")}
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>
            Soluções estratégicas para
            <br />
            <span style={{ background: "linear-gradient(135deg, #4361EE, #06D6A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              negócios que querem crescer.
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl">
          {services.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              Nenhum serviço cadastrado no momento.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2rem" }}>
              {services.map((service, i) => {
                const Icon = (service.icon && iconMap[service.icon]) || Wrench;
                const color = palette[i % palette.length];
                const benefits = (service.benefits ?? []).slice(0, 3);
                return (
                  <div
                    key={service.id}
                    className="hover-card"
                    style={{
                      backgroundColor: "var(--site-card)",
                      borderRadius: "1.25rem",
                      padding: "2rem",
                      border: "1px solid var(--site-border)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "3.25rem",
                        height: "3.25rem",
                        borderRadius: "0.875rem",
                        backgroundColor: `${color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <Icon size={22} color={color} />
                    </div>

                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.625rem" }}>
                      {service.title_pt}
                    </h2>
                    <p style={{ color: "var(--site-muted)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem", flex: 1 }}>
                      {service.description_pt}
                    </p>

                    {benefits.length > 0 && (
                      <div style={{ marginBottom: "1.5rem" }}>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.625rem" }}>
                          Benefícios
                        </p>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          {benefits.map((benefit) => (
                            <li key={benefit} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--site-text-secondary)" }}>
                              <CheckCircle2 size={14} color={color} />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Link
                      href={{ pathname: "/servicos/[slug]", params: { slug: service.slug } }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        backgroundColor: color,
                        color: color === "#FFB703" ? "#0d1b2a" : "white",
                        padding: "0.875rem",
                        borderRadius: "0.75rem",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        textDecoration: "none",
                      }}
                    >
                      Solicitar proposta <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="section-padding" style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
            Como funciona a consultoria
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.0625rem", marginBottom: "3.5rem" }}>
            Um processo estruturado para gerar resultados reais.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem", textAlign: "left" }}>
            {[
              { step: "01", title: "Diagnóstico", desc: "Entendimento profundo do negócio, desafios e oportunidades." },
              { step: "02", title: "Estratégia", desc: "Desenvolvimento do plano estratégico personalizado." },
              { step: "03", title: "Execução", desc: "Implementação com acompanhamento próximo." },
              { step: "04", title: "Resultados", desc: "Medição, ajuste e consolidação dos ganhos." },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="hover-card-dark"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: "2rem", color: "rgba(67,97,238,0.4)", marginBottom: "0.5rem", lineHeight: 1 }}>
                  {step}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.375rem" }}>{title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "3rem" }}>
            <Link
              href="/contato"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#4361EE",
                color: "white",
                padding: "0.875rem 2rem",
                borderRadius: "0.75rem",
                fontWeight: 700,
                boxShadow: "0 4px 24px -4px rgba(67,97,238,0.5)",
              }}
            >
              Agendar conversa gratuita <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
