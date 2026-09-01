"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { upsertArticle } from "./actions";
import type { Article, Category, Author } from "@/types/database.types";

export function ArticleForm({ item, categories, authors }: { item?: Article; categories: Category[]; authors: Author[] }) {
  const action = upsertArticle.bind(null, item?.id ?? null);

  return (
    <FormShell title={item ? "Editar artigo" : "Novo artigo"} backHref="/admin/artigos">
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
        <Field label="Resumo (PT)">
          <Textarea name="excerpt_pt" rows={2} defaultValue={item?.excerpt_pt ?? ""} />
        </Field>
        <Field label="Resumo (EN)">
          <Textarea name="excerpt_en" rows={2} defaultValue={item?.excerpt_en ?? ""} />
        </Field>
        <Field label="Conteúdo (PT)" hint="Suporta markdown simples">
          <Textarea name="content_pt" rows={12} defaultValue={item?.content_pt} required />
        </Field>
        <Field label="Conteúdo (EN)">
          <Textarea name="content_en" rows={12} defaultValue={item?.content_en ?? ""} />
        </Field>
        <Field label="Imagem de capa (URL)">
          <Input name="cover_image" defaultValue={item?.cover_image ?? ""} />
        </Field>
        <Field label="SEO — título (PT)">
          <Input name="seo_title_pt" defaultValue={item?.seo_title_pt ?? ""} />
        </Field>
        <Field label="SEO — descrição (PT)">
          <Textarea name="seo_desc_pt" rows={2} defaultValue={item?.seo_desc_pt ?? ""} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={item?.status ?? "draft"}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </Select>
        </Field>
        <SubmitButton>{item ? "Salvar alterações" : "Criar artigo"}</SubmitButton>
      </form>
    </FormShell>
  );
}
