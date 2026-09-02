"use client";

import { useState } from "react";
import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { upsertAuthor } from "./actions";
import type { Author } from "@/types/database.types";

const TAGLINE_MAX = 80;

function TaglineField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const remaining = TAGLINE_MAX - value.length;

  return (
    <Field
      label={label}
      hint={`Aparece na tira de colunistas, no lugar do cargo. ${remaining} caractere${remaining === 1 ? "" : "s"} restante${remaining === 1 ? "" : "s"}.`}
    >
      <Textarea
        name={name}
        rows={2}
        maxLength={TAGLINE_MAX}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ borderColor: remaining < 0 ? "#ef4444" : undefined }}
      />
    </Field>
  );
}

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
        <TaglineField name="tagline_pt" label="Frase de destaque (PT)" defaultValue={item?.tagline_pt ?? ""} />
        <TaglineField name="tagline_en" label="Frase de destaque (EN)" defaultValue={item?.tagline_en ?? ""} />
        <Field label="Cargo (PT)" hint='Usado como reserva quando não há frase de destaque nem artigo publicado. Ex: "Especialista em Growth e Dados"'>
          <Input name="role_pt" defaultValue={item?.role_pt ?? ""} />
        </Field>
        <Field label="Cargo (EN)">
          <Input name="role_en" defaultValue={item?.role_en ?? ""} />
        </Field>
        <Field label="Bio (PT)">
          <Textarea name="bio_pt" rows={4} defaultValue={item?.bio_pt ?? ""} />
        </Field>
        <Field label="Bio (EN)">
          <Textarea name="bio_en" rows={4} defaultValue={item?.bio_en ?? ""} />
        </Field>
        <Field
          label="Trajetória / Marcos (PT)"
          hint='Aparece na página "Sobre" da pessoa. Um marco por linha, no formato "Ano | Descrição". Ex: 2022 | Fundou a People & Growth'
        >
          <Textarea name="milestones_pt" rows={4} defaultValue={item?.milestones_pt ?? ""} placeholder={"2022 | Fundou a People & Growth\n2024 | Fundou a Neuro Botics"} />
        </Field>
        <Field label="Trajetória / Marcos (EN)" hint='Mesmo formato: "Year | Description".'>
          <Textarea name="milestones_en" rows={4} defaultValue={item?.milestones_en ?? ""} />
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
