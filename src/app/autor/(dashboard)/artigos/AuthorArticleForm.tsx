"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { upsertOwnArticle } from "./actions";
import type { Article, Category } from "@/types/database.types";

export function AuthorArticleForm({ item, categories }: { item?: Article; categories: Category[] }) {
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
