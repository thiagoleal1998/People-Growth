"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { UserProfile, Author } from "@/types/database.types";
import { updateUserRole, updateUserAuthorLink, deleteUser } from "./actions";

export function UsersClient({ users, authors }: { users: UserProfile[]; authors: Author[] }) {
  const [, startTransition] = useTransition();
  const [items, setItems] = useState(users);
  const authorById = new Map(authors.map((a) => [a.id, a]));

  return (
    <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
      {items.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>
          Nenhum usuário cadastrado.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                {["E-mail", "Papel", "Vinculado ao autor", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{u.email}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <select
                      defaultValue={u.role}
                      onChange={(e) => {
                        const role = e.target.value as UserProfile["role"];
                        setItems((prev) => prev.map((i) => (i.id === u.id ? { ...i, role } : i)));
                        startTransition(() => updateUserRole(u.id, role));
                      }}
                      style={{
                        backgroundColor: u.role === "admin" ? "rgba(67,97,238,0.1)" : "rgba(6,214,160,0.1)",
                        color: u.role === "admin" ? "#4361EE" : "#04a87d",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="author">Autor</option>
                    </select>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <select
                      defaultValue={u.author_id ?? ""}
                      onChange={(e) => {
                        const authorId = e.target.value || null;
                        setItems((prev) => prev.map((i) => (i.id === u.id ? { ...i, author_id: authorId } : i)));
                        startTransition(() => updateUserAuthorLink(u.id, authorId));
                      }}
                      style={{ padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
                    >
                      <option value="">— nenhum —</option>
                      {authors.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    {u.author_id && !authorById.has(u.author_id) && (
                      <span style={{ color: "#ef4444", fontSize: "0.75rem", marginLeft: "0.5rem" }}>autor não encontrado</span>
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <button
                      onClick={() => {
                        if (confirm(`Remover o acesso de ${u.email}? A pessoa não conseguirá mais entrar.`)) {
                          setItems((prev) => prev.filter((i) => i.id !== u.id));
                          startTransition(() => deleteUser(u.id));
                        }
                      }}
                      style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                      title="Remover acesso"
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
  );
}
