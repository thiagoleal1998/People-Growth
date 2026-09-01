import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { PortfolioCase } from "@/types/database.types";

export const revalidate = 300;

const categoryMeta: Record<PortfolioCase["category"], { label: string; color: string }> = {
  marketing: { label: "Marketing", color: "#4361EE" },
  growth: { label: "Growth", color: "#06D6A0" },
  data: { label: "Dados", color: "#FFB703" },
  ai: { label: "IA", color: "#4361EE" },
  consulting: { label: "Consultoria", color: "#06D6A0" },
};

function linesToList(text: string | null): string[] {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

async function getCase(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("portfolio_cases").select("*").eq("slug", slug).eq("status", "active").single();
  return data as PortfolioCase | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCase(slug);
  return { title: c ? c.title_pt : "Case não encontrado" };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCase(slug);

  if (!c) notFound();

  const meta = categoryMeta[c.category];
  const results = linesToList(c.results_pt);

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "4rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "840px" }}>
          <Link href="/portfolio" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> Portfólio
          </Link>
          <span style={{ display: "inline-block", backgroundColor: `${meta.color}25`, color: meta.color, padding: "0.25rem 0.875rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "1.25rem" }}>
            {meta.label}
          </span>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, lineHeight: 1.2 }}>{c.title_pt}</h1>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "white" }}>
        <div className="container-xl" style={{ maxWidth: "900px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
            <div>
              {c.challenge_pt && (
                <>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1rem" }}>Desafio</h2>
                  <p style={{ color: "#475569", lineHeight: 1.75, marginBottom: "2rem" }}>{c.challenge_pt}</p>
                </>
              )}

              {c.solution_pt && (
                <>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1rem" }}>Solução</h2>
                  <p style={{ color: "#475569", lineHeight: 1.75 }}>{c.solution_pt}</p>
                </>
              )}
            </div>

            <div>
              {c.tools && c.tools.length > 0 && (
                <>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1rem" }}>Ferramentas utilizadas</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
                    {c.tools.map((tool) => (
                      <span key={tool} style={{ backgroundColor: "#f0f4f8", color: "#475569", padding: "0.375rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {results.length > 0 && (
                <>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1rem" }}>Resultados</h2>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {results.map((r) => (
                      <li key={r} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <CheckCircle2 size={18} color={meta.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.5 }}>{r}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            <Link href="/contato" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#4361EE", color: "white", padding: "0.875rem 2rem", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.9375rem", boxShadow: "0 4px 24px -4px rgba(67,97,238,0.4)" }}>
              Quero resultados assim no meu negócio →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
