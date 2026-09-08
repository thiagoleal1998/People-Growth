import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, EmptyState, Field, Input, Select, SubmitButton } from "@/components/admin/ui";
import { createSearchRule } from "./actions";
import { SearchRuleRowActions } from "./SearchRuleRowActions";
import type { PromoSearchRule } from "@/types/database.types";

export default async function RegrasDeBuscaPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data } = await client.from("promo_search_rules").select("*").order("created_at", { ascending: false });
  const rules = (data ?? []) as PromoSearchRule[];

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/promocoes" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
          &larr; Voltar
        </Link>
      </div>
      <PageHeader
        title="Regras de busca"
        subtitle="Termos monitorados 1x por dia — o sistema busca no marketplace escolhido e cria uma promoção automaticamente para itens com desconto igual ou acima do mínimo. Mercado Livre está bloqueando essas buscas no momento (403 do lado deles); eBay funciona hoje, mas é catálogo internacional em dólar."
      />

      <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <form action={createSearchRule} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <Field label="Termo de busca" hint='Ex: "tenis nike", "smartphone samsung".'>
              <Input name="query" placeholder="tenis nike" required />
            </Field>
          </div>
          <div style={{ width: "170px" }}>
            <Field label="Marketplace">
              <Select name="marketplace" defaultValue="mercado_livre">
                <option value="mercado_livre">Mercado Livre</option>
                <option value="ebay">eBay</option>
              </Select>
            </Field>
          </div>
          <div style={{ width: "160px" }}>
            <Field label="Desconto mínimo (%)">
              <Input name="min_discount_pct" type="number" min="1" max="99" defaultValue={20} />
            </Field>
          </div>
          <div style={{ marginBottom: "1.125rem" }}>
            <SubmitButton>Adicionar regra</SubmitButton>
          </div>
        </form>
      </div>

      <Card>
        {rules.length === 0 ? (
          <EmptyState text="Nenhuma regra de busca cadastrada ainda." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                {["Termo", "Marketplace", "Desconto mínimo", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{rule.query}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>{rule.marketplace === "ebay" ? "eBay" : "Mercado Livre"}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>{rule.min_discount_pct}%</td>
                  <td style={{ padding: "0.875rem 1.25rem" }} colSpan={2}>
                    <SearchRuleRowActions rule={rule} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
