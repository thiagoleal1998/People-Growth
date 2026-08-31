import { Users, TrendingUp, Mail } from "lucide-react";

const subscribers = [
  { id: "1", email: "ana.santos@gmail.com", name: "Ana Santos", status: "active", source: "website", date: "18/06/2025" },
  { id: "2", email: "carlos.lopes@empresa.com", name: "Carlos Lopes", status: "active", source: "website", date: "17/06/2025" },
  { id: "3", email: "mariana@startup.io", name: "Mariana Costa", status: "active", source: "linkedin", date: "16/06/2025" },
  { id: "4", email: "pedro.m@corp.com", name: "Pedro Mendes", status: "unsubscribed", source: "website", date: "10/06/2025" },
];

export default function NewsletterAdminPage() {
  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d1b2a" }}>Newsletter</h1>
        <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>Gerenciar assinantes da Mea Sententia</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {[
          { label: "Total de assinantes", value: "1.247", icon: Users, color: "#4361EE" },
          { label: "Ativos", value: "1.198", icon: TrendingUp, color: "#06D6A0" },
          { label: "Esta semana", value: "+45", icon: Mail, color: "#FFB703" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.875rem" }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontWeight: 900, fontSize: "1.75rem", color: "#0d1b2a", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Export button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#06D6A0", color: "#0d1b2a", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer" }}>
          Exportar CSV
        </button>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              {["E-mail", "Nome", "Status", "Origem", "Data"].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscribers.map(({ id, email, name, status, source, date }) => (
              <tr key={id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "#0d1b2a", fontSize: "0.875rem" }}>{email}</td>
                <td style={{ padding: "0.875rem 1.25rem", color: "#475569", fontSize: "0.875rem" }}>{name}</td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <span style={{ backgroundColor: status === "active" ? "rgba(6,214,160,0.1)" : "rgba(148,163,184,0.1)", color: status === "active" ? "#04a87d" : "#64748b", padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>
                    {status === "active" ? "Ativo" : "Cancelado"}
                  </span>
                </td>
                <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>{source}</td>
                <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem" }}>{date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
