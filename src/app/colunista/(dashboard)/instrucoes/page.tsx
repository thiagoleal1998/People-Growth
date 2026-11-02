import { ListChecks, HelpCircle, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import type { InstructionItem } from "@/types/database.types";

export default async function InstrucoesAutorPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any).from("instruction_items").select("*").order("sort_order", { ascending: true });
  const items = (data ?? []) as InstructionItem[];
  const steps = items.filter((i) => i.kind === "step");
  const faqs = items.filter((i) => i.kind === "faq");

  return (
    <div>
      <PageHeader title="Canal de Instruções" subtitle="Passo a passo e perguntas frequentes para quem escreve no Grupo Festina." />

      {items.length === 0 ? (
        <Card>
          <EmptyState text="Nenhuma instrução cadastrada ainda." />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {steps.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <ListChecks size={18} color="#315E9C" />
                <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)" }}>Passo a passo</h2>
              </div>
              <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "0.5rem 1.5rem" }}>
                {steps.map((step, index) => (
                  <div key={step.id} style={{ display: "flex", gap: "1rem", padding: "1.125rem 0", borderTop: index === 0 ? undefined : "1px solid var(--admin-border)" }}>
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "1.875rem", height: "1.875rem", borderRadius: "50%", backgroundColor: "#315E9C", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8125rem" }}>
                        {index + 1}
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--admin-text)" }}>{step.title}</div>
                      <p style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", marginTop: "0.375rem", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {faqs.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <HelpCircle size={18} color="#315E9C" />
                <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)" }}>Perguntas frequentes</h2>
              </div>
              <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
                {faqs.map((faq, index) => (
                  <details key={faq.id} style={{ borderTop: index === 0 ? undefined : "1px solid var(--admin-border)" }}>
                    <summary
                      style={{
                        listStyle: "none",
                        cursor: "pointer",
                        padding: "1.125rem 1.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        color: "var(--admin-text)",
                      }}
                    >
                      {faq.title}
                      <ChevronDown size={16} className="instrucoes-faq-chevron" style={{ flexShrink: 0, color: "var(--admin-faint)" }} />
                    </summary>
                    <p style={{ margin: 0, padding: "0 1.25rem 1.125rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{faq.body}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        details[open] .instrucoes-faq-chevron { transform: rotate(180deg); }
        .instrucoes-faq-chevron { transition: transform 0.2s ease; }
        summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  );
}
