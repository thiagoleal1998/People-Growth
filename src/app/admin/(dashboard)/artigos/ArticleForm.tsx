"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Field, Input, Textarea, Select, SubmitButton, FieldGrid } from "@/components/admin/ui";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { DateTimePicker } from "@/components/admin/DateTimePicker";
import { SeoPreview } from "@/components/admin/SeoPreview";
import { SavedToast } from "@/components/admin/SavedToast";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { upsertArticle } from "./actions";
import type { Article, Category, Author } from "@/types/database.types";

const tabs = [
  { id: "conteudo", label: "Conteúdo" },
  { id: "detalhes", label: "Detalhes" },
  { id: "seo", label: "SEO" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function slugifyPreview(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ArticleForm({
  item,
  categories,
  authors,
  imageError,
  saved,
}: {
  item?: Article;
  categories: Category[];
  authors: Author[];
  imageError?: string;
  saved?: boolean;
}) {
  const action = upsertArticle.bind(null, item?.id ?? null);
  const [active, setActive] = useState<TabId>("conteudo");
  const [titlePt, setTitlePt] = useState(item?.title_pt ?? "");
  const [excerptPt, setExcerptPt] = useState(item?.excerpt_pt ?? "");
  const [seoTitlePt, setSeoTitlePt] = useState(item?.seo_title_pt ?? "");
  const [seoDescPt, setSeoDescPt] = useState(item?.seo_desc_pt ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");

  const previewUrl = `peoplegrowth.com.br › mea-sententia › ${slug || slugifyPreview(titlePt) || "..."}`;

  return (
    <div style={{ maxWidth: "900px" }}>
      <SavedToast show={Boolean(saved)} />
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <Link href="/admin/artigos" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
            &larr; Voltar
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", marginTop: "0.5rem" }}>
            {item ? "Editar artigo" : "Novo artigo"}
          </h1>
        </div>
        {item && (
          <Link
            href={`/admin/artigos/${item.id}/preview`}
            target="_blank"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border-strong)", color: "var(--admin-text)", padding: "0.625rem 1.125rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", flexShrink: 0 }}
          >
            <Eye size={16} /> Visualizar
          </Link>
        )}
      </div>

      <form action={action}>
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

        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
          <div style={{ display: active === "conteudo" ? "block" : "none" }}>
            <Field label="Título (PT)">
              <Input name="title_pt" value={titlePt} onChange={(e) => setTitlePt(e.target.value)} required />
            </Field>
            <Field label="Título (EN)">
              <Input name="title_en" defaultValue={item?.title_en ?? ""} />
            </Field>
            <FieldGrid>
              <Field label="Linha fina / subtítulo (PT)" hint="Aparece nas listagens, cards de artigos e como descrição em buscadores — não é o Resumo em destaque abaixo.">
                <Textarea name="excerpt_pt" rows={2} value={excerptPt} onChange={(e) => setExcerptPt(e.target.value)} />
              </Field>
              <Field label="Linha fina / subtítulo (EN)">
                <Textarea name="excerpt_en" rows={2} defaultValue={item?.excerpt_en ?? ""} />
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label="Resumo em destaque (PT)" hint='Opcional. Aparece numa caixa "Resumo" expansível, no início do artigo. Deixe em branco para não mostrar essa caixa.'>
                <Textarea name="summary_pt" rows={3} defaultValue={item?.summary_pt ?? ""} />
              </Field>
              <Field label="Resumo em destaque (EN)">
                <Textarea name="summary_en" rows={3} defaultValue={item?.summary_en ?? ""} />
              </Field>
            </FieldGrid>

            <Field
              label="Conteúdo (PT)"
              hint='Use a barra de ferramentas para negrito, subtítulo, listas, citação, link e imagem — ou digite direto: **negrito**, [link](url), ## subtítulo, "- " para lista, "> texto" para citação (com "> — Autor" numa linha própria, opcional).'
            >
              <MarkdownEditor name="content_pt" defaultValue={item?.content_pt ?? ""} required />
            </Field>
            <Field label="Conteúdo (EN)">
              <MarkdownEditor name="content_en" defaultValue={item?.content_en ?? ""} minHeight={280} />
            </Field>

            <Field label="Vídeo (URL do YouTube)" hint="Opcional — vira o visual principal do artigo, no lugar da imagem de capa. Mesmo assim, cadastre uma imagem de capa na aba Detalhes: ela é usada como miniatura ao compartilhar o link.">
              <Input name="video_url" defaultValue={item?.video_url ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
            </Field>
          </div>

          <div style={{ display: active === "detalhes" ? "block" : "none" }}>
            <FieldGrid>
              <Field label="Slug" hint="Deixe em branco para gerar automaticamente">
                <Input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugifyPreview(titlePt)} />
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue={item?.status ?? "draft"}>
                  <option value="draft">Rascunho</option>
                  <option value="pending">Pendente (aguardando revisão)</option>
                  <option value="scheduled">Agendado (publica sozinho na data)</option>
                  <option value="published">Publicado</option>
                </Select>
              </Field>
              <Field label="Tipo de conteúdo" hint="Notícia: reportagem/atualidade. Opinião: aparece com a tag Mea Sententia.">
                <Select name="format" defaultValue={item?.format ?? "noticia"}>
                  <option value="noticia">Notícia</option>
                  <option value="opiniao">Opinião (Mea Sententia)</option>
                </Select>
              </Field>
              <Field label="Categoria">
                <Select name="category_id" defaultValue={item?.category_id ?? ""}>
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_pt}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Autor">
                <Select name="author_id" defaultValue={item?.author_id ?? ""}>
                  <option value="">Sem autor definido</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Data de publicação agendada" hint='Usada quando o status acima é "Agendado" — o artigo vai ao ar sozinho a partir dessa data.'>
                <DateTimePicker name="scheduled_for" defaultValue={item?.scheduled_for} />
              </Field>
            </FieldGrid>
            <Field label="Imagem de capa" hint="PNG, JPG ou WEBP — convertida automaticamente para WebP e comprimida para menos de 1MB.">
              {item?.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover_image}
                  alt="Capa atual"
                  style={{ maxHeight: "6rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border)" }}
                />
              )}
              <input className="admin-file-input" type="file" name="cover_image_file" accept="image/png,image/jpeg,image/webp" />
              <input type="hidden" name="current_cover_image" value={item?.cover_image ?? ""} />
              <ErrorBanner message={imageError} />
            </Field>
            <FieldGrid>
              <Field label="Legenda da imagem" hint="Descrição curta exibida junto da foto no início do artigo.">
                <Input name="cover_image_caption" defaultValue={item?.cover_image_caption ?? ""} />
              </Field>
              <Field label="Crédito da imagem" hint="Fotógrafo ou fonte da imagem.">
                <Input name="cover_image_credit" defaultValue={item?.cover_image_credit ?? ""} />
              </Field>
            </FieldGrid>
          </div>

          <div style={{ display: active === "seo" ? "block" : "none" }}>
            <Field label="SEO — título (PT)" hint="Deixe em branco para usar o título do artigo.">
              <Input name="seo_title_pt" value={seoTitlePt} onChange={(e) => setSeoTitlePt(e.target.value)} maxLength={70} />
            </Field>
            <Field label="SEO — descrição (PT)" hint="Deixe em branco para usar a linha fina / subtítulo.">
              <Textarea name="seo_desc_pt" rows={2} value={seoDescPt} onChange={(e) => setSeoDescPt(e.target.value)} maxLength={170} />
            </Field>

            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "0.625rem" }}>
                Como aparece no Google
              </div>
              <SeoPreview url={previewUrl} title={seoTitlePt || titlePt} description={seoDescPt || excerptPt} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <SubmitButton>{item ? "Salvar alterações" : "Criar artigo"}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
