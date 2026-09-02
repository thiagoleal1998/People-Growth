import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader, Field, Input, Textarea, SubmitButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { updateOwnAuthorProfile } from "./actions";
import type { Author } from "@/types/database.types";

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

      <form action={updateOwnAuthorProfile} style={{ maxWidth: "560px", backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "1.75rem" }}>
        <Field label="Foto" hint="PNG, JPG, WEBP ou GIF, até 5MB.">
          {author?.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.photo_url}
              alt="Foto atual"
              style={{ width: "4rem", height: "4rem", borderRadius: "50%", objectFit: "cover", display: "block", marginBottom: "0.625rem" }}
            />
          )}
          <input type="file" name="photo_file" accept="image/png,image/jpeg,image/webp,image/gif" />
          <ErrorBanner message={photoError} />
        </Field>

        <Field label="Frase de destaque (PT)" hint="Aparece na tira de colunistas, no lugar do cargo. Até 80 caracteres.">
          <Textarea name="tagline_pt" rows={2} maxLength={80} defaultValue={author?.tagline_pt ?? ""} />
        </Field>
        <Field label="Frase de destaque (EN)">
          <Textarea name="tagline_en" rows={2} maxLength={80} defaultValue={author?.tagline_en ?? ""} />
        </Field>
        <Field label="Bio (PT)">
          <Textarea name="bio_pt" rows={5} defaultValue={author?.bio_pt ?? ""} />
        </Field>
        <Field label="Bio (EN)">
          <Textarea name="bio_en" rows={5} defaultValue={author?.bio_en ?? ""} />
        </Field>
        <Field
          label="Trajetória / Marcos (PT)"
          hint='Aparece na sua página "Sobre". Um marco por linha, no formato "Ano | Descrição".'
        >
          <Textarea name="milestones_pt" rows={4} defaultValue={author?.milestones_pt ?? ""} placeholder={"2024 | Comecei a colaborar com a People & Growth"} />
        </Field>
        <Field label="Trajetória / Marcos (EN)">
          <Textarea name="milestones_en" rows={4} defaultValue={author?.milestones_en ?? ""} />
        </Field>
        <Field label="LinkedIn (URL)">
          <Input name="linkedin_url" defaultValue={author?.linkedin_url ?? ""} />
        </Field>
        <Field label="Instagram (URL)">
          <Input name="instagram_url" defaultValue={author?.instagram_url ?? ""} />
        </Field>
        <SubmitButton>Salvar alterações</SubmitButton>
      </form>
    </div>
  );
}
