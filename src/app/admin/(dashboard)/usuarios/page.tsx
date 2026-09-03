import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader, Field, Input, Select, SubmitButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { UsersClient } from "./UsersClient";
import { PasswordResetRequestsClient } from "./PasswordResetRequestsClient";
import { createUser } from "./actions";
import type { UserProfile, Author, PasswordResetRequest } from "@/types/database.types";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; userError?: string }>;
}) {
  const { saved, userError } = await searchParams;
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;

  const [{ data: usersData }, { data: authorsData }, { data: resetRequestsData }] = await Promise.all([
    client.from("user_profiles").select("*").order("created_at"),
    client.from("authors").select("*").order("order"),
    client.from("password_reset_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }),
  ]);

  const users = (usersData ?? []) as UserProfile[];
  const authors = (authorsData ?? []) as Author[];
  const resetRequests = (resetRequestsData ?? []) as PasswordResetRequest[];

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader
        title="Usuários"
        subtitle="Cada pessoa tem seu próprio login. Admins têm acesso total; autores só escrevem e editam o próprio perfil."
      />

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
  );
}
