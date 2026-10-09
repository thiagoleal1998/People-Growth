"use client";

import { useState } from "react";
import { Field, Input, Select, SubmitButton, FieldGrid } from "@/components/admin/ui";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { CategoriesManager } from "./CategoriesManager";
import { updateSiteConfig } from "./actions";
import type { Category } from "@/types/database.types";

const contactFields: { key: string; label: string; placeholder?: string }[] = [
  { key: "contact_email", label: "E-mail de contato" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+55 11 99999-9999" },
  { key: "linkedin", label: "LinkedIn (URL)" },
  { key: "instagram", label: "Instagram (URL)" },
  { key: "youtube", label: "YouTube (URL do canal)" },
  { key: "x", label: "X / Twitter (URL)" },
  { key: "calendly_url", label: "Link de agendamento (Calendly)" },
];

const homeContentFields: { key: string; label: string; placeholder?: string }[] = [
  { key: "hero_photo", label: "Foto de destaque (URL da imagem)" },
  { key: "hero_video_url", label: "Vídeo institucional (topo da home, ao lado do título — URL do YouTube)", placeholder: "https://www.youtube.com/watch?v=..." },
  { key: "featured_video_url", label: "Vídeo em destaque (URL de embed do YouTube)", placeholder: "https://www.youtube.com/embed/..." },
  { key: "shorts_video_url", label: "Vídeo vertical (Shorts, URL de embed do YouTube)", placeholder: "https://www.youtube.com/shorts/..." },
];

const weatherFields: { key: string; label: string; placeholder?: string }[] = [
  { key: "weather_city_name", label: "Cidade exibida", placeholder: "São Paulo" },
  { key: "weather_lat", label: "Latitude", placeholder: "-23.5505" },
  { key: "weather_lon", label: "Longitude", placeholder: "-46.6333" },
];

const liveFields: { key: string; label: string; placeholder?: string }[] = [
  { key: "live_stream_url", label: "Live (URL de embed do YouTube)", placeholder: "https://www.youtube.com/embed/live_stream?channel=..." },
  { key: "live_caption_pt", label: "Legenda da live", placeholder: "Ex: Thiago Leal comenta os principais temas da semana" },
  { key: "live_replay_url", label: "Replay (URL do YouTube) — aparece na mesma caixa quando não estiver ao vivo", placeholder: "https://www.youtube.com/watch?v=..." },
];

const tabs = [
  { id: "identidade", label: "Identidade visual" },
  { id: "tecnico", label: "Dados técnicos" },
  { id: "contato", label: "Contato" },
  { id: "home", label: "Conteúdo da home" },
  { id: "topo", label: "Barra de topo" },
  { id: "live", label: "Transmissão ao vivo" },
  { id: "eleicoes", label: "Eleições 2026" },
  { id: "esportes", label: "Esportes" },
  { id: "categorias", label: "Categorias" },
  { id: "secoes", label: "Seções do site" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const panelStyle = { backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" } as const;

export function ConfiguracoesTabs({
  values,
  categories,
  articleCounts,
  logoError,
  faviconError,
}: {
  values: Record<string, string>;
  categories: Category[];
  articleCounts: Record<string, number>;
  logoError?: string;
  faviconError?: string;
}) {
  const [active, setActive] = useState<TabId>("identidade");

  return (
    <div>
      {/* Categories live outside the site_config form (their own table, saved
          immediately per row) — the tab nav sits above both so switching tabs
          never touches either. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-border)", paddingBottom: "1rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: `1px solid ${active === tab.id ? "#4361EE" : "var(--admin-border-strong)"}`,
              backgroundColor: active === tab.id ? "rgba(67,97,238,0.1)" : "var(--admin-surface)",
              color: active === tab.id ? "#4361EE" : "var(--admin-text-secondary)",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form action={updateSiteConfig} style={{ maxWidth: "1400px" }}>
        <div style={{ display: active === "identidade" ? "block" : "none" }}>
          <div style={panelStyle}>
            <FieldGrid>
              <Field label="Logo do cabeçalho" hint="Aparece ao lado do nome People & Growth no topo do site. PNG, JPG, WEBP, SVG ou GIF, até 5MB.">
                {values.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={values.logo_url} alt="Logo atual" style={{ height: "2.5rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.25rem" }} />
                )}
                <input className="admin-file-input" type="file" name="logo_file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" />
                <ErrorBanner message={logoError} />
              </Field>

              <Field label="Favicon" hint="Ícone que aparece na aba do navegador. Ideal: PNG ou SVG quadrado, fundo transparente.">
                {values.favicon_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={values.favicon_url} alt="Favicon atual" style={{ height: "2rem", width: "2rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.25rem" }} />
                )}
                <input className="admin-file-input" type="file" name="favicon_file" accept="image/png,image/x-icon,image/svg+xml" />
                <ErrorBanner message={faviconError} />
              </Field>
            </FieldGrid>
          </div>
        </div>

        <div style={{ display: active === "tecnico" ? "block" : "none" }}>
          <div style={panelStyle}>
            <Field label="URL do site" hint="Ex: https://people-growth.vercel.app — sem barra no final.">
              <Input name="site_url" defaultValue={values.site_url ?? ""} />
            </Field>
          </div>
        </div>

        <div style={{ display: active === "contato" ? "block" : "none" }}>
          <div style={panelStyle}>
            <FieldGrid>
              {contactFields.map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
                </Field>
              ))}
            </FieldGrid>
          </div>
        </div>

        <div style={{ display: active === "home" ? "block" : "none" }}>
          <div style={panelStyle}>
            <FieldGrid>
              {homeContentFields.map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
                </Field>
              ))}
            </FieldGrid>
          </div>
        </div>

        <div style={{ display: active === "topo" ? "block" : "none" }}>
          <div style={panelStyle}>
            <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.125rem" }}>
              Cotação de dólar/euro, previsão do tempo e busca, exibidas acima do menu em todo o site. Encontre a latitude/longitude da cidade em latlong.net.
            </p>
            <FieldGrid>
              {weatherFields.map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
                </Field>
              ))}
            </FieldGrid>
          </div>
        </div>

        <div style={{ display: active === "live" ? "block" : "none" }}>
          <div style={panelStyle}>
            <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.125rem" }}>Controla a caixa AO VIVO que aparece na home durante a transmissão de sábado.</p>
            <Field label="Mostrar a caixa na home?" hint="Desative para tirar a caixa da home.">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                <input type="checkbox" name="is_live" defaultChecked={values.is_live === "true"} />
                Sim, mostrar a caixa na home
              </label>
            </Field>
            <Field label="Tipo da caixa" hint="Ao vivo mostra a URL da live e o selo AO VIVO; Replay mostra a URL do replay e o título Replay.">
              <Select name="live_box_type" defaultValue={values.live_box_type === "replay" ? "replay" : "live"}>
                <option value="live">Ao vivo</option>
                <option value="replay">Replay</option>
              </Select>
            </Field>
            <FieldGrid>
              {liveFields.map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <Input name={key} defaultValue={values[key] ?? ""} placeholder={placeholder} />
                </Field>
              ))}
            </FieldGrid>
          </div>
        </div>

        <div style={{ display: active === "eleicoes" ? "block" : "none" }}>
          <div style={panelStyle}>
            <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.125rem" }}>Bloco de apuração na home, com os dados oficiais do TSE.</p>
            <Field label="Mostrar o bloco de eleições na home?" hint="Desative depois da eleição para tirar o bloco da home. A página /eleicoes continua disponível.">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                <input type="checkbox" name="tse_widget_enabled" defaultChecked={values.tse_widget_enabled !== "false"} />
                Sim, mostrar o bloco de eleições
              </label>
            </Field>
          </div>
        </div>

        <div style={{ display: active === "esportes" ? "block" : "none" }}>
          <div style={panelStyle}>
            <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.125rem" }}>
              Jogos ao vivo (API-Football) e classificação top 5 (TheSportsDB) do Brasileirão na home — requer as variáveis de ambiente API_FOOTBALL_KEY e, opcionalmente, THESPORTSDB_KEY. Tabela completa e próximos jogos de vários dias ainda não têm fonte gratuita confiável.
            </p>
            <Field label="Mostrar o bloco de esportes na home?" hint="A página /esportes continua disponível mesmo com o bloco desligado.">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                <input type="checkbox" name="sports_widget_enabled" defaultChecked={values.sports_widget_enabled !== "false"} />
                Sim, mostrar o bloco de esportes
              </label>
            </Field>
          </div>
        </div>

        <div style={{ display: active === "categorias" ? "block" : "none" }}>
          <div style={panelStyle}>
            <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.125rem" }}>
              Categorias usadas nos artigos, na barra de categorias e nas páginas de conteúdo. Mudanças aqui salvam na hora, sem precisar clicar em &quot;Salvar alterações&quot; no fim da página.
            </p>
            <CategoriesManager categories={categories} articleCounts={articleCounts} />
          </div>
        </div>

        <div style={{ display: active === "secoes" ? "block" : "none" }}>
          <div style={panelStyle}>
            <Field label="Mostrar a seção Na Mídia?" hint="Desative para ocultar a seção na home, o link no menu/rodapé e a página /na-midia, sem apagar as menções cadastradas.">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                <input type="checkbox" name="media_enabled" defaultChecked={values.media_enabled !== "false"} />
                Sim, mostrar a seção Na Mídia
              </label>
            </Field>
            <Field label='Mostrar a seção "O que dizem sobre o nosso trabalho"?' hint="Desative para ocultar os depoimentos na home, sem apagar os cadastrados.">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                <input type="checkbox" name="testimonials_enabled" defaultChecked={values.testimonials_enabled !== "false"} />
                Sim, mostrar os depoimentos
              </label>
            </Field>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <SubmitButton>Salvar alterações</SubmitButton>
        </div>
      </form>
    </div>
  );
}
