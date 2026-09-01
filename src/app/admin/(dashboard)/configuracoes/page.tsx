import { createClient } from "@/lib/supabase/server";
import { PageHeader, Field, Input, SubmitButton } from "@/components/admin/ui";
import { updateSiteConfig } from "./actions";

const fields: { key: string; label: string; placeholder?: string }[] = [
  { key: "contact_email", label: "E-mail de contato" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+55 11 99999-9999" },
  { key: "linkedin", label: "LinkedIn (URL)" },
  { key: "instagram", label: "Instagram (URL)" },
  { key: "calendly_url", label: "Link de agendamento (Calendly)" },
  { key: "hero_photo", label: "Foto de destaque (URL da imagem)" },
  { key: "featured_video_url", label: "Vídeo em destaque (URL de embed do YouTube)", placeholder: "https://www.youtube.com/embed/..." },
  { key: "site_url", label: "URL do site" },
];

type SiteConfigRow = { key: string; value: string | null };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any).from("site_config").select("*")) as { data: SiteConfigRow[] | null };
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Dados gerais do site" />

      <form action={updateSiteConfig} style={{ maxWidth: "560px", backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "1.75rem" }}>
        {fields.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
          </Field>
        ))}
        <SubmitButton>Salvar alterações</SubmitButton>
      </form>
    </div>
  );
}
