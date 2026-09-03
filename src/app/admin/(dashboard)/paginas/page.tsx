import Link from "next/link";
import { Edit, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { INSTITUTIONAL_PAGES } from "./pages";
import type { InstitutionalPage } from "@/types/database.types";

export default async function PaginasInstitucionaisPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*");
  const bySlug = new Map(((data ?? []) as InstitutionalPage[]).map((p) => [p.slug, p]));

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Páginas Institucionais" subtitle="Cookies, direitos autorais e regras de comentários — o texto exibido no site." />

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
              {["Página", "URL", "Última atualização", ""].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INSTITUTIONAL_PAGES.map(({ slug, label, path }) => {
              const record = bySlug.get(slug);
              return (
                <tr key={slug} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>
                    {record?.title_pt ?? label}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <a href={path} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#4361EE", fontSize: "0.8125rem" }}>
                      {path} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.8125rem" }}>
                    {record ? new Date(record.updated_at).toLocaleDateString("pt-BR") : "— (usando texto padrão)"}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Link href={`/admin/paginas/${slug}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar">
                      <Edit size={15} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
