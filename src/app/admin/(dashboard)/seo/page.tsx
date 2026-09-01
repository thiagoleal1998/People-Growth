import { createClient } from "@/lib/supabase/server";
import { PageHeader, Field, Input, Textarea, SubmitButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { updateSeoConfig } from "./actions";

const seoFields: { key: string; label: string; placeholder?: string; hint?: string }[] = [
  { key: "seo_meta_title_pt", label: "Título SEO (PT)", placeholder: "People & Growth", hint: "Substitui o título padrão nas buscas. Ideal até 60 caracteres." },
  { key: "seo_meta_title_en", label: "Título SEO (EN)", placeholder: "People & Growth" },
  { key: "seo_meta_description_pt", label: "Descrição SEO (PT)", hint: "Aparece nos resultados de busca. Ideal até 155 caracteres." },
  { key: "seo_meta_description_en", label: "Descrição SEO (EN)" },
  { key: "seo_og_image", label: "Imagem de compartilhamento (Open Graph)", placeholder: "https://...", hint: "Imagem exibida ao compartilhar o site no WhatsApp, LinkedIn, etc. Ideal 1200x630px." },
  { key: "seo_google_verification", label: "Código de verificação do Google Search Console", hint: "Cole apenas o valor do content da meta tag google-site-verification." },
  { key: "seo_twitter_handle", label: "Usuário no X/Twitter", placeholder: "@peoplegrowth" },
];

const geoFields: { key: string; label: string; placeholder?: string; hint?: string }[] = [
  {
    key: "geo_ai_summary_pt",
    label: "Resumo institucional para IA (PT)",
    hint: "Frase objetiva sobre quem é a People & Growth, usada como base para respostas de ferramentas como ChatGPT, Perplexity e Gemini.",
  },
  { key: "geo_ai_summary_en", label: "Resumo institucional para IA (EN)" },
];

type SiteConfigRow = { key: string; value: string | null };

export default async function SeoPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any).from("site_config").select("*")) as { data: SiteConfigRow[] | null };
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="SEO, GEO & AEO" subtitle="Como o site aparece em buscadores tradicionais e em ferramentas de IA" />

      <form action={updateSeoConfig} style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.25rem" }}>SEO</h2>
          <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
            Otimização para buscadores tradicionais (Google, Bing).
          </p>
          {seoFields.map(({ key, label, placeholder, hint }) => (
            <Field key={key} label={label} hint={hint}>
              {key.includes("description") ? (
                <Textarea name={key} rows={2} defaultValue={values[key] ?? ""} placeholder={placeholder} />
              ) : (
                <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
              )}
            </Field>
          ))}
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.25rem" }}>GEO</h2>
          <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
            Generative Engine Optimization — como assistentes de IA descrevem a marca. O robots.txt do site já permite o acesso de crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, etc).
          </p>
          {geoFields.map(({ key, label, hint }) => (
            <Field key={key} label={label} hint={hint}>
              <Textarea name={key} rows={3} defaultValue={values[key] ?? ""} />
            </Field>
          ))}
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.25rem" }}>AEO</h2>
          <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
            Answer Engine Optimization — perguntas e respostas usadas para gerar dados estruturados (FAQ) que aparecem em respostas diretas de busca e assistentes de voz.
          </p>
          <Field
            label="Perguntas frequentes (PT)"
            hint='Uma pergunta e resposta por linha, separadas por " | ". Ex: O que é a People & Growth? | Uma consultoria e um espaço de conteúdo sobre negócios, pessoas e os temas que os impactam.'
          >
            <Textarea name="aeo_faq_pt" rows={6} defaultValue={values.aeo_faq_pt ?? ""} />
          </Field>
        </div>

        <div>
          <SubmitButton>Salvar alterações</SubmitButton>
        </div>
      </form>
    </div>
  );
}
