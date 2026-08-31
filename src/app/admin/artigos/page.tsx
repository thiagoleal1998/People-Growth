import Link from "next/link";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";

const articles = [
  { id: "1", title: "Como usar IA para acelerar sua estratégia de Growth", category: "IA", status: "published", views: 1243, date: "18/06/2025" },
  { id: "2", title: "OKRs na prática: como definir metas que realmente funcionam", category: "Estratégia", status: "published", views: 892, date: "10/05/2025" },
  { id: "3", title: "Neuromarketing: como o cérebro decide", category: "Marketing", status: "published", views: 2341, date: "22/04/2025" },
  { id: "4", title: "Rascunho: O papel do CMO na era da IA", category: "Liderança", status: "draft", views: 0, date: "15/06/2025" },
];

export default function ArtigosAdminPage() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d1b2a" }}>Artigos</h1>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>Mea Sententia — {articles.length} artigos</p>
        </div>
        <Link
          href="/admin/artigos/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#4361EE", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}
        >
          <Plus size={16} /> Novo artigo
        </Link>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              {["Título", "Categoria", "Status", "Visualizações", "Data", "Ações"].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articles.map(({ id, title, category, status, views, date }) => (
              <tr key={id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "#0d1b2a", fontSize: "0.875rem", maxWidth: "320px" }}>
                  <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                </td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <span style={{ backgroundColor: "#f0f4f8", color: "#475569", padding: "0.2rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 600 }}>{category}</span>
                </td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <span style={{
                    backgroundColor: status === "published" ? "rgba(6,214,160,0.1)" : "rgba(148,163,184,0.1)",
                    color: status === "published" ? "#04a87d" : "#64748b",
                    padding: "0.2rem 0.625rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}>
                    {status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>{views.toLocaleString("pt-BR")}</td>
                <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem" }}>{date}</td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button style={{ padding: "0.375rem", color: "#4361EE", background: "none", border: "none", cursor: "pointer", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></button>
                    <button style={{ padding: "0.375rem", color: "#64748b", background: "none", border: "none", cursor: "pointer", borderRadius: "0.375rem" }} title="Visualizar"><Eye size={15} /></button>
                    <button style={{ padding: "0.375rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", borderRadius: "0.375rem" }} title="Excluir"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
