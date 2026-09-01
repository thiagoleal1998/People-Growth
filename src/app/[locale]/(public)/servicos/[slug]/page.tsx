import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/types/database.types";

export const revalidate = 300;

async function getService(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("services").select("*").eq("slug", slug).eq("status", "active").single();
  return data as Service | null;
}

function linesToList(text: string | null): string[] {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Serviço não encontrado" };
  return {
    title: service.title_pt,
    description: service.description_pt,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) notFound();

  const color = "#4361EE";
  const benefits = service.benefits ?? [];
  const methodology = linesToList(service.methodology_pt);
  const results = linesToList(service.results_pt);

  return (
    <>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "5rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          <Link href="/servicos" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> Serviços
          </Link>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>
            {service.title_pt}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>
            {service.description_pt}
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "white" }}>
        <div className="container-xl servico-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "4rem", alignItems: "start" }}>
          <div>
            {/* Methodology */}
            {methodology.length > 0 && (
              <>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.5rem" }}>Metodologia</h2>
                <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "3rem" }}>
                  {methodology.map((item, i) => (
                    <li key={item} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                      <span style={{ width: "2rem", height: "2rem", borderRadius: "50%", backgroundColor: `${color}15`, color, fontWeight: 800, fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <span style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.6, paddingTop: "0.25rem" }}>{item}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.5rem" }}>Benefícios</h2>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "3rem" }}>
                  {benefits.map((b) => (
                    <li key={b} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <CheckCircle2 size={20} color={color} style={{ flexShrink: 0, marginTop: "1px" }} />
                      <span style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.6 }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Results */}
            {results.length > 0 && (
              <>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.5rem" }}>Resultados típicos</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                  {results.map((r) => (
                    <div key={r} style={{ backgroundColor: "#f0f4f8", borderRadius: "0.75rem", padding: "1.25rem", border: `1px solid ${color}25` }}>
                      <p style={{ color: "#0d1b2a", fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.5 }}>✓ {r}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Contact form */}
          <div style={{ position: "sticky", top: "5rem" }}>
            <div style={{ backgroundColor: "#f0f4f8", borderRadius: "1.25rem", padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.5rem" }}>
                Solicitar proposta
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                Preencha abaixo e entrarei em contato em até 24h.
              </p>
              <ContactForm serviceDefault={service.title_pt} />
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .servico-detail-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  );
}
