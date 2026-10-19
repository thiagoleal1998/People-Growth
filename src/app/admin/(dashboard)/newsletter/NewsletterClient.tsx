"use client";

import { useState, useTransition } from "react";
import { Search, Trash2, RefreshCw } from "lucide-react";
import type { Database } from "@/types/database.types";
import { confirmDialog, alertDialog } from "@/components/admin/dialog-store";
import { updateSubStatus, deleteSub, syncAllToSender } from "./actions";

type Sub = Database["public"]["Tables"]["newsletter_subs"]["Row"];

function formatDate(iso: string) {
  // timeZone pinned to avoid a hydration mismatch — see ArticlesTabs.tsx.
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function NewsletterClient({ subs }: { subs: Sub[] }) {
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [, startTransition] = useTransition();

  const filtered = subs.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()) || (s.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleSyncAll() {
    setSyncing(true);
    try {
      const { synced } = await syncAllToSender();
      await alertDialog(`${synced} inscrito${synced === 1 ? "" : "s"} ativo${synced === 1 ? "" : "s"} enviado${synced === 1 ? "" : "s"} pro Sender.net.`);
    } catch {
      await alertDialog("Falha ao sincronizar com o Sender.net. Confira se a SENDER_API_KEY está configurada.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "var(--admin-surface)", borderRadius: "0.75rem", padding: "0.75rem 1rem", border: "1px solid var(--admin-border-strong)", maxWidth: "400px", flex: 1 }}>
          <Search size={16} color="var(--admin-faint)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar inscrito..."
            style={{ border: "none", outline: "none", fontSize: "0.9rem", color: "var(--admin-text)", width: "100%", background: "none" }}
          />
        </div>
        <button
          type="button"
          onClick={handleSyncAll}
          disabled={syncing}
          title="Envia todos os inscritos ativos pro Sender.net — útil pra quem assinou antes dessa integração existir; dali em diante, inscrição e cancelamento já sincronizam sozinhos"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.125rem",
            borderRadius: "0.625rem",
            border: "1px solid var(--admin-border-strong)",
            backgroundColor: "var(--admin-surface)",
            color: "var(--admin-text)",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: syncing ? "default" : "pointer",
            opacity: syncing ? 0.6 : 1,
          }}
        >
          <RefreshCw size={15} className={syncing ? "admin-spin" : undefined} />
          {syncing ? "Sincronizando..." : "Sincronizar com Sender.net"}
        </button>
      </div>

      <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>
            {subs.length === 0 ? "Nenhum inscrito ainda." : "Nenhum inscrito encontrado."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["E-mail", "Nome", "Origem", "Status", "Inscrito em", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 700, color: "var(--admin-text)", fontSize: "0.875rem" }}>{sub.email}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{sub.name ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{sub.source ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <select
                        defaultValue={sub.status}
                        onChange={(e) => startTransition(() => updateSubStatus(sub.id, e.target.value as Sub["status"]))}
                        style={{
                          backgroundColor: sub.status === "active" ? "rgba(200, 154, 74,0.1)" : "rgba(148,163,184,0.15)",
                          color: sub.status === "active" ? "#A07B3B" : "var(--admin-muted)",
                          padding: "0.2rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer",
                        }}
                      >
                        <option value="active">Ativo</option>
                        <option value="unsubscribed">Cancelado</option>
                      </select>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{formatDate(sub.subscribed_at)}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <button
                        onClick={async () => { if (await confirmDialog(`Remover ${sub.email}?`, { danger: true, confirmText: "Remover" })) startTransition(() => deleteSub(sub.id)); }}
                        style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                        title="Remover"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
