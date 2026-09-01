import { createClient } from "@/lib/supabase/server";
import { PageHeader, Field, Input, SubmitButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { updateSiteConfig } from "./actions";

const fields: { key: string; label: string; placeholder?: string }[] = [
  { key: "contact_email", label: "E-mail de contato" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+55 11 99999-9999" },
  { key: "linkedin", label: "LinkedIn (URL)" },
  { key: "instagram", label: "Instagram (URL)" },
  { key: "calendly_url", label: "Link de agendamento (Calendly)" },
  { key: "hero_photo", label: "Foto de destaque (URL da imagem)" },
  { key: "logo_url", label: "Logo do cabeçalho (URL da imagem)", placeholder: "Aparece ao lado do nome People & Growth no topo do site" },
  { key: "featured_video_url", label: "Vídeo em destaque (URL de embed do YouTube)", placeholder: "https://www.youtube.com/embed/..." },
  { key: "live_stream_url", label: "Live (URL de embed do YouTube)", placeholder: "https://www.youtube.com/embed/live_stream?channel=..." },
  { key: "site_url", label: "URL do site" },
];

type SiteConfigRow = { key: string; value: string | null };

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any).from("site_config").select("*")) as { data: SiteConfigRow[] | null };
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Configurações" subtitle="Dados gerais do site" />

      <form action={updateSiteConfig} style={{ maxWidth: "560px", backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "1.75rem" }}>
        <Field label="Estamos ao vivo agora?" hint="Ative só durante a transmissão de sábado — a caixa AO VIVO some da home quando desativado.">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#334155" }}>
            <input type="checkbox" name="is_live" defaultChecked={values.is_live === "true"} />
            Sim, mostrar a caixa AO VIVO na home
          </label>
        </Field>

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
