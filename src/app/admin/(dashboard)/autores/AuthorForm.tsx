"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { upsertAuthor } from "./actions";
import type { Author } from "@/types/database.types";

export function AuthorForm({ item }: { item?: Author }) {
  const action = upsertAuthor.bind(null, item?.id ?? null);

  return (
    <FormShell title={item ? "Editar autor" : "Novo autor"} backHref="/admin/autores">
      <form action={action}>
        <Field label="Nome">
          <Input name="name" defaultValue={item?.name} required />
        </Field>
        <Field label="Slug" hint="Usado na URL da página do autor — deixe em branco para gerar automaticamente">
          <Input name="slug" defaultValue={item?.slug ?? ""} />
        </Field>
        <Field label="Cargo/tagline (PT)" hint='Ex: "Especialista em Growth e Dados"'>
          <Input name="role_pt" defaultValue={item?.role_pt ?? ""} />
        </Field>
        <Field label="Cargo/tagline (EN)">
          <Input name="role_en" defaultValue={item?.role_en ?? ""} />
        </Field>
        <Field label="Bio (PT)">
          <Textarea name="bio_pt" rows={4} defaultValue={item?.bio_pt ?? ""} />
        </Field>
        <Field label="Bio (EN)">
          <Textarea name="bio_en" rows={4} defaultValue={item?.bio_en ?? ""} />
        </Field>
        <Field label="Foto (URL)">
          <Input name="photo_url" defaultValue={item?.photo_url ?? ""} />
        </Field>
        <Field label="E-mail">
          <Input name="email" type="email" defaultValue={item?.email ?? ""} />
        </Field>
        <Field label="LinkedIn (URL)">
          <Input name="linkedin_url" defaultValue={item?.linkedin_url ?? ""} />
        </Field>
        <Field label="Instagram (URL)">
          <Input name="instagram_url" defaultValue={item?.instagram_url ?? ""} />
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
        <SubmitButton>{item ? "Salvar alterações" : "Criar autor"}</SubmitButton>
      </form>
    </FormShell>
  );
}
