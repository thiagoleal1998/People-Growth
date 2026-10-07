"use client";

import { useState, useTransition } from "react";
import { Field, Input } from "@/components/admin/ui";
import { changeOwnPassword } from "./actions";

// Its own small form, separate from the big profile form below — so a typo here
// never has to risk the rest of the page's unsaved fields.
export function ChangePasswordCard() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid #eef1f4", padding: "1.75rem", marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.125rem" }}>Segurança — trocar senha</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 1.25rem" }}>
        <Field label="Nova senha" hint="Mínimo 6 caracteres.">
          <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setDone(false); }} minLength={6} />
        </Field>
        <Field label="Confirmar nova senha">
          <Input type="password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setDone(false); }} minLength={6} />
        </Field>
      </div>
      {mismatch && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>As senhas não coincidem.</div>}
      {error && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{error}</div>}
      {done && <div style={{ color: "#06a87c", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>Senha atualizada.</div>}
      <button
        type="button"
        disabled={pending || password.length < 6 || mismatch}
        onClick={() => {
          setError(null);
          setDone(false);
          startTransition(async () => {
            try {
              await changeOwnPassword(password);
              setPassword("");
              setConfirm("");
              setDone(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro ao trocar a senha.");
            }
          });
        }}
        style={{
          backgroundColor: "#4361EE",
          color: "white",
          padding: "0.625rem 1.25rem",
          borderRadius: "0.625rem",
          fontWeight: 700,
          fontSize: "0.875rem",
          border: "none",
          cursor: pending || password.length < 6 || mismatch ? "default" : "pointer",
          opacity: pending || password.length < 6 || mismatch ? 0.6 : 1,
        }}
      >
        {pending ? "Salvando..." : "Trocar senha"}
      </button>
    </div>
  );
}
