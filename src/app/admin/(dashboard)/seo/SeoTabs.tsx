"use client";

import { useState } from "react";
import { Field, Input, Textarea, SubmitButton, FieldGrid } from "@/components/admin/ui";

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

const tabs = [
  { id: "seo", label: "SEO" },
  { id: "geo", label: "GEO" },
  { id: "aeo", label: "AEO" },
  { id: "analytics", label: "Analytics" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SeoTabs({
  values,
  action,
}: {
  values: Record<string, string>;
  action: (formData: FormData) => void;
}) {
  const [active, setActive] = useState<TabId>("seo");

  return (
    <form action={action} style={{ maxWidth: "900px" }}>
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.75rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={{
              padding: "0.75rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: active === tab.id ? "#4361EE" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: active === tab.id ? "2px solid #4361EE" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}
      >
        <div style={{ display: active === "seo" ? "block" : "none" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.375rem" }}>
            Otimização para buscadores tradicionais (Google, Bing).
          </p>
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
        </div>

        <div style={{ display: active === "geo" ? "block" : "none" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.375rem" }}>
            Generative Engine Optimization — como assistentes de IA descrevem a marca. O robots.txt do site já permite o acesso de crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, etc).
          </p>
          <FieldGrid>
            {geoFields.map(({ key, label, hint }) => (
              <Field key={key} label={label} hint={hint}>
                <Textarea name={key} rows={3} defaultValue={values[key] ?? ""} />
              </Field>
            ))}
          </FieldGrid>
        </div>

        <div style={{ display: active === "aeo" ? "block" : "none" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.375rem" }}>
            Answer Engine Optimization — perguntas e respostas usadas para gerar dados estruturados (FAQ) que aparecem em respostas diretas de busca e assistentes de voz.
          </p>
          <FieldGrid>
            <Field
              label="Perguntas frequentes (PT)"
              hint='Uma pergunta e resposta por linha, separadas por " | ". Ex: O que é a People & Growth? | Uma consultoria e um espaço de conteúdo sobre negócios, pessoas e os temas que os impactam.'
            >
              <Textarea name="aeo_faq_pt" rows={8} defaultValue={values.aeo_faq_pt ?? ""} />
            </Field>
            <Field
              label="Perguntas frequentes (EN)"
              hint="Deixe em branco para usar as mesmas perguntas em português também na versão em inglês do site."
            >
              <Textarea name="aeo_faq_en" rows={8} defaultValue={values.aeo_faq_en ?? ""} />
            </Field>
          </FieldGrid>
        </div>

        <div style={{ display: active === "analytics" ? "block" : "none" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.375rem" }}>
            Métricas de audiência do site.
          </p>
          <Field
            label="ID de métricas do Google Analytics (GA4)"
            hint="Encontrado em Admin > Fluxos de dados no Google Analytics. Deixe em branco para não carregar o Analytics no site."
          >
            <Input name="ga4_measurement_id" defaultValue={values.ga4_measurement_id ?? ""} placeholder="G-XXXXXXXXXX" />
          </Field>
          <Field
            label="Meta Pixel ID (Facebook/Instagram Ads)"
            hint="Encontrado no Gerenciador de Eventos do Meta Business. Necessário para remarketing em anúncios de Facebook/Instagram."
          >
            <Input name="meta_pixel_id" defaultValue={values.meta_pixel_id ?? ""} placeholder="123456789012345" />
          </Field>
          <Field
            label="LinkedIn Insight Tag — Partner ID"
            hint="Encontrado no LinkedIn Campaign Manager, em Ferramentas de Conta > Insight Tag. Necessário para remarketing em anúncios de LinkedIn."
          >
            <Input name="linkedin_partner_id" defaultValue={values.linkedin_partner_id ?? ""} placeholder="1234567" />
          </Field>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <SubmitButton>Salvar alterações</SubmitButton>
      </div>
    </form>
  );
}
