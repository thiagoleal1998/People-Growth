import { Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, PrimaryLinkButton, Card, EmptyState, Badge } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { PromoRowActions } from "./PromoRowActions";
import type { Promo } from "@/types/database.types";

function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PromocoesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data } = await client.from("promos").select("*").order("created_at", { ascending: false });
  const promos = (data ?? []) as Promo[];

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader
        title="Promoções"
        subtitle='Monta o texto no formato do Canal do WhatsApp (imagem + texto formatado) para você copiar e colar manualmente — não existe API de Canal do WhatsApp para postar automaticamente.'
        action={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link
              href="/admin/promocoes/regras"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border-strong)", color: "var(--admin-text)", padding: "0.625rem 1.125rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}
            >
              Regras de busca
            </Link>
            <PrimaryLinkButton href="/admin/promocoes/novo"><Plus size={16} /> Nova promoção</PrimaryLinkButton>
          </div>
        }
      />

      <Card>
        {promos.length === 0 ? (
          <EmptyState text="Nenhuma promoção cadastrada ainda." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                {["", "Produto", "Preço", "Origem", "Criada em", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ padding: "0.5rem 1.25rem" }}>
                    {promo.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={promo.image_url} alt="" style={{ width: "2.5rem", height: "2.5rem", objectFit: "cover", borderRadius: "0.375rem" }} />
                    ) : (
                      <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.375rem", background: "var(--admin-surface-alt)" }} />
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem", maxWidth: "260px" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{promo.product_name}</div>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem" }}>
                    {promo.old_price && (
                      <span style={{ color: "var(--admin-faint)", textDecoration: "line-through", marginRight: "0.375rem" }}>{fmtBRL(promo.old_price)}</span>
                    )}
                    <span style={{ color: "var(--admin-text)", fontWeight: 700 }}>{fmtBRL(promo.new_price)}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={promo.source === "mercado_livre" ? "warning" : "neutral"}>
                      {promo.source === "mercado_livre" ? "Mercado Livre" : "Manual"}
                    </Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.8125rem" }}>
                    {new Date(promo.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={promo.sent_at ? "success" : "neutral"}>{promo.sent_at ? "Enviada" : "Pendente"}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <PromoRowActions promo={promo} />
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
