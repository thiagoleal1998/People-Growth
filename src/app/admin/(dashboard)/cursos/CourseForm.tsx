"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { upsertCourse } from "./actions";
import type { Course } from "@/types/database.types";

export function CourseForm({ item }: { item?: Course }) {
  const action = upsertCourse.bind(null, item?.id ?? null);

  return (
    <FormShell title={item ? "Editar curso" : "Novo curso"} backHref="/admin/cursos">
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
        <Field label="Descrição (PT)">
          <Textarea name="description_pt" rows={3} defaultValue={item?.description_pt ?? ""} />
        </Field>
        <Field label="Descrição (EN)">
          <Textarea name="description_en" rows={3} defaultValue={item?.description_en ?? ""} />
        </Field>
        <Field label="Categoria">
          <Input name="category" defaultValue={item?.category ?? ""} placeholder="Ex: Estratégia, IA, Marketing" />
        </Field>
        <Field label="Capa (URL da imagem)">
          <Input name="cover_image" defaultValue={item?.cover_image ?? ""} />
        </Field>
        <Field label="Preço (R$)">
          <Input name="price" type="number" step="0.01" defaultValue={item?.price ?? ""} />
        </Field>
        <Field label="Ordem">
          <Input name="order" type="number" defaultValue={item?.order ?? 0} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={item?.status ?? "coming_soon"}>
            <option value="coming_soon">Em breve</option>
            <option value="active">Ativo</option>
            <option value="draft">Rascunho</option>
          </Select>
        </Field>
        <SubmitButton>{item ? "Salvar alterações" : "Criar curso"}</SubmitButton>
      </form>
    </FormShell>
  );
}
