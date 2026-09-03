import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { MeuPerfilForm } from "./MeuPerfilForm";
import type { Author } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function MeuPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; photoError?: string }>;
}) {
  const { saved, error, photoError } = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile?.author_id) {
    return (
      <div>
        <PageHeader title="Meu perfil" />
        <div style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "0.625rem", fontSize: "0.875rem" }}>
          Seu login ainda não está vinculado a um perfil de autor. Peça a um admin para vincular em Admin → Usuários.
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("authors").select("*").eq("id", profile.author_id).single();
  const author = data as Author | null;

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Meu perfil" subtitle="Como você aparece no site — na tira de colunistas e na página Sobre." />

      {error && (
        <div style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "0.625rem", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          {error}
        </div>
      )}

      <MeuPerfilForm author={author} photoError={photoError} />
    </div>
  );
}
