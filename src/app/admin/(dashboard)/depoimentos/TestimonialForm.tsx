"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { upsertTestimonial } from "./actions";
import type { Testimonial } from "@/types/database.types";

export function TestimonialForm({ item }: { item?: Testimonial }) {
  const action = upsertTestimonial.bind(null, item?.id ?? null);

  return (
    <FormShell title={item ? "Editar depoimento" : "Novo depoimento"} backHref="/admin/depoimentos">
      <form action={action}>
        <Field label="Nome">
          <Input name="name" defaultValue={item?.name} required />
        </Field>
        <Field label="Cargo">
          <Input name="role" defaultValue={item?.role ?? ""} />
        </Field>
        <Field label="Empresa">
          <Input name="company" defaultValue={item?.company ?? ""} />
        </Field>
        <Field label="Depoimento (PT)">
          <Textarea name="text_pt" rows={4} defaultValue={item?.text_pt} required />
        </Field>
        <Field label="Depoimento (EN)">
          <Textarea name="text_en" rows={4} defaultValue={item?.text_en ?? ""} />
        </Field>
        <Field label="Foto (URL do avatar)">
          <Input name="avatar_url" defaultValue={item?.avatar_url ?? ""} />
        </Field>
        <Field label="LinkedIn (URL)">
          <Input name="linkedin_url" defaultValue={item?.linkedin_url ?? ""} />
        </Field>
        <Field label="Avaliação (1-5)">
          <Input name="rating" type="number" min={1} max={5} defaultValue={item?.rating ?? ""} />
        </Field>
        <Field label="Ordem">
          <Input name="order" type="number" defaultValue={item?.order ?? 0} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={item?.status ?? "active"}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </Select>
        </Field>
        <SubmitButton>{item ? "Salvar alterações" : "Criar depoimento"}</SubmitButton>
      </form>
    </FormShell>
  );
}
