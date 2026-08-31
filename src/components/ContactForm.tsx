"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ContactFormProps {
  serviceDefault?: string;
  compact?: boolean;
}

export function ContactForm({ serviceDefault = "", compact = false }: ContactFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: serviceDefault,
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const inputStyle = {
    width: "100%",
    padding: compact ? "0.625rem 0.875rem" : "0.75rem 1rem",
    borderRadius: "0.625rem",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    color: "#0d1b2a",
    outline: "none",
    backgroundColor: "white",
    boxSizing: "border-box" as const,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", service: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{ backgroundColor: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.3)", borderRadius: "0.875rem", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
        <h3 style={{ fontWeight: 700, color: "#0d1b2a", marginBottom: "0.5rem" }}>Mensagem enviada!</h3>
        <p style={{ color: "#475569", fontSize: "0.9rem" }}>Em breve entrarei em contato. Obrigado!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
            Nome completo *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Seu nome"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
            E-mail *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
            WhatsApp
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="(11) 99999-9999"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
            Assunto / Serviço
          </label>
          <select
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            style={inputStyle}
          >
            <option value="">Selecione...</option>
            <option>Consultoria Estratégica</option>
            <option>Marketing Digital</option>
            <option>Growth Hacking</option>
            <option>Business Intelligence</option>
            <option>Inteligência Artificial</option>
            <option>Treinamentos Corporativos</option>
            <option>Mentoria</option>
            <option>Outro</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
          Mensagem *
        </label>
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Conte um pouco sobre seu projeto ou desafio..."
          rows={compact ? 3 : 5}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {status === "error" && (
        <p style={{ color: "#ef4444", fontSize: "0.8125rem" }}>Algo deu errado. Tente novamente.</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          backgroundColor: "#4361EE",
          color: "white",
          padding: "0.875rem 1.5rem",
          borderRadius: "0.75rem",
          fontWeight: 700,
          fontSize: "0.9375rem",
          border: "none",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          opacity: status === "loading" ? 0.8 : 1,
        }}
      >
        {status === "loading" ? (
          <>
            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            Enviando...
          </>
        ) : (
          "Enviar mensagem"
        )}
      </button>
    </form>
  );
}
