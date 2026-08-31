"use client";

import { useState } from "react";
import { Check, X, ExternalLink, AlertCircle, Copy } from "lucide-react";

const PLATFORMS = [
  {
    id: "linkedin",
    label: "LinkedIn",
    emoji: "💼",
    color: "#0A66C2",
    bg: "rgba(10,102,194,0.08)",
    description: "Posts e artigos profissionais",
    canPost: true,
    fields: [
      { key: "LINKEDIN_ACCESS_TOKEN", label: "Access Token", type: "password", help: "Token OAuth 2.0 da sua conta" },
      { key: "LINKEDIN_PERSON_ID", label: "Person ID", type: "text", help: "ID do seu perfil (ex: ABC123xyz)" },
    ],
    setupUrl: "https://www.linkedin.com/developers/apps",
    setupSteps: [
      "Acesse LinkedIn Developers e crie um app",
      "Adicione os produtos 'Share on LinkedIn' e 'Sign In with LinkedIn'",
      "Na aba Auth, gere um Access Token com escopos: w_member_social, r_liteprofile",
      "Seu Person ID está na URL do seu perfil do LinkedIn",
    ],
  },
  {
    id: "instagram",
    label: "Instagram",
    emoji: "📸",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.08)",
    description: "Posts, Reels e Stories",
    canPost: true,
    fields: [
      { key: "INSTAGRAM_ACCESS_TOKEN", label: "Access Token", type: "password", help: "Token do Graph API (Meta for Developers)" },
      { key: "INSTAGRAM_USER_ID", label: "User ID", type: "text", help: "ID da sua conta Business no Instagram" },
    ],
    setupUrl: "https://developers.facebook.com/",
    setupSteps: [
      "Acesse Meta for Developers e crie um app do tipo Business",
      "Adicione o produto 'Instagram Graph API'",
      "Conecte sua conta Instagram Business ou Creator",
      "Gere um Access Token de longa duração com escopo: instagram_content_publish",
      "Seu User ID aparece nas configurações da conta Business",
    ],
  },
  {
    id: "tiktok",
    label: "TikTok",
    emoji: "🎵",
    color: "#222",
    bg: "rgba(0,0,0,0.06)",
    description: "Vídeos curtos — roteiro gerado pela IA",
    canPost: false,
    fields: [],
    setupUrl: "https://developers.tiktok.com/",
    setupSteps: [
      "TikTok exige aprovação especial para a Content Posting API",
      "Por enquanto, o sistema gera roteiro e legenda completos",
      "Você grava o vídeo com o roteiro e publica pelo app",
      "A legenda e hashtags ficam prontas para copiar",
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    emoji: "▶️",
    color: "#FF0000",
    bg: "rgba(255,0,0,0.08)",
    description: "Vídeos — roteiro e descrição gerados pela IA",
    canPost: false,
    fields: [],
    setupUrl: "https://console.cloud.google.com/",
    setupSteps: [
      "YouTube requer aprovação do Google para upload via API",
      "Por enquanto, o sistema gera título, descrição e roteiro",
      "Você grava e faz o upload pelo YouTube Studio",
      "Tudo que a IA gerou fica pronto para copiar",
    ],
  },
];

interface ConnectionState {
  [key: string]: { connected: boolean; profileName?: string; values?: Record<string, string> };
}

export default function IntegracoesPage() {
  const [connections, setConnections] = useState<ConnectionState>({
    linkedin: { connected: false },
    instagram: { connected: false },
    tiktok: { connected: false },
    youtube: { connected: false },
  });
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showSteps, setShowSteps] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const platform = PLATFORMS.find((p) => p.id === configuring);

  const handleConnect = (platformId: string) => {
    const conn = connections[platformId];
    if (conn.connected) {
      setConnections((prev) => ({ ...prev, [platformId]: { connected: false } }));
    } else {
      const p = PLATFORMS.find((pl) => pl.id === platformId);
      if (!p?.fields.length) return;
      setFormValues({});
      setConfiguring(platformId);
    }
  };

  const handleSave = () => {
    if (!configuring || !platform) return;
    const profileName = formValues[platform.fields[0]?.key]?.slice(0, 20) + "..." || "Conta conectada";
    setConnections((prev) => ({
      ...prev,
      [configuring]: { connected: true, profileName, values: { ...formValues } },
    }));
    setConfiguring(null);
    setFormValues({});
  };

  const copyEnvLine = async (key: string, value: string) => {
    await navigator.clipboard.writeText(`${key}=${value}`);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const allFilled = platform?.fields.every((f) => formValues[f.key]?.trim());

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.25rem" }}>Integrações</h1>
        <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>Conecte suas redes sociais para publicar diretamente do painel</p>
      </div>

      {/* Info banner */}
      <div style={{ backgroundColor: "rgba(67,97,238,0.06)", border: "1px solid rgba(67,97,238,0.15)", borderRadius: "0.875rem", padding: "1rem 1.25rem", marginBottom: "1.75rem", display: "flex", gap: "0.875rem" }}>
        <AlertCircle size={18} color="#4361EE" style={{ flexShrink: 0, marginTop: "0.125rem" }} />
        <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.6 }}>
          As credenciais são salvas no arquivo <code style={{ backgroundColor: "rgba(67,97,238,0.1)", padding: "0.1rem 0.375rem", borderRadius: "0.25rem", fontFamily: "monospace", fontSize: "0.8rem" }}>.env.local</code> do projeto. Elas nunca saem do seu servidor.
        </div>
      </div>

      {/* Platform cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "1rem" }}>
        {PLATFORMS.map((p) => {
          const conn = connections[p.id];
          return (
            <div key={p.id} style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {/* Card header */}
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", backgroundColor: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", flexShrink: 0 }}>
                  {p.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0d1b2a" }}>{p.label}</span>
                    {conn.connected ? (
                      <span style={{ backgroundColor: "rgba(6,214,160,0.1)", color: "#04a87d", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700 }}>
                        ✓ Conectado
                      </span>
                    ) : p.canPost ? (
                      <span style={{ backgroundColor: "rgba(255,183,3,0.1)", color: "#cc9200", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700 }}>
                        Não conectado
                      </span>
                    ) : (
                      <span style={{ backgroundColor: "#f1f5f9", color: "#94a3b8", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700 }}>
                        Assistido
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.125rem" }}>{p.description}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {p.canPost && (
                    <button
                      onClick={() => handleConnect(p.id)}
                      style={{
                        padding: "0.4rem 0.875rem",
                        borderRadius: "0.5rem",
                        border: "1px solid",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        borderColor: conn.connected ? "#fecaca" : p.color,
                        backgroundColor: conn.connected ? "rgba(239,68,68,0.06)" : p.bg,
                        color: conn.connected ? "#ef4444" : p.color,
                      }}
                    >
                      {conn.connected ? "Desconectar" : "Conectar"}
                    </button>
                  )}
                  <a
                    href={p.setupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "0.4rem 0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#64748b", display: "inline-flex", alignItems: "center" }}
                    title="Abrir portal do desenvolvedor"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Setup steps */}
              <div style={{ padding: "1rem 1.5rem" }}>
                <button
                  onClick={() => setShowSteps(showSteps === p.id ? null : p.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "0.8125rem", fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: "0.375rem" }}
                >
                  {showSteps === p.id ? "▾" : "▸"} Como configurar
                </button>
                {showSteps === p.id && (
                  <ol style={{ margin: "0.75rem 0 0 1.25rem", padding: 0, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    {p.setupSteps.map((step, i) => (
                      <li key={i} style={{ fontSize: "0.8125rem", color: "#475569", lineHeight: 1.6 }}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Connected info */}
              {conn.connected && conn.profileName && (
                <div style={{ margin: "0 1.5rem 1rem", backgroundColor: "rgba(6,214,160,0.06)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", fontSize: "0.8125rem", color: "#04a87d", fontWeight: 600 }}>
                  ✓ Token configurado — publicação direta ativa
                </div>
              )}

              {/* Not connectable explanation */}
              {!p.canPost && (
                <div style={{ margin: "0 1.5rem 1rem", backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6 }}>
                  O sistema gera roteiro, legenda e hashtags completos. Você copia e publica pelo app/plataforma.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* .env.local instructions */}
      <div style={{ backgroundColor: "#0d1b2a", borderRadius: "1rem", padding: "1.5rem", marginTop: "1.5rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>
          Adicione ao arquivo .env.local do projeto
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {[
            "GEMINI_API_KEY=sua_chave_aqui",
            "LINKEDIN_ACCESS_TOKEN=seu_token_aqui",
            "LINKEDIN_PERSON_ID=seu_id_aqui",
            "INSTAGRAM_ACCESS_TOKEN=seu_token_aqui",
            "INSTAGRAM_USER_ID=seu_user_id_aqui",
          ].map((line) => {
            const key = line.split("=")[0];
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <code style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "#06D6A0" }}>{line}</code>
                <button
                  onClick={() => copyEnvLine(key, line)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: copied === key ? "#06D6A0" : "rgba(255,255,255,0.3)", padding: "0.25rem", display: "flex", alignItems: "center" }}
                  title="Copiar"
                >
                  {copied === key ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Config Modal */}
      {configuring && platform && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "480px", margin: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#0d1b2a" }}>
                {platform.emoji} Conectar {platform.label}
              </h2>
              <button onClick={() => setConfiguring(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            {platform.fields.map((field) => (
              <div key={field.key} style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={formValues[field.key] || ""}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.key}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: field.type === "password" ? "monospace" : "inherit" }}
                />
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>{field.help}</div>
              </div>
            ))}

            <div style={{ backgroundColor: "#f8fafc", borderRadius: "0.625rem", padding: "0.875rem", marginBottom: "1.5rem", fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6 }}>
              Após salvar, adicione as mesmas credenciais ao <code style={{ fontFamily: "monospace", color: "#4361EE" }}>.env.local</code> para persistir após reiniciar o servidor.
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setConfiguring(null)}
                style={{ flex: 1, padding: "0.625rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#475569", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!allFilled}
                style={{
                  flex: 2, padding: "0.625rem", borderRadius: "0.625rem", border: "none",
                  backgroundColor: allFilled ? platform.color : "#e2e8f0",
                  color: allFilled ? "white" : "#94a3b8",
                  fontSize: "0.9rem", fontWeight: 700,
                  cursor: allFilled ? "pointer" : "not-allowed",
                }}
              >
                Salvar e conectar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
