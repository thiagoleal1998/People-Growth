import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { UsuariosAutoresTabs } from "./UsuariosAutoresTabs";
import type { UserProfile, Author, PasswordResetRequest } from "@/types/database.types";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; userError?: string; tab?: string }>;
}) {
  const { saved, userError, tab } = await searchParams;
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

      <UsuariosAutoresTabs
        users={users}
        authors={authors}
        resetRequests={resetRequests}
        userError={userError}
        initialTab={tab}
      />
    </div>
  );
}
