"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ArrowLeft, Eye, EyeOff } from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

const initialTemplates: Template[] = [
  {
    id: "1",
    name: "Saudação padrão",
    content: 'Oi {{nome}}! Vi que curtiu meu vídeo sobre "{{video}}". Obrigado pelo apoio! 🙏 Se tiver alguma dúvida sobre o tema, pode me chamar aqui.',
    createdAt: "28/07/2025",
  },
  {
    id: "2",
    name: "Engajamento ativo",
    content: 'Olá {{nome}}! Fico feliz que curtiu o vídeo sobre "{{video}}"! Tenho mais conteúdo sobre isso. Qualquer dúvida é só perguntar 🚀',
    createdAt: "28/07/2025",
  },
];

const VARIABLES = [
  { tag: "{{nome}}", label: "Nome do curtidor" },
  { tag: "{{username}}", label: "@username do TikTok" },
  { tag: "{{video}}", label: "Título do vídeo" },
];

function previewTemplate(content: string): string {
  return content
    .replace(/\{\{nome\}\}/g, "Maria Silva")
    .replace(/\{\{username\}\}/g, "@maria.silva")
    .replace(/\{\{video\}\}/g, "Como usar IA no marketing");
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [editing, setEditing] = useState<Template | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleSave = () => {
    if (!editing) return;
    if (isNew) {
      setTemplates((prev) => [
        ...prev,
        { ...editing, id: `${Date.now()}`, createdAt: new Date().toLocaleDateString("pt-BR") },
      ]);
    } else {
      setTemplates((prev) => prev.map((t) => (t.id === editing.id ? editing : t)));
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNew = () => {
    setEditing({ id: "", name: "", content: "", createdAt: "" });
    setIsNew(true);
  };

  const insertVariable = (tag: string) => {
    if (!editing) return;
    setEditing({ ...editing, content: editing.content + tag });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <Link
            href="/admin/tiktok"
            style={{ color: "#64748b", textDecoration: "none", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.5rem" }}
          >
            <ArrowLeft size={15} /> TikTok Engajamento
          </Link>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.25rem" }}>Templates de Mensagem</h1>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>Crie e edite templates com variáveis dinâmicas</p>
        </div>
        <button
          onClick={handleNew}
          style={{ padding: "0.5rem 1.125rem", borderRadius: "0.625rem", border: "none", backgroundColor: "#4361EE", color: "white", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={15} /> Novo template
        </button>
      </div>

      {/* Variables reference */}
      <div style={{ backgroundColor: "rgba(67,97,238,0.06)", borderRadius: "0.875rem", padding: "1rem 1.25rem", marginBottom: "1.75rem", border: "1px solid rgba(67,97,238,0.12)" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#4361EE", marginBottom: "0.5rem" }}>Variáveis disponíveis</div>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          {VARIABLES.map((v) => (
            <span key={v.tag} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <code style={{ backgroundColor: "rgba(67,97,238,0.12)", padding: "0.125rem 0.375rem", borderRadius: "0.25rem", fontSize: "0.8rem", color: "#4361EE", fontFamily: "monospace" }}>
                {v.tag}
              </code>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{v.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Template list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {templates.map((template) => (
          <div key={template.id} style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0d1b2a", marginBottom: "0.625rem" }}>{template.name}</div>
                {previewId === template.id ? (
                  <div style={{ fontSize: "0.875rem", color: "#475569", backgroundColor: "#f0fdf4", borderRadius: "0.5rem", padding: "0.875rem", lineHeight: 1.7, border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Preview com dados de exemplo
                    </div>
                    {previewTemplate(template.content)}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.7, fontFamily: "inherit" }}>{template.content}</div>
                )}
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.625rem" }}>Criado em {template.createdAt}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button
                  onClick={() => setPreviewId(previewId === template.id ? null : template.id)}
                  title={previewId === template.id ? "Fechar preview" : "Ver preview"}
                  style={{ padding: "0.4rem 0.625rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", backgroundColor: previewId === template.id ? "rgba(67,97,238,0.08)" : "white", color: previewId === template.id ? "#4361EE" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  {previewId === template.id ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => { setEditing(template); setIsNew(false); }}
                  title="Editar"
                  style={{ padding: "0.4rem 0.625rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  title="Excluir"
                  style={{ padding: "0.4rem 0.625rem", borderRadius: "0.5rem", border: "1px solid #fee2e2", backgroundColor: "white", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
            Nenhum template criado ainda. Clique em "Novo template" para começar.
          </div>
        )}
      </div>

      {/* Edit / New Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "560px", margin: "1rem", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#0d1b2a", marginBottom: "1.5rem" }}>
              {isNew ? "Novo template" : "Editar template"}
            </h2>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Nome do template</label>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Ex: Saudação padrão"
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Mensagem</label>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  {VARIABLES.map((v) => (
                    <button
                      key={v.tag}
                      onClick={() => insertVariable(v.tag)}
                      title={`Inserir ${v.label}`}
                      style={{ padding: "0.2rem 0.5rem", borderRadius: "0.25rem", border: "1px solid rgba(67,97,238,0.2)", backgroundColor: "rgba(67,97,238,0.06)", color: "#4361EE", fontSize: "0.7rem", fontFamily: "monospace", cursor: "pointer" }}
                    >
                      {v.tag}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                placeholder="Oi {{nome}}! Vi que curtiu meu vídeo sobre {{video}}..."
                rows={5}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" }}
              />
            </div>

            {editing.content && (
              <div style={{ backgroundColor: "#f0fdf4", borderRadius: "0.5rem", padding: "0.875rem", marginBottom: "1.25rem", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview com dados de exemplo</div>
                <div style={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.7 }}>{previewTemplate(editing.content)}</div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => { setEditing(null); setIsNew(false); }}
                style={{ flex: 1, padding: "0.625rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#475569", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!editing.name.trim() || !editing.content.trim()}
                style={{
                  flex: 2, padding: "0.625rem", borderRadius: "0.625rem", border: "none",
                  backgroundColor: editing.name.trim() && editing.content.trim() ? "#4361EE" : "#e2e8f0",
                  color: editing.name.trim() && editing.content.trim() ? "white" : "#94a3b8",
                  fontSize: "0.9rem", fontWeight: 600,
                  cursor: editing.name.trim() && editing.content.trim() ? "pointer" : "not-allowed",
                }}
              >
                {isNew ? "Criar template" : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
