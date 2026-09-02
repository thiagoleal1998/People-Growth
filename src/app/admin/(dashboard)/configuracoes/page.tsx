import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Field, Input, SubmitButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { updateSiteConfig } from "./actions";

const contactFields: { key: string; label: string; placeholder?: string }[] = [
  { key: "contact_email", label: "E-mail de contato" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+55 11 99999-9999" },
  { key: "linkedin", label: "LinkedIn (URL)" },
  { key: "instagram", label: "Instagram (URL)" },
  { key: "calendly_url", label: "Link de agendamento (Calendly)" },
];

const homeContentFields: { key: string; label: string; placeholder?: string }[] = [
  { key: "hero_photo", label: "Foto de destaque (URL da imagem)" },
  { key: "featured_video_url", label: "Vídeo em destaque (URL de embed do YouTube)", placeholder: "https://www.youtube.com/embed/..." },
  { key: "shorts_video_url", label: "Vídeo vertical (Shorts, URL de embed do YouTube)", placeholder: "https://www.youtube.com/shorts/..." },
];

const liveFields: { key: string; label: string; placeholder?: string }[] = [
  { key: "live_stream_url", label: "Live (URL de embed do YouTube)", placeholder: "https://www.youtube.com/embed/live_stream?channel=..." },
  { key: "live_caption_pt", label: "Legenda da live", placeholder: "Ex: Thiago Leal comenta os principais temas da semana" },
];

type SiteConfigRow = { key: string; value: string | null };

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem", marginBottom: "1.25rem" }}>
      <div style={{ marginBottom: "1.375rem" }}>
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--admin-text)" }}>{title}</h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginTop: "0.1875rem" }}>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<{ saved?: string; logoError?: string; faviconError?: string }> }) {
  const { saved, logoError, faviconError } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any).from("site_config").select("*")) as { data: SiteConfigRow[] | null };
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Configurações" subtitle="Identidade visual, contato e conteúdo exibido no site público" />

      <form action={updateSiteConfig} style={{ maxWidth: "640px" }}>
        <Section title="Identidade visual" subtitle="Logo e favicon usados em todo o site público.">
          <Field label="Logo do cabeçalho" hint="Aparece ao lado do nome People & Growth no topo do site. PNG, JPG, WEBP, SVG ou GIF, até 5MB.">
            {values.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.logo_url}
                alt="Logo atual"
                style={{ height: "2.5rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.25rem" }}
              />
            )}
            <input type="file" name="logo_file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" />
            <ErrorBanner message={logoError} />
          </Field>

          <Field label="Favicon" hint="Ícone que aparece na aba do navegador. Ideal: PNG ou SVG quadrado, fundo transparente.">
            {values.favicon_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.favicon_url}
                alt="Favicon atual"
                style={{ height: "2rem", width: "2rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.25rem" }}
              />
            )}
            <input type="file" name="favicon_file" accept="image/png,image/x-icon,image/svg+xml" />
            <ErrorBanner message={faviconError} />
          </Field>
        </Section>

        <Section title="Contato & redes sociais" subtitle="Informações que aparecem no rodapé e na página de contato do site.">
          {contactFields.map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
            </Field>
          ))}
        </Section>

        <Section title="Conteúdo em destaque na home" subtitle="Foto e vídeos exibidos na página inicial do site.">
          {homeContentFields.map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
            </Field>
          ))}
        </Section>

        <Section title="Transmissão ao vivo" subtitle="Controla a caixa AO VIVO que aparece na home durante a transmissão de sábado.">
          <Field label="Estamos ao vivo agora?" hint="Ative só durante a transmissão — a caixa AO VIVO some da home quando desativado.">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
              <input type="checkbox" name="is_live" defaultChecked={values.is_live === "true"} />
              Sim, mostrar a caixa AO VIVO na home
            </label>
          </Field>
          {liveFields.map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
            </Field>
          ))}
        </Section>

        <Section title="Dados técnicos do site" subtitle="Usado em SEO, compartilhamentos e links absolutos gerados pelo sistema.">
          <Field label="URL do site" hint="Ex: https://people-growth.vercel.app — sem barra no final.">
            <Input name="site_url" defaultValue={values.site_url ?? ""} />
          </Field>
        </Section>

        <SubmitButton>Salvar alterações</SubmitButton>
      </form>
    </div>
  );
}
