"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_VERSION } from "@/lib/version";
import type { Author } from "@/types/database.types";

export function LoginForm({ logoUrl, authors }: { logoUrl?: string; authors: Author[] }) {
  const [mode, setMode] = useState<"login" | "forgot">("login");

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <div className="login-brand-panel" style={{ flex: "1 1 50%", background: "linear-gradient(135deg, #0d1b2a 0%, #162236 50%, #1a1f3e 100%)", position: "relative", overflow: "hidden", padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(67,97,238,0.15) 0%, transparent 55%), radial-gradient(circle at 80% 75%, rgba(6,214,160,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(circle at 35% 40%, black 0%, transparent 65%)",
            WebkitMaskImage: "radial-gradient(circle at 35% 40%, black 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "absolute", width: "22rem", height: "22rem", borderRadius: "50%", background: "#4361EE", opacity: 0.18, filter: "blur(90px)", top: "-6rem", right: "-6rem", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "18rem", height: "18rem", borderRadius: "50%", background: "#06D6A0", opacity: 0.14, filter: "blur(90px)", bottom: "-4rem", left: "-4rem", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "440px" }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="People & Growth" style={{ height: "3.75rem", width: "auto", display: "block", margin: "0 auto 2rem" }} />
          ) : (
            <div style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: "2rem", background: "linear-gradient(135deg, #4361EE, #06D6A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              People &amp; Growth
            </div>
          )}

          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.3)", borderRadius: "9999px", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <Sparkles size={13} color="#06D6A0" />
            <span style={{ fontSize: "0.75rem", color: "#06D6A0", fontWeight: 600 }}>Painel do portal</span>
          </div>

          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", lineHeight: 1.15, marginBottom: "1rem" }}>
            Bem-vindo de volta.
            <br />
            Vamos construir <span style={{ background: "linear-gradient(135deg, #4361EE, #06D6A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>juntos</span>.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", lineHeight: 1.6, marginBottom: authors.length > 0 ? "2.5rem" : 0 }}>
            Publique artigos, acompanhe métricas e mantenha o People &amp; Growth sempre atualizado — tudo em um só lugar.
          </p>

          {authors.length > 0 && (
            <div style={{ paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#06D6A0", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
                Quem está por trás do People &amp; Growth
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {authors.slice(0, 4).map((author) => (
                <div key={author.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div
                    style={{
                      width: "2.25rem",
                      height: "2.25rem",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: author.photo_url ? `url(${author.photo_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
                    }}
                  />
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", fontWeight: 600 }}>{author.name}</span>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: "absolute", left: "3rem", bottom: "1.5rem", color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>v{APP_VERSION}</div>
      </div>

      <div style={{ flex: "1 1 50%", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "1.5rem" }}>
        <div style={{ position: "absolute", width: "26rem", height: "26rem", borderRadius: "50%", background: "#4361EE", opacity: 0.06, filter: "blur(100px)", top: "-8rem", left: "-8rem", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "20rem", height: "20rem", borderRadius: "50%", background: "#06D6A0", opacity: 0.06, filter: "blur(100px)", bottom: "-6rem", right: "-6rem", pointerEvents: "none" }} />
        <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
          <div className="login-mobile-logo" style={{ display: "none", marginBottom: "1.5rem" }}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="People & Growth" style={{ height: "2rem", width: "auto" }} />
            ) : (
              <div style={{ fontWeight: 800, fontSize: "1.25rem", background: "linear-gradient(135deg, #4361EE, #06D6A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                People &amp; Growth
              </div>
            )}
          </div>

          {mode === "login" ? (
            <LoginFields onForgotPassword={() => setMode("forgot")} />
          ) : (
            <ForgotPasswordFields onBack={() => setMode("login")} />
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .login-brand-panel { display: none; }
          .login-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function LoginFields({ onForgotPassword }: { onForgotPassword: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setError("E-mail ou senha inválidos.");
      return;
    }

    // Hard navigation, and loading stays true: a client-side router.push
    // here can visually flip the button back to "Entrar" for a moment
    // before the redirect lands, making it look stuck (same root cause
    // fixed for the admin/author logout buttons).
    window.location.href = "/admin";
  }

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>Entrar</h2>
      <div style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Informe seu e-mail e senha para continuar.</div>

      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
        E-mail
      </label>
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "0.625rem 0.75rem",
          borderRadius: "0.5rem",
          border: "1px solid #cbd5e1",
          marginBottom: "1rem",
          fontSize: "0.9rem",
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.375rem" }}>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>Senha</label>
        <button type="button" onClick={onForgotPassword} style={{ background: "none", border: "none", color: "#4361EE", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
          Esqueci minha senha
        </button>
      </div>
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <input
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "0.625rem 2.5rem 0.625rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #cbd5e1",
            fontSize: "0.9rem",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          style={{ position: "absolute", right: "0.625rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {error && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</div>}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.75rem",
          borderRadius: "0.5rem",
          border: "none",
          backgroundColor: "#4361EE",
          color: "white",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading && <Loader2 size={16} className="admin-spin" />}
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

function ForgotPasswordFields({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/password-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erro ao enviar o pedido.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
      <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", color: "#64748b", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: "1.25rem" }}>
        <ArrowLeft size={14} /> Voltar para login
      </button>

      {sent ? (
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>Pedido enviado</h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Se esse e-mail tiver uma conta aqui, um administrador foi avisado e vai definir uma nova senha para você em breve.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>Esqueci minha senha</h2>
          <p style={{ color: "#64748b", fontSize: "0.8125rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Informe seu e-mail de acesso. Um administrador será avisado e vai definir uma nova senha para você.
          </p>

          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
            E-mail
          </label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", marginBottom: "1rem", fontSize: "0.9rem", boxSizing: "border-box" }}
          />

          {error && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#4361EE", color: "white", fontWeight: 600, fontSize: "0.9rem", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Enviando..." : "Enviar pedido"}
          </button>
        </form>
      )}
    </div>
  );
}
