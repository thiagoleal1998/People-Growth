"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d1b2a",
        padding: "1.5rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "white",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.25rem",
            marginBottom: "0.25rem",
            background: "linear-gradient(135deg, #4361EE, #06D6A0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          People &amp; Growth
        </div>
        <div style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Acesse sua conta
        </div>

        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
          E-mail
        </label>
        <input
          type="email"
          required
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

        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
          Senha
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "0.625rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #cbd5e1",
            marginBottom: "1.25rem",
            fontSize: "0.9rem",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
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
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
