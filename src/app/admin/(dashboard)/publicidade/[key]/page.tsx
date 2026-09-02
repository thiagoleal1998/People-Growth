import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormShell, Field, Input, SubmitButton } from "@/components/admin/ui";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { AD_SLOT_DEFS } from "../ad-slots";
import { upsertAdSlot } from "../actions";
import type { AdSlot } from "@/types/database.types";

export default async function EditarEspacoPublicitarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ imageError?: string }>;
}) {
  const { key } = await params;
  const { imageError } = await searchParams;
  const def = AD_SLOT_DEFS.find((d) => d.key === key);
  if (!def) notFound();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("ad_slots").select("*").eq("key", key).single();
  const slot = data as AdSlot | null;

  const action = upsertAdSlot.bind(null, key);

  return (
    <FormShell title={`Editar: ${def.label}`} backHref="/admin/publicidade">
      <p style={{ fontSize: "0.8125rem", color: "var(--admin-faint)", marginBottom: "1.5rem" }}>{def.description}</p>
      <form action={action}>
        <Field label="Estamos exibindo este anúncio?">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
            <input type="checkbox" name="active" defaultChecked={slot?.active ?? false} />
            Sim, mostrar no site
          </label>
        </Field>

        <Field label="Imagem do banner" hint="PNG, JPG ou WEBP, até 5MB. Sem imagem, o espaço fica invisível no site mesmo que ativado.">
          {slot?.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slot.image_url}
              alt="Banner atual"
              style={{ maxHeight: "6rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border)" }}
            />
          )}
          <input type="file" name="image_file" accept="image/png,image/jpeg,image/webp" />
          <ErrorBanner message={imageError} />
        </Field>

        <Field label="Link de destino (URL)" hint="Para onde o clique no banner leva.">
          <Input name="link_url" defaultValue={slot?.link_url ?? ""} placeholder="https://..." />
        </Field>

        <Field label="Texto alternativo">
          <Input name="alt_text" defaultValue={slot?.alt_text ?? ""} placeholder="Descrição curta do anúncio" />
        </Field>

        <SubmitButton>Salvar alterações</SubmitButton>
      </form>
    </FormShell>
  );
}
