"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { Field, Input, Select, SubmitButton, Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { PasswordResetRequestsClient } from "./PasswordResetRequestsClient";
import { UsersClient } from "./UsersClient";
import { createUser } from "./actions";
import { deleteAuthor } from "../autores/actions";
import type { UserProfile, Author, PasswordResetRequest } from "@/types/database.types";

const outerTabs = [
  { id: "usuarios", label: "Usuários" },
  { id: "autores", label: "Autores" },
] as const;

type OuterTabId = (typeof outerTabs)[number]["id"];

export function UsuariosAutoresTabs({
  users,
  authors,
  resetRequests,
  userError,
  initialTab,
}: {
  users: UserProfile[];
  authors: Author[];
  resetRequests: PasswordResetRequest[];
  userError?: string;
  initialTab?: string;
}) {
  const [active, setActive] = useState<OuterTabId>(initialTab === "autores" ? "autores" : "usuarios");

  return (
    <div>
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {outerTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={{
              padding: "0.875rem 1.5rem",
              fontSize: "0.9375rem",
              fontWeight: 800,
              color: active === tab.id ? "#315E9C" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: active === tab.id ? "2.5px solid #315E9C" : "2.5px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "usuarios" ? (
        <div>
          {resetRequests.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <PasswordResetRequestsClient requests={resetRequests} users={users} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: "1.5rem", alignItems: "start" }}>
            <form
              action={createUser}
              style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}
            >
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.25rem" }}>Criar novo acesso</h2>
              <Field label="E-mail">
                <Input name="email" type="email" required />
              </Field>
              <Field label="Senha inicial" hint="Mínimo 6 caracteres. A pessoa pode trocar depois pelo Supabase se necessário.">
                <Input name="password" type="text" required minLength={6} />
              </Field>
              <Field label="Papel">
                <Select name="role" defaultValue="author">
                  <option value="author">Autor — escreve conteúdo</option>
                  <option value="admin">Admin — acesso total</option>
                </Select>
              </Field>
              <Field label="Vincular ao autor (perfil público)" hint="Liga esse login a um autor já cadastrado, para editar o próprio perfil e assinar os próprios artigos.">
                <Select name="author_id" defaultValue="">
                  <option value="">— nenhum por enquanto —</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              </Field>
              <ErrorBanner message={userError} />
              <SubmitButton>Criar acesso</SubmitButton>
            </form>

            <UsersClient users={users} authors={authors} />
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
            <Link
              href="/admin/autores/novo"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#315E9C", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}
            >
              <Plus size={16} /> Novo autor
            </Link>
          </div>

          <Card>
            {authors.length === 0 ? (
              <EmptyState text="Nenhum autor cadastrado." />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                    {["Nome", "Cargo", "Status", "Termo de Aceite", ""].map((h) => (
                      <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {authors.map((a) => (
                    <tr key={a.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                      <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: a.photo_url ? `url("${a.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
                          }}
                        />
                        {a.name}
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{a.role_pt ?? "—"}</td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <Badge tone={a.status === "active" ? "success" : "neutral"}>{a.status === "active" ? "Ativo" : "Inativo"}</Badge>
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <Badge tone={a.terms_accepted_at ? "success" : a.terms_declined_at ? "danger" : "warning"}>
                          {a.terms_accepted_at ? "Aceito" : a.terms_declined_at ? "Recusado" : "Pendente"}
                        </Badge>
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Link href={`/admin/autores/${a.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                          <ConfirmDeleteButton confirmText={`Excluir o autor "${a.name}"?`} onDelete={deleteAuthor.bind(null, a.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
