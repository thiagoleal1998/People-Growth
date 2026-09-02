import { createClient } from "@/lib/supabase/server";
import { PageHeader, Field, Input, Textarea, SubmitButton, SectionGrid, SectionCard, FieldGrid } from "@/components/admin/ui";
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

      <form action={updateSeoConfig} style={{ maxWidth: "1400px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <SectionGrid>
            <SectionCard title="SEO" subtitle="Otimização para buscadores tradicionais (Google, Bing)." wide>
              <FieldGrid>
                {seoFields.map(({ key, label, placeholder, hint }) => (
                  <Field key={key} label={label} hint={hint}>
                    {key.includes("description") ? (
                      <Textarea name={key} rows={2} defaultValue={values[key] ?? ""} placeholder={placeholder} />
                    ) : (
                      <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
                    )}
                  </Field>
                ))}
              </FieldGrid>
            </SectionCard>

            <SectionCard
              title="GEO"
              subtitle="Generative Engine Optimization — como assistentes de IA descrevem a marca. O robots.txt do site já permite o acesso de crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, etc)."
            >
              {geoFields.map(({ key, label, hint }) => (
                <Field key={key} label={label} hint={hint}>
                  <Textarea name={key} rows={3} defaultValue={values[key] ?? ""} />
                </Field>
              ))}
            </SectionCard>

            <SectionCard
              title="AEO"
              subtitle="Answer Engine Optimization — perguntas e respostas usadas para gerar dados estruturados (FAQ) que aparecem em respostas diretas de busca e assistentes de voz."
            >
              <Field
                label="Perguntas frequentes (PT)"
                hint='Uma pergunta e resposta por linha, separadas por " | ". Ex: O que é a People & Growth? | Uma consultoria e um espaço de conteúdo sobre negócios, pessoas e os temas que os impactam.'
              >
                <Textarea name="aeo_faq_pt" rows={6} defaultValue={values.aeo_faq_pt ?? ""} />
              </Field>
            </SectionCard>
          </SectionGrid>
        </div>

        <SubmitButton>Salvar alterações</SubmitButton>
      </form>
    </div>
  );
}
