import Link from "next/link";
import { FileText, Users, Mail, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LiveStatsWidget } from "@/components/admin/LiveStatsWidget";
import type { Lead } from "@/types/database.types";

const statusLabels: Record<Lead["status"], { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: "#4361EE", bg: "rgba(67,97,238,0.12)" },
  contacted: { label: "Em contato", color: "#FFB703", bg: "rgba(255,183,3,0.12)" },
  proposal: { label: "Proposta", color: "#06D6A0", bg: "rgba(6,214,160,0.12)" },
  closed: { label: "Fechado", color: "var(--admin-faint)", bg: "rgba(148,163,184,0.12)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [publishedArticles, newLeads, activeSubs, resources, recentLeadsRes] = await Promise.all([
    client.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    client.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    client.from("newsletter_subs").select("id", { count: "exact", head: true }).eq("status", "active"),
    client.from("resources").select("download_count"),
    client.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const totalDownloads = ((resources.data ?? []) as { download_count: number }[]).reduce((sum, r) => sum + (r.download_count ?? 0), 0);
  const recentLeads = (recentLeadsRes.data ?? []) as Lead[];

  const stats = [
    { label: "Artigos publicados", value: publishedArticles.count ?? 0, icon: FileText, color: "#4361EE" },
    { label: "Leads novos", value: newLeads.count ?? 0, icon: Users, color: "#06D6A0" },
    { label: "Assinantes newsletter", value: activeSubs.count ?? 0, icon: Mail, color: "#FFB703" },
    { label: "Downloads de recursos", value: totalDownloads, icon: Download, color: "#4361EE" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "0.25rem" }}>Dashboard</h1>
        <p style={{ color: "var(--admin-muted)", fontSize: "0.9375rem" }}>Bem-vindo! Aqui está o resumo do seu site.</p>
      </div>

      <LiveStatsWidget />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--admin-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontWeight: 900, fontSize: "2rem", color: "var(--admin-text)", lineHeight: 1, marginBottom: "0.25rem" }}>{value.toLocaleString("pt-BR")}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--admin-border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--admin-text)" }}>Leads recentes</h2>
          <Link href="/admin/leads" style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Ver todos →</Link>
        </div>
        {recentLeads.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>Nenhum lead recebido ainda.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["Nome", "E-mail", "Serviço", "Status", "Data"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const s = statusLabels[lead.status];
                  return (
                    <tr key={lead.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                      <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "var(--admin-text)", fontSize: "0.9rem" }}>{lead.name}</td>
                      <td style={{ padding: "1rem 1.5rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{lead.email}</td>
                      <td style={{ padding: "1rem 1.5rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>{lead.service_interest ?? "—"}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>{s.label}</span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", color: "var(--admin-faint)", fontSize: "0.8125rem" }}>{formatDate(lead.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
