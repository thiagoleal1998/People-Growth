"use client";

import { FormShell, Field, Input, Select, SubmitButton, ConfirmDeleteButton } from "@/components/admin/ui";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { upsertInstitutionalPost, deleteInstitutionalPost } from "./actions";
import type { Columnist, InstitutionalPost } from "@/types/database.types";

export function InstitutionalPostForm({ item, columnists }: { item?: InstitutionalPost; columnists: Columnist[] }) {
  const action = upsertInstitutionalPost.bind(null, item?.id ?? null);
  const backHref = "/admin/institucional";

  return (
    <FormShell
      title={item ? "Editar post institucional" : "Novo post institucional"}
      backHref={backHref}
      maxWidth="820px"
      action={item && <ConfirmDeleteButton confirmText={`Excluir o post "${item.title_pt}"?`} onDelete={deleteInstitutionalPost.bind(null, item.id)} />}
    >
      <form action={action}>
        <Field label="Título (PT)">
          <Input name="title_pt" defaultValue={item?.title_pt ?? ""} required />
        </Field>
        <Field label="Título (EN)" hint="Deixe em branco para usar o título em português.">
          <Input name="title_en" defaultValue={item?.title_en ?? ""} />
        </Field>
        <Field label="Slug (URL)" hint="Deixe em branco para gerar a partir do título.">
          <Input name="slug" defaultValue={item?.slug ?? ""} placeholder="ex: carta-ao-leitor-2026" />
        </Field>

        <Field label="Assinado por" hint="Deixe em 'Grupo Festina' para um comunicado sem assinatura de uma pessoa específica.">
          <Select name="author_columnist_id" defaultValue={item?.author_columnist_id ?? ""}>
            <option value="">— Grupo Festina (sem assinatura) —</option>
            {columnists.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Status">
          <Select name="status" defaultValue={item?.status ?? "draft"}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </Select>
        </Field>

        <Field label="Resumo (PT)" hint="Aparece no card do feed e como descrição para buscadores/redes sociais.">
          <Input name="excerpt_pt" defaultValue={item?.excerpt_pt ?? ""} />
        </Field>
        <Field label="Resumo (EN)">
          <Input name="excerpt_en" defaultValue={item?.excerpt_en ?? ""} />
        </Field>

        <Field label="Imagem de capa (URL)" hint="Opcional.">
          <Input name="cover_image" defaultValue={item?.cover_image ?? ""} placeholder="https://..." />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
          <Field label="Legenda da imagem">
            <Input name="cover_image_caption" defaultValue={item?.cover_image_caption ?? ""} />
          </Field>
          <Field label="Crédito da imagem">
            <Input name="cover_image_credit" defaultValue={item?.cover_image_credit ?? ""} />
          </Field>
        </div>

        <Field label="Conteúdo (PT)">
          <MarkdownEditor name="body_pt" defaultValue={item?.body_pt ?? ""} minHeight={420} />
        </Field>
        <Field label="Conteúdo (EN)" hint="Deixe em branco para usar o conteúdo em português também na versão em inglês do site.">
          <MarkdownEditor name="body_en" defaultValue={item?.body_en ?? ""} minHeight={300} />
        </Field>

        <SubmitButton>{item ? "Salvar alterações" : "Criar"}</SubmitButton>
      </form>
    </FormShell>
  );
}
