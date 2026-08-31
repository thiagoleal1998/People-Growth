"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, Loader2, Send, Settings, Hash, Clock, Zap } from "lucide-react";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2", bg: "rgba(10,102,194,0.08)", emoji: "💼" },
  { id: "instagram", label: "Instagram", color: "#E1306C", bg: "rgba(225,48,108,0.08)", emoji: "📸" },
  { id: "tiktok", label: "TikTok", color: "#222", bg: "rgba(0,0,0,0.06)", emoji: "🎵" },
  { id: "youtube", label: "YouTube", color: "#FF0000", bg: "rgba(255,0,0,0.08)", emoji: "▶️" },
];

const TONES = ["Profissional", "Educativo", "Descontraído", "Motivacional", "Storytelling"];

interface LinkedInContent { caption: string; hashtags: string[]; best_time: string; cta: string }
interface InstagramContent { caption: string; hashtags: string[]; best_time: string; cta: string }
interface TikTokContent { script: string; caption: string; hashtags: string[]; best_time: string; cta: string }
interface YouTubeContent { title: string; description: string; hashtags: string[]; best_time: string; cta: string }

interface GeneratedContent {
  linkedin?: LinkedInContent;
  instagram?: InstagramContent;
  tiktok?: TikTokContent;
  youtube?: YouTubeContent;
}

function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.375rem",
        padding: "0.3rem 0.625rem", borderRadius: "0.375rem",
        border: "1px solid", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
        borderColor: copied ? "#04a87d" : "#e2e8f0",
        backgroundColor: copied ? "rgba(6,214,160,0.08)" : "white",
        color: copied ? "#04a87d" : "#64748b",
        transition: "all 0.15s",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copiado!" : label}
    </button>
  );
}

function HashtagList({ tags }: { tags: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
      {tags.map((tag) => (
        <span key={tag} style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "0.2rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600 }}>
          #{tag}
        </span>
      ))}
    </div>
  );
}

function ContentSection({ title, children, copyText }: { title: string; children: React.ReactNode; copyText: string }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>
        <CopyButton text={copyText} />
      </div>
      {children}
    </div>
  );
}

function LinkedInResult({ data, onPublish }: { data: LinkedInContent; onPublish: () => void }) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<string | null>(null);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/social/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "linkedin", caption: `${data.caption}\n\n${data.hashtags.map(h => `#${h}`).join(" ")}` }),
      });
      const result = await res.json();
      if (result.success) {
        setPublished(result.url || "Publicado!");
      } else {
        alert(result.error);
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <ContentSection title="Post" copyText={data.caption}>
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "0.625rem", padding: "1rem", fontSize: "0.9rem", lineHeight: 1.7, color: "#374151", whiteSpace: "pre-wrap", border: "1px solid #f1f5f9" }}>
          {data.caption}
        </div>
      </ContentSection>
      <ContentSection title="Hashtags" copyText={data.hashtags.map(h => `#${h}`).join(" ")}>
        <HashtagList tags={data.hashtags} />
      </ContentSection>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.25rem" }}>MELHOR HORÁRIO</div>
          <div style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>🕐 {data.best_time}</div>
        </div>
        <div style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.25rem" }}>CALL-TO-ACTION</div>
          <div style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>🎯 {data.cta}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <CopyButton text={`${data.caption}\n\n${data.hashtags.map(h => `#${h}`).join(" ")}`} label="Copiar tudo" />
        {published ? (
          <a href={published} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.3rem 0.75rem", borderRadius: "0.375rem", border: "none", backgroundColor: "rgba(6,214,160,0.1)", color: "#04a87d", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none" }}>
            <Check size={12} /> Ver no LinkedIn
          </a>
        ) : (
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.3rem 0.75rem", borderRadius: "0.375rem", border: "none", backgroundColor: "#0A66C2", color: "white", fontSize: "0.75rem", fontWeight: 700, cursor: publishing ? "not-allowed" : "pointer", opacity: publishing ? 0.7 : 1 }}
          >
            {publishing ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={12} />}
            {publishing ? "Publicando..." : "Publicar no LinkedIn"}
          </button>
        )}
      </div>
    </div>
  );
}

function InstagramResult({ data }: { data: InstagramContent }) {
  return (
    <div>
      <ContentSection title="Caption" copyText={data.caption}>
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "0.625rem", padding: "1rem", fontSize: "0.9rem", lineHeight: 1.7, color: "#374151", whiteSpace: "pre-wrap", border: "1px solid #f1f5f9" }}>
          {data.caption}
        </div>
      </ContentSection>
      <ContentSection title="Hashtags" copyText={data.hashtags.map(h => `#${h}`).join(" ")}>
        <HashtagList tags={data.hashtags} />
      </ContentSection>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.25rem" }}>MELHOR HORÁRIO</div>
          <div style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>🕐 {data.best_time}</div>
        </div>
        <div style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.25rem" }}>CALL-TO-ACTION</div>
          <div style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>🎯 {data.cta}</div>
        </div>
      </div>
      <CopyButton text={`${data.caption}\n\n${data.hashtags.map(h => `#${h}`).join(" ")}`} label="Copiar tudo" />
    </div>
  );
}

function TikTokResult({ data }: { data: TikTokContent }) {
  return (
    <div>
      <ContentSection title="Roteiro do vídeo" copyText={data.script}>
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "0.625rem", padding: "1rem", fontSize: "0.875rem", lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap", border: "1px solid #f1f5f9", fontFamily: "inherit" }}>
          {data.script}
        </div>
      </ContentSection>
      <ContentSection title="Legenda" copyText={data.caption}>
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "0.625rem", padding: "0.875rem", fontSize: "0.9rem", lineHeight: 1.7, color: "#374151", whiteSpace: "pre-wrap", border: "1px solid #f1f5f9" }}>
          {data.caption}
        </div>
      </ContentSection>
      <ContentSection title="Hashtags" copyText={data.hashtags.map(h => `#${h}`).join(" ")}>
        <HashtagList tags={data.hashtags} />
      </ContentSection>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.25rem" }}>MELHOR HORÁRIO</div>
          <div style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>🕐 {data.best_time}</div>
        </div>
        <div style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.25rem" }}>CALL-TO-ACTION</div>
          <div style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>🎯 {data.cta}</div>
        </div>
      </div>
      <CopyButton text={`${data.caption}\n\n${data.hashtags.map(h => `#${h}`).join(" ")}`} label="Copiar legenda + hashtags" />
    </div>
  );
}

function YouTubeResult({ data }: { data: YouTubeContent }) {
  return (
    <div>
      <ContentSection title="Título" copyText={data.title}>
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "0.625rem", padding: "0.875rem 1rem", fontSize: "1rem", fontWeight: 700, color: "#0d1b2a", border: "1px solid #f1f5f9" }}>
          {data.title}
        </div>
      </ContentSection>
      <ContentSection title="Descrição" copyText={data.description}>
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "0.625rem", padding: "1rem", fontSize: "0.875rem", lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap", border: "1px solid #f1f5f9" }}>
          {data.description}
        </div>
      </ContentSection>
      <ContentSection title="Tags" copyText={data.hashtags.join(", ")}>
        <HashtagList tags={data.hashtags} />
      </ContentSection>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.25rem" }}>MELHOR HORÁRIO</div>
          <div style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>🕐 {data.best_time}</div>
        </div>
        <div style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.25rem" }}>CALL-TO-ACTION</div>
          <div style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>🎯 {data.cta}</div>
        </div>
      </div>
      <CopyButton text={`${data.title}\n\n${data.description}\n\nTags: ${data.hashtags.join(", ")}`} label="Copiar tudo" />
    </div>
  );
}

export default function ConteudoPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "instagram"]);
  const [tema, setTema] = useState("");
  const [contexto, setContexto] = useState("");
  const [tom, setTom] = useState("Profissional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!tema.trim() || selectedPlatforms.length === 0) return;
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/gerar-conteudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, plataformas: selectedPlatforms, tom, contexto }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Erro ao gerar conteúdo");
        return;
      }

      setResult(data.content);
      setActiveTab(selectedPlatforms[0]);
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const activePlatform = PLATFORMS.find((p) => p.id === activeTab);
  const canGenerate = tema.trim().length > 0 && selectedPlatforms.length > 0 && !isGenerating;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.25rem" }}>Estúdio de Conteúdo</h1>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>Gere conteúdo otimizado com IA para todas as suas redes</p>
        </div>
        <Link
          href="/admin/integracoes"
          style={{ padding: "0.5rem 1rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#475569", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Settings size={15} /> Gerenciar integrações
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Form */}
        <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "1.5rem", position: "sticky", top: "1rem" }}>
          {/* Platform selector */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              Plataformas
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {PLATFORMS.map((p) => {
                const selected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    style={{
                      padding: "0.625rem 0.75rem",
                      borderRadius: "0.625rem",
                      border: "2px solid",
                      borderColor: selected ? p.color : "#e2e8f0",
                      backgroundColor: selected ? p.bg : "white",
                      color: selected ? p.color : "#64748b",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{p.emoji}</span> {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              Tema / Ideia
            </label>
            <textarea
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex: Como IA está transformando o marketing digital em 2025"
              rows={3}
              style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
            />
          </div>

          {/* Context */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              Contexto adicional <span style={{ fontWeight: 400, color: "#94a3b8", textTransform: "none" }}>(opcional)</span>
            </label>
            <textarea
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              placeholder="Ex: Baseado em caso real de cliente, foco em PMEs, incluir estatísticas..."
              rows={2}
              style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
            />
          </div>

          {/* Tone */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              Tom de voz
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTom(t)}
                  style={{
                    padding: "0.3rem 0.625rem",
                    borderRadius: "9999px",
                    border: "1px solid",
                    borderColor: tom === t ? "#4361EE" : "#e2e8f0",
                    backgroundColor: tom === t ? "rgba(67,97,238,0.1)" : "white",
                    color: tom === t ? "#4361EE" : "#64748b",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              width: "100%",
              padding: "0.875rem",
              borderRadius: "0.75rem",
              border: "none",
              background: canGenerate ? "linear-gradient(135deg, #4361EE, #06D6A0)" : "#e2e8f0",
              color: canGenerate ? "white" : "#94a3b8",
              fontSize: "0.9375rem",
              fontWeight: 700,
              cursor: canGenerate ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "opacity 0.15s",
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                Gerando conteúdo...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Gerar com IA
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div>
          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.875rem", padding: "1rem 1.25rem", marginBottom: "1rem", color: "#dc2626", fontSize: "0.875rem" }}>
              <strong>Erro:</strong> {error}
            </div>
          )}

          {!result && !isGenerating && !error && (
            <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "4rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
              <div style={{ fontWeight: 700, fontSize: "1.125rem", color: "#0d1b2a", marginBottom: "0.5rem" }}>Pronto para criar</div>
              <div style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "320px", margin: "0 auto" }}>
                Selecione as plataformas, descreva o tema e clique em &quot;Gerar com IA&quot; para criar conteúdo otimizado para cada rede.
              </div>
            </div>
          )}

          {isGenerating && (
            <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "4rem 2rem", textAlign: "center" }}>
              <Loader2 size={40} style={{ animation: "spin 1s linear infinite", color: "#4361EE", margin: "0 auto 1rem", display: "block" }} />
              <div style={{ fontWeight: 700, fontSize: "1.125rem", color: "#0d1b2a", marginBottom: "0.5rem" }}>Criando seu conteúdo...</div>
              <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                Gerando para {selectedPlatforms.length} plataforma{selectedPlatforms.length > 1 ? "s" : ""}
              </div>
            </div>
          )}

          {result && (
            <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 1rem" }}>
                {PLATFORMS.filter((p) => result[p.id as keyof GeneratedContent]).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab(p.id)}
                    style={{
                      padding: "1rem 1.25rem",
                      border: "none",
                      borderBottom: "2px solid",
                      borderColor: activeTab === p.id ? p.color : "transparent",
                      backgroundColor: "transparent",
                      color: activeTab === p.id ? p.color : "#64748b",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      transition: "all 0.15s",
                      marginBottom: "-1px",
                    }}
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", padding: "0 0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Zap size={12} color="#4361EE" /> Gerado com IA
                  </span>
                </div>
              </div>

              {/* Tab content */}
              <div style={{ padding: "1.5rem" }}>
                {activeTab === "linkedin" && result.linkedin && (
                  <LinkedInResult data={result.linkedin} onPublish={() => {}} />
                )}
                {activeTab === "instagram" && result.instagram && (
                  <InstagramResult data={result.instagram} />
                )}
                {activeTab === "tiktok" && result.tiktok && (
                  <TikTokResult data={result.tiktok} />
                )}
                {activeTab === "youtube" && result.youtube && (
                  <YouTubeResult data={result.youtube} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
