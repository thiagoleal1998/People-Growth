"use client";

import { useState, useTransition } from "react";
import { KeyRound, X } from "lucide-react";
import type { PasswordResetRequest, UserProfile } from "@/types/database.types";
import { resetUserPassword, dismissPasswordResetRequest } from "./actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function PasswordResetRequestsClient({ requests, users }: { requests: PasswordResetRequest[]; users: UserProfile[] }) {
  const [items, setItems] = useState(requests);
  const userByEmail = new Map(users.map((u) => [u.email, u]));

  return (
    <div style={{ backgroundColor: "rgba(255,183,3,0.08)", border: "1px solid rgba(255,183,3,0.3)", borderRadius: "1rem", padding: "1.25rem 1.5rem" }}>
      <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#cc9200", marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <KeyRound size={15} /> {items.length} pedido{items.length === 1 ? "" : "s"} de redefinição de senha
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {items.map((req) => (
          <ResetRequestRow
            key={req.id}
            request={req}
            user={userByEmail.get(req.email)}
            onResolved={() => setItems((prev) => prev.filter((r) => r.id !== req.id))}
          />
        ))}
      </div>
    </div>
  );
}

function ResetRequestRow({ request, user, onResolved }: { request: PasswordResetRequest; user: UserProfile | undefined; onResolved: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "0.625rem", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: "160px" }}>
        <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)" }}>{request.email}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>{formatDate(request.created_at)}</div>
      </div>

      {user ? (
        <>
          <input
            type="text"
            placeholder="Nova senha (mín. 6 caracteres)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", minWidth: "200px" }}
          />
          <button
            type="button"
            disabled={pending || newPassword.length < 6}
            onClick={() => {
              setFormError(null);
              startTransition(async () => {
                try {
                  await resetUserPassword(user.id, newPassword, request.id);
                  onResolved();
                } catch (err) {
                  setFormError(err instanceof Error ? err.message : "Erro ao definir senha.");
                }
              });
            }}
            style={{ backgroundColor: "#4361EE", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontWeight: 700, fontSize: "0.8125rem", border: "none", cursor: pending || newPassword.length < 6 ? "default" : "pointer", opacity: pending || newPassword.length < 6 ? 0.6 : 1 }}
          >
            {pending ? "Salvando..." : "Definir senha"}
          </button>
        </>
      ) : (
        <span style={{ fontSize: "0.8125rem", color: "var(--admin-faint)" }}>Nenhum login encontrado para esse e-mail.</span>
      )}

      <button
        type="button"
        title="Dispensar"
        onClick={() => {
          startTransition(async () => {
            await dismissPasswordResetRequest(request.id);
            onResolved();
          });
        }}
        style={{ color: "var(--admin-faint)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}
      >
        <X size={16} />
      </button>

      {formError && <div style={{ width: "100%", color: "#dc2626", fontSize: "0.75rem" }}>{formError}</div>}
    </div>
  );
}
