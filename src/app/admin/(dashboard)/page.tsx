import Link from "next/link";
import { FileText, Users, Mail, Download, Eye, TrendingUp } from "lucide-react";

const stats = [
  { label: "Artigos publicados", value: "12", icon: FileText, color: "#4361EE", change: "+3 este mês" },
  { label: "Leads novos", value: "28", icon: Users, color: "#06D6A0", change: "+8 esta semana" },
  { label: "Assinantes newsletter", value: "1.247", icon: Mail, color: "#FFB703", change: "+45 esta semana" },
  { label: "Downloads de recursos", value: "6.432", icon: Download, color: "#4361EE", change: "+312 este mês" },
  { label: "Visitantes (mês)", value: "8.921", icon: Eye, color: "#06D6A0", change: "+15% vs. mês passado" },
  { label: "Artigos mais acessados", value: "3", icon: TrendingUp, color: "#FFB703", change: "Top artigos de IA" },
];

const recentLeads = [
  { name: "Marina Souza", email: "marina@empresa.com", service: "Consultoria Estratégica", status: "new", date: "Hoje, 14:32" },
  { name: "João Pedro Lima", email: "joao@startup.io", service: "IA para Negócios", status: "contacted", date: "Hoje, 10:15" },
  { name: "Carla Mendes", email: "carla@corp.com.br", service: "Treinamentos", status: "proposal", date: "Ontem, 16:48" },
  { name: "Ricardo Oliveira", email: "ricardo@pmebr.com", service: "Marketing Digital", status: "new", date: "Ontem, 09:22" },
];

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: "#4361EE", bg: "rgba(67,97,238,0.12)" },
  contacted: { label: "Em contato", color: "#FFB703", bg: "rgba(255,183,3,0.12)" },
  proposal: { label: "Proposta", color: "#06D6A0", bg: "rgba(6,214,160,0.12)" },
  closed: { label: "Fechado", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

export default function AdminDashboard() {
  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.25rem" }}>Dashboard</h1>
        <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>Bem-vindo, Thiago! Aqui está o resumo do seu site.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <div style={{ fontWeight: 900, fontSize: "2rem", color: "#0d1b2a", lineHeight: 1, marginBottom: "0.25rem" }}>{value}</div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
            <div style={{ fontSize: "0.75rem", color: color, fontWeight: 600 }}>{change}</div>
          </div>
        ))}
      </div>

      {/* Recent leads */}
      <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#0d1b2a" }}>Leads recentes</h2>
          <Link href="/admin/leads" style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Ver todos →</Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Nome", "E-mail", "Serviço", "Status", "Data"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLeads.map(({ name, email, service, status, date }) => {
                const s = statusLabels[status];
                return (
                  <tr key={email} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "#0d1b2a", fontSize: "0.9rem" }}>{name}</td>
                    <td style={{ padding: "1rem 1.5rem", color: "#64748b", fontSize: "0.875rem" }}>{email}</td>
                    <td style={{ padding: "1rem 1.5rem", color: "#475569", fontSize: "0.875rem" }}>{service}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>{s.label}</span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "#94a3b8", fontSize: "0.8125rem" }}>{date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
