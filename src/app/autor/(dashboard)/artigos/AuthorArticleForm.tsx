"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { upsertOwnArticle } from "./actions";
import type { Article, Category } from "@/types/database.types";

export function AuthorArticleForm({ item, categories, imageError }: { item?: Article; categories: Category[]; imageError?: string }) {
  const action = upsertOwnArticle.bind(null, item?.id ?? null);

  return (
    <FormShell title={item ? "Editar artigo" : "Novo artigo"} backHref="/autor">
      <form action={action}>
        <Field label="Título (PT)">
          <Input name="title_pt" defaultValue={item?.title_pt} required />
        </Field>
        <Field label="Título (EN)">
          <Input name="title_en" defaultValue={item?.title_en ?? ""} />
        </Field>
        <Field label="Slug" hint="Deixe em branco para gerar automaticamente">
          <Input name="slug" defaultValue={item?.slug ?? ""} />
        </Field>
        <Field label="Tipo de conteúdo" hint="Notícia: reportagem/atualidade. Opinião: aparece com a tag Mea Sententia.">
          <Select name="format" defaultValue={item?.format ?? "opiniao"}>
            <option value="opiniao">Opinião (Mea Sententia)</option>
            <option value="noticia">Notícia</option>
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
        <Field label="Linha fina / subtítulo (PT)" hint="Aparece nas listagens e cards de artigos — não é o Resumo em destaque abaixo.">
          <Textarea name="excerpt_pt" rows={2} defaultValue={item?.excerpt_pt ?? ""} />
        </Field>
        <Field label="Linha fina / subtítulo (EN)">
          <Textarea name="excerpt_en" rows={2} defaultValue={item?.excerpt_en ?? ""} />
        </Field>
        <Field label="Resumo em destaque (PT)" hint='Opcional. Aparece numa caixa "Resumo" expansível, no início do artigo. Deixe em branco para não mostrar essa caixa.'>
          <Textarea name="summary_pt" rows={3} defaultValue={item?.summary_pt ?? ""} />
        </Field>
        <Field label="Resumo em destaque (EN)">
          <Textarea name="summary_en" rows={3} defaultValue={item?.summary_en ?? ""} />
        </Field>
        <Field
          label="Conteúdo (PT)"
          hint='Suporta markdown simples: **negrito**, [link](url), ## subtítulo, listas com "- " ou "1. ", e citação em destaque com "> texto" (opcionalmente seguido de "> — Autor da frase" numa linha própria).'
        >
          <Textarea name="content_pt" rows={12} defaultValue={item?.content_pt} required />
        </Field>
        <Field label="Conteúdo (EN)">
          <Textarea name="content_en" rows={12} defaultValue={item?.content_en ?? ""} />
        </Field>
        <Field label="Vídeo (URL do YouTube)" hint="Opcional — vira o visual principal do artigo, no lugar da imagem de capa. Mesmo assim, cadastre uma imagem de capa abaixo: ela é usada como miniatura ao compartilhar o link.">
          <Input name="video_url" defaultValue={item?.video_url ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
        </Field>
        <Field label="Imagem de capa" hint="PNG, JPG ou WEBP — convertida automaticamente para WebP e comprimida para menos de 1MB.">
          {item?.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover_image}
              alt="Capa atual"
              style={{ maxHeight: "6rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0" }}
            />
          )}
          <input type="file" name="cover_image_file" accept="image/png,image/jpeg,image/webp" />
          <input type="hidden" name="current_cover_image" value={item?.cover_image ?? ""} />
          <ErrorBanner message={imageError} />
        </Field>
        <Field label="Legenda da imagem" hint="Descrição curta exibida junto da foto no início do artigo.">
          <Input name="cover_image_caption" defaultValue={item?.cover_image_caption ?? ""} />
        </Field>
        <Field label="Crédito da imagem" hint="Fotógrafo ou fonte da imagem.">
          <Input name="cover_image_credit" defaultValue={item?.cover_image_credit ?? ""} />
        </Field>
        <Field
          label="Status"
          hint="Você não publica diretamente — um admin revisa e publica. Rascunho fica só com você; Pendente entra na fila de revisão."
        >
          <Select name="status" defaultValue={item?.status === "pending" ? "pending" : "draft"}>
            <option value="draft">Rascunho</option>
            <option value="pending">Enviar para revisão</option>
          </Select>
        </Field>
        <SubmitButton>{item ? "Salvar alterações" : "Criar artigo"}</SubmitButton>
      </form>
    </FormShell>
  );
}
