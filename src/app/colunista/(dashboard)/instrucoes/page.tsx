import { ListChecks, HelpCircle } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { InstructionAccordionItem } from "@/components/InstructionAccordionItem";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { resolveUsersByIds } from "@/lib/messages-data";
import type { InstructionItem } from "@/types/database.types";

export default async function InstrucoesColunistaPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data } = await client.from("instruction_items").select("*").order("sort_order", { ascending: true });
  const items = (data ?? []) as InstructionItem[];
  const steps = items.filter((i) => i.kind === "step");
  const faqs = items.filter((i) => i.kind === "faq");

  // Resolving the creator's name/role reads other people's user_profiles
  // rows, which the session client can't see (RLS: "own row only") — same
  // admin-client bypass as the rest of the messaging directory lookups.
  const creatorIds = [...new Set(items.map((i) => i.created_by).filter((id): id is string => !!id))];
  const admin = await createAdminClient();
  const creators = await resolveUsersByIds(admin as any, creatorIds); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Visiting this page counts as reading everything on it — same
  // "bulk-mark-on-visit" approach already used for Comunicados, not
  // per-item (expanding an item isn't required to clear the badge).
  if (profile?.id && items.length > 0) {
    const { data: alreadyRead } = await client.from("instruction_item_reads").select("instruction_item_id").eq("user_id", profile.id);
    const readIds = new Set(((alreadyRead ?? []) as { instruction_item_id: string }[]).map((r) => r.instruction_item_id));
    const toMark = items.filter((i) => !readIds.has(i.id)).map((i) => ({ instruction_item_id: i.id, user_id: profile.id }));
    if (toMark.length > 0) await client.from("instruction_item_reads").insert(toMark);
  }

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
              <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
                {steps.map((step, index) => (
                  <div key={step.id} style={{ borderTop: index === 0 ? undefined : "1px solid var(--admin-border)" }}>
                    <InstructionAccordionItem
                      title={step.title}
                      bodyHtml={renderMarkdownLite(step.body)}
                      instructionItemId={step.id}
                      creator={step.created_by ? creators.get(step.created_by) : undefined}
                      badge={
                        <div style={{ flexShrink: 0, width: "1.75rem", height: "1.75rem", borderRadius: "50%", backgroundColor: "#315E9C", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8125rem" }}>
                          {index + 1}
                        </div>
                      }
                    />
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
                  <div key={faq.id} style={{ borderTop: index === 0 ? undefined : "1px solid var(--admin-border)" }}>
                    <InstructionAccordionItem
                      title={faq.title}
                      bodyHtml={renderMarkdownLite(faq.body)}
                      instructionItemId={faq.id}
                      creator={faq.created_by ? creators.get(faq.created_by) : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .instr-expand {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s ease;
        }
        .instr-expand-open { grid-template-rows: 1fr; }
        .instr-expand-clip { overflow: hidden; min-height: 0; }
        .instr-expand-content { padding: 0 1.25rem 1.125rem; }
      `}</style>
    </div>
  );
}
