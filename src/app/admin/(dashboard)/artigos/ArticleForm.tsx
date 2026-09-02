"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, Input, Textarea, Select, SubmitButton, FieldGrid } from "@/components/admin/ui";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { upsertArticle } from "./actions";
import type { Article, Category, Author } from "@/types/database.types";

const tabs = [
  { id: "conteudo", label: "Conteúdo" },
  { id: "detalhes", label: "Detalhes" },
  { id: "seo", label: "SEO" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ArticleForm({
  item,
  categories,
  authors,
  imageError,
}: {
  item?: Article;
  categories: Category[];
  authors: Author[];
  imageError?: string;
}) {
  const action = upsertArticle.bind(null, item?.id ?? null);
  const [active, setActive] = useState<TabId>("conteudo");

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/artigos" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
          &larr; Voltar
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", marginTop: "0.5rem" }}>
          {item ? "Editar artigo" : "Novo artigo"}
        </h1>
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
              <Input name="title_pt" defaultValue={item?.title_pt} required />
            </Field>
            <Field label="Título (EN)">
              <Input name="title_en" defaultValue={item?.title_en ?? ""} />
            </Field>
            <FieldGrid>
              <Field label="Resumo (PT)">
                <Textarea name="excerpt_pt" rows={2} defaultValue={item?.excerpt_pt ?? ""} />
              </Field>
              <Field label="Resumo (EN)">
                <Textarea name="excerpt_en" rows={2} defaultValue={item?.excerpt_en ?? ""} />
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label="Conteúdo (PT)" hint="Suporta markdown simples">
                <Textarea name="content_pt" rows={14} defaultValue={item?.content_pt} required />
              </Field>
              <Field label="Conteúdo (EN)">
                <Textarea name="content_en" rows={14} defaultValue={item?.content_en ?? ""} />
              </Field>
            </FieldGrid>
            <Field label="Vídeo (URL do YouTube)" hint="Opcional — aparece embutido no topo do artigo, antes do texto.">
              <Input name="video_url" defaultValue={item?.video_url ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
            </Field>
          </div>

          <div style={{ display: active === "detalhes" ? "block" : "none" }}>
            <FieldGrid>
              <Field label="Slug" hint="Deixe em branco para gerar automaticamente">
                <Input name="slug" defaultValue={item?.slug ?? ""} />
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue={item?.status ?? "draft"}>
                  <option value="draft">Rascunho</option>
                  <option value="pending">Pendente (aguardando revisão)</option>
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
              <input type="file" name="cover_image_file" accept="image/png,image/jpeg,image/webp" />
              <input type="hidden" name="current_cover_image" value={item?.cover_image ?? ""} />
              <ErrorBanner message={imageError} />
            </Field>
          </div>

          <div style={{ display: active === "seo" ? "block" : "none" }}>
            <Field label="SEO — título (PT)">
              <Input name="seo_title_pt" defaultValue={item?.seo_title_pt ?? ""} />
            </Field>
            <Field label="SEO — descrição (PT)">
              <Textarea name="seo_desc_pt" rows={2} defaultValue={item?.seo_desc_pt ?? ""} />
            </Field>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <SubmitButton>{item ? "Salvar alterações" : "Criar artigo"}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
