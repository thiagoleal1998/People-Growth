"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Copy, Check, Plus, Send, Clock, X, FileText, Search } from "lucide-react";

type Status = "pending" | "sent" | "skipped";

interface Engagement {
  id: string;
  username: string;
  displayName: string;
  videoTitle: string;
  status: Status;
  likedAt: string;
  sentAt: string | null;
  templateId: string | null;
}

interface Template {
  id: string;
  name: string;
  content: string;
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Saudação padrão",
    content: 'Oi {{nome}}! Vi que curtiu meu vídeo sobre "{{video}}". Obrigado pelo apoio! 🙏 Se tiver alguma dúvida sobre o tema, pode me chamar aqui.',
  },
  {
    id: "2",
    name: "Engajamento ativo",
    content: 'Olá {{nome}}! Fico feliz que curtiu o vídeo sobre "{{video}}"! Tenho mais conteúdo sobre isso. Qualquer dúvida é só perguntar 🚀',
  },
];

const sampleEngagements: Engagement[] = [
  { id: "1", username: "@maria.silva98", displayName: "Maria Silva", videoTitle: "Como usar IA no marketing", status: "pending", likedAt: "28/07/2025", sentAt: null, templateId: "1" },
  { id: "2", username: "@joaocampos_mk", displayName: "João Campos", videoTitle: "Como usar IA no marketing", status: "pending", likedAt: "28/07/2025", sentAt: null, templateId: null },
  { id: "3", username: "@anapaula_growth", displayName: "Ana Paula", videoTitle: "5 erros de growth hacking", status: "sent", likedAt: "27/07/2025", sentAt: "28/07/2025", templateId: "1" },
  { id: "4", username: "@carlos_biz", displayName: "Carlos Henrique", videoTitle: "5 erros de growth hacking", status: "pending", likedAt: "27/07/2025", sentAt: null, templateId: null },
];

function fillTemplate(content: string, engagement: Engagement): string {
  return content
    .replace(/\{\{nome\}\}/g, engagement.displayName)
    .replace(/\{\{username\}\}/g, engagement.username)
    .replace(/\{\{video\}\}/g, engagement.videoTitle);
}

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
  sent: { label: "Enviado", color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
  skipped: { label: "Ignorado", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
};

export default function TikTokPage() {
  const [engagements, setEngagements] = useState<Engagement[]>(sampleEngagements);
  const [templates] = useState<Template[]>(defaultTemplates);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importVideo, setImportVideo] = useState("");
  const [importUsernames, setImportUsernames] = useState("");

  const stats = {
    total: engagements.length,
    pending: engagements.filter((e) => e.status === "pending").length,
    sent: engagements.filter((e) => e.status === "sent").length,
  };

  const filtered = engagements.filter((e) => {
    const matchesFilter = filter === "all" || e.status === filter;
    const matchesSearch =
      !search ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.displayName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopy = async (engagement: Engagement) => {
    const tpl = templates.find((t) => t.id === engagement.templateId);
    if (!tpl) return;
    const msg = fillTemplate(tpl.content, engagement);
    await navigator.clipboard.writeText(msg);
    setCopied(engagement.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleMarkSent = (id: string) => {
    setEngagements((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "sent", sentAt: new Date().toLocaleDateString("pt-BR") } : e
      )
    );
  };

  const handleSkip = (id: string) => {
    setEngagements((prev) => prev.map((e) => (e.id === id ? { ...e, status: "skipped" } : e)));
  };

  const handleTemplateChange = (id: string, templateId: string) => {
    setEngagements((prev) => prev.map((e) => (e.id === id ? { ...e, templateId } : e)));
  };

  const handleImport = () => {
    if (!importVideo.trim() || !importUsernames.trim()) return;
    const lines = importUsernames.split("\n").map((l) => l.trim()).filter(Boolean);
    const newEngagements: Engagement[] = lines.map((line, i) => ({
      id: `new-${Date.now()}-${i}`,
      username: line.startsWith("@") ? line : `@${line}`,
      displayName: line.replace(/^@/, "").replace(/[._]/g, " "),
      videoTitle: importVideo,
      status: "pending",
      likedAt: new Date().toLocaleDateString("pt-BR"),
      sentAt: null,
      templateId: templates[0]?.id || null,
    }));
    setEngagements((prev) => [...newEngagements, ...prev]);
    setImportVideo("");
    setImportUsernames("");
    setShowImport(false);
  };

  const filterTabs = [
    { key: "all" as const, label: "Todos", count: stats.total },
    { key: "pending" as const, label: "Pendentes", count: stats.pending },
    { key: "sent" as const, label: "Enviados", count: stats.sent },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.25rem" }}>TikTok Engajamento</h1>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>Gerencie mensagens para quem curtiu seus vídeos</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            href="/admin/tiktok/templates"
            style={{ padding: "0.5rem 1rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#475569", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FileText size={15} /> Templates
          </Link>
          <button
            onClick={() => setShowImport(true)}
            style={{ padding: "0.5rem 1.125rem", borderRadius: "0.625rem", border: "none", backgroundColor: "#4361EE", color: "white", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Plus size={15} /> Importar curtidores
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        {[
          { label: "Total de curtidores", value: stats.total, icon: Heart, color: "#4361EE" },
          { label: "Aguardando mensagem", value: stats.pending, icon: Clock, color: "#cc9200" },
          { label: "Mensagens enviadas", value: stats.sent, icon: Send, color: "#04a87d" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.25rem 1.5rem", border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: "1.75rem", color: "#0d1b2a", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginTop: "0.125rem" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {filterTabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "0.4rem 0.875rem",
                borderRadius: "0.5rem",
                border: "1px solid",
                borderColor: filter === key ? "#4361EE" : "#e2e8f0",
                backgroundColor: filter === key ? "rgba(67,97,238,0.08)" : "white",
                color: filter === key ? "#4361EE" : "#64748b",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {label} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "white", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", border: "1px solid #e2e8f0" }}>
          <Search size={15} color="#94a3b8" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar @username..."
            style={{ border: "none", outline: "none", fontSize: "0.875rem", color: "#0d1b2a", width: "180px", background: "none" }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
            <Heart size={32} style={{ marginBottom: "0.75rem", opacity: 0.3, display: "block", margin: "0 auto 0.75rem" }} />
            <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Nenhum curtidor encontrado</div>
            <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>Importe curtidores para começar</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Curtidor", "Vídeo", "Data", "Template", "Status", "Ação"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((engagement) => {
                  const s = statusConfig[engagement.status];
                  const tpl = templates.find((t) => t.id === engagement.templateId);
                  const canCopy = engagement.templateId !== null;
                  const isCopied = copied === engagement.id;
                  return (
                    <tr key={engagement.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <div style={{ fontWeight: 700, color: "#0d1b2a", fontSize: "0.875rem" }}>{engagement.displayName}</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{engagement.username}</div>
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", color: "#475569", maxWidth: "200px" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{engagement.videoTitle}</div>
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{engagement.likedAt}</td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        {engagement.status === "pending" ? (
                          <select
                            value={engagement.templateId || ""}
                            onChange={(e) => handleTemplateChange(engagement.id, e.target.value)}
                            style={{ border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "0.3rem 0.5rem", fontSize: "0.8rem", color: "#475569", cursor: "pointer", maxWidth: "160px" }}
                          >
                            <option value="">Selecionar...</option>
                            {templates.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{tpl?.name || "—"}</span>
                        )}
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <span style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        {engagement.status === "pending" && (
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <button
                              onClick={() => handleCopy(engagement)}
                              disabled={!canCopy}
                              title={canCopy ? "Copiar mensagem preenchida" : "Selecione um template"}
                              style={{
                                display: "flex", alignItems: "center", gap: "0.375rem",
                                padding: "0.375rem 0.75rem", borderRadius: "0.5rem",
                                border: "1px solid",
                                fontSize: "0.8rem", fontWeight: 600,
                                cursor: canCopy ? "pointer" : "not-allowed",
                                borderColor: isCopied ? "#04a87d" : canCopy ? "#4361EE" : "#e2e8f0",
                                backgroundColor: isCopied ? "rgba(6,214,160,0.1)" : canCopy ? "rgba(67,97,238,0.08)" : "#f8fafc",
                                color: isCopied ? "#04a87d" : canCopy ? "#4361EE" : "#cbd5e1",
                                transition: "all 0.15s",
                              }}
                            >
                              {isCopied ? <Check size={13} /> : <Copy size={13} />}
                              {isCopied ? "Copiado!" : "Copiar"}
                            </button>
                            <button
                              onClick={() => handleMarkSent(engagement.id)}
                              title="Marcar como enviado"
                              style={{ padding: "0.375rem 0.625rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
                              <Send size={13} />
                            </button>
                            <button
                              onClick={() => handleSkip(engagement.id)}
                              title="Ignorar"
                              style={{ padding: "0.375rem 0.625rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        )}
                        {engagement.status === "sent" && (
                          <span style={{ fontSize: "0.8rem", color: "#04a87d", fontWeight: 600 }}>✓ Enviado em {engagement.sentAt}</span>
                        )}
                        {engagement.status === "skipped" && (
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Ignorado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImport && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "480px", margin: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#0d1b2a" }}>Importar curtidores</h2>
              <button onClick={() => setShowImport(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                Título do vídeo
              </label>
              <input
                value={importVideo}
                onChange={(e) => setImportVideo(e.target.value)}
                placeholder="Ex: Como usar IA no marketing"
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                @usernames <span style={{ fontWeight: 400, color: "#94a3b8" }}>(um por linha)</span>
              </label>
              <textarea
                value={importUsernames}
                onChange={(e) => setImportUsernames(e.target.value)}
                placeholder={"@maria.silva\n@joao_mk\n@anapaula98"}
                rows={6}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
              />
              {importUsernames.trim() && (
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.375rem" }}>
                  {importUsernames.split("\n").filter((l) => l.trim()).length} usuário(s) identificado(s)
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowImport(false)}
                style={{ flex: 1, padding: "0.625rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#475569", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!importVideo.trim() || !importUsernames.trim()}
                style={{
                  flex: 2, padding: "0.625rem", borderRadius: "0.625rem", border: "none",
                  backgroundColor: importVideo.trim() && importUsernames.trim() ? "#4361EE" : "#e2e8f0",
                  color: importVideo.trim() && importUsernames.trim() ? "white" : "#94a3b8",
                  fontSize: "0.9rem", fontWeight: 600,
                  cursor: importVideo.trim() && importUsernames.trim() ? "pointer" : "not-allowed",
                }}
              >
                Importar curtidores
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
