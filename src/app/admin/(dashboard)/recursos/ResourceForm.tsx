"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { upsertResource } from "./actions";
import type { Resource } from "@/types/database.types";

const types: { value: Resource["type"]; label: string }[] = [
  { value: "ebook", label: "E-book" },
  { value: "template", label: "Template" },
  { value: "guide", label: "Guia" },
  { value: "checklist", label: "Checklist" },
  { value: "prompt", label: "Prompt" },
];

export function ResourceForm({ item }: { item?: Resource }) {
  const action = upsertResource.bind(null, item?.id ?? null);

  return (
    <FormShell title={item ? "Editar recurso" : "Novo recurso"} backHref="/admin/recursos">
      <form action={action}>
        <Field label="Título (PT)">
          <Input name="title_pt" defaultValue={item?.title_pt} required />
        </Field>
        <Field label="Título (EN)">
          <Input name="title_en" defaultValue={item?.title_en ?? ""} />
        </Field>
        <Field label="Descrição (PT)">
          <Textarea name="description_pt" rows={3} defaultValue={item?.description_pt ?? ""} />
        </Field>
        <Field label="Descrição (EN)">
          <Textarea name="description_en" rows={3} defaultValue={item?.description_en ?? ""} />
        </Field>
        <Field label="Tipo">
          <Select name="type" defaultValue={item?.type ?? "ebook"}>
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Arquivo (URL para download)">
          <Input name="file_url" defaultValue={item?.file_url ?? ""} />
        </Field>
        <Field label="Capa (URL da imagem)">
          <Input name="cover_image" defaultValue={item?.cover_image ?? ""} />
        </Field>
        <Field label="Exige cadastro de lead para baixar?">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
            <input type="checkbox" name="lead_required" defaultChecked={item?.lead_required ?? true} />
            Sim, pedir e-mail antes do download
          </label>
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={item?.status ?? "active"}>
            <option value="active">Ativo</option>
            <option value="draft">Rascunho</option>
          </Select>
        </Field>
        <SubmitButton>{item ? "Salvar alterações" : "Criar recurso"}</SubmitButton>
      </form>
    </FormShell>
  );
}
